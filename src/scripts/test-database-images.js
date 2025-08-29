/**
 * Script para verificar que las imágenes se estén guardando correctamente en la base de datos
 * Ejecutar con: node src/scripts/test-database-images.js
 */

require('dotenv').config({ path: '.env' });

async function testDatabaseImages() {
  console.log('🔍 Verificando imágenes en la base de datos...\n');
  
  try {
    // Conectar a MongoDB
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db('cyneth');
    const productsCollection = db.collection('products');
    
    // Buscar productos con imágenes
    const productsWithImages = await productsCollection.find({
      $or: [
        { defaultImage: { $exists: true, $ne: '' } },
        { 'colorVariants.image': { $exists: true, $ne: '' } }
      ]
    }).toArray();
    
    console.log(`📊 Encontrados ${productsWithImages.length} productos con imágenes\n`);
    
    if (productsWithImages.length > 0) {
      productsWithImages.forEach((product, index) => {
        console.log(`📦 Producto ${index + 1}: ${product.name}`);
        console.log(`   ID: ${product._id}`);
        console.log(`   defaultImage: ${product.defaultImage || 'No definida'}`);
        
        if (product.colorVariants && product.colorVariants.length > 0) {
          console.log(`   Variantes de color:`);
          product.colorVariants.forEach((variant, vIndex) => {
            console.log(`     ${vIndex + 1}. ${variant.colorName}: ${variant.image || 'Sin imagen'}`);
          });
        }
        
        console.log(''); // Línea en blanco
      });
      
      // Verificar URLs de Cloudflare
      const cloudflareImages = productsWithImages.filter(product => 
        (product.defaultImage && product.defaultImage.includes('imagedelivery.net')) ||
        (product.colorVariants && product.colorVariants.some(v => v.image && v.image.includes('imagedelivery.net')))
      );
      
      console.log(`☁️  Productos con imágenes en Cloudflare: ${cloudflareImages.length}`);
      
      if (cloudflareImages.length > 0) {
        cloudflareImages.forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name}`);
          if (product.defaultImage && product.defaultImage.includes('imagedelivery.net')) {
            console.log(`      defaultImage: ${product.defaultImage}`);
          }
        });
      }
      
    } else {
      console.log('❌ No se encontraron productos con imágenes');
    }
    
    await client.close();
    console.log('\n✅ Conexión cerrada');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testDatabaseImages().catch(console.error);
}

module.exports = { testDatabaseImages };
