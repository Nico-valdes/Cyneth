/**
 * Limpia colorVariants en productos Peirano que fueron cargados con errores:
 * - Quita variantes donde colorName es en realidad un nombre de producto.
 * - Deja solo variantes con nombres de color válidos (whitelist).
 * - Si después de filtrar no queda ninguna variante, deja colorVariants = [].
 * - Si la foto estaba solo en colorVariants (y no en defaultImage), la mueve a
 *   defaultImage e images: cuando queda 0 variantes toma la imagen de la variante
 *   que se elimina; cuando queda 1 variante, usa la imagen de esa variante si
 *   defaultImage está vacío.
 *
 * Uso:
 *   node src/scripts/fix-peirano-color-variants.js              # solo Peirano
 *   node src/scripts/fix-peirano-color-variants.js --brand "PEIRANO"
 *   node src/scripts/fix-peirano-color-variants.js --dry-run     # ver cambios sin aplicar
 *
 * Antes de aplicar, guarda un backup en SubirProds/peirano-fix-backup-<fecha>.json
 * con colorVariants, defaultImage e images. Para volver atrás:
 *   node src/scripts/restore-peirano-fix-backup.js SubirProds/peirano-fix-backup-<fecha>.json
 *
 * Requiere .env: MONGODB_URI
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { connectToDatabase } = require('../libs/mongoConnect');

const BACKUP_DIR = path.resolve(__dirname, '../../SubirProds');

// Colores válidos conocidos (sanitarios/grifería). Comparación case-insensitive.
const VALID_COLOR_NAMES = new Set([
  'blanco', 'negro', 'cromo', 'gris', 'acero', 'inoxidable', 'mate', 'brillante',
  'blanco cromo', 'negro cromo', 'gris cromo', 'rojo cromo', 'blanco brillante',
  'negro mate', 'gris mate', 'acero inoxidable', 'aluminio', 'bronce', 'niquel',
  'níquel', 'oro', 'rose gold', 'gold', 'satin greystone', 'greystone',
  'champagne', 'cobre', 'latón', 'blanco mate', 'cromado', 'satine', 'satinado',
  'blanco roto', 'grafito', 'antracita', 'terracota', 'arena', 'beige', 'natural'
].map(s => s.trim().toLowerCase()));

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { brand: 'Peirano', dryRun: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dry-run') opts.dryRun = true;
    if (args[i] === '--brand' && args[i + 1]) {
      opts.brand = args[i + 1];
      i++;
    }
  }
  return opts;
}

function normalize(s) {
  return (s || '').trim().toLowerCase().normalize('NFD').replace(/\u0300-\u036f/g, '');
}

/** True si el nombre parece un color válido (whitelist o muy corto y sin números). */
function isValidColorName(colorName, productName) {
  const n = normalize(colorName);
  if (!n) return false;
  // Está en la whitelist
  if (VALID_COLOR_NAMES.has(n)) return true;
  // Variantes tipo "Blanco X" / "Negro X" donde X es acabado
  const first = n.split(/\s+/)[0];
  if (['blanco', 'negro', 'gris', 'cromo', 'acero', 'bronce', 'oro'].includes(first) && n.length <= 25) return true;
  // Nombre muy largo = probablemente nombre de producto
  if (n.length > 25) return false;
  // Si es el nombre del producto o el "color" contiene el nombre del producto → erróneo
  const productNorm = normalize(productName);
  if (productNorm) {
    if (n === productNorm) return false;
    if (productNorm.startsWith(n + ' ') || productNorm.includes(' ' + n + ' ')) return false;
    if (n.length > productNorm.length && n.includes(productNorm)) return false;
  }
  // Contiene muchos números = probablemente modelo/SKU
  if (/\d{2,}/.test(n) || (n.match(/\d/g) || []).length >= 3) return false;
  // Palabras muy cortas sueltas que no son colores
  if (n.length <= 2) return false;
  return true;
}

/** Primera URL de imagen encontrada en un array de variantes. */
function getFirstImageFromVariants(variants) {
  if (!Array.isArray(variants)) return null;
  const v = variants.find(x => x && x.image && String(x.image).trim());
  return v ? String(v.image).trim() : null;
}

