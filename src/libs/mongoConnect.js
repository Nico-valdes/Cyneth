// Cargar variables de entorno desde .env
require('dotenv').config();

const { MongoClient } = require('mongodb');

// Obtener URI desde variables de entorno
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/cyneth";

// Validar que la URI esté configurada
if (!process.env.MONGODB_URI) {
  console.warn("⚠️  MONGODB_URI no está configurada en .env, usando MongoDB local por defecto");
}

// Create a MongoClient sin configuración de serverApi para mayor compatibilidad
const client = new MongoClient(uri);

// Variable global para cachear la conexión
let cachedClient = null;

let isConnecting = false;

async function connectToDatabase() {
  // Si ya tenemos una conexión cacheada, retornarla directamente (sin verificación costosa)
  if (cachedClient) {
    return cachedClient;
  }
  
  // Evitar múltiples conexiones simultáneas
  if (isConnecting) {
    // Esperar a que termine la conexión en curso
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    if (cachedClient) {
      return cachedClient;
    }
  }

  try {
    isConnecting = true;
    
    // Conectar el cliente al servidor
    await client.connect();
    
    // Cachear la conexión
    cachedClient = client;
    
    // Solo imprimir en la primera conexión
    console.log("✅ Conectado exitosamente a MongoDB!");
    
    return client;
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
    cachedClient = null;
    throw error;
  } finally {
    isConnecting = false;
  }
}

// Función para cerrar la conexión (útil para testing)
async function closeConnection() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    console.log("🔌 Conexión a MongoDB cerrada");
  }
}

module.exports = {
  connectToDatabase,
  closeConnection,
  client
};
