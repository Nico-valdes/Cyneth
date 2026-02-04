const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { connectToDatabase } = require('../libs/mongoConnect');
const fs = require('fs');

async function exportCategories() {
  let client;
  try {
    client = await connectToDatabase();
    const dbName = process.env.MONGODB_DB_NAME || 'cyneth';
    const db = client.db(dbName);
    const docs = await db.collection('categories')
      .find({}, { projection: { _id: 1, name: 1, level: 1, parent: 1, slug: 1, type: 1 } })
      .sort({ level: 1, order: 1, name: 1 })
      .toArray();

    const out = docs.map((d) => ({
      id: d._id.toString(),
      name: d.name,
      level: d.level,
      parent: d.parent ? d.parent.toString() : null,
      slug: d.slug,
      type: d.type || null,
    }));

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