async function run() {
  const { brand, dryRun } = parseArgs();
  const client = await connectToDatabase();
  const dbName = process.env.MONGODB_DB_NAME || 'cyneth';
  const coll = client.db(dbName).collection('products');

  const brandRegex = new RegExp(`^${brand.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
  const products = await coll.find({ brand: brandRegex }).toArray();

  console.log(`\n📦 Productos de marca "${brand}": ${products.length}`);
  if (products.length === 0) {
    console.log('   No hay productos para corregir.');
    await client.close();
    return;
  }

  let updated = 0;
  let cleared = 0;
  let imagesMoved = 0;
  const removedNames = new Set();
  /** Backup de estado anterior (solo campos que modificamos) para poder restaurar */
  const backupPayload = [];

  for (const product of products) {
    const variants = product.colorVariants || [];
    if (variants.length === 0) continue;

    const kept = variants.filter(v => isValidColorName(v.colorName, product.name));
    const removed = variants.filter(v => !isValidColorName(v.colorName, product.name));
    removed.forEach(v => removedNames.add(v.colorName));

    if (removed.length === 0) continue;

    const newVariants = kept.length ? kept : [];
    if (newVariants.length !== variants.length) {
      const update = { colorVariants: newVariants, updatedAt: new Date() };
      const hasDefaultImage = product.defaultImage && String(product.defaultImage).trim();

      if (newVariants.length === 0) {
        // Quedó sin variantes: mover la foto de la variante eliminada a defaultImage/images
        const img = getFirstImageFromVariants(variants);
        if (img && !hasDefaultImage) {
          update.defaultImage = img;
          update.images = Array.isArray(product.images) && product.images.length
            ? product.images
            : [img];
          imagesMoved++;
        }
      } else if (newVariants.length === 1 && !hasDefaultImage) {
        // Una sola variante: si tiene imagen y el producto no tiene defaultImage, usarla
        const img = getFirstImageFromVariants(newVariants);
        if (img) {
          update.defaultImage = img;
          const currentImages = product.images && product.images.length ? product.images : [];
          update.images = currentImages.includes(img) ? currentImages : [img, ...currentImages].filter(Boolean);
          imagesMoved++;
        }
      }

      if (!dryRun) {
        backupPayload.push({
          _id: product._id.toString(),
          colorVariants: product.colorVariants || [],
          defaultImage: product.defaultImage || '',
          images: Array.isArray(product.images) ? product.images : []
        });
        await coll.updateOne({ _id: product._id }, { $set: update });
      }
      updated++;
      if (newVariants.length === 0) cleared++;
    }
  }

  console.log(`\n✅ Productos modificados: ${updated}${dryRun ? ' (dry-run, no se escribió nada)' : ''}`);
  console.log(`   Productos que quedaron sin variantes de color: ${cleared}`);
  console.log(`   Productos con imagen movida a defaultImage: ${imagesMoved}`);
  if (removedNames.size > 0) {
    console.log(`   Nombres eliminados como "color" (muestra):`);
    [...removedNames].slice(0, 25).forEach(n => console.log(`     - ${n}`));
    if (removedNames.size > 25) console.log(`     ... y ${removedNames.size - 25} más`);
  }
  if (dryRun && updated > 0) {
    console.log('\n   Ejecutá sin --dry-run para aplicar los cambios.');
  }

  if (!dryRun && backupPayload.length > 0) {
    const backupName = `peirano-fix-backup-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`;
    const backupPath = path.join(BACKUP_DIR, backupName);
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
    fs.writeFileSync(backupPath, JSON.stringify(backupPayload, null, 2), 'utf8');
    console.log(`\n   Backup guardado: ${backupName}`);
    console.log(`   Para revertir: node src/scripts/restore-peirano-fix-backup.js SubirProds/${backupName}`);
  }
  console.log('');
  await client.close();
}

run().catch(err => {
  console.error('❌', err);
  process.exit(1);
});
