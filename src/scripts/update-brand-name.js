/**
 * Actualiza el nombre de marca (y slug) en productos.
 * Uso:
 *   node src/scripts/update-brand-name.js --from "ACQUA SYSTEM" --to "ACQUASYSTEM"
 * Requiere .env: MONGODB_URI
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { connectToDatabase } = require('../libs/mongoConnect');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      options[key] = value;
      if (value !== true) i++;
    }
  }
  return options;
}

function slugFromName(name) {
  return (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function run() {
  const { from: fromName, to: toName } = parseArgs();
  if (!fromName || !toName) {
    console.error('❌ Uso: node src/scripts/update-brand-name.js --from "ACQUA SYSTEM" --to "ACQUASYSTEM"');
    process.exit(1);
  }

  const client = await connectToDatabase();
  const dbName = process.env.MONGODB_DB_NAME || 'cyneth';
  const collection = client.db(dbName).collection('products');

  const toSlug = slugFromName(toName);
  const result = await collection.updateMany(
    { brand: fromName },
    { $set: { brand: toName, brandSlug: toSlug, updatedAt: new Date() } }
  );

  console.log(`✅ Productos actualizados: ${result.modifiedCount}`);
  console.log(`   Marca: "${fromName}" → "${toName}"`);
  console.log(`   Slug: → "${toSlug}"`);
  await client.close();
}

run().catch((err) => {
  console.error('❌', err);
  process.exit(1);
});
