const { ObjectId } = require('mongodb');
const Product = require('../models/Product');

class ProductService {
  constructor(db) {
    this.db = db;
    this.collection = db.collection('products');
    this.productModel = new Product(db);
    this.categoriesCollection = db.collection('categories');
    
    // Caché en memoria para categorías (OPTIMIZACIÓN)
    this.categoryCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutos
    this.lastCacheUpdate = 0;
  }

  // Obtener todas las categorías descendientes (hijas, nietas, etc.) de una categoría
  async getAllDescendantCategories(parentId) {
    try {
      const descendants = await this.categoriesCollection.aggregate([
        {
          $match: { _id: parentId }
        },
        {
          $graphLookup: {
            from: 'categories',
            startWith: '$_id',
            connectFromField: '_id',
            connectToField: 'parent',
            as: 'descendants'
          }
        },
        {
          $project: {
            descendants: {
              $map: {
                input: '$descendants',
                as: 'desc',
                in: '$$desc._id'
              }
            }
          }
        }
      ]).toArray();

      return descendants[0]?.descendants || [];
    } catch (error) {
      console.error('Error obteniendo categorías descendientes:', error);
      return [];
    }
  }

  // Crear un nuevo producto con jerarquía de categorías
  async create(productData) {
    try {
      // Validar datos del producto
      const validationErrors = this.productModel.validateProduct(productData);
      if (validationErrors.length > 0) {
        throw new Error(`Errores de validación: ${validationErrors.join(', ')}`);
      }

      // Construir path de categorías y breadcrumb
      const categoryInfo = await this.productModel.buildCategoryPath(
        this.db, 
        productData.categorySlug, 
        productData.subcategorySlug
      );

      // Generar slug único si no se proporciona
      if (!productData.slug) {
        productData.slug = await this.generateUniqueSlug(productData.name);
      }

      const product = {
        ...productData,
        categoryPath: categoryInfo.path,
        categoryPathNames: categoryInfo.pathNames,
        categoryBreadcrumb: categoryInfo.breadcrumb,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await this.collection.insertOne(product);
      return { ...product, _id: result.insertedId };
    } catch (error) {
      console.error('Error creando producto:', error);
      throw error;
    }
  }

  // Obtener producto por ID (OPTIMIZADO)
  async findById(id, projection = null) {
    try {
      const query = { _id: new ObjectId(id) };
      
      // Si no se especifica proyección, traer solo campos esenciales
      if (!projection) {
        projection = {
          name: 1,
          sku: 1,
          price: 1,
          image: 1,
          defaultImage: 1,
          category: 1, // Ahora es ObjectId que referencia categories
          brand: 1,
          brandSlug: 1,
          active: 1,
          featured: 1,
          colorVariants: 1,
          description: 1,
          attributes: 1,
          measurements: 1,
          specifications: 1,
          createdAt: 1,
          updatedAt: 1
        };
      }
      
      return await this.collection.findOne(query, { projection });
    } catch (error) {
      console.error('Error buscando producto por ID:', error);
      throw error;
    }
  }

  // Obtener productos con filtros
  async find(filters = {}, options = {}) {
    try {
      const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;
      
      let query = {};
      
      // Solo aplicar filtro de active si no se solicita mostrar todos
      if (!filters.showAll) {
        query.active = true;
      }
      
      // Aplicar filtros
      if (filters.category) query.category = filters.category;
      if (filters.subcategory) query.subcategory = filters.subcategory;
      if (filters.brand) query.brand = filters.brand;
      if (filters.tags) query.tags = { $in: filters.tags };
      if (filters.featured !== undefined) query.featured = filters.featured;
      
      // Búsqueda por texto - usar regex para búsqueda parcial flexible
      if (filters.search) {
        const searchTerm = filters.search.trim();
        // Regex case-insensitive para buscar en nombre, SKU, marca y descripción
        query.$or = [
          { name: { $regex: searchTerm, $options: 'i' } },
          { sku: { $regex: searchTerm, $options: 'i' } },
          { brand: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ];
      }
      
      // Especificaciones específicas
      if (filters.specifications) {
        Object.keys(filters.specifications).forEach(key => {
          query[`specifications.${key}`] = filters.specifications[key];
        });
      }
      
      console.log('🔍 Query MongoDB:', JSON.stringify(query, null, 2)); // Debug log
      
      // Proyección para traer solo campos necesarios (OPTIMIZADO)
      const projection = {
        name: 1,
        sku: 1,
        price: 1,
        image: 1,
        defaultImage: 1, // ✅ AGREGADO: Campo faltante
        category: 1,
        subcategory: 1,
        categoryBreadcrumb: 1,
        brand: 1,
        active: 1,
        featured: 1, // ✅ AGREGADO: Campo destacado
        colorVariants: 1,
        createdAt: 1,
        updatedAt: 1
      };
      
      const products = await this.collection
        .find(query)
        .project(projection)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();
      
      console.log('📦 Productos encontrados:', products.length); // Debug log
      
      // Enriquecer productos con nombres de categorías (OPTIMIZADO)
      const enrichedProducts = await this.enrichProductsWithCategories(products);
      
      return enrichedProducts;
    } catch (error) {
      console.error('Error buscando productos:', error);
      throw error;
    }
  }

  // Actualizar producto con validación y categorías
  async update(id, updateData) {
    try {
      // Si se están actualizando categorías, reconstruir el path
      if (updateData.categorySlug || updateData.subcategorySlug) {
        const categoryInfo = await this.productModel.buildCategoryPath(
          this.db, 
          updateData.categorySlug, 
          updateData.subcategorySlug
        );
        
        updateData.categoryPath = categoryInfo.path;
        updateData.categoryPathNames = categoryInfo.pathNames;
        updateData.categoryBreadcrumb = categoryInfo.breadcrumb;
      }

      // Validar datos si se proporciona estructura completa
      if (updateData.name || updateData.sku || updateData.colorVariants) {
        const existingProduct = await this.findById(id);
        const productForValidation = { ...existingProduct, ...updateData };
        
        const validationErrors = this.productModel.validateProduct(productForValidation);
        if (validationErrors.length > 0) {
          throw new Error(`Errores de validación: ${validationErrors.join(', ')}`);
        }
      }

      const update = {
        ...updateData,
        updatedAt: new Date()
      };
      
      const result = await this.collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: update }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error actualizando producto:', error);
      throw error;
    }
  }

  // Eliminar producto (soft delete)
  async delete(id) {
    try {
      const result = await this.collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { active: false, updatedAt: new Date() } }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error eliminando producto:', error);
      throw error;
    }
  }

