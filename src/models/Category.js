const { ObjectId } = require('mongodb');

// Esquema de Categoría con soporte para anidación múltiple
const categorySchema = {
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  
  // Jerarquía de categorías
  parentId: { type: ObjectId, default: null }, // null para categorías raíz
  level: { type: Number, default: 0 }, // 0=raíz, 1=subcategoría, 2=sub-subcategoría, etc.
  path: { type: String }, // Ej: "sanitarios/banos/griferia" para navegación
  
  // Información de jerarquía
  ancestors: [{ // Array de IDs de categorías padre
    categoryId: { type: ObjectId },
    name: { type: String },
    slug: { type: String },
    level: { type: Number }
  }],
  
  // Subcategorías directas (para consultas rápidas)
  children: [{
    categoryId: { type: ObjectId },
    name: { type: String },
    slug: { type: String },
    productCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  }],
  
  // Contadores
  productCount: { type: Number, default: 0 }, // Productos directos en esta categoría
  totalProductCount: { type: Number, default: 0 }, // Incluye productos de subcategorías
  
  // Metadatos para SEO y organización
  icon: { type: String }, // Icono para la interfaz
  color: { type: String }, // Color temático
  order: { type: Number, default: 0 }, // Para ordenar categorías del mismo nivel
  
  // Estado
  active: { type: Boolean, default: true },
  featured: { type: Boolean, default: false }, // Para destacar en la página principal
  
  // Metadatos
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// Ejemplos de estructura jerárquica:
// Nivel 0: Sanitarios, Gas, Cocina, Plomería
// Nivel 1: Baños, Duchas, Lavabos (bajo Sanitarios)
// Nivel 2: Grifería, Accesorios, Desagües (bajo Baños)
// Nivel 3: Monocomandos, Bimandos (bajo Grifería)

// Clase básica del modelo (solo estructura)
class Category {
  constructor(db) {
    this.collection = db.collection('categories');
  }

  // Método para obtener la colección (para servicios)
  getCollection() {
    return this.collection;
  }
}

module.exports = Category;
