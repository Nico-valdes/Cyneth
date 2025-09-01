const { connectToDatabase, closeConnection } = require('../src/libs/mongoConnect');

/**
 * SCRIPT DE MIGRACIÓN A MODELO UNIFICADO
 * 
 * Convierte el sistema actual (Category + Subcategory) al modelo unificado
 * 
 * INSTRUCCIONES:
 * 1. Asegúrate de que MongoDB esté ejecutándose
 * 2. Ejecuta: node scripts/migrate-to-unified.js
 * 3. El script creará un backup automático antes de migrar
 * 
 * NOTA: Este script usa la misma configuración de MongoDB que la aplicación
 */

// Usar la base de datos desde las variables de entorno o la por defecto
const DB_NAME = process.env.DB_NAME || 'cyneth';

async function migrateToUnified() {
  let client = null;
  
  try {
    console.log('🔌 Conectando a MongoDB usando configuración de la aplicación...');
    client = await connectToDatabase();
    const db = client.db(DB_NAME);
    
    console.log('🚀 INICIANDO MIGRACIÓN A MODELO UNIFICADO\n');
    
    // 1. VERIFICAR ESTADO ACTUAL
    console.log('📊 Verificando estado actual...');
    const categoriesCount = await db.collection('categories').countDocuments();
    const subcategoriesCount = await db.collection('subcategories').countDocuments();
    const productsCount = await db.collection('products').countDocuments();
    
    console.log(`   - Categorías: ${categoriesCount}`);
    console.log(`   - Subcategorías: ${subcategoriesCount}`);
    console.log(`   - Productos: ${productsCount}`);
    
    if (categoriesCount === 0 && subcategoriesCount === 0) {
      console.log('⚠️  No hay datos para migrar. Saliendo...');
      return;
    }
    
    // 2. BACKUP DE DATOS ACTUALES
    console.log('\n📦 Creando backup...');
    const categoriesOld = await db.collection('categories').find({}).toArray();
    const subcategoriesOld = await db.collection('subcategories').find({}).toArray();
    const productsOld = await db.collection('products').find({}).toArray();
    
    // Crear colecciones de backup con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await db.collection(`categories_backup_${timestamp}`).insertMany(categoriesOld.length ? categoriesOld : [{ _placeholder: true }]);
    await db.collection(`subcategories_backup_${timestamp}`).insertMany(subcategoriesOld.length ? subcategoriesOld : [{ _placeholder: true }]);
    await db.collection(`products_backup_${timestamp}`).insertMany(productsOld.length ? productsOld : [{ _placeholder: true }]);
    
    console.log(`✅ Backup creado con timestamp: ${timestamp}`);
    
    // 3. CREAR NUEVA COLECCIÓN UNIFICADA
    console.log('\n🏗️  Creando estructura unificada...');
    
    // Borrar colección actual y recrear
    try {
      await db.collection('categories').drop();
      console.log('🗑️  Colección categories antigua eliminada');
    } catch (e) {
      console.log('ℹ️  Colección categories no existía');
    }
    
    const newCategories = [];
    
    // 3.1 Migrar categorías principales (de categories)
    console.log('📋 Migrando categorías principales...');
    categoriesOld.forEach(cat => {
      newCategories.push({
        _id: cat._id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        parent: null,
        level: 0,
        type: 'main',
        productCount: cat.productCount || 0,
        totalProductCount: cat.totalProductCount || cat.productCount || 0,
        order: cat.order || 0,
        active: cat.active !== false,
        createdAt: cat.createdAt || new Date(),
        updatedAt: new Date()
      });
    });
    
    // 3.2 Migrar subcategorías (de subcategories)
    console.log('📋 Migrando subcategorías...');
    
    // Crear un mapa para resolver referencias
    const categoryMap = new Map();
    categoriesOld.forEach(cat => {
      categoryMap.set(cat.slug, cat._id);
    });
    
    subcategoriesOld.forEach(sub => {
      // Encontrar la categoría principal
      const mainCategoryId = categoryMap.get(sub.categorySlug);
      
      // Determinar el parent correcto
      let parentId = null;
      if (sub.parent) {
        parentId = sub.parent;
      } else if (mainCategoryId) {
        parentId = mainCategoryId;
      }
      
      newCategories.push({
        _id: sub._id,
        name: sub.name,
        slug: sub.slug,
        description: sub.description || '',
        parent: parentId,
        level: sub.level || (sub.parent ? 2 : 1), // Ajustar nivel
        type: 'sub',
        productCount: sub.productCount || 0,
        totalProductCount: sub.productCount || 0,
        order: 0,
        active: sub.active !== false,
        createdAt: sub.createdAt || new Date(),
        updatedAt: new Date()
      });
    });
    
    // Insertar categorías unificadas
    if (newCategories.length > 0) {
      await db.collection('categories').insertMany(newCategories);
      console.log(`✅ ${newCategories.length} categorías unificadas creadas`);
    }
    
    // 4. CREAR ÍNDICES OPTIMIZADOS
    console.log('\n🔧 Creando índices optimizados...');
    try {
      await db.collection('categories').createIndex({ parent: 1, level: 1, order: 1, name: 1 });
      await db.collection('categories').createIndex({ type: 1, active: 1 });
      await db.collection('categories').createIndex({ slug: 1 }, { unique: true });
      await db.collection('categories').createIndex({ level: 1, active: 1 });
      console.log('✅ Índices de categorías creados');
    } catch (error) {
      console.log('⚠️  Algunos índices ya existían:', error.message);
    }
    
    // 5. MIGRAR PRODUCTOS
    console.log('\n📦 Migrando productos...');
    
    // Crear mapa de subcategorías
    const subcategoryMap = new Map();
    subcategoriesOld.forEach(sub => {
      subcategoryMap.set(sub.slug, sub._id);
    });
    
    let migratedProducts = 0;
    for (const product of productsOld) {
      let categoryId = null;
      
      // Determinar la categoría más específica
      if (product.subcategorySlug && subcategoryMap.has(product.subcategorySlug)) {
        categoryId = subcategoryMap.get(product.subcategorySlug);
      } else if (product.categorySlug && categoryMap.has(product.categorySlug)) {
        categoryId = categoryMap.get(product.categorySlug);
      }
      
      if (categoryId) {
        // Actualizar producto con nueva estructura
        await db.collection('products').updateOne(
          { _id: product._id },
          {
            $set: {
              category: categoryId,
              updatedAt: new Date()
            },
            $unset: {
              categorySlug: 1,
              subcategory: 1,
              subcategorySlug: 1,
              categoryPath: 1,
              categoryPathNames: 1,
              categoryBreadcrumb: 1
            }
          }
        );
        migratedProducts++;
      } else {
        console.log(`⚠️  Producto sin categoría válida: ${product.name}`);
      }
    }
    console.log(`✅ ${migratedProducts}/${productsOld.length} productos migrados`);
    
    // 6. CREAR ÍNDICES DE PRODUCTOS
    console.log('\n🔧 Creando índices de productos...');
    try {
      await db.collection('products').createIndex({ category: 1, active: 1 });
      await db.collection('products').createIndex({ brand: 1, active: 1 });
      await db.collection('products').createIndex({ sku: 1 }, { unique: true });
      await db.collection('products').createIndex({ active: 1, featured: 1 });
      console.log('✅ Índices de productos creados');
    } catch (error) {
      console.log('⚠️  Algunos índices ya existían:', error.message);
    }
    
    // 7. ACTUALIZAR CONTADORES
    console.log('\n📊 Actualizando contadores...');
    const productCounts = await db.collection('products').aggregate([
      { $match: { active: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]).toArray();
    
    for (const count of productCounts) {
      if (count._id) {
        await db.collection('categories').updateOne(
          { _id: count._id },
          { 
            $set: { 
              productCount: count.count,
              totalProductCount: count.count, // Por ahora igual, luego se puede calcular recursivo
              updatedAt: new Date()
            } 
          }
        );
      }
    }
    console.log('✅ Contadores actualizados');
    
    // 8. VERIFICACIÓN FINAL
    console.log('\n🔍 Verificando migración...');
    const finalCategories = await db.collection('categories').find({}).toArray();
    const finalProducts = await db.collection('products').find({}).toArray();
    
    const mainCategories = finalCategories.filter(c => c.level === 0);
    const subCategories = finalCategories.filter(c => c.level > 0);
    const productsWithCategory = finalProducts.filter(p => p.category);
    
    console.log(`📊 RESULTADO FINAL:`);
    console.log(`   - Categorías principales: ${mainCategories.length}`);
    console.log(`   - Subcategorías: ${subCategories.length}`);
    console.log(`   - Total categorías: ${finalCategories.length}`);
    console.log(`   - Productos con categoría: ${productsWithCategory.length}/${finalProducts.length}`);
    
    // 9. ELIMINAR COLECCIÓN OBSOLETA
    console.log('\n🗑️  Limpiando colecciones obsoletas...');
    try {
      await db.collection('subcategories').drop();
      console.log('✅ Colección subcategories eliminada');
    } catch (e) {
      console.log('ℹ️  Colección subcategories no existía');
    }
    
    console.log('\n🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE');
    console.log('\n💡 PRÓXIMOS PASOS:');
    console.log('   1. Reiniciar la aplicación Next.js');
    console.log('   2. Probar el catálogo y filtros');
    console.log('   3. Verificar formulario de productos en admin');
    console.log(`   4. Si todo funciona, eliminar colecciones backup_${timestamp}`);
    
  } catch (error) {
    console.error('\n❌ ERROR EN MIGRACIÓN:', error.message);
    console.log('\n🔄 Para revertir:');
    console.log('   1. Restaurar desde las colecciones *_backup_*');
    console.log('   2. Recrear índices originales');
    console.log('   3. Revisar logs para identificar el problema');
  } finally {
    if (client) {
      await closeConnection();
    }
  }
}

// Verificar argumentos de línea de comandos
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🔄 SCRIPT DE MIGRACIÓN A MODELO UNIFICADO

Uso: node scripts/migrate-to-unified.js [opciones]

Opciones:
  --help, -h    Mostrar esta ayuda
  
Variables de entorno:
  MONGODB_URI   URI de conexión a MongoDB (se usa la de .env o default)
  DB_NAME       Nombre de la base de datos (default: cyneth)
  
Ejemplo:
  DB_NAME=cyneth node scripts/migrate-to-unified.js
  
Nota: El script usa automáticamente la configuración de MongoDB de src/libs/mongoConnect.js
  `);
  process.exit(0);
}

// Ejecutar migración
if (require.main === module) {
  migrateToUnified()
    .then(() => {
      console.log('\n✨ Proceso finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = { migrateToUnified };
