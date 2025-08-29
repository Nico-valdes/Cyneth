// Esquema de Subcategoría con soporte para anidación
const subcategorySchema = {
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  categorySlug: { type: String, required: true },
  parent: { type: String, default: null }, // ID de la subcategoría padre (null = nivel raíz)
  parentSlug: { type: String, default: null }, // Slug de la subcategoría padre
  level: { type: Number, default: 0 }, // Nivel de profundidad (0 = raíz, 1 = primer nivel, etc.)
  path: { type: Array, default: [] }, // Array de IDs que forman la ruta completa
  pathSlugs: { type: Array, default: [] }, // Array de slugs que forman la ruta completa
  productCount: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// Clase del modelo con métodos para manejar jerarquía
class Subcategory {
  constructor(db) {
    this.collection = db.collection('subcategories');
  }

  // Método para obtener la colección (para servicios)
  getCollection() {
    return this.collection;
  }

  // Método para crear índices necesarios para la jerarquía
  async createIndexes() {
    try {
      // Índice compuesto para consultas por categoría y nivel
      await this.collection.createIndex({ category: 1, level: 1 });
      
      // Índice para consultas por padre
      await this.collection.createIndex({ parent: 1 });
      
      // Índice para consultas por path
      await this.collection.createIndex({ path: 1 });
      
      // Índice para consultas por slug único
      await this.collection.createIndex({ slug: 1 }, { unique: true });
      
      console.log('✅ Índices de subcategorías creados exitosamente');
    } catch (error) {
      console.error('❌ Error creando índices de subcategorías:', error);
      throw error;
    }
  }

  // Método para validar la estructura de jerarquía
  validateHierarchy(subcategoryData) {
    const errors = [];

    // Validar que no se exceda el nivel máximo (5 niveles)
    if (subcategoryData.level > 4) {
      errors.push('No se puede crear una subcategoría más allá del nivel 4');
    }

    // Validar que el path no sea demasiado largo
    if (subcategoryData.path && subcategoryData.path.length > 5) {
      errors.push('La ruta de la subcategoría no puede tener más de 5 niveles');
    }

    return errors;
  }

  // Método para calcular el nivel basado en el padre
  calculateLevel(parentId) {
    if (!parentId) return 0;
    
    // El nivel se calcula dinámicamente en el servicio
    // para evitar inconsistencias
    return null; // Se calculará en el servicio
  }

  // Método para construir el path completo
  buildPath(parentId, categoryId) {
    if (!parentId) return [];
    
    // El path se construye dinámicamente en el servicio
    // para mantener consistencia
    return null; // Se construirá en el servicio
  }
}

module.exports = Subcategory;
