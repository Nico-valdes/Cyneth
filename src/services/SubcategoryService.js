const { ObjectId } = require('mongodb');

class SubcategoryService {
  constructor(db) {
    this.collection = db.collection('subcategories');
    this.productCollection = db.collection('products');
  }

  // Crear índices necesarios para la jerarquía
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

  // Calcular el nivel de una subcategoría basado en su padre
  async calculateLevel(parentId) {
    if (!parentId) return 0;
    
    const parent = await this.collection.findOne({ _id: new ObjectId(parentId) });
    if (!parent) {
      throw new Error('Subcategoría padre no encontrada');
    }
    
    return parent.level + 1;
  }

  // Construir el path completo de una subcategoría
  async buildPath(parentId, categoryId) {
    if (!parentId) return [];
    
    const path = [];
    let currentId = parentId;
    
    while (currentId) {
      const parent = await this.collection.findOne({ _id: new ObjectId(currentId) });
      if (!parent) break;
      
      path.unshift(parent._id.toString());
      currentId = parent.parent;
      
      // Prevenir bucles infinitos
      if (path.length > 10) break;
    }
    
    return path;
  }

  // Construir el path de slugs
  async buildPathSlugs(parentId, categoryId) {
    if (!parentId) return [];
    
    const pathSlugs = [];
    let currentId = parentId;
    
    while (currentId) {
      const parent = await this.collection.findOne({ _id: new ObjectId(currentId) });
      if (!parent) break;
      
      pathSlugs.unshift(parent.slug);
      currentId = parent.parent;
      
      // Prevenir bucles infinitos
      if (pathSlugs.length > 10) break;
    }
    
    return pathSlugs;
  }

  // Verificar si crear una subcategoría crearía un ciclo
  async wouldCreateCycle(subcategoryId, parentId) {
    if (!parentId) return false;
    
    let currentId = parentId;
    const visited = new Set();
    
    while (currentId) {
      if (visited.has(currentId.toString())) return true;
      visited.add(currentId.toString());
      
      const parent = await this.collection.findOne({ _id: new ObjectId(currentId) });
      if (!parent) break;
      
      currentId = parent.parent;
      
      // Prevenir bucles infinitos
      if (visited.size > 10) break;
    }
    
    return false;
  }

  // Obtener la profundidad de una subcategoría
  async getSubcategoryDepth(subcategoryId) {
    let depth = 0;
    let currentId = subcategoryId;
    
    while (currentId) {
      const subcategory = await this.collection.findOne({ _id: new ObjectId(currentId) });
      if (!subcategory) break;
      
      depth++;
      currentId = subcategory.parent;
      
      // Prevenir bucles infinitos
      if (depth > 10) break;
    }
    
    return depth;
  }

  // Generar o actualizar subcategorías desde productos existentes
  async syncFromProducts() {
    try {
      console.log('🔄 Sincronizando subcategorías desde productos...');
      
      // Obtener todas las subcategorías únicas de productos
      const subcategoryGroups = await this.productCollection.aggregate([
        { $match: { active: true, subcategory: { $exists: true, $ne: null } } },
        { 
          $group: { 
            _id: { category: '$category', subcategory: '$subcategory' },
            count: { $sum: 1 }
          } 
        },
        { $sort: { '_id.category': 1, '_id.subcategory': 1 } }
      ]).toArray();

      // Crear o actualizar subcategorías
      for (const group of subcategoryGroups) {
        const subcategoryData = {
          name: group._id.subcategory,
          slug: this.generateSlug(group._id.subcategory),
          category: group._id.category,
          categorySlug: this.generateSlug(group._id.category),
          parent: null, // Por defecto, subcategorías de productos son de nivel raíz
          parentSlug: null,
          level: 0,
          path: [],
          pathSlugs: [],
          productCount: group.count,
          active: true,
          updatedAt: new Date()
        };

        // Buscar si la subcategoría ya existe
        const existingSubcategory = await this.collection.findOne({ 
          name: group._id.subcategory,
          category: group._id.category
        });
        
        if (existingSubcategory) {
          // Actualizar subcategoría existente
          await this.collection.updateOne(
            { _id: existingSubcategory._id },
            { $set: subcategoryData }
          );
          console.log(`✅ Subcategoría actualizada: ${group._id.subcategory} (${group._id.category})`);
        } else {
          // Crear nueva subcategoría
          subcategoryData.createdAt = new Date();
          await this.collection.insertOne(subcategoryData);
          console.log(`✅ Nueva subcategoría creada: ${group._id.subcategory} (${group._id.category})`);
        }
      }
      
      console.log('🎉 Sincronización de subcategorías completada!');
      return true;
      
    } catch (error) {
      console.error('❌ Error sincronizando subcategorías:', error);
      throw error;
    }
  }

  // Obtener todas las subcategorías
  async getAll() {
    try {
      return await this.collection.find({ active: true }).sort({ category: 1, level: 1, name: 1 }).toArray();
    } catch (error) {
      console.error('Error obteniendo subcategorías:', error);
      return [];
    }
  }

