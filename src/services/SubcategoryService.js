const CategoryService = require('./CategoryService');

/**
 * ALIAS DE COMPATIBILIDAD
 * 
 * SubcategoryService ahora es un alias de CategoryService
 * para mantener compatibilidad con código existente
 */

class SubcategoryService extends CategoryService {
  constructor(db) {
    super(db);
    console.log('⚠️ SubcategoryService está obsoleto. Usa CategoryService directamente.');
  }

  // Métodos de compatibilidad para APIs existentes
  async getByCategoryHierarchical(categorySlug) {
    console.log('📝 getByCategoryHierarchical: Redirigiendo a getHierarchicalTree()');
    return this.getHierarchicalTree(categorySlug);
  }

  async getByCategory(categorySlug) {
    console.log('📝 getByCategory: Redirigiendo a getDirectChildren()');
    try {
      const parent = await this.getBySlug(categorySlug);
      if (!parent) return [];
      return this.getDirectChildren(parent._id);
    } catch (error) {
      console.error('Error en getByCategory:', error);
      return [];
    }
  }

  // Alias para mantener compatibilidad
  buildHierarchicalStructure(categories) {
    console.log('📝 buildHierarchicalStructure: Redirigiendo a buildHierarchy()');
    return this.buildHierarchy(categories);
  }
}

module.exports = SubcategoryService;

