/**
 * Limpia campos obsoletos de productos: categoryPath, categoryPathNames, categoryBreadcrumb.
 * Ejecutar: node src/scripts/clean-product-category-path.js
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { connectToDatabase } = require('../libs/mongoConnect');

async function run() {
  let client;
  try {
    client = await connectToDatabase();
    const dbName = process.env.MONGODB_DB_NAME || 'cyneth';
    const db = client.db(dbName);
    const collection = db.collection('products');

    const result = await collection.updateMany(
      {},
      {
        $unset: {
          categoryPath: '',
          categoryPathNames: '',
          categoryBreadcrumb: ''
        }
      }
    );

    console.log('✅ Limpieza completada.');
    console.log(`   Documentos modificados: ${result.modifiedCount}`);
    console.log(`   Total coincidencias: ${result.matchedCount}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    if (client) await client.close();
  }
}

run();
