const { ObjectId } = require('mongodb');

class CategoryService {
  constructor(db) {
    this.collection = db.collection('categories');
    this.productCollection = db.collection('products');
  }

  // ========================================
  // CRUD BÁSICO
  // ========================================

  async create(categoryData) {
    try {
      // Validar jerarquía
      const errors = this.validateHierarchy(categoryData);
      if (errors.length > 0) {
        throw new Error(`Errores de validación: ${errors.join(', ')}`);
      }

      // Auto-calcular level si no está definido
      if (categoryData.parent && !categoryData.level) {
        const parent = await this.collection.findOne({ _id: ObjectId(categoryData.parent) });
        if (parent) {
          categoryData.level = parent.level + 1;
        }
      }

      // Auto-calcular type
      categoryData.type = categoryData.level === 0 ? 'main' : 'sub';
      categoryData.createdAt = new Date();
      categoryData.updatedAt = new Date();

      const result = await this.collection.insertOne(categoryData);
      return await this.collection.findOne({ _id: result.insertedId });
    } catch (error) {
      console.error('Error creando categoría:', error);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      updateData.updatedAt = new Date();
      
      const result = await this.collection.updateOne(
        { _id: ObjectId(id) },
        { $set: updateData }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error actualizando categoría:', error);
      return false;
    }
  }

  async delete(id) {
    try {
      // Verificar que no tenga productos
      const productCount = await this.productCollection.countDocuments({ category: ObjectId(id) });
      if (productCount > 0) {
        throw new Error('No se puede eliminar una categoría que tiene productos asignados');
      }

      // Verificar que no tenga hijos
      const childrenCount = await this.collection.countDocuments({ parent: ObjectId(id) });
      if (childrenCount > 0) {
        throw new Error('No se puede eliminar una categoría que tiene subcategorías');
      }

      const result = await this.collection.deleteOne({ _id: ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      throw error;
    }
  }

  async getAll() {
    try {
      return await this.collection.find({ active: true })
        .sort({ level: 1, order: 1, name: 1 })
        .toArray();
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      return [];
    }
  }

  async getById(id) {
    try {
      return await this.collection.findOne({ _id: ObjectId(id), active: true });
    } catch (error) {
      console.error('Error obteniendo categoría por ID:', error);
      return null;
    }
  }

  async getBySlug(slug) {
    try {
      return await this.collection.findOne({ slug, active: true });
    } catch (error) {
      console.error('Error obteniendo categoría por slug:', error);
      return null;
    }
  }

  // ========================================
  // CONSULTAS JERÁRQUICAS OPTIMIZADAS
  // ========================================

  // Obtener solo categorías principales (nivel 0)
  async getMainCategories() {
    try {
      return await this.collection.find({ 
        level: 0, 
        active: true 
      }).sort({ order: 1, name: 1 }).toArray();
    } catch (error) {
      console.error('Error obteniendo categorías principales:', error);
      return [];
    }
  }

  // Obtener subcategorías directas de una categoría
  async getDirectChildren(parentId) {
    try {
      return await this.collection.find({ 
        parent: ObjectId(parentId), 
        active: true 
      }).sort({ order: 1, name: 1 }).toArray();
    } catch (error) {
      console.error('Error obteniendo hijos directos:', error);
      return [];
    }
  }

  // Obtener árbol jerárquico completo para una categoría principal  
  async getHierarchicalTree(parentSlug = null) {
    try {
      if (parentSlug) {
        const parent = await this.getBySlug(parentSlug);
        if (!parent) return [];
        
        // SIMPLIFICADO: Obtener todas las descendientes con una consulta simple
        // Usar $graphLookup para obtener toda la jerarquía descendiente
        const allDescendants = await this.collection.aggregate([
          {
            $graphLookup: {
              from: 'categories',
              startWith: parent._id,
              connectFromField: '_id',
              connectToField: 'parent',
              as: 'descendants',
              maxDepth: 10,
              restrictSearchWithMatch: { active: true }
            }
          },
          {
            $match: { _id: parent._id }
          },
          {
            $project: {
              descendants: 1
            }
          }
        ]).toArray();
        
        if (allDescendants.length === 0 || !allDescendants[0].descendants) {
          return [];
        }
        
        // Obtener todos los descendientes
        const descendants = allDescendants[0].descendants;
        
        return this.buildHierarchy(descendants);
      } else {
        // Solo principales si no se especifica parent
        const mainCategories = await this.getMainCategories();
        return mainCategories.map(cat => ({ ...cat, children: [] }));
      }
    } catch (error) {
      console.error('Error obteniendo árbol jerárquico:', error);
      return [];
    }
  }

  // Construir jerarquía optimizada
  buildHierarchy(categories) {
    const map = new Map();
    const roots = [];
    
    // Crear mapa
    categories.forEach(cat => {
      map.set(cat._id.toString(), { ...cat, children: [] });
    });
    
    // Construir jerarquía
    categories.forEach(cat => {
      const categoryWithChildren = map.get(cat._id.toString());
      
      if (cat.parent) {
        const parent = map.get(cat.parent.toString());
        if (parent) {
          parent.children.push(categoryWithChildren);
        } else {
          // Parent no encontrado, agregar como root
          roots.push(categoryWithChildren);
        }
      } else {
        roots.push(categoryWithChildren);
      }
    });
    
    return roots;
  }

  // ========================================
  // UTILIDADES
  // ========================================

  // Obtener breadcrumb para una categoría
  async getBreadcrumb(categorySlug) {
    try {
      const category = await this.getBySlug(categorySlug);
      if (!category) return [];

      const breadcrumb = [];
      let current = category;
      
      // Recorrer hacia arriba
      while (current) {
        breadcrumb.unshift({
          _id: current._id,
          name: current.name,
          slug: current.slug,
          level: current.level
        });
        
        if (current.parent) {
          current = await this.getById(current.parent.toString());
        } else {
          break;
        }
      }
      
      return breadcrumb;
    } catch (error) {
      console.error('Error obteniendo breadcrumb:', error);
      return [];
    }
  }

  // Validar jerarquía
  validateHierarchy(categoryData) {
    const errors = [];

    if (categoryData.level === 0 && categoryData.parent) {
      errors.push('Categorías de nivel 0 no pueden tener parent');
    }
    if (categoryData.level > 0 && !categoryData.parent) {
      errors.push('Categorías de nivel > 0 deben tener parent');
    }
    if (categoryData.level > 4) {
      errors.push('Máximo 5 niveles permitidos');
    }

    return errors;
  }

  // Actualizar contadores de productos
  async updateProductCounts() {
    try {
      // Contar productos por categoría
      const productCounts = await this.productCollection.aggregate([
        { $match: { active: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]).toArray();
      
      // Actualizar contadores directos
      for (const count of productCounts) {
        await this.collection.updateOne(
          { _id: count._id },
          { 
            $set: { 
              productCount: count.count,
              totalProductCount: count.count, // Por ahora igual, se puede calcular recursivo después
              updatedAt: new Date()
            } 
          }
        );
      }
      
      console.log('✅ Contadores de productos actualizados');
    } catch (error) {
      console.error('❌ Error actualizando contadores:', error);
    }
  }

  // ========================================
  // MÉTODOS DE COMPATIBILIDAD
  // ========================================

  // Para mantener compatibilidad con código existente
  async syncFromProducts() {
    console.log('📝 syncFromProducts: Método obsoleto, usar updateProductCounts()');
    return this.updateProductCounts();
  }
}

module.exports = CategoryService;