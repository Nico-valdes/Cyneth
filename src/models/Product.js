const { ObjectId } = require('mongodb');

// Esquema de producto mejorado con soporte para jerarquía de categorías
const productSchema = {
  // Información básica
  name: { type: String, required: true },
  description: { type: String, default: '' },
  sku: { type: String, required: true, unique: true }, // SKU base - manual por el usuario
  
  // Categorización SIMPLIFICADA
  category: { type: ObjectId, required: true, ref: 'categories' }, // Referencia a la categoría más específica
  
  // Marca
  brand: { type: String, default: '' },
  brandSlug: { type: String, default: '' },
  
  // Atributos estructurados (clave-valor)
  attributes: { type: Array, default: [] }, // [{ name: "Tecnología", value: "Es altamente increíble" }]
  
  // Especificaciones técnicas estructuradas (opcional)
  specifications: {
    type: Object,
    default: {},
    // Ejemplo para caños: { material: "PVC", pressure: "16bar", connection: "pegable" }
    // Ejemplo para grifería: { type: "monocomando", installation: "mural", warranty: "2 años" }
  },
  
  // Sistema de medidas - solo informativo (sin SKUs)
  measurements: {
    enabled: { type: Boolean, default: false }, // Si el producto tiene medidas disponibles
    unit: { type: String, default: 'mm' }, // Unidad principal
    description: { type: String, default: '' }, // Descripción libre de medidas
    availableSizes: { type: Array, default: [] }
    // Ejemplo para caños: ["110mm x 3m", "110mm x 6m", "160mm x 3m", "160mm x 6m"]
    // Ejemplo para grifería: ["Altura: 25cm", "Caño: 20cm", "Base: 5cm"]
  },
  
  // Variantes de color (cada una con su propio SKU e imagen)
  colorVariants: { type: Array, default: [] },
  // [{ 
  //   colorName: "Blanco", 
  //   colorCode: "#FFFFFF", 
  //   sku: "CANO-PVC-110-BLA", // SKU manual único
  //   image: "url", // Imagen específica para este color
  //   active: true
  // }]
  
  // Imagen por defecto del producto (opcional)
  defaultImage: { type: String, default: '' }, // Imagen por defecto si no hay variantes de color
  
  // Metadatos simples
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  
  // Slug para URLs
  slug: { type: String, required: true, unique: true },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

class Product {
  constructor(db) {
    this.collection = db.collection('products');
  }

  // Método para obtener la colección
  getCollection() {
    return this.collection;
  }

  // Crear índices necesarios
  async createIndexes() {
    try {
      // Índices básicos
      await this.collection.createIndex({ sku: 1 }, { unique: true });
      await this.collection.createIndex({ slug: 1 }, { unique: true });
      
      // Índices para categorías
      await this.collection.createIndex({ category: 1, active: 1 });
      await this.collection.createIndex({ subcategory: 1, active: 1 });
      await this.collection.createIndex({ categoryPath: 1 });
      
      // Índices para búsquedas
      await this.collection.createIndex({ brand: 1, active: 1 });
      await this.collection.createIndex({ tags: 1 });
      await this.collection.createIndex({ featured: 1, active: 1 });
      
      // Índice de texto para búsqueda
      await this.collection.createIndex({ 
        name: 'text', 
        description: 'text', 
        tags: 'text' 
      });
      
      // Índices para variantes
      await this.collection.createIndex({ 'colorVariants.sku': 1 });
      
      console.log('✅ Índices de productos creados exitosamente');
    } catch (error) {
      console.error('❌ Error creando índices de productos:', error);
      throw error;
    }
  }

  // Validar estructura del producto
  validateProduct(productData) {
    const errors = [];

    // Validaciones básicas
    if (!productData.name || productData.name.trim() === '') {
      errors.push('El nombre del producto es obligatorio');
    }

    if (!productData.sku || productData.sku.trim() === '') {
      errors.push('El SKU es obligatorio');
    }

    if (!productData.category) {
      errors.push('La categoría es obligatoria');
    }

    // Validar SKUs únicos en variantes
    if (productData.variants && productData.variants.length > 0) {
      const skus = productData.variants.map(v => v.sku);
      const uniqueSkus = [...new Set(skus)];
      if (skus.length !== uniqueSkus.length) {
        errors.push('Los SKUs de las variantes deben ser únicos');
      }
    }

    // Validar coherencia de variantes
    if (productData.colorVariants && productData.colorVariants.length > 0) {
      // Validar que cada variante de color tenga SKU único
      const variantSkus = productData.colorVariants.map(v => v.sku).filter(sku => sku);
      const uniqueVariantSkus = [...new Set(variantSkus)];
      if (variantSkus.length !== uniqueVariantSkus.length) {
        errors.push('Los SKUs de las variantes de color deben ser únicos');
      }
      
      // Validar que cada variante tenga imagen si hay variantes de color
      const variantsWithoutImage = productData.colorVariants.filter(v => !v.image);
      if (variantsWithoutImage.length > 0 && !productData.defaultImage) {
        errors.push('Las variantes de color deben tener imagen o debe haber una imagen por defecto');
      }
    }

    if (productData.measurements?.enabled && (!productData.measurements.availableSizes || productData.measurements.availableSizes.length === 0)) {
      errors.push('Si las medidas están habilitadas, debe especificar los tamaños disponibles');
    }

    return errors;
  }

  // Generar SKU sugerido (el usuario puede modificarlo)
  generateSKUSuggestion(productData) {
    const category = productData.categorySlug || 'PROD';
    const name = productData.name.substring(0, 8).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const timestamp = Date.now().toString(36).toUpperCase().substring(0, 4);
    
    return `${category.substring(0, 4).toUpperCase()}-${name}-${timestamp}`;
  }

  // Generar slug del producto
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

  // Construir path de categorías y breadcrumb
  async buildCategoryPath(db, categorySlug, subcategorySlug) {
    try {
      const categoryService = require('../services/CategoryService');
      const subcategoryService = require('../services/SubcategoryService');
      
      const path = [];
      const pathNames = [];
      let breadcrumb = '';
      
      // Obtener categoría principal
      if (categorySlug) {
        const category = await new categoryService(db).getBySlug(categorySlug);
        if (category) {
          path.push(category._id.toString());
          pathNames.push(category.name);
          breadcrumb = category.name;
        }
      }
      
      // Obtener subcategoría y construir path completo
      if (subcategorySlug) {
        const subcategory = await new subcategoryService(db).getBySlug(subcategorySlug);
        if (subcategory && subcategory.path) {
          // Usar el path completo de la subcategoría
          path.push(...subcategory.path.map(id => id.toString()));
          pathNames.push(...subcategory.pathNames || []);
          
          // Construir breadcrumb: "Categoría > Subcategoría > Sub-subcategoría"
          if (subcategory.pathNames && subcategory.pathNames.length > 0) {
            breadcrumb = [category?.name, ...subcategory.pathNames].filter(Boolean).join(' > ');
          }
        }
      }
      
      return { 
        path, 
        pathNames, 
        breadcrumb 
      };
    } catch (error) {
      console.error('Error construyendo path de categorías:', error);
      return { 
        path: categorySlug ? [categorySlug] : [], 
        pathNames: [], 
        breadcrumb: '' 
      };
    }
  }
}

module.exports = Product;