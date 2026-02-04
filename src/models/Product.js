const { ObjectId } = require('mongodb');

// Esquema de producto (alineado con el documento en BD)
// Campos: _id, name, description, sku, category, slug, brand, brandSlug,
// attributes, specifications, measurements, colorVariants, defaultImage, images,
// featured, active, createdAt, updatedAt
const productSchema = {
  name: { type: String, required: true },
  description: { type: String, default: '' },
  sku: { type: String, required: true, unique: true },
  category: { type: ObjectId, required: true, ref: 'categories' },
  slug: { type: String, required: true, unique: true },
  brand: { type: String, default: '' },
  brandSlug: { type: String, default: '' },
  attributes: { type: Array, default: [] },
  specifications: { type: Object, default: {} },
  measurements: {
    enabled: { type: Boolean, default: false },
    description: { type: String, default: '' },
    variants: [{
      size: { type: String, required: true },
      sku: { type: String, required: true },
      active: { type: Boolean, default: true }
    }]
  },
  colorVariants: { type: Array, default: [] },
  defaultImage: { type: String, default: '' },
  images: { type: Array, default: [] },
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
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
      await this.collection.createIndex({ sku: 1 }, { unique: true });
      await this.collection.createIndex({ slug: 1 }, { unique: true });
      await this.collection.createIndex({ category: 1, active: 1 });
      await this.collection.createIndex({ brand: 1, active: 1 });
      await this.collection.createIndex({ featured: 1, active: 1 });
      await this.collection.createIndex({ 'colorVariants.sku': 1 });
      await this.collection.createIndex(
        { name: 'text', description: 'text' },
        { name: 'product_text' }
      );
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

    if (productData.measurements?.enabled && (!productData.measurements.variants || productData.measurements.variants.length === 0)) {
      errors.push('Si las medidas están habilitadas, debe especificar al menos una variante (medida/SKU)');
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
}

module.exports = Product;