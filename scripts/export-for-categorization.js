/**
 * Script para exportar productos y categorías a JSON
 * Estos archivos se usarán para la categorización automática con IA
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { connectToDatabase, closeConnection } = require('../src/libs/mongoConnect');

async function exportData() {
  let client;
  
  try {
    console.log('📦 Conectando a MongoDB...');
    client = await connectToDatabase();
    const db = client.db('cyneth');

    // Exportar productos con información relevante para categorización
    console.log('📋 Exportando productos...');
    const products = await db.collection('products').find({}).toArray();
    
    const productsExport = products.map(product => ({
      _id: product._id.toString(),
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      brand: product.brand || '',
      attributes: product.attributes || [],
      specifications: product.specifications || {},
      currentCategory: product.category ? product.category.toString() : null,
      colorVariants: product.colorVariants?.map(v => v.colorName) || []
    }));

    // Exportar categorías con su jerarquía
    console.log('📂 Exportando categorías...');
    const categories = await db.collection('categories').find({}).toArray();
    
    const categoriesExport = categories.map(category => ({
      _id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parent: category.parent ? category.parent.toString() : null,
      level: category.level || 0,
      type: category.type || 'main',
      productCount: category.productCount || 0
    }));

    // Crear directorio de exportación si no existe
    const exportDir = path.join(__dirname, 'exports');
    await fs.mkdir(exportDir, { recursive: true });

    // Guardar archivos JSON
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const productsFile = path.join(exportDir, `products-${timestamp}.json`);
    const categoriesFile = path.join(exportDir, `categories-${timestamp}.json`);

    await fs.writeFile(
      productsFile,
      JSON.stringify(productsExport, null, 2),
      'utf8'
    );

    await fs.writeFile(
      categoriesFile,
      JSON.stringify(categoriesExport, null, 2),
      'utf8'
    );

    console.log(`\n✅ Exportación completada:`);
    console.log(`   📦 Productos: ${productsExport.length} exportados → ${productsFile}`);
    console.log(`   📂 Categorías: ${categoriesExport.length} exportadas → ${categoriesFile}`);
    console.log(`\n💡 Próximo paso: Ejecuta 'node scripts/categorize-with-ai.js' para categorizar con IA`);

  } catch (error) {
    console.error('❌ Error durante la exportación:', error);
    throw error;
  } finally {
    if (client) {
      await closeConnection();
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  exportData()
    .then(() => {
      console.log('\n✅ Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error en el proceso:', error);
      process.exit(1);
    });
}

module.exports = { exportData };

