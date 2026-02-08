/**
 * Copia completa de la colección products en CSV (mismo formato que la exportación).
 * Uso: node src/scripts/backup-products.js
 * Salida: SubirProds/productos_backup_YYYY-MM-DD_HH-mm-ss.csv
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { connectToDatabase } = require('../libs/mongoConnect');
const ProductService = require('../services/ProductService');
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

async function run() {
  let client;
  try {
    client = await connectToDatabase();
    const dbName = process.env.MONGODB_DB_NAME || 'cyneth';
    const db = client.db(dbName);
    const productService = new ProductService(db);

    const filters = { showAll: true };
    const options = { limit: 100000, skip: 0, sort: { createdAt: -1 } };
    const products = await productService.findWithCategories(filters, options);

    const headers = [
      '_id',
      'name',
      'sku',
      'slug',
      'brand',
      'brandSlug',
      'description',
      'category',
      'categoryBreadcrumb',
      'active',
      'featured',
      'defaultImage',
      'colorVariantsCount',
      'measurementsEnabled',
      'measurementsVariants',
      'createdAt',
      'updatedAt',
    ];

    const lines = [row(headers)];

    for (const p of products) {
      const categoryId = p.category?.toString?.() ?? p.category ?? '';
      const colorCount = Array.isArray(p.colorVariants) ? p.colorVariants.length : 0;
      const measEnabled = p.measurements?.enabled === true;
      const measVariants = Array.isArray(p.measurements?.variants)
        ? JSON.stringify(p.measurements.variants)
        : '';
      const createdAt =
        p.createdAt instanceof Date
          ? p.createdAt.toISOString()
          : typeof p.createdAt === 'string'
            ? p.createdAt
            : '';
      const updatedAt =
        p.updatedAt instanceof Date
          ? p.updatedAt.toISOString()
          : typeof p.updatedAt === 'string'
            ? p.updatedAt
            : '';

      lines.push(
        row([
          p._id?.toString?.() ?? p._id ?? '',
          p.name ?? '',
          p.sku ?? '',
          p.slug ?? '',
          p.brand ?? '',
          p.brandSlug ?? '',
          p.description ?? '',
          categoryId,
          p.categoryBreadcrumb ?? '',
          p.active === true ? '1' : '0',
          p.featured === true ? '1' : '0',
          p.defaultImage ?? '',
          colorCount,
          measEnabled ? '1' : '0',
          measVariants,
          createdAt,
          updatedAt,
        ])
      );
    }

    const csv = '\uFEFF' + lines.join('\r\n');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const outPath = path.resolve(__dirname, '../../SubirProds', `productos_backup_${stamp}.csv`);
    fs.writeFileSync(outPath, csv, 'utf8');
    console.log('OK: ' + products.length + ' productos guardados en ' + outPath);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    if (client) client.close();
  }
}

run();
