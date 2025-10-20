// Cargar variables de entorno desde .env en la raíz del proyecto
require('dotenv').config({ path: '../../.env' });
const { MongoClient } = require('mongodb');

// Función para generar slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Función para capitalizar solo la primera letra
const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Nueva estructura de categorías CYNETH
const CYNETH_CATEGORIES = [
  {
    name: "Grifería",
    children: [
      {
        name: "Grifería para baño",
        children: [
          {
            name: "Bi comando",
            children: [
              { name: "Lavatorio" },
              { name: "Bidet" },
              { name: "Ducha" }
            ]
          },
          {
            name: "Monocomando",
            children: [
              { name: "Lavatorio" },
              { name: "Bidet" },
              { name: "Ducha" }
            ]
          }
        ]
      },
      {
        name: "Grifería para cocina",
        children: [
          { name: "Bicomando" },
          { name: "Monocomando" }
        ]
      },
      { name: "Accesorios" },
      { name: "Repuestos" },
      { name: "Sopapas" }
    ]
  },
  {
    name: "Caños y conexión de agua",
    children: [
      {
        name: "Termofusión",
        children: [
          { name: "Caños" },
          { name: "Conexiones" },
          { name: "Herramientas" }
        ]
      },
      {
        name: "Polipropileno",
        children: [
          { name: "Caños" },
          { name: "Conexiones" },
          { name: "Herramientas" }
        ]
      }
    ]
  },
  {
    name: "Caños y conexiones desagüe",
    children: [
      { name: "Caños" },
      { name: "Conexiones" },
      {
        name: "Canaletas",
        children: [
          { name: "Techo" },
          { name: "Piso" }
        ]
      },
      { name: "Complementos y herramientas" }
    ]
  },
  {
    name: "Caños y conexiones gas",
    children: [
      {
        name: "Termofusión",
        children: [
          { name: "Caños" },
          { name: "Accesorios" },
          { name: "Herramientas" }
        ]
      },
      {
        name: "Epoxi",
        children: [
          { name: "Caños" },
          { name: "Accesorios" }
        ]
      },
      { name: "Reguladores" },
      { name: "Accesorios (vainas, nichos, puertas, pilares, gripper - rejillas)" },
      { name: "Ventilación" }
    ]
  },
  {
    name: "Sanitarios",
    children: [
      { name: "Bidets" },
      { name: "Inodoros" },
      { name: "Depósitos" },
      { name: "Asientos y tapas" },
      { name: "Bañera y receptáculos" },
      { name: "Bachas" },
      { name: "Repuestos" },
      { name: "Complementos de instalación (tornillo inodoro, etc)" }
    ]
  },
  {
    name: "Piletas de acero",
    children: [
      { name: "Baño" },
      { name: "Lavadero" },
      { name: "Cocina" }
    ]
  },
  {
    name: "Tanques agua",
    children: [
      {
        name: "Tanques",
        children: [
          { name: "Bicapa" },
          { name: "Tricapa" },
          { name: "Cuatricapa" }
        ]
      },
      { name: "Cisterna" },
      { name: "Biodigestores" },
      { name: "Accesorios (flotantes, bases)" }
    ]
  },
  {
    name: "Bombas",
    children: [
      { name: "Presurizadora" },
      { name: "Elevadora" },
      { name: "Piscina" },
      { name: "Accesorios" }
    ]
  },
  {
    name: "Riego",
    children: [
      {
        name: "PVC soldable",
        children: [
          { name: "Caños" },
          { name: "Conexiones" }
        ]
      },
      {
        name: "Polietileno",
        children: [
          { name: "Caños" },
          { name: "Conexiones" }
        ]
      },
      { name: "Accesorios" },
      { name: "Sistema de riego" },
      { name: "Canillas" }
    ]
  },
  {
    name: "Flexibles",
    children: [
      { name: "Agua" },
      { name: "Gas" }
    ]
  }
];

