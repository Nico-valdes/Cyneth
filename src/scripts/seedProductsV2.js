const { connectToDatabase } = require('../libs/mongoConnect');
const ProductService = require('../services/ProductService');

// Datos de prueba con estructura correcta
const sampleProducts = [
  {
    name: "Caño PVC 110mm x 3m",
    category: "Caños",
    subcategory: "PVC",
    brand: "Tigre",
    description: "Caño de PVC para drenaje de 110mm de diámetro y 3 metros de longitud",
    specifications: {
      material: "PVC",
      diameter: "110mm",
      length: "3m",
      pressure: "10 bar",
      temperature: "60°C",
      color: "Gris"
    },
    variations: [
      {
        attributes: { diameter: "110mm", length: "3m" },
        stock: 150,
        sku: "PVC-110-3M-TIGRE",
        active: true
      },
      {
        attributes: { diameter: "110mm", length: "6m" },
        stock: 80,
        sku: "PVC-110-6M-TIGRE",
        active: true
      }
    ],
    tags: ["caño", "pvc", "110mm", "drenaje", "tigre"],
    images: [
      {
        url: "https://ejemplo.com/caño-pvc-110mm.jpg",
        alt: "Caño PVC 110mm Tigre",
        priority: 1
      }
    ],
    active: true
  },
  {
    name: "Caño PVC 160mm x 3m",
    category: "Caños",
    subcategory: "PVC",
    brand: "Tigre",
    description: "Caño de PVC para drenaje de 160mm de diámetro y 3 metros de longitud",
    specifications: {
      material: "PVC",
      diameter: "160mm",
      length: "3m",
      pressure: "10 bar",
      temperature: "60°C",
      color: "Gris"
    },
    variations: [
      {
        attributes: { diameter: "160mm", length: "3m" },
        stock: 100,
        sku: "PVC-160-3M-TIGRE",
        active: true
      }
    ],
    tags: ["caño", "pvc", "160mm", "drenaje", "tigre"],
    images: [
      {
        url: "https://ejemplo.com/caño-pvc-160mm.jpg",
        alt: "Caño PVC 160mm Tigre",
        priority: 1
      }
    ],
    active: true
  },
  {
    name: "Bomba Hidráulica 1HP",
    category: "Bombas",
    subcategory: "Hidráulicas",
    brand: "Grundfos",
    description: "Bomba hidráulica sumergible de 1 caballo de fuerza para pozos",
    specifications: {
      potencia: "1HP",
      caudal: "2000L/h",
      altura: "30m",
      voltaje: "220V",
      tipo: "Sumergible",
      material: "Acero inoxidable"
    },
    variations: [
      {
        attributes: { potencia: "1HP", voltaje: "220V" },
        stock: 25,
        sku: "BOMBA-1HP-220V-GRUNDFOS",
        active: true
      },
      {
        attributes: { potencia: "1HP", voltaje: "380V" },
        stock: 15,
        sku: "BOMBA-1HP-380V-GRUNDFOS",
        active: true
      }
    ],
    tags: ["bomba", "hidráulica", "1hp", "sumergible", "grundfos"],
    images: [
      {
        url: "https://ejemplo.com/bomba-1hp.jpg",
        alt: "Bomba Hidráulica 1HP Grundfos",
        priority: 1
      }
    ],
    active: true
  },
  {
    name: "Bomba Centrífuga 2HP",
    category: "Bombas",
    subcategory: "Centrífugas",
    brand: "Pedrollo",
    description: "Bomba centrífuga de 2 caballos de fuerza para riego",
    specifications: {
      potencia: "2HP",
      caudal: "4000L/h",
      altura: "45m",
      voltaje: "220V",
      tipo: "Centrífuga",
      material: "Hierro fundido"
    },
    variations: [
      {
        attributes: { potencia: "2HP", voltaje: "220V" },
        stock: 18,
        sku: "BOMBA-2HP-220V-PEDROLLO",
        active: true
      }
    ],
    tags: ["bomba", "centrífuga", "2hp", "riego", "pedrollo"],
    images: [
      {
        url: "https://ejemplo.com/bomba-2hp.jpg",
        alt: "Bomba Centrífuga 2HP Pedrollo",
        priority: 1
      }
    ],
    active: true
  },
  {
    name: "Inodoro Completo con Tapa",
    category: "Sanitarios",
    subcategory: "Inodoros",
    brand: "Ferrum",
    description: "Inodoro completo con tapa, taza y mochila de empotrar",
    specifications: {
      tipo: "Completo",
      material: "Porcelana",
      color: "Blanco",
      descarga: "Doble descarga",
      instalacion: "Empotrar"
    },
    variations: [
      {
        attributes: { color: "Blanco", descarga: "Doble" },
        stock: 45,
        sku: "INODORO-COMPLETO-BLANCO-FERRUM",
        active: true
      }
    ],
    tags: ["inodoro", "completo", "ferrum", "porcelana", "blanco"],
    images: [
      {
        url: "https://ejemplo.com/inodoro-completo.jpg",
        alt: "Inodoro Completo Ferrum",
        priority: 1
      }
    ],
    active: true
  },
  {
    name: "Bidet de Pared",
    category: "Sanitarios",
    subcategory: "Bidets",
    brand: "Roca",
    description: "Bidet de pared en porcelana blanca",
    specifications: {
      tipo: "Pared",
      material: "Porcelana",
      color: "Blanco",
      instalacion: "Pared"
    },
    variations: [
      {
        attributes: { color: "Blanco", instalacion: "Pared" },
        stock: 30,
        sku: "BIDET-PARED-BLANCO-ROCA",
        active: true
      }
    ],
    tags: ["bidet", "pared", "roca", "porcelana", "blanco"],
    images: [
      {
        url: "https://ejemplo.com/bidet-pared.jpg",
        alt: "Bidet de Pared Roca",
        priority: 1
      }
    ],
    active: true
  },
  {
    name: "Llave de Paso 1/2\"",
    category: "Grifería",
    subcategory: "Llaves",
    brand: "Fiat",
    description: "Llave de paso de 1/2 pulgada en bronce",
    specifications: {
      medida: "1/2\"",
      material: "Bronce",
      tipo: "Paso",
      presion: "16 bar"
    },
    variations: [
      {
        attributes: { medida: "1/2\"", material: "Bronce" },
        stock: 200,
        sku: "LLAVE-1-2-BRONCE-FIAT",
        active: true
      }
    ],
    tags: ["llave", "paso", "1/2", "bronce", "fiat"],
    images: [
      {
        url: "https://ejemplo.com/llave-paso.jpg",
        alt: "Llave de Paso 1/2\" Fiat",
        priority: 1
      }
    ],
    active: true
  }
];

