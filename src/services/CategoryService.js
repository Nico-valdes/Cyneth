const { ObjectId } = require('mongodb');

class CategoryService {
  constructor(db) {
    this.collection = db.collection('categories');
    this.productCollection = db.collection('products');
  }

  // ================================
  // Helpers para slug con contexto
  // ================================

  generateSlug(name) {
    return (name || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async ensureUniqueSlug(baseSlug, excludeId = null) {
    let slug = baseSlug || 'categoria';
    let counter = 1;

    // Mientras exista otra categoría con el mismo slug, agregar sufijo incremental
    // (excluyendo opcionalmente un _id concreto para updates)
    // unique index está en slug, así evitamos errores de duplicado.
    // Nota: usamos findOne en bucle porque la cantidad de colisiones esperada es baja.
    // Si creciera mucho, se podría optimizar.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const query = { slug };
      if (excludeId) {
        query._id = { $ne: new ObjectId(excludeId) };
      }
      const existing = await this.collection.findOne(query);
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    return slug;
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
      let parent = null;
      if (categoryData.parent) {
        parent = await this.collection.findOne({ _id: new ObjectId(categoryData.parent) });
      }
      if (parent && !categoryData.level && categoryData.level !== 0) {
        categoryData.level = parent.level + 1;
      }

      // Auto-calcular type
      categoryData.type = categoryData.level === 0 ? 'main' : 'sub';

      // Generar slug con contexto jerárquico:
      // - Principal: slug = slug(name)
      // - Hija: slug = parent.slug + '-' + slug(name)
      const baseNameSlug = this.generateSlug(categoryData.name);
      const parentSlug = parent?.slug || '';
      const rawSlug = parentSlug ? `${parentSlug}-${baseNameSlug}` : baseNameSlug;
      categoryData.slug = await this.ensureUniqueSlug(rawSlug);

      // Campos que deben existir siempre (como en categorías de ejemplo)
      if (categoryData.description === undefined) categoryData.description = '';
      if (categoryData.productCount === undefined) categoryData.productCount = 0;
      if (categoryData.totalProductCount === undefined) categoryData.totalProductCount = 0;

      // order: siguiente número entre hermanos (mismo parent)
      if (categoryData.order === undefined) {
        const parentId = categoryData.parent ? new ObjectId(categoryData.parent) : null;
        const siblingFilter = parentId ? { parent: parentId } : { $or: [{ parent: null }, { parent: '' }] };
        const lastSibling = await this.collection
          .find(siblingFilter)
          .sort({ order: -1 })
          .limit(1)
          .project({ order: 1 })
          .next();
        categoryData.order = (lastSibling?.order ?? -1) + 1;
      }

      // Asegurar parent como ObjectId si viene como string
      if (categoryData.parent && typeof categoryData.parent === 'string' && ObjectId.isValid(categoryData.parent)) {
        categoryData.parent = new ObjectId(categoryData.parent);
      }

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
      // Si cambia el nombre o el padre, recalcular slug con contexto
      if (updateData.name || Object.prototype.hasOwnProperty.call(updateData, 'parent')) {
        const current = await this.collection.findOne({ _id: new ObjectId(id) });
        if (current) {
          const newName = updateData.name || current.name;
          const newParentId = Object.prototype.hasOwnProperty.call(updateData, 'parent')
            ? updateData.parent
            : current.parent;

          let parent = null;
          if (newParentId) {
            parent = await this.collection.findOne({ _id: new ObjectId(newParentId) });
          }

          const baseNameSlug = this.generateSlug(newName);
          const parentSlug = parent?.slug || '';
          const rawSlug = parentSlug ? `${parentSlug}-${baseNameSlug}` : baseNameSlug;
          updateData.slug = await this.ensureUniqueSlug(rawSlug, id);

          // Ajustar level si cambia el parent
          if (newParentId && (!updateData.level && updateData.level !== 0)) {
            updateData.level = (parent?.level ?? 0) + 1;
          } else if (!newParentId) {
            updateData.level = 0;
          }
        }
      }

      updateData.updatedAt = new Date();

      // Asegurar parent como ObjectId si viene como string
      if (updateData.parent && typeof updateData.parent === 'string' && ObjectId.isValid(updateData.parent)) {
        updateData.parent = new ObjectId(updateData.parent);
      }
      
      const result = await this.collection.updateOne(
        { _id: new ObjectId(id) },
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
      const productCount = await this.productCollection.countDocuments({ category: new ObjectId(id) });
      if (productCount > 0) {
        throw new Error('No se puede eliminar una categoría que tiene productos asignados');
      }

      // Verificar que no tenga hijos
      const childrenCount = await this.collection.countDocuments({ parent: new ObjectId(id) });
      if (childrenCount > 0) {
        throw new Error('No se puede eliminar una categoría que tiene subcategorías');
      }

      const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
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
      return await this.collection.findOne({ _id: new ObjectId(id), active: true });
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
        parent: new ObjectId(parentId), 
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