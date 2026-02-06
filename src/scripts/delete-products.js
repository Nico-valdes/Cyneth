/**
 * Elimina productos de la base de datos.
 * Opciones:
 *   - Por marca: node src/scripts/delete-products.js --brand "Tigre"
 *   - Por brandSlug: node src/scripts/delete-products.js --brandSlug "tigre"
 *   - Por fecha (últimos N días): node src/scripts/delete-products.js --days 1
 *   - Desde archivo JSON: node src/scripts/delete-products.js --fromFile SubirProds/tigre_junta_elastica_tje.json
 *   - Por SKU específico: node src/scripts/delete-products.js --sku "TJE11108504"
 *   - Por prefijo de SKU: node src/scripts/delete-products.js --skuPrefix "TJE"
 *
 * Requiere en .env: MONGODB_URI
 */
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { connectToDatabase } = require('../libs/mongoConnect');
const { ObjectId } = require('mongodb');

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

async function run() {
  const options = parseArgs();
  let client;
  
  try {
    client = await connectToDatabase();
    const dbName = process.env.MONGODB_DB_NAME || 'cyneth';
    const db = client.db(dbName);
    const collection = db.collection('products');

    let query = {};
    let description = '';

    if (options.fromFile) {
      const jsonPath = path.isAbsolute(options.fromFile)
        ? options.fromFile
        : path.resolve(__dirname, '../..', options.fromFile);
      
      if (!fs.existsSync(jsonPath)) {
        console.error('❌ No se encontró el archivo:', jsonPath);
        process.exit(1);
      }

      const products = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const skus = products.map(p => p.sku).filter(Boolean);
      
      if (skus.length === 0) {
        console.error('❌ No se encontraron SKUs en el archivo');
        process.exit(1);
      }

      query = { sku: { $in: skus } };
      description = `productos del archivo ${options.fromFile} (${skus.length} SKUs)`;
    } else if (options.brand) {
      query = { brand: options.brand };
      description = `productos de la marca "${options.brand}"`;
    } else if (options.brandSlug) {
      query = { brandSlug: options.brandSlug };
      description = `productos con brandSlug "${options.brandSlug}"`;
    } else if (options.sku) {
      query = { sku: options.sku };
      description = `producto con SKU "${options.sku}"`;
    } else if (options.skuPrefix) {
      const prefix = String(options.skuPrefix).trim();
      if (!prefix) {
        console.error('❌ --skuPrefix no puede estar vacío');
        process.exit(1);
      }
      query = { sku: new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) };
      description = `productos con SKU que empieza por "${prefix}"`;
    } else if (options.days) {
      const days = parseInt(options.days);
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - days);
      query = { createdAt: { $gte: dateLimit } };
      description = `productos creados en los últimos ${days} día(s)`;
    } else {
      console.error('❌ Debes especificar un criterio de eliminación:');
      console.error('   --brand "Marca"');
      console.error('   --brandSlug "marca-slug"');
      console.error('   --days N (últimos N días)');
      console.error('   --fromFile ruta/al/archivo.json');
      console.error('   --sku "SKU123"');
      console.error('   --skuPrefix "TJE" (SKU que empieza por...)');
      process.exit(1);
    }

    const count = await collection.countDocuments(query);
    
    if (count === 0) {
      console.log(`ℹ️  No se encontraron productos que coincidan con: ${description}`);
      return;
    }

    console.log(`⚠️  Se eliminarán ${count} ${description}`);
    console.log('   Presiona Ctrl+C para cancelar...');
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    const result = await collection.deleteMany(query);

    console.log('✅ Eliminación completada.');
    console.log(`   Productos eliminados: ${result.deletedCount}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    if (client) await client.close();
  }
}

run();