async function seedProductsV2() {
  let client = null;
  
  try {
    console.log('🌱 Iniciando inserción de productos V2 con estructura correcta...\n');
    
    // Conectar a MongoDB
    client = await connectToDatabase();
    const db = client.db('cyneth');
    
    // Crear instancia del servicio
    const productService = new ProductService(db);
    
    // Limpiar productos existentes (opcional)
    console.log('🧹 Limpiando productos existentes...');
    const existingProducts = await productService.find({}, { limit: 1000 });
    for (const product of existingProducts) {
      await productService.delete(product._id.toString());
    }
    console.log(`🗑️  ${existingProducts.length} productos eliminados\n`);
    
    // Insertar nuevos productos
    console.log('📦 Insertando nuevos productos...\n');
    for (const productData of sampleProducts) {
      try {
        const product = await productService.create(productData);
        console.log(`✅ Producto creado: ${product.name} (${product.category} > ${product.subcategory} > ${product.brand})`);
      } catch (error) {
        console.error(`❌ Error creando producto ${productData.name}:`, error.message);
      }
    }
    
    console.log('\n🎉 Inserción de productos V2 completada!');
    
    // Obtener estadísticas
    try {
      const totalProducts = await productService.count();
      console.log(`\n📊 Total de productos en la base de datos: ${totalProducts}`);
    } catch (statsError) {
      console.log('\n⚠️ No se pudieron obtener estadísticas');
    }
    
  } catch (error) {
    console.error('❌ Error en el script de inserción V2:', error);
  } finally {
    // Cerrar conexión
    if (client) {
      try {
        await client.close();
        console.log('\n🔌 Conexión cerrada');
      } catch (closeError) {
        console.log('⚠️ Error cerrando conexión:', closeError.message);
      }
    }
  }
}

// Ejecutar el script
seedProductsV2();