  // Obtener subcategorías por categoría
  async getByCategory(categorySlug) {
    try {
      return await this.collection.find({ 
        categorySlug, 
        active: true 
      }).sort({ level: 1, name: 1 }).toArray();
    } catch (error) {
      console.error('Error obteniendo subcategorías por categoría:', error);
      return [];
    }
  }

  // Obtener subcategorías por categoría con estructura jerárquica
  async getByCategoryHierarchical(categorySlug) {
    try {
      const subcategories = await this.collection.find({ 
        categorySlug, 
        active: true 
      }).sort({ level: 1, name: 1 }).toArray();
      
      // Organizar en estructura jerárquica
      return this.buildHierarchicalStructure(subcategories);
    } catch (error) {
      console.error('Error obteniendo subcategorías jerárquicas por categoría:', error);
      return [];
    }
  }

  // Construir estructura jerárquica de subcategorías
  buildHierarchicalStructure(subcategories) {
    const map = new Map();
    const roots = [];
    
    // Crear mapa de todas las subcategorías
    subcategories.forEach(sub => {
      map.set(sub._id.toString(), { ...sub, children: [] });
    });
    
    // Construir jerarquía
    subcategories.forEach(sub => {
      const subWithChildren = map.get(sub._id.toString());
      
      if (sub.parent) {
        const parent = map.get(sub.parent);
        if (parent) {
          parent.children.push(subWithChildren);
        }
      } else {
        roots.push(subWithChildren);
      }
    });
    
    return roots;
  }

  // Obtener subcategoría por slug
  async getBySlug(slug) {
    try {
      return await this.collection.findOne({ slug, active: true });
    } catch (error) {
      console.error('Error obteniendo subcategoría por slug:', error);
      return null;
    }
  }

  // Obtener subcategoría por ID
  async getById(id) {
    try {
      return await this.collection.findOne({ _id: new ObjectId(id), active: true });
    } catch (error) {
      console.error('Error obteniendo subcategoría por ID:', error);
      return null;
    }
  }

  // Obtener subcategorías por padre
  async getByParent(parentId) {
    try {
      return await this.collection.find({ 
        parent: parentId, 
        active: true 
      }).sort({ name: 1 }).toArray();
    } catch (error) {
      console.error('Error obteniendo subcategorías por padre:', error);
      return [];
    }
  }

  // Obtener subcategorías disponibles como padre para una categoría
  async getAvailableParents(categoryId, excludeId = null) {
    try {
      const query = { 
        category: categoryId, 
        active: true,
        level: { $lt: 4 } // Solo hasta nivel 3 puede ser padre (para crear nivel 4)
      };
      
      if (excludeId) {
        query._id = { $ne: new ObjectId(excludeId) };
      }
      
      return await this.collection.find(query).sort({ level: 1, name: 1 }).toArray();
    } catch (error) {
      console.error('Error obteniendo padres disponibles:', error);
      return [];
    }
  }

  // Crear subcategoría manualmente
  async create(subcategoryData) {
    try {
      // Validar que no se exceda el nivel máximo
      if (subcategoryData.parent) {
        const parentLevel = await this.calculateLevel(subcategoryData.parent);
        if (parentLevel >= 4) {
          throw new Error('No se puede crear una subcategoría más allá del nivel 4');
        }
        
        // Verificar que no se cree un ciclo
        if (await this.wouldCreateCycle(subcategoryData._id, subcategoryData.parent)) {
          throw new Error('No se puede crear un ciclo en la jerarquía');
        }
      }
      
      // Calcular nivel y construir path
      const level = await this.calculateLevel(subcategoryData.parent);
      const path = await this.buildPath(subcategoryData.parent, subcategoryData.category);
      const pathSlugs = await this.buildPathSlugs(subcategoryData.parent, subcategoryData.category);
      
      // Generar slug único basado en la jerarquía
      const baseSlug = this.generateSlug(subcategoryData.name);
      console.log('🔧 Generando slug único:', {
        baseSlug,
        pathSlugs,
        category: subcategoryData.category,
        parent: subcategoryData.parent
      });
      const uniqueSlug = await this.generateUniqueSlug(baseSlug, pathSlugs, subcategoryData.category);
      console.log('✅ Slug único generado:', uniqueSlug);
      
      const subcategory = {
        ...subcategoryData,
        slug: uniqueSlug,
        categorySlug: this.generateSlug(subcategoryData.category),
        level,
        path,
        pathSlugs,
        parentSlug: subcategoryData.parent ? await this.getParentSlug(subcategoryData.parent) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
        active: true
      };

      const result = await this.collection.insertOne(subcategory);
      return { ...subcategory, _id: result.insertedId };
    } catch (error) {
      console.error('Error creando subcategoría:', error);
      throw error;
    }
  }

  // Obtener slug del padre
  async getParentSlug(parentId) {
    try {
      const parent = await this.collection.findOne({ _id: new ObjectId(parentId) });
      return parent ? parent.slug : null;
    } catch (error) {
      console.error('Error obteniendo slug del padre:', error);
      return null;
    }
  }

