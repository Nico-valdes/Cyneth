/**
 * Actualiza productos desde un JSON: solo category y slug (por SKU).
 * El JSON es un array de objetos con al menos: sku, category, slug.
 * Uso: node src/scripts/upload-products-from-json.js [ruta.json]
 * Por defecto: SubirProds/catalogo_2040_categorizado.json
 */
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { connectToDatabase } = require('../libs/mongoConnect');
const { ObjectId } = require('mongodb');

async function run() {
  const jsonPath = path.resolve(
    __dirname,
    '../../',
    process.argv[2] || 'SubirProds/catalogo_2040_categorizado.json'
  );
  if (!fs.existsSync(jsonPath)) {
    console.error('No existe el archivo:', jsonPath);
    process.exit(1);
  }

  let products;
  try {
    let raw = fs.readFileSync(jsonPath, 'utf8');
    if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
    products = JSON.parse(raw);
  } catch (err) {
    console.error('Error leyendo JSON:', err.message);
    process.exit(1);
  }

  if (!Array.isArray(products)) {
    console.error('El JSON debe ser un array de productos');
    process.exit(1);
  }

  const valid = products.filter(
    (p) => p.sku && (p.category || p.slug)
  );
  console.log('Productos en JSON:', products.length, '| Con sku y (category o slug):', valid.length);

  let client;
  try {
    client = await connectToDatabase();
    const dbName = process.env.MONGODB_DB_NAME || 'cyneth';
    const coll = client.db(dbName).collection('products');

    let updated = 0;
    let notFound = 0;
    const total = valid.length;
    for (let i = 0; i < valid.length; i++) {
      const p = valid[i];
      if (i > 0 && i % 500 === 0) console.log('Procesados ' + i + '/' + total + '...');

      const set = { updatedAt: new Date() };
      if (p.category && ObjectId.isValid(p.category)) {
        set.category = new ObjectId(p.category);
      }
      if (p.slug != null && p.slug !== '') {
        set.slug = String(p.slug).trim();
      }
      if (Object.keys(set).length <= 1) continue;

      const result = await coll.updateOne(
        { sku: p.sku },
        { $set: set }
      );
      if (result.matchedCount) updated++;
      else notFound++;
    }

    console.log('OK: actualizados ' + updated + ' productos (category y/o slug).');
    if (notFound) console.log('No encontrados por SKU: ' + notFound);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  } finally {
    if (client) client.close();
  }
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