  // Contar productos totales
  async count(filters = {}) {
    try {
      let query = {};
      
      // Solo aplicar filtro de active si no se solicita mostrar todos
      if (!filters.showAll) {
        query.active = true;
      }
      
      if (filters.category) {
        try {
          const categoryId = new ObjectId(filters.category);
          
          // Obtener todas las categorías descendientes
          const allDescendants = await this.getAllDescendantCategories(categoryId);
          
          // Buscar en la categoría seleccionada Y todas sus descendientes
          query.category = { $in: [categoryId, ...allDescendants] };
        } catch (error) {
          query.category = filters.category;
        }
      }
      if (filters.subcategory) {
        try {
          query.subcategory = new ObjectId(filters.subcategory);
        } catch (error) {
          query.subcategory = filters.subcategory;
        }
      }
      if (filters.brand) query.brand = filters.brand;
      if (filters.featured !== undefined) query.featured = filters.featured;
      
      return await this.collection.countDocuments(query);
    } catch (error) {
      console.error('Error contando productos:', error);
      throw error;
    }
  }

  // Obtener productos por categoría
  async getByCategory(category, options = {}) {
    try {
      const filters = { category, active: true };
      return await this.find(filters, options);
    } catch (error) {
      console.error('Error obteniendo productos por categoría:', error);
      return [];
    }
  }

  // Obtener productos por subcategoría
  async getBySubcategory(subcategory, options = {}) {
    try {
      const filters = { subcategory, active: true };
      return await this.find(filters, options);
    } catch (error) {
      console.error('Error obteniendo productos por subcategoría:', error);
      return [];
    }
  }

  // Obtener productos por marca
  async getByBrand(brand, options = {}) {
    try {
      const filters = { brand, active: true };
      return await this.find(filters, options);
    } catch (error) {
      console.error('Error obteniendo productos por marca:', error);
      return [];
    }
  }

