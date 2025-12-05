require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/cyneth";

async function addPerformanceIndexes() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("✅ Conectado a MongoDB");
    
    const db = client.db('cyneth');
    
    console.log("\n🔧 Agregando índices de rendimiento...\n");
    
    // Índices para brands
    console.log("📦 Índices para brands...");
    try {
      await db.collection('brands').createIndex({ active: 1, name: 1 }, { name: 'idx_active_name' });
      console.log("   ✅ Índice active + name creado");
    } catch (error) {
      console.log("   ⚠️  Índice ya existe o error:", error.message);
    }
    
    // Índices para categories
    console.log("📦 Índices para categories...");
    try {
      await db.collection('categories').createIndex({ active: 1, level: 1, order: 1, name: 1 }, { name: 'idx_active_level_order_name' });
      console.log("   ✅ Índice compuesto creado");
    } catch (error) {
      console.log("   ⚠️  Índice ya existe o error:", error.message);
    }
    
    // Índices para products - ordenamiento con featured
    console.log("📦 Índices para products (ordenamiento)...");
    try {
      // Índice para ordenamiento por featured + name
      await db.collection('products').createIndex({ active: 1, featured: -1, name: 1 }, { name: 'idx_active_featured_name' });
      console.log("   ✅ Índice active + featured + name creado");
      
      // Índice para ordenamiento por featured + brand
      await db.collection('products').createIndex({ active: 1, featured: -1, brand: 1 }, { name: 'idx_active_featured_brand' });
      console.log("   ✅ Índice active + featured + brand creado");
      
      // Índice para ordenamiento por featured + createdAt
      await db.collection('products').createIndex({ active: 1, featured: -1, createdAt: -1 }, { name: 'idx_active_featured_created' });
      console.log("   ✅ Índice active + featured + createdAt creado");
    } catch (error) {
      console.log("   ⚠️  Algunos índices ya existen o error:", error.message);
    }
    
    // Índice para búsqueda por color
    console.log("📦 Índice para búsqueda por color...");
    try {
      await db.collection('products').createIndex({ 'colorVariants.colorName': 1, active: 1 }, { name: 'idx_color_active' });
      console.log("   ✅ Índice colorVariants.colorName + active creado");
    } catch (error) {
      console.log("   ⚠️  Índice ya existe o error:", error.message);
    }
    
    console.log("\n✅ Índices de rendimiento agregados exitosamente!");
    
    // Mostrar estadísticas de índices
    console.log("\n📊 Índices existentes:");
    const collections = ['products', 'categories', 'brands'];
    for (const collectionName of collections) {
      const indexes = await db.collection(collectionName).indexes();
      console.log(`\n${collectionName}:`);
      indexes.forEach(idx => {
        console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
      });
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
    console.log("\n🔌 Conexión cerrada");
  }
}

addPerformanceIndexes();

