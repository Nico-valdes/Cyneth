/**
 * Exporta todas las categorías de la BD a un archivo CSV (categorias.csv).
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { connectToDatabase } = require('../libs/mongoConnect');
const { ObjectId } = require('mongodb');
const fs = require('fs');

function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function row(values) {
  return values.map(escapeCsv).join(',');
}

async function exportCategoriesCsv() {
  let client;
  try {
    client = await connectToDatabase();
    const dbName = process.env.MONGODB_DB_NAME || 'cyneth';
    const db = client.db(dbName);

    const docs = await db
      .collection('categories')
      .find({})
      .sort({ level: 1, order: 1, name: 1 })
      .toArray();

    const headers = [
      '_id',
      'name',
      'slug',
      'description',
      'parent',
      'level',
      'type',
      'productCount',
      'totalProductCount',
      'order',
      'active',
      'createdAt',
      'updatedAt',
    ];

    const lines = [row(headers)];

    for (const c of docs) {
      const parent = c.parent ? (c.parent instanceof ObjectId ? c.parent.toString() : String(c.parent)) : '';
      const createdAt = c.createdAt instanceof Date ? c.createdAt.toISOString() : (c.createdAt || '');
      const updatedAt = c.updatedAt instanceof Date ? c.updatedAt.toISOString() : (c.updatedAt || '');

      lines.push(
        row([
          c._id.toString(),
          c.name || '',
          c.slug || '',
          c.description || '',
          parent,
          c.level ?? '',
          c.type || '',
          c.productCount ?? '',
          c.totalProductCount ?? '',
          c.order ?? '',
          c.active === true ? '1' : '0',
          createdAt,
          updatedAt,
        ])
      );
    }

    const csv = '\uFEFF' + lines.join('\r\n');
    const outPath = path.resolve(__dirname, '../../categorias.csv');
    fs.writeFileSync(outPath, csv, 'utf8');
    console.log('OK: ' + docs.length + ' categorías exportadas a ' + outPath);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    if (client) client.close();
  }
}

exportCategoriesCsv();
