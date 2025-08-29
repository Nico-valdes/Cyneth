require('dotenv').config({ path: '.env' });
const { connectToDatabase } = require('../libs/mongoConnect');

async function verifyProductImages() {
  try {
    console.log('🔍 Verificando imágenes de productos en la base de datos...\n');
    
    const client = await connectToDatabase();
    const db = client.db('cyneth');
    
    console.log('✅ Conectado a MongoDB');
    
    const productsCollection = db.collection('products');
    
    // Obtener todos los productos
    const allProducts = await productsCollection.find({}).toArray();
    
    console.log(`📊 Total de productos: ${allProducts.length}\n`);
    
    // Categorizar productos por estado de imágenes
    const productsWithDefaultImage = [];
    const productsWithColorVariants = [];
    const productsWithoutImages = [];
    const productsWithBoth = [];
    
    allProducts.forEach(product => {
      const hasDefaultImage = product.defaultImage && product.defaultImage.trim() !== '';
      const hasColorVariants = product.colorVariants && product.colorVariants.length > 0;
      const hasColorVariantImages = hasColorVariants && 
        product.colorVariants.some(v => v.image && v.image.trim() !== '');
      
      if (hasDefaultImage && hasColorVariantImages) {
        productsWithBoth.push(product);
      } else if (hasDefaultImage) {
        productsWithDefaultImage.push(product);
      } else if (hasColorVariantImages) {
        productsWithColorVariants.push(product);
      } else {
        productsWithoutImages.push(product);
      }
    });
    
    // Mostrar estadísticas
    console.log('📊 ESTADÍSTICAS DE IMÁGENES:');
    console.log(`✅ Con imagen por defecto: ${productsWithDefaultImage.length}`);
    console.log(`🎨 Con variantes de color: ${productsWithColorVariants.length}`);
    console.log(`🔄 Con ambos tipos: ${productsWithBoth.length}`);
    console.log(`❌ Sin imágenes: ${productsWithoutImages.length}\n`);
    
    // Mostrar productos sin imágenes
    if (productsWithoutImages.length > 0) {
      console.log('❌ PRODUCTOS SIN IMÁGENES:');
      productsWithoutImages.forEach(product => {
        console.log(`   - ${product.name} (SKU: ${product.sku})`);
        console.log(`     defaultImage: ${product.defaultImage || 'No definido'}`);
        console.log(`     colorVariants: ${product.colorVariants?.length || 0}`);
        if (product.colorVariants?.length > 0) {
          product.colorVariants.forEach((variant, index) => {
            console.log(`       Variante ${index + 1}: ${variant.colorName} - Imagen: ${variant.image || 'No definida'}`);
          });
        }
        console.log('');
      });
    }
    
    // Mostrar productos con imagen por defecto
    if (productsWithDefaultImage.length > 0) {
      console.log('✅ PRODUCTOS CON IMAGEN POR DEFECTO:');
      productsWithDefaultImage.slice(0, 5).forEach(product => {
        console.log(`   - ${product.name}: ${product.defaultImage}`);
      });
      if (productsWithDefaultImage.length > 5) {
        console.log(`   ... y ${productsWithDefaultImage.length - 5} más`);
      }
      console.log('');
    }
    
    // Mostrar productos con variantes de color
    if (productsWithColorVariants.length > 0) {
      console.log('🎨 PRODUCTOS CON VARIANTES DE COLOR:');
      productsWithColorVariants.slice(0, 5).forEach(product => {
        console.log(`   - ${product.name}: ${product.colorVariants.length} variantes`);
        product.colorVariants.forEach((variant, index) => {
          console.log(`     ${index + 1}. ${variant.colorName}: ${variant.image || 'Sin imagen'}`);
        });
      });
      if (productsWithColorVariants.length > 5) {
        console.log(`   ... y ${productsWithColorVariants.length - 5} más`);
      }
      console.log('');
    }
    
    // Mostrar productos con ambos tipos
    if (productsWithBoth.length > 0) {
      console.log('🔄 PRODUCTOS CON AMBOS TIPOS DE IMAGEN:');
      productsWithBoth.slice(0, 3).forEach(product => {
        console.log(`   - ${product.name}`);
        console.log(`     defaultImage: ${product.defaultImage}`);
        console.log(`     colorVariants: ${product.colorVariants.length}`);
      });
      if (productsWithBoth.length > 3) {
        console.log(`   ... y ${productsWithBoth.length - 3} más`);
      }
      console.log('');
    }
    
    console.log('🎯 RECOMENDACIONES:');
    if (productsWithoutImages.length > 0) {
      console.log(`   - ${productsWithoutImages.length} productos necesitan imágenes`);
      console.log('   - Agregar defaultImage o variantes de color con imágenes');
    }
    
    if (productsWithDefaultImage.length === 0) {
      console.log('   - Ningún producto tiene imagen por defecto');
      console.log('   - Considerar agregar defaultImage para productos sin variantes');
    }
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error verificando productos:', error);
  } finally {
    process.exit(0);
  }
}

verifyProductImages();
