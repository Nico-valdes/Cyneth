const { connectToDatabase } = require('../src/libs/mongoConnect');
const { ObjectId } = require('mongodb');

/**
 * SCRIPT DE LIMPIEZA Y SEEDING
 * 
 * Limpia completamente la base de datos y crea una estructura 
 * de categorías limpia y bien organizada para empezar desde cero
 */

async function cleanAndSeed() {
  let client = null;
  
  try {
    console.log('🔌 Conectando a MongoDB...');
    client = await connectToDatabase();
    const db = client.db('cyneth');
    
    console.log('\n🧹 LIMPIEZA Y SEEDING DE BASE DE DATOS\n');
    
    // 1. BACKUP DE DATOS ACTUALES
    console.log('📦 Creando backup de datos actuales...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
      const categories = await db.collection('categories').find({}).toArray();
      const products = await db.collection('products').find({}).toArray();
      
      if (categories.length > 0) {
        await db.collection(`categories_backup_${timestamp}`).insertMany(categories);
        console.log(`   ✅ ${categories.length} categorías respaldadas`);
      }
      
      if (products.length > 0) {
        await db.collection(`products_backup_${timestamp}`).insertMany(products);
        console.log(`   ✅ ${products.length} productos respaldados`);
      }
    } catch (error) {
      console.log('   ⚠️  Error en backup (continuando):', error.message);
    }
    
    // 2. LIMPIAR COLECCIONES
    console.log('\n🗑️  Limpiando colecciones...');
    
    await db.collection('categories').deleteMany({});
    await db.collection('products').deleteMany({});
    
    // También limpiar subcategories si existe
    try {
      await db.collection('subcategories').deleteMany({});
    } catch (error) {
      // No importa si no existe
    }
    
    console.log('   ✅ Colecciones limpiadas');
    
    // 3. CREAR ESTRUCTURA DE CATEGORÍAS LIMPIA
    console.log('\n🏗️  Creando estructura de categorías...');
    
    // Estructura jerárquica limpia para un catálogo de plomería/grifería
    const categoryStructure = [
      {
        name: 'Grifería',
        slug: 'griferia',
        description: 'Grifos, canillas y accesorios',
        children: [
          {
            name: 'Baño',
            slug: 'griferia-bano',
            description: 'Grifería para baño',
            children: [
              {
                name: 'Monocomando',
                slug: 'griferia-bano-monocomando',
                description: 'Grifos de una sola palanca',
                children: [
                  { name: 'Lavatorio', slug: 'griferia-bano-monocomando-lavatorio' },
                  { name: 'Bidet', slug: 'griferia-bano-monocomando-bidet' },
                  { name: 'Ducha', slug: 'griferia-bano-monocomando-ducha' },
                  { name: 'Bañera', slug: 'griferia-bano-monocomando-banera' }
                ]
              },
              {
                name: 'Doble Comando',
                slug: 'griferia-bano-doble-comando',
                description: 'Grifos de dos palancas',
                children: [
                  { name: 'Lavatorio', slug: 'griferia-bano-doble-comando-lavatorio' },
                  { name: 'Bidet', slug: 'griferia-bano-doble-comando-bidet' },
                  { name: 'Ducha', slug: 'griferia-bano-doble-comando-ducha' }
                ]
              }
            ]
          },
          {
            name: 'Cocina',
            slug: 'griferia-cocina',
            description: 'Grifería para cocina',
            children: [
              { name: 'Monocomando', slug: 'griferia-cocina-monocomando' },
              { name: 'Doble Comando', slug: 'griferia-cocina-doble-comando' },
              { name: 'Con Filtro', slug: 'griferia-cocina-con-filtro' }
            ]
          },
          {
            name: 'Ducha',
            slug: 'griferia-ducha',
            description: 'Grifería para ducha',
            children: [
              { name: 'Monocomando', slug: 'griferia-ducha-monocomando' },
              { name: 'Termostática', slug: 'griferia-ducha-termostatica' },
              { name: 'Empotrable', slug: 'griferia-ducha-empotrable' }
            ]
          }
        ]
      },
      {
        name: 'Plomería',
        slug: 'plomeria',
        description: 'Tuberías, conexiones y accesorios',
        children: [
          {
            name: 'Tuberías',
            slug: 'plomeria-tuberias',
            children: [
              { name: 'PVC', slug: 'plomeria-tuberias-pvc' },
              { name: 'Cobre', slug: 'plomeria-tuberias-cobre' },
              { name: 'PPR', slug: 'plomeria-tuberias-ppr' }
            ]
          },
          {
            name: 'Conexiones',
            slug: 'plomeria-conexiones',
            children: [
              { name: 'Codos', slug: 'plomeria-conexiones-codos' },
              { name: 'Tés', slug: 'plomeria-conexiones-tes' },
              { name: 'Uniones', slug: 'plomeria-conexiones-uniones' }
            ]
          }
        ]
      },
      {
        name: 'Sanitarios',
        slug: 'sanitarios',
        description: 'Inodoros, lavatorios y bidets',
        children: [
          { name: 'Inodoros', slug: 'sanitarios-inodoros' },
          { name: 'Lavatorios', slug: 'sanitarios-lavatorios' },
          { name: 'Bidets', slug: 'sanitarios-bidets' },
          { name: 'Accesorios', slug: 'sanitarios-accesorios' }
        ]
      },
      {
        name: 'Calefacción',
        slug: 'calefaccion',
        description: 'Sistemas de calefacción',
        children: [
          { name: 'Radiadores', slug: 'calefaccion-radiadores' },
          { name: 'Calderas', slug: 'calefaccion-calderas' },
          { name: 'Accesorios', slug: 'calefaccion-accesorios' }
        ]
      }
    ];
    
    // Función recursiva para insertar categorías
    async function insertCategories(categories, parent = null, level = 0) {
      for (const category of categories) {
        const categoryDoc = {
          _id: new ObjectId(),
          name: category.name,
          slug: category.slug,
          description: category.description || '',
          parent: parent,
          level: level,
          type: level === 0 ? 'main' : 'sub',
          productCount: 0,
          totalProductCount: 0,
          order: 0,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const result = await db.collection('categories').insertOne(categoryDoc);
        console.log(`   ${'  '.repeat(level)}✅ ${category.name} (level ${level})`);
        
        // Insertar hijos recursivamente
        if (category.children && category.children.length > 0) {
          await insertCategories(category.children, result.insertedId, level + 1);
        }
      }
    }
    
    await insertCategories(categoryStructure);
    
    // 4. CREAR ALGUNOS PRODUCTOS DE EJEMPLO
    console.log('\n📦 Creando productos de ejemplo...');
    
    // Obtener algunas categorías para asignar productos
    const griferiaMonocomandoLavatorio = await db.collection('categories').findOne({ 
      slug: 'griferia-bano-monocomando-lavatorio' 
    });
    const griferiaCocina = await db.collection('categories').findOne({ 
      slug: 'griferia-cocina-monocomando' 
    });
    const plomeriaPVC = await db.collection('categories').findOne({ 
      slug: 'plomeria-tuberias-pvc' 
    });
    
    const sampleProducts = [
      {
        _id: new ObjectId(),
        name: 'Grifo Monocomando para Lavatorio Cromo',
        slug: 'grifo-monocomando-lavatorio-cromo',
        description: 'Grifo monocomando de alta calidad con acabado cromado',
        category: griferiaMonocomandoLavatorio?._id,
        brand: 'FV',
        sku: 'FV-001-CR',
        price: 15000,
        images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400'],
        active: true,
        featured: true,
        stock: 25,
        attributes: [
          { name: 'Material', value: 'Latón cromado' },
          { name: 'Garantía', value: '2 años' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        name: 'Grifo de Cocina Extensible',
        slug: 'grifo-cocina-extensible',
        description: 'Grifo de cocina con caño extensible y rociador',
        category: griferiaCocina?._id,
        brand: 'Hidromet',
        sku: 'HM-K001',
        price: 28000,
        images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'],
        active: true,
        featured: false,
        stock: 15,
        attributes: [
          { name: 'Material', value: 'Acero inoxidable' },
          { name: 'Altura', value: '35 cm' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        name: 'Tubería PVC 110mm x 3m',
        slug: 'tuberia-pvc-110mm-3m',
        description: 'Tubería de PVC para desagües de 110mm de diámetro',
        category: plomeriaPVC?._id,
        brand: 'Tigre',
        sku: 'TG-PVC-110-3',
        price: 2500,
        images: ['https://images.unsplash.com/photo-1558618666-fbd68c1c3f90?w=400'],
        active: true,
        featured: false,
        stock: 100,
        attributes: [
          { name: 'Diámetro', value: '110mm' },
          { name: 'Longitud', value: '3 metros' },
          { name: 'Presión máxima', value: '10 bar' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.collection('products').insertMany(sampleProducts);
    console.log(`   ✅ ${sampleProducts.length} productos de ejemplo creados`);
    
    // 5. ACTUALIZAR CONTADORES DE PRODUCTOS
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
              totalProductCount: count.count,
              updatedAt: new Date()
            } 
          }
        );
      }
    }
    
    // 6. CREAR ÍNDICES OPTIMIZADOS
    console.log('\n🔧 Creando índices...');
    
    try {
      // Índices para categories
      await db.collection('categories').createIndex({ parent: 1, level: 1, order: 1 });
      await db.collection('categories').createIndex({ slug: 1 }, { unique: true });
      await db.collection('categories').createIndex({ level: 1, active: 1 });
      await db.collection('categories').createIndex({ type: 1, active: 1 });
      
      // Índices para products
      await db.collection('products').createIndex({ category: 1, active: 1 });
      await db.collection('products').createIndex({ brand: 1, active: 1 });
      await db.collection('products').createIndex({ sku: 1 }, { unique: true });
      await db.collection('products').createIndex({ active: 1, featured: 1 });
      await db.collection('products').createIndex({ name: 'text', description: 'text' });
      
      console.log('   ✅ Índices creados');
    } catch (error) {
      console.log('   ⚠️  Algunos índices ya existían:', error.message);
    }
    
    // 7. VERIFICACIÓN FINAL
    console.log('\n🔍 Verificación final...');
    
    const finalStats = {
      categories: await db.collection('categories').countDocuments(),
      level0: await db.collection('categories').countDocuments({ level: 0 }),
      level1: await db.collection('categories').countDocuments({ level: 1 }),
      level2: await db.collection('categories').countDocuments({ level: 2 }),
      level3: await db.collection('categories').countDocuments({ level: 3 }),
      products: await db.collection('products').countDocuments(),
      productsActive: await db.collection('products').countDocuments({ active: true })
    };
    
    console.log('📈 Estadísticas finales:');
    console.log(`   Total categorías: ${finalStats.categories}`);
    console.log(`   - Nivel 0 (principales): ${finalStats.level0}`);
    console.log(`   - Nivel 1: ${finalStats.level1}`);
    console.log(`   - Nivel 2: ${finalStats.level2}`);
    console.log(`   - Nivel 3: ${finalStats.level3}`);
    console.log(`   Total productos: ${finalStats.products} (${finalStats.productsActive} activos)`);
    
    // 8. PROBAR JERÁRQUÍA
    console.log('\n🧪 Probando jerarquía...');
    
    const CategoryService = require('../src/services/CategoryService');
    const categoryService = new CategoryService(db);
    
    // Probar categorías principales
    const mainCategories = await categoryService.getMainCategories();
    console.log(`   Categorías principales: ${mainCategories.length}`);
    mainCategories.forEach((cat, index) => {
      console.log(`      ${index + 1}. ${cat.name}`);
    });
    
    // Probar jerarquía de grifería
    const griferiaTree = await categoryService.getHierarchicalTree('griferia');
    console.log(`\n   Jerarquía de Grifería: ${griferiaTree.length} ramas`);
    griferiaTree.forEach((branch, index) => {
      console.log(`      ${index + 1}. ${branch.name} (${branch.children?.length || 0} hijos)`);
      if (branch.children) {
        branch.children.forEach((child, childIndex) => {
          console.log(`         ${childIndex + 1}. ${child.name} (${child.children?.length || 0} hijos)`);
        });
      }
    });
    
    console.log('\n🎉 LIMPIEZA Y SEEDING COMPLETADO');
    console.log('\n✨ Base de datos lista para usar con:');
    console.log('   - Estructura jerárquica limpia');
    console.log('   - Categorías bien organizadas');
    console.log('   - Productos de ejemplo');
    console.log('   - Índices optimizados');
    console.log(`   - Backup disponible: *_${timestamp}`);
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Ejecutar
if (require.main === module) {
  cleanAndSeed()
    .then(() => {
      console.log('\n✅ Proceso finalizado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = { cleanAndSeed };