  // Buscar productos por texto
  async search(searchTerm, options = {}) {
    try {
      const filters = { search: searchTerm };
      return await this.find(filters, options);
    } catch (error) {
      console.error('Error buscando productos:', error);
      return [];
    }
  }

  // Obtener productos por path de categoría jerárquico
  async getByCategoryPath(categoryPath, options = {}) {
    try {
      const filters = { 
        categoryPath: { $all: categoryPath },
        active: true 
      };
      return await this.find(filters, options);
    } catch (error) {
      console.error('Error obteniendo productos por path de categoría:', error);
      return [];
    }
  }

  // Generar sugerencia de SKU
  generateSKUSuggestion(productData) {
    return this.productModel.generateSKUSuggestion(productData);
  }

  // Generar slug único
  async generateUniqueSlug(name) {
    const baseSlug = this.productModel.generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    // Verificar si el slug ya existe
    while (await this.collection.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  // Obtener variantes de color de un producto
  async getColorVariants(productId) {
    try {
      const product = await this.findById(productId);
      return product?.colorVariants || [];
    } catch (error) {
      console.error('Error obteniendo variantes de color:', error);
      return [];
    }
  }

  // Actualizar variante de color específica
  async updateColorVariant(productId, variantIndex, variantData) {
    try {
      const updateField = `colorVariants.${variantIndex}`;
      const result = await this.collection.updateOne(
        { _id: new ObjectId(productId) },
        { 
          $set: { 
            [updateField]: variantData,
            updatedAt: new Date()
          } 
        }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error actualizando variante de color:', error);
      throw error;
    }
  }

  // Agregar nueva variante de color
  async addColorVariant(productId, variantData) {
    try {
      // Validar que el SKU de la variante sea único
      const existingProduct = await this.collection.findOne({
        $or: [
          { sku: variantData.sku },
          { 'colorVariants.sku': variantData.sku }
        ]
      });

      if (existingProduct) {
        throw new Error('El SKU de la variante ya existe');
      }

      const result = await this.collection.updateOne(
        { _id: new ObjectId(productId) },
        { 
          $push: { colorVariants: variantData },
          $set: { updatedAt: new Date() }
        }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error agregando variante de color:', error);
      throw error;
    }
  }

  // Eliminar variante de color
  async removeColorVariant(productId, variantIndex) {
    try {
      // Primero obtener el producto para sacar la variante específica
      const product = await this.findById(productId);
      if (!product || !product.colorVariants || variantIndex >= product.colorVariants.length) {
        throw new Error('Variante no encontrada');
      }

      // Remover la variante del array
      product.colorVariants.splice(variantIndex, 1);

      const result = await this.collection.updateOne(
        { _id: new ObjectId(productId) },
        { 
          $set: { 
            colorVariants: product.colorVariants,
            updatedAt: new Date()
          }
        }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error eliminando variante de color:', error);
      throw error;
    }
  }

  // Verificar disponibilidad de SKU
  async isSkuAvailable(sku, excludeProductId = null) {
    try {
      const query = {
        $or: [
          { sku: sku },
          { 'colorVariants.sku': sku }
        ]
      };

      if (excludeProductId) {
        query._id = { $ne: new ObjectId(excludeProductId) };
      }

      const existingProduct = await this.collection.findOne(query);
      return !existingProduct;
    } catch (error) {
      console.error('Error verificando disponibilidad de SKU:', error);
      return false;
    }
  }

  // ===== MÉTODOS OPTIMIZADOS =====
  
  // Actualizar caché de categorías
  async updateCategoryCache() {
    try {
      const now = Date.now();
      
      // Solo actualizar si el caché expiró
      if (now - this.lastCacheUpdate < this.cacheExpiry) {
        return;
      }
      
      console.log('🔄 Actualizando caché de categorías...');
      
      // Cargar todas las categorías activas
      const categories = await this.db.collection('categories')
        .find({ active: true })
        .project({ _id: 1, name: 1 })
        .toArray();
      
      const subcategories = await this.db.collection('subcategories')
        .find({ active: true })
        .project({ _id: 1, name: 1, categoryId: 1 })
        .toArray();
      
      // Limpiar cachés anteriores
      this.categoryCache.clear();
      this.subcategoryCache.clear();
      
      // Llenar cachés
      categories.forEach(cat => {
        this.categoryCache.set(cat._id.toString(), cat.name);
      });
      
      subcategories.forEach(sub => {
        this.subcategoryCache.set(sub._id.toString(), sub.name);
      });
      
      this.lastCacheUpdate = now;
      console.log(`✅ Caché actualizado: ${categories.length} categorías, ${subcategories.length} subcategorías`);
      
    } catch (error) {
      console.error('Error actualizando caché de categorías:', error);
    }
  }
  
  // Enriquecer productos con categorías usando CACHÉ (ULTRA OPTIMIZADO)
  async enrichProductsWithCategories(products) {
    try {
      // Si no hay productos, retornar array vacío
      if (!products || products.length === 0) {
        return [];
      }

      // Actualizar caché si es necesario
      await this.updateCategoryCache();

      // Enriquecer productos usando el caché (SIN CONSULTAS A LA BD)
      return products.map(product => {
        // Si ya tiene breadcrumb completo, no hacer nada
        if (product.categoryBreadcrumb && product.categoryBreadcrumb.includes(' > ')) {
          return product;
        }

        let breadcrumb = '';
        
        // Construir breadcrumb usando el caché
        if (product.category) {
          const categoryName = this.categoryCache.get(product.category.toString());
          if (categoryName) {
            breadcrumb = categoryName;
            
            if (product.subcategory) {
              const subcategoryName = this.subcategoryCache.get(product.subcategory.toString());
              if (subcategoryName) {
                breadcrumb += ` > ${subcategoryName}`;
              }
            }
          }
        }

        // Si no se pudo construir, usar el existente o valor por defecto
        if (!breadcrumb) {
          breadcrumb = product.categoryBreadcrumb || 'Sin categoría';
        }

        return {
          ...product,
          categoryBreadcrumb: breadcrumb
        };
      });

    } catch (error) {
      console.error('Error enriqueciendo productos con categorías:', error);
      // En caso de error, retornar productos sin enriquecer
      return products;
    }
  }
  
  // Limpiar caché manualmente (útil para testing o cuando se actualizan categorías)
  clearCategoryCache() {
    this.categoryCache.clear();
    this.subcategoryCache.clear();
    this.lastCacheUpdate = 0;
    console.log('🧹 Caché de categorías limpiado');
  }
  
  // Obtener estadísticas del caché
  getCacheStats() {
    return {
      categoryCacheSize: this.categoryCache.size,
      subcategoryCacheSize: this.subcategoryCache.size,
      lastUpdate: this.lastCacheUpdate,
      isExpired: Date.now() - this.lastCacheUpdate > this.cacheExpiry
    };
  }
  
  // ===== CONSULTAS AGREGADAS OPTIMIZADAS =====
  
  // Obtener productos con categorías en UNA SOLA CONSULTA (MÁXIMA OPTIMIZACIÓN)
  async findWithCategories(filters = {}, options = {}) {
    try {
      const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;
      
      let query = {};
      
      // Solo aplicar filtro de active si no se solicita mostrar todos
      if (!filters.showAll) {
        query.active = true;
      }
      
      // Aplicar filtros
      if (filters.category) {
        // En el modelo unificado, buscar en categoría y todas sus descendientes
        try {
          const categoryId = new ObjectId(filters.category);
          
          // Obtener todas las categorías descendientes
          const allDescendants = await this.getAllDescendantCategories(categoryId);
          
          // Buscar en la categoría seleccionada Y todas sus descendientes
          query.category = { $in: [categoryId, ...allDescendants] };
        } catch (error) {
          // Si no es un ObjectId válido, usarlo como string para compatibilidad
          query.category = filters.category;
        }
      }
      if (filters.subcategory) {
        // Subcategory ya no se usa en el modelo unificado, pero mantener para compatibilidad
        try {
          query.subcategory = new ObjectId(filters.subcategory);
        } catch (error) {
          query.subcategory = filters.subcategory;
        }
      }
      if (filters.brand) query.brand = filters.brand;
      if (filters.tags) query.tags = { $in: filters.tags };
      if (filters.featured !== undefined) query.featured = filters.featured;
      
      // Búsqueda por texto - usar regex para búsqueda parcial flexible
      if (filters.search) {
        const searchTerm = filters.search.trim();
        // Regex case-insensitive para buscar en nombre, SKU, marca y descripción
        query.$or = [
          { name: { $regex: searchTerm, $options: 'i' } },
          { sku: { $regex: searchTerm, $options: 'i' } },
          { brand: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ];
      }
      
      // Especificaciones específicas
      if (filters.specifications) {
        Object.keys(filters.specifications).forEach(key => {
          query[`specifications.${key}`] = filters.specifications[key];
        });
      }
      
      // CONSULTA AGREGADA: Unir productos con categorías en una sola operación
      const pipeline = [
        { $match: query },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryInfo',
            pipeline: [
              { $project: { name: 1 } }
            ]
          }
        },
        {
          $lookup: {
            from: 'subcategories',
            localField: 'subcategory',
            foreignField: '_id',
            as: 'subcategoryInfo',
            pipeline: [
              { $project: { name: 1 } }
            ]
          }
        },
        {
          $addFields: {
            categoryBreadcrumb: {
              $cond: {
                if: { $gt: [{ $size: '$categoryInfo' }, 0] },
                then: {
                  $concat: [
                    { $arrayElemAt: ['$categoryInfo.name', 0] },
                    { $cond: {
                      if: { $gt: [{ $size: '$subcategoryInfo' }, 0] },
                      then: { $concat: [' > ', { $arrayElemAt: ['$subcategoryInfo.name', 0] }] },
                      else: ''
                    }}
                  ]
                },
                else: '$categoryBreadcrumb'
              }
            }
          }
        },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            name: 1,
            sku: 1,
            price: 1,
            image: 1,
            defaultImage: 1, // ✅ AGREGADO: Campo faltante
            category: 1,
            subcategory: 1,
            categoryBreadcrumb: 1,
            brand: 1,
            active: 1,
            featured: 1, // ✅ AGREGADO: Campo destacado
            colorVariants: 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
      ];
      
      const products = await this.collection.aggregate(pipeline).toArray();
      
      console.log(`📦 Productos encontrados con agregación: ${products.length}`);
      
      return products;
      
    } catch (error) {
      console.error('Error en consulta agregada:', error);
      // Fallback al método anterior si falla la agregación
      return await this.find(filters, options);
    }
  }

  // ========================================
  // MÉTODOS PARA MODELO UNIFICADO
  // ========================================

  // Obtener breadcrumb automático para un producto
  async getProductBreadcrumb(productId) {
    try {
      const product = await this.collection.findOne({ _id: ObjectId(productId) });
      if (!product) return null;

      const breadcrumb = [];
      let currentCategory = await this.categoriesCollection.findOne({ _id: product.category });
      
      // Recorrer hacia arriba hasta llegar a la raíz
      while (currentCategory) {
        breadcrumb.unshift({
          _id: currentCategory._id,
          name: currentCategory.name,
          slug: currentCategory.slug,
          level: currentCategory.level
        });
        
        if (currentCategory.parent) {
          currentCategory = await this.categoriesCollection.findOne({ _id: currentCategory.parent });
        } else {
          break;
        }
      }
      
      return {
        product: product.name,
        breadcrumb,
        breadcrumbString: breadcrumb.map(cat => cat.name).join(' > ')
      };
    } catch (error) {
      console.error('Error obteniendo breadcrumb:', error);
      return null;
    }
  }

  // Obtener productos por categoría (incluyendo subcategorías)
  async getProductsByCategory(categoryId, includeChildren = true) {
    try {
      let categoryIds = [ObjectId(categoryId)];
      
      if (includeChildren) {
        // Obtener todos los hijos de la categoría
        const children = await this.getCategoryChildren(categoryId);
        categoryIds = categoryIds.concat(children.map(child => child._id));
      }
      
      return await this.collection.find({
        category: { $in: categoryIds },
        active: true
      }).toArray();
    } catch (error) {
      console.error('Error obteniendo productos por categoría:', error);
      return [];
    }
  }

  // Obtener todas las subcategorías de una categoría
  async getCategoryChildren(categoryId) {
    try {
      const allChildren = [];
      const directChildren = await this.categoriesCollection.find({ 
        parent: ObjectId(categoryId) 
      }).toArray();
      
      for (const child of directChildren) {
        allChildren.push(child);
        const grandChildren = await this.getCategoryChildren(child._id);
        allChildren.push(...grandChildren);
      }
      
      return allChildren;
    } catch (error) {
      console.error('Error obteniendo hijos de categoría:', error);
      return [];
    }
  }
}

module.exports = ProductService;
