/**
 * Actualiza solo el campo category de cada producto según el CSV.
 * El CSV debe tener columnas _id y category (ObjectId de categoría como texto).
 * Uso: node src/scripts/apply-categories-from-csv.js [ruta.csv]
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

  const raw = fs.readFileSync(csvPath, 'utf8');
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) {
    console.error('CSV vacío o solo cabecera');
    process.exit(1);
  }

  const header = parseCsvLine(lines[0]);
  const idIdx = header.indexOf('_id');
  const catIdx = header.indexOf('category');
  if (idIdx === -1 || catIdx === -1) {
    console.error('El CSV debe tener columnas _id y category');
    process.exit(1);
  }

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const _id = (cells[idIdx] || '').trim();
    const category = (cells[catIdx] || '').trim();
    if (!_id || !category) continue;
    if (!ObjectId.isValid(_id) || !ObjectId.isValid(category)) continue;
    rows.push({ _id, category });
  }

  let client;
  try {
    client = await connectToDatabase();
    const dbName = process.env.MONGODB_DB_NAME || 'cyneth';
    const db = client.db(dbName);
    const coll = db.collection('products');

    let updated = 0;
    let notFound = 0;
    for (const { _id, category } of rows) {
      const result = await coll.updateOne(
        { _id: new ObjectId(_id) },
        { $set: { category: new ObjectId(category), updatedAt: new Date() } }
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

run();
