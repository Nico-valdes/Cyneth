/**
 * Sube o actualiza productos desde un CSV (mismo formato que la exportación).
 * Por _id: si existe actualiza; si no existe podría omitirse (este CSV es de productos existentes).
 * Uso: node src/scripts/upload-products-from-csv.js [ruta.csv]
 * Por defecto: SubirProds/productos_categorizados_nivel_profundo.csv
 */
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { connectToDatabase } = require('../libs/mongoConnect');
const { ObjectId } = require('mongodb');

function parseCsvLine(line) {
  const out = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      let s = '';
      i++;
      while (i < line.length) {
        if (line[i] === '"') {
          if (line[i + 1] === '"') {
            s += '"';
            i += 2;
          } else {
            i++;
            break;
          }
        } else {
          s += line[i];
          i++;
        }
      }
      out.push(s);
    } else {
      let s = '';
      while (i < line.length && line[i] !== ',') {
        s += line[i];
        i++;
      }
      out.push(s);
      if (i < line.length) i++;
    }
  }
  return out;
}

async function run() {
  const csvPath = path.resolve(
    __dirname,
    '../../',
    process.argv[2] || 'SubirProds/productos_categorizados_nivel_profundo.csv'
  );
  if (!fs.existsSync(csvPath)) {
    console.error('No existe el archivo:', csvPath);
    process.exit(1);
  }

  let raw = fs.readFileSync(csvPath, 'utf8');
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) {
    console.error('CSV vacío o solo cabecera');
    process.exit(1);
  }

  const header = parseCsvLine(lines[0]);
  const idIdx = header.indexOf('_id');
  if (idIdx === -1) {
    console.error('El CSV no tiene columna _id. Cabecera:', header.slice(0, 5).join(','));
    process.exit(1);
  }
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const _id = (cells[idIdx] ?? '').trim();
    if (!_id || !ObjectId.isValid(_id)) continue;
    const get = (name) => (cells[header.indexOf(name)] ?? '').trim();
    rows.push({
      _id,
      name: get('name'),
      sku: get('sku'),
      slug: get('slug'),
      brand: get('brand'),
      brandSlug: get('brandSlug'),
      description: get('description'),
      category: get('category'),
      active: get('active'),
      featured: get('featured'),
      defaultImage: get('defaultImage'),
      measurementsEnabled: get('measurementsEnabled'),
      measurementsVariants: get('measurementsVariants'),
    });
  }

  console.log('Filas leídas del CSV:', rows.length);
  if (rows.length === 0) {
    console.log('No hay filas válidas con _id. Revisá el CSV.');
    process.exit(0);
  }

  let client;
  try {
    client = await connectToDatabase();
    const dbName = process.env.MONGODB_DB_NAME || 'cyneth';
    const db = client.db(dbName);
    const coll = db.collection('products');

    let updated = 0;
    let notFound = 0;
    const total = rows.length;
    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx];
      if (idx > 0 && idx % 500 === 0) console.log('Procesados ' + idx + '/' + total + '...');
      const categoryId = row.category && ObjectId.isValid(row.category) ? new ObjectId(row.category) : null;
      const set = {
        name: row.name,
        sku: row.sku,
        slug: row.slug,
        brand: row.brand,
        brandSlug: row.brandSlug,
        description: row.description,
        active: row.active === '1' || row.active === 'true',
        featured: row.featured === '1' || row.featured === 'true',
        defaultImage: row.defaultImage,
        updatedAt: new Date(),
      };
      if (categoryId) set.category = categoryId;

      if (row.measurementsEnabled !== undefined && row.measurementsEnabled !== '') {
        set['measurements.enabled'] = row.measurementsEnabled === '1' || row.measurementsEnabled === 'true';
      }
      if (row.measurementsVariants !== undefined && row.measurementsVariants !== '' && row.measurementsVariants !== '[]') {
        try {
          const variants = JSON.parse(row.measurementsVariants);
          if (Array.isArray(variants)) set['measurements.variants'] = variants;
        } catch (_) {}
      }

      const result = await coll.updateOne(
        { _id: new ObjectId(row._id) },
        { $set: set }
      );
      if (result.matchedCount) updated++;
      else notFound++;
    }

    console.log('OK: actualizados ' + updated + ' productos.');
    if (notFound) console.log('No encontrados en BD (por _id): ' + notFound);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    if (client) client.close();
  }
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