  // Actualizar subcategoría
  async update(id, updateData) {
    try {
      // Si se está cambiando el padre, recalcular nivel y path
      if (updateData.parent !== undefined) {
        if (updateData.parent) {
          const parentLevel = await this.calculateLevel(updateData.parent);
          if (parentLevel >= 4) {
            throw new Error('No se puede mover la subcategoría más allá del nivel 4');
          }
          
          // Verificar que no se cree un ciclo
          if (await this.wouldCreateCycle(id, updateData.parent)) {
            throw new Error('No se puede crear un ciclo en la jerarquía');
          }
          
          updateData.level = parentLevel + 1;
          updateData.path = await this.buildPath(updateData.parent, updateData.category);
          updateData.pathSlugs = await this.buildPathSlugs(updateData.parent, updateData.category);
          updateData.parentSlug = await this.getParentSlug(updateData.parent);
        } else {
          updateData.level = 0;
          updateData.path = [];
          updateData.pathSlugs = [];
          updateData.parentSlug = null;
        }
      }

      const update = {
        ...updateData,
        updatedAt: new Date()
      };

      if (updateData.name) {
        update.slug = this.generateSlug(updateData.name);
      }
      if (updateData.category) {
        update.categorySlug = this.generateSlug(updateData.category);
      }

      const result = await this.collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: update }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error actualizando subcategoría:', error);
      throw error;
    }
  }

  // Eliminar subcategoría (soft delete)
  async delete(id) {
    try {
      // Verificar si tiene subcategorías hijas
      const hasChildren = await this.collection.countDocuments({ 
        parent: id, 
        active: true 
      });
      
      if (hasChildren > 0) {
        throw new Error('No se puede eliminar una subcategoría que tiene subcategorías hijas');
      }
      
      const result = await this.collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { active: false, updatedAt: new Date() } }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error eliminando subcategoría:', error);
      throw error;
    }
  }

  // Generar slug único basado en la jerarquía
  async generateUniqueSlug(baseSlug, pathSlugs, categorySlug) {
    try {
      console.log('🔍 generateUniqueSlug iniciado:', { baseSlug, pathSlugs, categorySlug });
      
      // Si es nivel raíz, usar el slug base si no existe
      if (!pathSlugs || pathSlugs.length === 0) {
        console.log('📋 Es nivel raíz, verificando existencia...');
        const existing = await this.collection.findOne({ 
          slug: baseSlug, 
          categorySlug: this.generateSlug(categorySlug) 
        });
        
        console.log('🔍 Slug existente encontrado:', existing ? 'SÍ' : 'NO');
        
        if (!existing) {
          console.log('✅ Slug disponible, usando:', baseSlug);
          return baseSlug;
        }
        
        // Si existe, agregar sufijo numérico
        console.log('🔄 Slug ocupado, buscando alternativa con sufijo...');
        let counter = 1;
        let uniqueSlug = `${baseSlug}-${counter}`;
        
        while (await this.collection.findOne({ 
          slug: uniqueSlug, 
          categorySlug: this.generateSlug(categorySlug) 
        })) {
          console.log(`❌ ${uniqueSlug} también existe, probando siguiente...`);
          counter++;
          uniqueSlug = `${baseSlug}-${counter}`;
        }
        
        console.log('✅ Slug único encontrado con sufijo:', uniqueSlug);
        return uniqueSlug;
      }
      
      // Para subcategorías anidadas, crear slug jerárquico
      console.log('🏗️ Es subcategoría anidada, creando slug jerárquico...');
      const hierarchicalSlug = [...pathSlugs, baseSlug].join('-');
      console.log('🔗 Slug jerárquico generado:', hierarchicalSlug);
      
      // Verificar si el slug jerárquico existe
      const existing = await this.collection.findOne({ 
        slug: hierarchicalSlug, 
        categorySlug: this.generateSlug(categorySlug) 
      });
      
      console.log('🔍 Slug jerárquico existente:', existing ? 'SÍ' : 'NO');
      
      if (!existing) {
        console.log('✅ Slug jerárquico disponible:', hierarchicalSlug);
        return hierarchicalSlug;
      }
      
      // Si existe, agregar sufijo numérico
      let counter = 1;
      let uniqueSlug = `${hierarchicalSlug}-${counter}`;
      
      while (await this.collection.findOne({ 
        slug: uniqueSlug, 
        categorySlug: this.generateSlug(categorySlug) 
      })) {
        counter++;
        uniqueSlug = `${hierarchicalSlug}-${counter}`;
      }
      
      return uniqueSlug;
      
    } catch (error) {
      console.error('❌ Error generando slug único:', error);
      // Fallback: usar timestamp para garantizar unicidad
      const fallbackSlug = `${baseSlug}-${Date.now()}`;
      console.log('🆘 Usando fallback slug:', fallbackSlug);
      return fallbackSlug;
    }
  }

  // Generar slug desde nombre
  generateSlug(name) {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
}

module.exports = SubcategoryService;
