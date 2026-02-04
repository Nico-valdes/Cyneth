/**
 * Migración: normaliza el campo measurements en todos los productos
 * al nuevo formato { enabled, description, variants: [{ size, sku, active }] }.
 * - Productos sin measurements o con formato viejo (availableSizes/unit) se actualizan.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { connectToDatabase } = require('../libs/mongoConnect');
const { ObjectId } = require('mongodb');

const DEFAULT_MEASUREMENTS = {
  enabled: false,
  description: '',
  variants: []
};

function isNewFormat(measurements) {
  return (
    measurements &&
    typeof measurements === 'object' &&
    Array.isArray(measurements.variants) &&
    !Object.hasOwnProperty.call(measurements, 'availableSizes')
  );
}

function migrateMeasurements(product) {
  const current = product.measurements;
  if (!current || typeof current !== 'object') {
    return DEFAULT_MEASUREMENTS;
  }
  if (isNewFormat(current)) {
    return {
      enabled: Boolean(current.enabled),
      description: current.description || '',
      variants: Array.isArray(current.variants)
        ? current.variants.map((v) => ({
            size: v.size || '',
            sku: v.sku || '',
            active: v.active !== false
          }))
        : []
    };
  }
  // Formato viejo: availableSizes (array de strings) y opcional unit
  const baseSku = product.sku || 'PROD';
  const variants = Array.isArray(current.availableSizes)
    ? current.availableSizes.map((size, i) => ({
        size: String(size).trim(),
        sku: `${baseSku}-${i}`,
        active: true
      })).filter((v) => v.size)
    : [];
  return {
    enabled: Boolean(current.enabled),
    description: current.description || '',
    variants
  };
}

async function run() {
  let client;
  try {
    client = await connectToDatabase();
    const dbName = process.env.MONGODB_DB_NAME || 'cyneth';
    const db = client.db(dbName);
    const collection = db.collection('products');

    const products = await collection.find({}).toArray();
    let updated = 0;
    let skipped = 0;

    for (const product of products) {
      const migrated = migrateMeasurements(product);
      const alreadyOk =
        isNewFormat(product.measurements) &&
        product.measurements.enabled === migrated.enabled &&
        (product.measurements.description || '') === (migrated.description || '') &&
        (product.measurements.variants || []).length === migrated.variants.length;
      if (alreadyOk) {
        skipped++;
        continue;
      }
      await collection.updateOne(
        { _id: product._id },
        {
          $set: {
            measurements: migrated,
            updatedAt: new Date()
          }
        }
      );
      updated++;
      if (updated % 50 === 0) {
        console.log(`  Actualizados ${updated} productos...`);
      }
    }

    console.log('✅ Migración measurements finalizada.');
    console.log(`   Total productos: ${products.length}`);
    console.log(`   Actualizados: ${updated}`);
    console.log(`   Sin cambios: ${skipped}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    if (client) await client.close();
  }
}

run();
