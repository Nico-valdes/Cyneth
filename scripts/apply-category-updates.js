/**
 * Script para aplicar actualizaciones masivas de categorías en MongoDB
 * Lee el archivo de mapeo generado por categorize-with-ai.js y aplica los cambios
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { ObjectId } = require('mongodb');
const { connectToDatabase, closeConnection } = require('../src/libs/mongoConnect');

/**
 * Función principal para aplicar actualizaciones
 */
async function applyCategoryUpdates(mappingFileName, options = {}) {
  const { dryRun = false, confirmBeforeUpdate = true } = options;
  let client;

  try {
    // Cargar archivo de mapeo
    const exportDir = path.join(__dirname, 'exports');
    const mappingFile = path.join(exportDir, mappingFileName);

    console.log(`📂 Cargando mapeo desde: ${mappingFile}`);
    const mappingData = await fs.readFile(mappingFile, 'utf8');
    const mapping = JSON.parse(mappingData);

    console.log(`\n📊 RESUMEN DEL MAPEO:`);
    console.log(`   📦 Total de productos: ${mapping.totalProducts}`);
    console.log(`   🔄 Productos con cambios: ${mapping.changes}`);
    console.log(`   ✓ Productos sin cambios: ${mapping.noChange}`);
    console.log(`   ❌ Errores: ${mapping.errors}\n`);

    // Filtrar solo los que tienen cambios
    const updates = mapping.updates.filter(u => u.changed);
    
    if (updates.length === 0) {
      console.log('✅ No hay cambios para aplicar');
      return;
    }

    console.log(`📝 Productos que se actualizarán: ${updates.length}\n`);

    // Mostrar preview de cambios
    if (confirmBeforeUpdate && !dryRun) {
      console.log('📋 PREVIEW DE CAMBIOS (primeros 10):');
      updates.slice(0, 10).forEach((update, idx) => {
        console.log(`   ${idx + 1}. ${update.productName} (${update.sku})`);
        console.log(`      Actual: ${update.currentCategory || 'Sin categoría'}`);
        console.log(`      Nuevo: ${update.suggestedCategory}`);
      });
      if (updates.length > 10) {
        console.log(`   ... y ${updates.length - 10} más\n`);
      }
    }

    // Conectar a MongoDB
    console.log('📦 Conectando a MongoDB...');
    client = await connectToDatabase();
    const db = client.db('cyneth');

    if (dryRun) {
      console.log('\n🔍 MODO DRY RUN - No se aplicarán cambios reales\n');
    } else {
      console.log('\n⚠️  MODO REAL - Se aplicarán cambios en la base de datos\n');
    }

    // Aplicar actualizaciones en lotes
    const batchSize = 100;
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(updates.length / batchSize);

      console.log(`📦 Procesando lote ${batchNum}/${totalBatches} (${batch.length} productos)...`);

      if (!dryRun) {
        // Actualizar en lote usando bulkWrite
        const bulkOps = batch.map(update => ({
          updateOne: {
            filter: { _id: new ObjectId(update.productId) },
            update: {
              $set: {
                category: new ObjectId(update.suggestedCategory),
                updatedAt: new Date()
              }
            }
          }
        }));

        try {
          const result = await db.collection('products').bulkWrite(bulkOps, {
            ordered: false // Continuar aunque haya errores
          });

          successCount += result.modifiedCount;
          errorCount += result.writeErrors?.length || 0;

          // Guardar errores
          if (result.writeErrors) {
            result.writeErrors.forEach(error => {
              errors.push({
                productId: batch[error.index]?.productId,
                error: error.errmsg
              });
            });
          }

        } catch (error) {
          console.error(`❌ Error en lote ${batchNum}:`, error.message);
          errorCount += batch.length;
          batch.forEach(update => {
            errors.push({
              productId: update.productId,
              error: error.message
            });
          });
        }
      } else {
        // En modo dry run, solo contar
        successCount += batch.length;
      }
    }

    // Mostrar resumen
    console.log('\n📊 RESUMEN DE ACTUALIZACIÓN:');
    console.log(`   ✅ Actualizados exitosamente: ${successCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);

    if (errors.length > 0) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const errorsFile = path.join(exportDir, `update-errors-${timestamp}.json`);
      await fs.writeFile(
        errorsFile,
        JSON.stringify(errors, null, 2),
        'utf8'
      );
      console.log(`   ⚠️  Errores guardados en: ${errorsFile}`);
    }

    if (!dryRun) {
      console.log('\n✅ Actualizaciones aplicadas exitosamente');
      console.log('💡 Considera ejecutar un script para actualizar los contadores de categorías');
    } else {
      console.log('\n💡 Ejecuta sin --dry-run para aplicar los cambios reales');
    }

  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
    throw error;
  } finally {
    if (client) {
      await closeConnection();
    }
  }
}

/**
 * Función CLI
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Uso: node scripts/apply-category-updates.js <nombre-archivo-mapping> [--dry-run]');
    console.error('   Ejemplo: node scripts/apply-category-updates.js category-mapping-2024-01-15.json');
    console.error('   Ejemplo: node scripts/apply-category-updates.js category-mapping-2024-01-15.json --dry-run');
    process.exit(1);
  }

  const mappingFileName = args[0];
  const dryRun = args.includes('--dry-run');

  await applyCategoryUpdates(mappingFileName, {
    dryRun,
    confirmBeforeUpdate: !dryRun
  });
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error en el proceso:', error);
      process.exit(1);
    });
}

module.exports = { applyCategoryUpdates };


