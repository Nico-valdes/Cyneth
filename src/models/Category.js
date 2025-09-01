const { ObjectId } = require('mongodb');

/**
 * MODELO UNIFICADO DE CATEGORÍAS
 * 
 * Reemplaza tanto Category.js como Subcategory.js
 * Estructura simple y eficiente para jerarquías de cualquier profundidad
 */

const categorySchema = {
  // Información básica
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  
  // Jerarquía simple
  parent: { type: ObjectId, default: null }, // null = categoría principal
  level: { type: Number, default: 0 }, // 0=principal, 1=sub, 2=sub-sub, etc.
  
  // Tipo para distinguir (opcional - se puede calcular por level)
  type: { 
    type: String, 
    enum: ['main', 'sub'], 
    default: function() { return this.level === 0 ? 'main' : 'sub'; }
  },
  
  // Contadores
  productCount: { type: Number, default: 0 }, // Productos directos
  totalProductCount: { type: Number, default: 0 }, // Incluye subcategorías
  
  // Metadatos
  order: { type: Number, default: 0 }, // Para ordenar al mismo nivel
  active: { type: Boolean, default: true },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

/**
 * ÍNDICES REQUERIDOS PARA PERFORMANCE:
 * 
 * db.categories.createIndex({ parent: 1, level: 1, order: 1, name: 1 })
 * db.categories.createIndex({ type: 1, active: 1 })
 * db.categories.createIndex({ slug: 1 }, { unique: true })
 * db.categories.createIndex({ level: 1, active: 1 })
 */

class Category {
  constructor(db) {
    this.collection = db.collection('categories');
  }

  getCollection() {
    return this.collection;
  }

  // Crear índices necesarios
  async createIndexes() {
    try {
      await this.collection.createIndex({ parent: 1, level: 1, order: 1, name: 1 });
      await this.collection.createIndex({ type: 1, active: 1 });
      await this.collection.createIndex({ slug: 1 }, { unique: true });
      await this.collection.createIndex({ level: 1, active: 1 });
      console.log('✅ Índices de categorías unificadas creados');
    } catch (error) {
      console.error('❌ Error creando índices:', error);
    }
  }

  // Validar jerarquía
  validateHierarchy(categoryData) {
    const errors = [];

    // Validar nivel vs parent
    if (categoryData.level === 0 && categoryData.parent) {
      errors.push('Categorías de nivel 0 no pueden tener parent');
    }
    if (categoryData.level > 0 && !categoryData.parent) {
      errors.push('Categorías de nivel > 0 deben tener parent');
    }

    // Validar profundidad máxima
    if (categoryData.level > 4) {
      errors.push('Máximo 5 niveles de profundidad permitidos');
    }

    return errors;
  }
}

module.exports = Category;
