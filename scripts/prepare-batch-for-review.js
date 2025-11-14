/**
 * Script para preparar lotes de productos para revisión manual/interactiva
 * Crea archivos JSON con lotes pequeños que pueden ser revisados con IA
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

async function prepareBatches() {
  try {
    const exportDir = path.join(__dirname, 'exports');
    const files = await fs.readdir(exportDir);
    
    const productFiles = files.filter(f => f.startsWith('products-') && f.endsWith('.json'));
    const categoryFiles = files.filter(f => f.startsWith('categories-') && f.endsWith('.json'));

    if (productFiles.length === 0 || categoryFiles.length === 0) {
      console.error('❌ No se encontraron archivos de exportación.');
      console.error('💡 Ejecuta primero: node scripts/export-for-categorization.js');
      process.exit(1);
    }

    const latestProductFile = productFiles.sort().reverse()[0];
    const latestCategoryFile = categoryFiles.sort().reverse()[0];

    console.log('📂 Cargando archivos...');
    const productsData = await fs.readFile(path.join(exportDir, latestProductFile), 'utf8');
    const categoriesData = await fs.readFile(path.join(exportDir, latestCategoryFile), 'utf8');

    const products = JSON.parse(productsData);
    const categories = JSON.parse(categoriesData);

    console.log(`\n✅ Cargados ${products.length} productos y ${categories.length} categorías`);

    // Construir mapa de categorías
    const categoryMap = new Map();
    categories.forEach(cat => {
      categoryMap.set(cat._id, cat);
    });

    // Construir paths completos
    function getCategoryPath(categoryId) {
      const category = categoryMap.get(categoryId);
      if (!category) return 'Sin categoría';
      
      const path = [category.name];
      let current = category;
      
      while (current.parent && categoryMap.has(current.parent)) {
        current = categoryMap.get(current.parent);
        path.unshift(current.name);
      }
      
      return path.join(' > ');
    }

    // Preparar lotes de 50 productos cada uno
    const batchSize = 50;
    const batches = [];
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      
      const batchData = {
        batchNumber: batchNum,
        totalBatches: Math.ceil(products.length / batchSize),
        products: batch.map(product => {
          const currentCategory = categoryMap.get(product.currentCategory);
          return {
            _id: product._id,
            name: product.name,
            sku: product.sku,
            description: product.description || '',
            brand: product.brand || '',
            attributes: product.attributes || [],
            currentCategory: product.currentCategory,
            currentCategoryPath: getCategoryPath(product.currentCategory)
          };
        })
      };

      batches.push(batchData);
    }

    // Guardar lotes
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const batchesDir = path.join(exportDir, `batches-${timestamp}`);
    await fs.mkdir(batchesDir, { recursive: true });

    for (const batch of batches) {
      const batchFile = path.join(batchesDir, `batch-${batch.batchNumber}.json`);
      await fs.writeFile(
        batchFile,
        JSON.stringify(batch, null, 2),
        'utf8'
      );
    }

    // Crear archivo de índice
    const indexFile = path.join(batchesDir, 'index.json');
    const index = {
      generatedAt: new Date().toISOString(),
      totalProducts: products.length,
      totalBatches: batches.length,
      batchSize,
      categories: categories.map(cat => ({
        _id: cat._id,
        name: cat.name,
        slug: cat.slug,
        level: cat.level,
        parent: cat.parent,
        fullPath: getCategoryPath(cat._id)
      }))
    };

    await fs.writeFile(indexFile, JSON.stringify(index, null, 2), 'utf8');

    console.log(`\n✅ Preparados ${batches.length} lotes de ${batchSize} productos cada uno`);
    console.log(`📁 Archivos guardados en: ${batchesDir}`);
    console.log(`\n💡 Puedes revisar cada lote individualmente o procesarlos todos juntos`);
    console.log(`   Ejemplo: Abre batch-1.json y pégame aquí el contenido para que lo analice`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

if (require.main === module) {
  prepareBatches()
    .then(() => {
      console.log('\n✅ Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { prepareBatches };