async function migrateCynethCategories() {
  // Obtener URI desde variables de entorno
  const uri = process.env.MONGODB_URI;
  
  // Validar que la URI esté configurada
  if (!process.env.MONGODB_URI) {
    console.warn("⚠️  MONGODB_URI no está configurada en .env, usando MongoDB local por defecto");
  }
  
  // Create a MongoClient sin configuración de serverApi para mayor compatibilidad
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    
    // Enviar ping para confirmar conexión exitosa
    await client.db("admin").command({ ping: 1 });
    console.log('🔌 Conectado exitosamente a MongoDB!');
    
    const db = client.db('cyneth');
    const categoriesCollection = db.collection('categories');
    const productsCollection = db.collection('products');
    
    console.log('📊 Verificando datos actuales...');
    const currentCategories = await categoriesCollection.countDocuments();
    const currentProducts = await productsCollection.countDocuments();
    console.log(`   - Categorías actuales: ${currentCategories}`);
    console.log(`   - Productos actuales: ${currentProducts}`);
    
    // PASO 1: Eliminar todas las categorías existentes
    console.log('\n🗑️ PASO 1: Eliminando categorías existentes...');
    const deleteResult = await categoriesCollection.deleteMany({});
    console.log(`   ✅ ${deleteResult.deletedCount} categorías eliminadas`);
    
    // PASO 2: Crear las nuevas categorías
    console.log('\n📝 PASO 2: Creando nueva estructura de categorías CYNETH...');
    
    let order = 1;
    
    for (const mainCategory of CYNETH_CATEGORIES) {
      console.log(`\n🔸 Creando categoría principal: ${mainCategory.name}`);
      
      // Crear categoría principal
      const mainCategoryDoc = {
        name: mainCategory.name,
        slug: generateSlug(mainCategory.name),
        description: '',
        parent: null,
        level: 0,
        type: 'main',
        productCount: 0,
        totalProductCount: 0,
        order: order++,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const mainResult = await categoriesCollection.insertOne(mainCategoryDoc);
      const mainCategoryId = mainResult.insertedId;
      console.log(`   ✅ Categoría principal creada: ${mainCategory.name} (ID: ${mainCategoryId})`);
      
      // Crear subcategorías de primer nivel
      if (mainCategory.children) {
        let subOrder = 1;
        
        for (const subCategory of mainCategory.children) {
          console.log(`   🔹 Creando subcategoría: ${subCategory.name}`);
          
          const subCategoryDoc = {
            name: subCategory.name,
            slug: generateSlug(`${mainCategory.name}-${subCategory.name}`),
            description: '',
            parent: mainCategoryId,
            level: 1,
            type: 'sub',
            productCount: 0,
            totalProductCount: 0,
            order: subOrder++,
            active: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          const subResult = await categoriesCollection.insertOne(subCategoryDoc);
          const subCategoryId = subResult.insertedId;
          console.log(`      ✅ Subcategoría creada: ${subCategory.name} (ID: ${subCategoryId})`);
          
          // Crear subcategorías de segundo nivel
          if (subCategory.children) {
            let subSubOrder = 1;
            
            for (const subSubCategory of subCategory.children) {
              console.log(`      🔸 Creando sub-subcategoría: ${subSubCategory.name}`);
              
              const subSubCategoryDoc = {
                name: subSubCategory.name,
                slug: generateSlug(`${mainCategory.name}-${subCategory.name}-${subSubCategory.name}`),
                description: '',
                parent: subCategoryId,
                level: 2,
                type: 'sub',
                productCount: 0,
                totalProductCount: 0,
                order: subSubOrder++,
                active: true,
                createdAt: new Date(),
                updatedAt: new Date()
              };
              
              const subSubResult = await categoriesCollection.insertOne(subSubCategoryDoc);
              const subSubCategoryId = subSubResult.insertedId;
              console.log(`         ✅ Sub-subcategoría creada: ${subSubCategory.name} (ID: ${subSubCategoryId})`);
              
              // Crear subcategorías de tercer nivel si existen
              if (subSubCategory.children) {
                let subSubSubOrder = 1;
                
                for (const subSubSubCategory of subSubCategory.children) {
                  console.log(`         🔹 Creando sub-sub-subcategoría: ${subSubSubCategory.name}`);
                  
                  const subSubSubCategoryDoc = {
                    name: subSubSubCategory.name,
                    slug: generateSlug(`${mainCategory.name}-${subCategory.name}-${subSubCategory.name}-${subSubSubCategory.name}`),
                    description: '',
                    parent: subSubCategoryId,
                    level: 3,
                    type: 'sub',
                    productCount: 0,
                    totalProductCount: 0,
                    order: subSubSubOrder++,
                    active: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                  };
                  
                  const subSubSubResult = await categoriesCollection.insertOne(subSubSubCategoryDoc);
                  const subSubSubCategoryId = subSubSubResult.insertedId;
                  console.log(`            ✅ Sub-sub-subcategoría creada: ${subSubSubCategory.name} (ID: ${subSubSubCategoryId})`);
                }
              }
            }
          }
        }
      }
    }
    
    // PASO 3: Verificar resultados
    console.log('\n📊 PASO 3: Verificando resultados...');
    const finalCategories = await categoriesCollection.countDocuments();
    const mainCategories = await categoriesCollection.countDocuments({ level: 0 });
    const subCategories = await categoriesCollection.countDocuments({ level: 1 });
    const subSubCategories = await categoriesCollection.countDocuments({ level: 2 });
    const subSubSubCategories = await categoriesCollection.countDocuments({ level: 3 });
    
    console.log(`   ✅ Total de categorías creadas: ${finalCategories}`);
    console.log(`   📁 Categorías principales (nivel 0): ${mainCategories}`);
    console.log(`   📂 Subcategorías (nivel 1): ${subCategories}`);
    console.log(`   📂 Sub-subcategorías (nivel 2): ${subSubCategories}`);
    console.log(`   📂 Sub-sub-subcategorías (nivel 3): ${subSubSubCategories}`);
    
    // PASO 4: Crear índices
    console.log('\n🔧 PASO 4: Creando índices...');
    try {
      await categoriesCollection.createIndex({ parent: 1, level: 1, order: 1, name: 1 });
      await categoriesCollection.createIndex({ type: 1, active: 1 });
      await categoriesCollection.createIndex({ slug: 1 }, { unique: true });
      await categoriesCollection.createIndex({ level: 1, active: 1 });
      console.log('   ✅ Índices creados correctamente');
    } catch (error) {
      console.log('   ⚠️ Algunos índices ya existían, continuando...');
    }
    
    console.log('\n🎉 ¡Migración de categorías CYNETH completada exitosamente!');
    console.log('\nEstructura creada:');
    console.log('- GRIFERIA');
    console.log('- CAÑOS Y CONEXIÓN DE AGUA');
    console.log('- CAÑOS Y CONEXIONES DESAGÜE');
    console.log('- CAÑOS Y CONEXIONES GAS');
    console.log('- SANITARIOS');
    console.log('- PILETAS DE ACERO');
    console.log('- TANQUES AGUA');
    console.log('- BOMBAS');
    console.log('- RIEGO');
    console.log('- FLEXIBLES');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  migrateCynethCategories()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error ejecutando script:', error);
      process.exit(1);
    });
}

module.exports = migrateCynethCategories;
