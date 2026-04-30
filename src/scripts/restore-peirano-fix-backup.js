/**
 * Restaura colorVariants, defaultImage e images de productos desde un backup
 * generado por fix-peirano-color-variants.js (revierte el fix).
 *
 * Uso:
 *   node src/scripts/restore-peirano-fix-backup.js SubirProds/peirano-fix-backup-2026-02-08T12-30-00.json
 *
 * Requiere .env: MONGODB_URI
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { connectToDatabase } = require('../libs/mongoConnect');
const { ObjectId } = require('mongodb');

function toMongoVariants(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(v => {
    if (!v || typeof v !== 'object') return v;
    return { ...v };
  });
}

async function run() {
  const relativePath = process.argv[2];
  if (!relativePath) {
    console.error('Uso: node src/scripts/restore-peirano-fix-backup.js <ruta-al-backup.json>');
    console.error('Ejemplo: node src/scripts/restore-peirano-fix-backup.js SubirProds/peirano-fix-backup-2026-02-08T12-30-00.json');
    process.exit(1);
  }

  const backupPath = path.isAbsolute(relativePath)
    ? relativePath
    : path.resolve(__dirname, '../../', relativePath);

  if (!fs.existsSync(backupPath)) {
    console.error('No existe el archivo:', backupPath);
    process.exit(1);
  }

  let payload;
  try {
    const raw = fs.readFileSync(backupPath, 'utf8');
    if (raw.charCodeAt(0) === 0xfeff) payload = JSON.parse(raw.slice(1));
    else payload = JSON.parse(raw);
  } catch (err) {
    console.error('Error leyendo el JSON:', err.message);
    process.exit(1);
  }

  if (!Array.isArray(payload) || payload.length === 0) {
    console.error('El backup debe ser un array con al menos un elemento.');
    process.exit(1);
  }

  const client = await connectToDatabase();
  const dbName = process.env.MONGODB_DB_NAME || 'cyneth';
  const coll = client.db(dbName).collection('products');

  let restored = 0;
  for (const item of payload) {
    const id = item._id;
    if (!id || !ObjectId.isValid(id)) continue;

    const update = {
      colorVariants: toMongoVariants(item.colorVariants),
      defaultImage: item.defaultImage != null ? item.defaultImage : '',
      images: Array.isArray(item.images) ? item.images : [],
      updatedAt: new Date()
    };

    const result = await coll.updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    if (result.matchedCount) restored++;
  }

  console.log(`\n✅ Restaurados ${restored} productos desde ${path.basename(backupPath)}\n`);
  await client.close();
}

run().catch(err => {
  console.error('❌', err);
  process.exit(1);
});
