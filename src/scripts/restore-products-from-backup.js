/**
 * Restaura productos desde un JSON de backup (solo actualiza los que existen por _id).
 * Uso: node src/scripts/restore-products-from-backup.js SubirProds/productos_backup_YYYY-MM-DD_HH-mm-ss.json
 */
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { connectToDatabase } = require('../libs/mongoConnect');
const { ObjectId } = require('mongodb');

function toMongo(doc) {
  if (!doc || typeof doc !== 'object') return doc;
  const out = {};
  for (const [k, v] of Object.entries(doc)) {
    if (k === '_id' && (typeof v === 'string' && ObjectId.isValid(v))) {
      out[k] = new ObjectId(v);
    } else if (k === 'category' && v && (typeof v === 'string' && ObjectId.isValid(v))) {
      out[k] = new ObjectId(v);
    } else if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
      out[k] = toMongo(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

async function run() {
  const backupPath = path.resolve(__dirname, '../../', process.argv[2] || '');
  if (!process.argv[2] || !fs.existsSync(backupPath)) {
    console.error('Uso: node src/scripts/restore-products-from-backup.js <ruta-backup.json>');
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  if (!Array.isArray(products)) {
    console.error('El JSON debe ser un array de productos');
    process.exit(1);
  }

  let client;
  try {
    client = await connectToDatabase();
    const dbName = process.env.MONGODB_DB_NAME || 'cyneth';
    const db = client.db(dbName);
    const coll = db.collection('products');

    let restored = 0;
    for (const p of products) {
      const id = p._id;
      if (!id) continue;
      const doc = toMongo({ ...p });
      delete doc._id;
      doc.updatedAt = new Date();
      const result = await coll.updateOne(
        { _id: new ObjectId(p._id) },
        { $set: doc }
      );
      if (result.matchedCount) restored++;
    }
    console.log('OK: restaurados ' + restored + ' productos desde ' + backupPath);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    if (client) client.close();
  }
}

run();
