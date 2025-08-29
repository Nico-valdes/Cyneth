require('dotenv').config({ path: '.env' });
const { connectToDatabase } = require('../libs/mongoConnect');

async function optimizeDatabase() {
  try {
    console.log('🚀 Conectando a MongoDB para optimización...');
    const client = await connectToDatabase();
    const db = client.db('cyneth');
    
    console.log('✅ Conectado exitosamente a MongoDB!');
    
    // ===== VERIFICAR ÍNDICES EXISTENTES =====
    console.log('\n🔍 Verificando índices existentes...');
    
    const existingProductsIndexes = await db.collection('products').indexes();
    const existingCategoriesIndexes = await db.collection('categories').indexes();
    const existingSubcategoriesIndexes = await db.collection('subcategories').indexes();
    
    console.log(`📊 Products: ${existingProductsIndexes.length} índices existentes`);
    console.log(`📊 Categories: ${existingCategoriesIndexes.length} índices existentes`);
    console.log(`📊 Subcategories: ${existingSubcategoriesIndexes.length} índices existentes`);
    
    // ===== OPTIMIZAR COLECCIÓN PRODUCTS =====
    console.log('\n📦 Optimizando colección products...');
    
    // Función para verificar si un índice ya existe
    const indexExists = (collection, indexName) => {
      return existingProductsIndexes.some(idx => idx.name === indexName);
    };
    
    const categoryIndexExists = (collection, indexName) => {
      return existingCategoriesIndexes.some(idx => idx.name === indexName);
    };
    
    const subcategoryIndexExists = (collection, indexName) => {
      return existingSubcategoriesIndexes.some(idx => idx.name === indexName);
    };
    
    // Índice compuesto para consultas más frecuentes
    if (!indexExists('products', 'idx_active_category_subcategory_created')) {
      try {
        await db.collection('products').createIndex(
          { active: 1, category: 1, subcategory: 1, createdAt: -1 },
          { name: 'idx_active_category_subcategory_created' }
        );
        console.log('✅ Índice compuesto creado');
      } catch (error) {
        console.log('⚠️ Índice compuesto ya existe o no se pudo crear');
      }
    } else {
      console.log('✅ Índice compuesto ya existe');
    }
    
    // Índice para búsquedas por marca
    if (!indexExists('products', 'idx_active_brand')) {
      try {
        await db.collection('products').createIndex(
          { active: 1, brand: 1 },
          { name: 'idx_active_brand' }
        );
        console.log('✅ Índice de marca creado');
      } catch (error) {
        console.log('⚠️ Índice de marca ya existe o no se pudo crear');
      }
    } else {
      console.log('✅ Índice de marca ya existe');
    }
    
    // Índice para búsquedas por SKU (verificar si ya existe)
    const skuIndexExists = existingProductsIndexes.some(idx => 
      idx.key && idx.key.sku === 1
    );
    
    if (!skuIndexExists) {
      try {
        await db.collection('products').createIndex(
          { sku: 1 },
          { unique: true, name: 'idx_sku_unique' }
        );
        console.log('✅ Índice de SKU creado');
      } catch (error) {
        console.log('⚠️ Índice de SKU ya existe o no se pudo crear');
      }
    } else {
      console.log('✅ Índice de SKU ya existe');
    }
    
    // Índice para variantes de color
    if (!indexExists('products', 'idx_color_variants_sku')) {
      try {
        await db.collection('products').createIndex(
          { 'colorVariants.sku': 1 },
          { name: 'idx_color_variants_sku' }
        );
        console.log('✅ Índice de variantes de color creado');
      } catch (error) {
        console.log('⚠️ Índice de variantes de color ya existe o no se pudo crear');
      }
    } else {
      console.log('✅ Índice de variantes de color ya existe');
    }
    
    // Índice de texto para búsquedas
    const textIndexExists = existingProductsIndexes.some(idx => 
      idx.name === 'idx_text_search' || idx.key && idx.key.name === 'text'
    );
    
    if (!textIndexExists) {
      try {
        await db.collection('products').createIndex(
          { name: 'text', description: 'text', tags: 'text' },
          { 
            name: 'idx_text_search',
            weights: {
              name: 10,
              description: 5,
              tags: 3
            }
          }
        );
        console.log('✅ Índice de texto creado');
      } catch (error) {
        console.log('⚠️ Índice de texto ya existe o no se pudo crear');
      }
    } else {
      console.log('✅ Índice de texto ya existe');
    }
    
    // Índice para slug
    const slugIndexExists = existingProductsIndexes.some(idx => 
      idx.key && idx.key.slug === 1
    );
    
    if (!slugIndexExists) {
      try {
        await db.collection('products').createIndex(
          { slug: 1 },
          { unique: true, name: 'idx_slug_unique' }
        );
        console.log('✅ Índice de slug creado');
      } catch (error) {
        console.log('⚠️ Índice de slug ya existe o no se pudo crear');
      }
    } else {
      console.log('✅ Índice de slug ya existe');
    }
    
    console.log('✅ Índices de products verificados!');
    
    // ===== OPTIMIZAR COLECCIÓN CATEGORIES =====
    console.log('\n📂 Optimizando colección categories...');
    
    if (!categoryIndexExists('categories', 'idx_category_slug_unique')) {
      try {
        await db.collection('categories').createIndex(
          { slug: 1 },
          { unique: true, name: 'idx_category_slug_unique' }
        );
        console.log('✅ Índice de slug de categoría creado');
      } catch (error) {
        console.log('⚠️ Índice de slug de categoría ya existe o no se pudo crear');
      }
    } else {
      console.log('✅ Índice de slug de categoría ya existe');
    }
    
    if (!categoryIndexExists('categories', 'idx_category_active_order')) {
      try {
        await db.collection('categories').createIndex(
          { active: 1, order: 1 },
          { name: 'idx_category_active_order' }
        );
        console.log('✅ Índice de orden de categoría creado');
      } catch (error) {
        console.log('⚠️ Índice de orden de categoría ya existe o no se pudo crear');
      }
    } else {
      console.log('✅ Índice de orden de categoría ya existe');
    }
    
    console.log('✅ Índices de categories verificados!');
    
    // ===== OPTIMIZAR COLECCIÓN SUBCATEGORIES =====
    console.log('\n📁 Optimizando colección subcategories...');
    
    if (!subcategoryIndexExists('subcategories', 'idx_subcategory_slug_unique')) {
      try {
        await db.collection('subcategories').createIndex(
          { slug: 1 },
          { unique: true, name: 'idx_subcategory_slug_unique' }
        );
        console.log('✅ Índice de slug de subcategoría creado');
      } catch (error) {
        console.log('⚠️ Índice de slug de subcategoría ya existe o no se pudo crear');
      }
    } else {
      console.log('✅ Índice de slug de subcategoría ya existe');
    }
    
    if (!subcategoryIndexExists('subcategories', 'idx_subcategory_category_active_order')) {
      try {
        await db.collection('subcategories').createIndex(
          { categoryId: 1, active: 1, order: 1 },
          { name: 'idx_subcategory_category_active_order' }
        );
        console.log('✅ Índice de orden de subcategoría creado');
      } catch (error) {
        console.log('⚠️ Índice de orden de subcategoría ya existe o no se pudo crear');
      }
    } else {
      console.log('✅ Índice de orden de subcategoría ya existe');
    }
    
    console.log('✅ Índices de subcategories verificados!');
    
    // ===== VERIFICAR ÍNDICES FINALES =====
    console.log('\n🔍 Verificando índices finales...');
    
    const finalProductsIndexes = await db.collection('products').indexes();
    const finalCategoriesIndexes = await db.collection('categories').indexes();
    const finalSubcategoriesIndexes = await db.collection('subcategories').indexes();
    
    console.log(`📊 Products: ${finalProductsIndexes.length} índices totales`);
    console.log(`📊 Categories: ${finalCategoriesIndexes.length} índices totales`);
    console.log(`📊 Subcategories: ${finalSubcategoriesIndexes.length} índices totales`);
    
    console.log('\n🎉 ¡Base de datos optimizada exitosamente!');
    console.log('💡 Los índices mejorarán significativamente el rendimiento de las consultas.');
    console.log('🚀 Ahora puedes probar el método optimizado findWithCategories()');
    
  } catch (error) {
    console.error('❌ Error optimizando base de datos:', error);
  } finally {
    process.exit(0);
  }
}

optimizeDatabase();
