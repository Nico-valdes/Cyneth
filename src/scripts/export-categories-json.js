const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { connectToDatabase } = require('../libs/mongoConnect');
const { ObjectId } = require('mongodb');
const fs = require('fs');

/**
 * Convierte un documento de MongoDB a JSON serializable
 * (ObjectId -> string, Date -> string ISO)
 */
function serializeDoc(doc) {
  if (doc === null || doc === undefined) return doc;
  if (doc instanceof Date) return doc.toISOString();
  const out = {};
  for (const [key, value] of Object.entries(doc)) {
    if (value instanceof ObjectId) {
      out[key] = value.toString();
    } else if (value instanceof Date) {
      out[key] = value.toISOString();
    } else if (Array.isArray(value)) {
      out[key] = value.map((item) =>
        item instanceof ObjectId ? item.toString() : item instanceof Date ? item.toISOString() : serializeDoc(item)
      );
    } else if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      out[key] = serializeDoc(value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

async function exportCategories() {
  let client;
  try {
    client = await connectToDatabase();
    const dbName = process.env.MONGODB_DB_NAME || 'cyneth';
    const db = client.db(dbName);

    // Todas las categorías, todos los campos (sin projection)
    const docs = await db
      .collection('categories')
      .find({})
      .sort({ level: 1, order: 1, name: 1 })
      .toArray();

    const out = docs.map((d) => serializeDoc(d));

    const outPath = path.resolve(__dirname, '../../categorias.json');
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
    console.log('OK: ' + docs.length + ' categorías exportadas a ' + outPath);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    if (client) client.close();
  }
}

exportCategories();
