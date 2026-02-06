/**
 * Actualiza solo las imágenes de productos que ya están en la base.
 * Lee el JSON, busca cada producto por SKU y vuelve a subir las URLs de imagen
 * a Cloudinary, luego actualiza defaultImage e images en la BD.
 * Útil cuando las fotos se borraron de Cloudinary y querés re-subir desde el JSON.
 *
 * Requiere en .env: MONGODB_URI, CLOUDINARY_URL
 * Uso:
 *   node src/scripts/update-product-images-from-json.js SubirProds/tigre_junta_elastica_final_v6.json
 */
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { connectToDatabase } = require('../libs/mongoConnect');

const IMAGE_TIMEOUT_MS = 30000;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function parseCloudinaryUrl() {
  const url = process.env.CLOUDINARY_URL || '';
  if (!url) throw new Error('CLOUDINARY_URL no está configurado en .env');
  const u = new URL(url);
  return {
    cloudName: u.hostname.split('.')[0],
    apiKey: u.username,
    apiSecret: u.password
  };
}

function generateSignature(publicId, timestamp, apiSecret) {
  const params = `folder=products&overwrite=true&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  return crypto.createHash('sha1').update(params).digest('hex');
}

function fileNameFromProduct(name, index) {
  const clean = (name || 'producto')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
  return `${clean}-${index}-${Date.now()}`;
}

async function downloadImage(imageUrl) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS);
  try {
    const res = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ProductImporter/1.0)',
        Accept: 'image/*'
      }
    });
    clearTimeout(timeoutId);
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const contentType = res.headers.get('content-type') || '';
    if (!/image\//i.test(contentType)) return { ok: false, error: 'No es imagen' };
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length > MAX_FILE_SIZE) return { ok: false, error: 'Imagen demasiado grande' };
    return { ok: true, buffer, contentType: contentType.split(';')[0].trim() || 'image/jpeg' };
  } catch (e) {
    clearTimeout(timeoutId);
    return { ok: false, error: e.message };
  }
}

async function uploadToCloudinary(imageUrl, productName, index, creds) {
  const { cloudName, apiKey, apiSecret } = creds;
  const publicId = `products/${fileNameFromProduct(productName, index)}`;
  const timestamp = Math.round(Date.now() / 1000).toString();

  const downloaded = await downloadImage(imageUrl);
  if (!downloaded.ok) return { success: false, originalUrl: imageUrl, error: downloaded.error };

  const base64 = downloaded.buffer.toString('base64');
  const dataUrl = `data:${downloaded.contentType};base64,${base64}`;
  const form = new FormData();
  form.append('file', dataUrl);
  form.append('public_id', publicId);
  form.append('folder', 'products');
  form.append('overwrite', 'true');
  form.append('resource_type', 'image');
  form.append('api_key', apiKey);
  form.append('timestamp', timestamp);
  form.append('signature', generateSignature(publicId, timestamp, apiSecret));

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: form
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, originalUrl: imageUrl, error: res.status + ' ' + JSON.stringify(err) };
    }
    const data = await res.json();
    return { success: true, originalUrl: imageUrl, cloudinaryUrl: data.secure_url };
  } catch (e) {
    return { success: false, originalUrl: imageUrl, error: e.message };
  }
}

async function run() {
  const jsonRelative = process.argv[2];
  if (!jsonRelative) {
    console.error('❌ Uso: node src/scripts/update-product-images-from-json.js <ruta-al-json>');
    process.exit(1);
  }

  const JSON_PATH = path.isAbsolute(jsonRelative)
    ? jsonRelative
    : path.resolve(__dirname, '../..', jsonRelative);

  console.log('📂 Archivo:', JSON_PATH);
  if (!fs.existsSync(JSON_PATH)) {
    console.error('❌ No se encontró el archivo:', JSON_PATH);
    process.exit(1);
  }

  let products;
  try {
    products = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  } catch (e) {
    console.error('❌ Error leyendo JSON:', e.message);
    process.exit(1);
  }

  if (!Array.isArray(products) || products.length === 0) {
    console.error('❌ El JSON debe ser un array de productos.');
    process.exit(1);
  }

  const creds = parseCloudinaryUrl();
  const client = await connectToDatabase();
  const dbName = process.env.MONGODB_DB_NAME || 'cyneth';
  const collection = client.db(dbName).collection('products');

  const urlCache = new Map();
  let updated = 0;
  let skippedNoUrls = 0;
  let skippedNotFound = 0;
  let errors = 0;

  console.log('📦 Productos en JSON:', products.length);
  console.log('');

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const name = p.name || `Producto ${i + 1}`;
    const sku = p.sku || '';

    const firstImageUrl = (p.defaultImage || '').split('\n')[0].trim();
    const imageUrls = Array.isArray(p.images)
      ? p.images.map(it => (typeof it === 'string' ? it : (it && it.url) || '')).filter(u => u && String(u).trim())
      : [];
    if (firstImageUrl && !imageUrls.includes(firstImageUrl)) {
      imageUrls.unshift(firstImageUrl);
    }
    const uniqueUrls = [...new Set(imageUrls)].filter(u => u && u.startsWith('http'));

    if (uniqueUrls.length === 0) {
      skippedNoUrls++;
      continue;
    }

    const existing = await collection.findOne({ sku });
    if (!existing) {
      skippedNotFound++;
      continue;
    }

    let defaultImageCloud = '';
    const imagesCloud = [];

    for (let j = 0; j < uniqueUrls.length; j++) {
      const url = uniqueUrls[j];
      if (urlCache.has(url)) {
        const cached = urlCache.get(url);
        if (j === 0) defaultImageCloud = cached;
        imagesCloud.push(cached);
        continue;
      }

      const result = await uploadToCloudinary(url, name, j, creds);
      if (result.success) {
        urlCache.set(url, result.cloudinaryUrl);
        if (j === 0) defaultImageCloud = result.cloudinaryUrl;
        imagesCloud.push(result.cloudinaryUrl);
      } else {
        console.warn(`   ⚠️  [${sku}] Imagen ${j + 1} falló: ${result.error}`);
      }
      await new Promise(r => setTimeout(r, 300));
    }

    if (imagesCloud.length === 0) {
      errors++;
      continue;
    }

    if (!defaultImageCloud) defaultImageCloud = imagesCloud[0];

    try {
      await collection.updateOne(
        { sku },
        { $set: { defaultImage: defaultImageCloud, images: imagesCloud, updatedAt: new Date() } }
      );
      updated++;
      console.log(`✅ [${i + 1}/${products.length}] Imágenes actualizadas: ${sku} - "${name}" (${imagesCloud.length} imagen/es)`);
    } catch (e) {
      errors++;
      console.warn(`   ❌ [${sku}] Error al actualizar: ${e.message}`);
    }

    if ((i + 1) % 10 === 0 && i + 1 < products.length) {
      console.log(`   ... progreso ${i + 1}/${products.length}`);
    }
  }

  console.log('');
  console.log('📊 Resumen:');
  console.log('   Imágenes actualizadas (productos):', updated);
  console.log('   Sin URLs de imagen en JSON:', skippedNoUrls);
  console.log('   Producto no encontrado en BD:', skippedNotFound);
  console.log('   Errores:', errors);
  console.log('   URLs en caché (Cloudinary):', urlCache.size);

  await client.close();
}

run().catch(err => {
  console.error('❌', err);
  process.exit(1);
});
