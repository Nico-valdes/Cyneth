/**
 * Sube productos desde un JSON a MongoDB.
 * Para cada producto: sube las URLs de imagen a Cloudinary y guarda los links
 * de Cloudinary en defaultImage e images antes de insertar.
 *
 * Requiere en .env: MONGODB_URI, CLOUDINARY_URL
 * Uso:
 *   node src/scripts/upload-products-duratop-json.js
 *   node src/scripts/upload-products-duratop-json.js SubirProds/productos_sigas_final_v5.json
 */
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { connectToDatabase } = require('../libs/mongoConnect');
const { ObjectId } = require('mongodb');

const DEFAULT_JSON = 'SubirProds/productos_duratop_x_final.json';
const jsonRelative = process.argv[2] || DEFAULT_JSON;
const JSON_PATH = path.isAbsolute(jsonRelative)
  ? jsonRelative
  : path.resolve(__dirname, '../..', jsonRelative);
const BATCH_SIZE = 1;
const DELAY_MS = 800;
const IMAGE_TIMEOUT_MS = 25000;
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
  const clean = name
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

async function ensureUniqueSlug(collection, baseSlug) {
  let slug = baseSlug;
  let n = 1;
  while (await collection.findOne({ slug })) {
    slug = `${baseSlug}-${n}`;
    n++;
  }
  return slug;
}

async function run() {
  console.log('📂 Archivo:', JSON_PATH);
  if (!fs.existsSync(JSON_PATH)) {
    console.error('❌ No se encontró el archivo:', JSON_PATH);
    process.exit(1);
  }

  let raw;
  try {
    raw = fs.readFileSync(JSON_PATH, 'utf8');
  } catch (e) {
    console.error('❌ Error leyendo JSON:', e.message);
    process.exit(1);
  }

  let products;
  try {
    products = JSON.parse(raw);
  } catch (e) {
    console.error('❌ JSON inválido:', e.message);
    process.exit(1);
  }

  if (!Array.isArray(products) || products.length === 0) {
    console.error('❌ El JSON debe ser un array de productos.');
    process.exit(1);
  }

  const creds = parseCloudinaryUrl();
  const client = await connectToDatabase();
  const db = client.db(process.env.MONGODB_DB_NAME || 'cyneth');
  const collection = db.collection('products');

  const urlCache = new Map();
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  console.log(`📦 Total productos en JSON: ${products.length}`);
  console.log('');

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const name = p.name || `Producto ${i + 1}`;
    const sku = p.sku || '';

    try {
      const existingBySku = sku ? await collection.findOne({ sku }) : null;
      if (existingBySku) {
        console.log(`⏭️  [${i + 1}/${products.length}] SKU ya existe: ${sku} - "${name}"`);
        skipped++;
        continue;
      }

      const firstImageUrl = (p.defaultImage || '').split('\n')[0].trim();
      const imageUrls = Array.isArray(p.images)
        ? p.images.map(it => (typeof it === 'string' ? it : (it && it.url) || '')).filter(u => u && String(u).trim())
        : [];
      if (firstImageUrl && !imageUrls.includes(firstImageUrl)) {
        imageUrls.unshift(firstImageUrl);
      }
      const uniqueUrls = [...new Set(imageUrls)];

      let defaultImageCloud = '';
      const imagesCloud = [];

      for (let j = 0; j < uniqueUrls.length; j++) {
        const url = uniqueUrls[j];
        if (!url || !url.startsWith('http')) continue;

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
          console.warn(`   ⚠️  Imagen ${j + 1} falló: ${result.error}`);
          if (j === 0) defaultImageCloud = url;
          imagesCloud.push(url);
        }
        await new Promise(r => setTimeout(r, 300));
      }

      if (!defaultImageCloud && firstImageUrl) {
        defaultImageCloud = firstImageUrl;
      }
      if (imagesCloud.length === 0 && firstImageUrl) {
        imagesCloud.push(defaultImageCloud);
      }

      const categoryId = p.category && ObjectId.isValid(p.category)
        ? new ObjectId(p.category)
        : null;
      if (!categoryId) {
        console.log(`⏭️  [${i + 1}/${products.length}] Sin categoría válida: "${name}"`);
        skipped++;
        continue;
      }

      const baseSlug = (p.slug || name).toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      const slug = await ensureUniqueSlug(collection, baseSlug || 'producto');

      const doc = {
        name: p.name || '',
        description: p.description || '',
        sku: p.sku || `DURATOP-${Date.now()}-${i}`,
        category: categoryId,
        slug,
        brand: p.brand || '',
        brandSlug: p.brandSlug || '',
        attributes: Array.isArray(p.attributes) ? p.attributes : [],
        specifications: p.specifications && typeof p.specifications === 'object' ? p.specifications : {},
        measurements: p.measurements && typeof p.measurements === 'object'
          ? {
              enabled: Boolean(p.measurements.enabled),
              description: p.measurements.description || '',
              variants: Array.isArray(p.measurements.variants)
                ? p.measurements.variants.map(v => ({
                    size: v.size || '',
                    sku: v.sku || '',
                    active: v.active !== false
                  }))
                : []
            }
          : { enabled: false, description: '', variants: [] },
        colorVariants: Array.isArray(p.colorVariants) ? p.colorVariants : [],
        defaultImage: defaultImageCloud,
        images: imagesCloud,
        featured: Boolean(p.featured),
        active: p.active !== false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await collection.insertOne(doc);
      inserted++;
      console.log(`✅ [${i + 1}/${products.length}] Insertado: ${doc.sku} - "${name}"`);
    } catch (err) {
      errors++;
      console.error(`❌ [${i + 1}/${products.length}] Error "${name}":`, err.message);
    }

    if ((i + 1) % 10 === 0) {
      console.log(`   ... progreso ${i + 1}/${products.length}`);
    }
    await new Promise(r => setTimeout(r, DELAY_MS));
  }

  await client.close();
  console.log('');
  console.log('📊 Resumen:');
  console.log(`   Insertados: ${inserted}`);
  console.log(`   Omitidos (SKU/sin categoría): ${skipped}`);
  console.log(`   Errores: ${errors}`);
  console.log(`   URLs en caché (imágenes subidas a Cloudinary): ${urlCache.size}`);
}

run().catch(err => {
  console.error('❌', err);
  process.exit(1);
});
