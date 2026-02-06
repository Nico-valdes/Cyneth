/**
 * Reemplaza un prefijo de SKU por otro en todos los productos que coincidan.
 * Ejemplo: DUX -> ACQ en productos con sku que empieza por DUX.
 *
 * Requiere en .env: MONGODB_URI
 * Uso:
 *   node src/scripts/replace-sku-prefix.js --from DUX --to ACQ
 *   node src/scripts/replace-sku-prefix.js --from DUX --to ACQ --onlyFromFile SubirProds/productos_acqua_system_limpio_v2.json
 */
const path = require('path');
const fs = require('fs');
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

function loadSkusFromFile(filePath) {
  const resolved = path.isAbsolute(filePath) ? filePath : path.resolve(__dirname, '../..', filePath);
  if (!fs.existsSync(resolved)) {
    console.error('❌ No se encontró el archivo:', resolved);
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(resolved, 'utf8'));
  const arr = Array.isArray(data) ? data : [data];
  const set = new Set();
  for (const p of arr) {
    if (p.sku) set.add(String(p.sku).trim());
    for (const v of p.measurements?.variants || []) {
      if (v.sku) set.add(String(v.sku).trim());
    }
  }
  return set;
}

async function run() {
  const { from: fromPrefix, to: toPrefix, onlyFromFile } = parseArgs();

  if (!fromPrefix || !toPrefix) {
    console.error('❌ Uso: node src/scripts/replace-sku-prefix.js --from DUX --to ACQ [--onlyFromFile ruta.json]');
    process.exit(1);
  }

  const regex = new RegExp(`^${fromPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
  const len = fromPrefix.length;

  let onlySkus = null;
  if (onlyFromFile) {
    onlySkus = loadSkusFromFile(onlyFromFile);
    console.log(`📄 Solo productos cuyo SKU está en: ${onlyFromFile} (${onlySkus.size} SKUs en el archivo).`);
  }

  const client = await connectToDatabase();
  const dbName = process.env.MONGODB_DB_NAME || 'cyneth';
  const collection = client.db(dbName).collection('products');

  const finalQuery = onlySkus
    ? { $and: [{ sku: regex }, { sku: { $in: [...onlySkus] } }] }
    : { sku: regex };

  const count = await collection.countDocuments(finalQuery);
  if (count === 0) {
    console.log(`ℹ️  No hay productos que coincidan.`);
    await client.close();
    return;
  }

  console.log(`📦 Productos a actualizar: ${count}`);
  console.log(`   Reemplazo: "${fromPrefix}" → "${toPrefix}".`);
  console.log('');

  // Pipeline: 1) Cambiar sku principal. 2) En variants, cambiar sku que empiece por fromPrefix.
  const pipeline = [
    {
      $set: {
        sku: { $concat: [toPrefix, { $substr: ['$sku', len, -1] }] },
        updatedAt: new Date()
      }
    },
    {
      $set: {
        'measurements.variants': {
          $cond: {
            if: { $isArray: '$measurements.variants' },
            then: {
              $map: {
                input: '$measurements.variants',
                as: 'v',
                in: {
                  $mergeObjects: [
                    '$$v',
                    {
                      sku: {
                        $cond: {
                          if: { $eq: [{ $substr: ['$$v.sku', 0, len] }, fromPrefix] },
                          then: { $concat: [toPrefix, { $substr: ['$$v.sku', len, -1] }] },
                          else: '$$v.sku'
                        }
                      }
                    }
                  ]
                }
              }
            },
            else: '$measurements.variants'
          }
        }
      }
    }
  ];

  const cursor = collection.find(finalQuery);
  let updated = 0;
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    const newSku = toPrefix + (doc.sku || '').slice(len);
    const newVariants = Array.isArray(doc.measurements?.variants)
      ? doc.measurements.variants.map((v) => ({
          ...v,
          sku: v.sku && v.sku.substring(0, len) === fromPrefix ? toPrefix + v.sku.slice(len) : v.sku
        }))
      : doc.measurements?.variants;

    await collection.updateOne(
      { _id: doc._id },
      {
        $set: {
          sku: newSku,
          updatedAt: new Date(),
          ...(newVariants && { 'measurements.variants': newVariants })
        }
      }
    );
    updated++;
    if (updated <= 5 || updated % 20 === 0) {
      console.log(`   ${doc.sku} → ${newSku}`);
    }
  }

  console.log('');
  console.log(`✅ Actualizados: ${updated} productos. Prefijo "${fromPrefix}" → "${toPrefix}".`);
  await client.close();
}

run().catch((err) => {
  console.error('❌', err);
  process.exit(1);
});
