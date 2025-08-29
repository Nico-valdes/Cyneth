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

async function connectToDatabase() {
  // Si ya tenemos una conexión, la retornamos
  if (cachedClient) {
    return cachedClient;
  }

  try {
    // Conectar el cliente al servidor
    await client.connect();
    
    // Enviar ping para confirmar conexión exitosa
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Conectado exitosamente a MongoDB!");
    
    // Cachear la conexión
    cachedClient = client;
    
    return client;
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
    throw error;
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
