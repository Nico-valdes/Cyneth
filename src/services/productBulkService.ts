import { connectToDatabase } from '@/libs/mongoConnect';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Brand from '@/models/Brand';
import { CloudinaryImageService, CloudinaryUploadResult } from './CloudinaryImageService';

export interface ProductRow {
  name: string;
  category: string;
  subcategory?: string;
  brand?: string;
  description?: string;
  specifications?: any;
  tags?: string[];
  variations?: any[];
  images?: any[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ProcessedProduct {
  product: any;
  errors: string[];
  warnings: string[];
}

export class ProductBulkService {
  private db: any;
  private productModel: Product;
  private categoryModel: Category;
  private brandModel: Brand;
  private cloudinaryService: CloudinaryImageService;
  private isInitialized: boolean = false;

  constructor() {
    // No inicializar aquí, se hará cuando se necesite
    this.cloudinaryService = new CloudinaryImageService();
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initializeModels();
      this.isInitialized = true;
    }
  }

  private async initializeModels() {
    const client = await connectToDatabase();
    this.db = client.db('cyneth');
    this.productModel = new Product(this.db);
    this.categoryModel = new Category(this.db);
    this.brandModel = new Brand(this.db);
  }

  /**
   * Valida una fila de datos del Excel
   */
  public async validateRow(row: any[], headers: string[]): Promise<ValidationResult> {
    await this.ensureInitialized(); // Asegúrate de que los modelos estén inicializados
    const errors: string[] = [];
    const warnings: string[] = [];

    // Crear un objeto mapeado para facilitar la validación
    const rowData: any = {};
    headers.forEach((header, index) => {
      rowData[header] = row[index];
    });

    // Validar campos obligatorios
    if (!rowData.name || (typeof rowData.name === 'string' && rowData.name.trim() === '')) {
      errors.push('El nombre del producto es obligatorio');
    }

    if (!rowData.category || (typeof rowData.category === 'string' && rowData.category.trim() === '')) {
      errors.push('La categoría es obligatoria');
    }

    // Validar longitud de campos (convertir a advertencias)
    if (rowData.name && typeof rowData.name === 'string' && rowData.name.length > 200) {
      warnings.push('El nombre del producto es muy largo (máximo 200 caracteres)');
    }

    if (rowData.description && typeof rowData.description === 'string' && rowData.description.length > 1000) {
      warnings.push('La descripción es muy larga (máximo 1000 caracteres)');
    }

    // Validar formato de especificaciones (convertir a advertencias)
    if (rowData.specifications && typeof rowData.specifications === 'string' && rowData.specifications.trim() !== '') {
      try {
        JSON.parse(rowData.specifications);
      } catch (e) {
        warnings.push('Las especificaciones no están en formato JSON válido - se guardarán como texto');
      }
    }

    // Validar formato de variaciones (convertir a advertencias)
    if (rowData.variations && typeof rowData.variations === 'string' && rowData.variations.trim() !== '') {
      try {
        const variations = JSON.parse(rowData.variations);
        if (!Array.isArray(variations)) {
          warnings.push('Las variaciones no son un array JSON válido - se guardarán como texto');
        }
      } catch (e) {
        warnings.push('Las variaciones no están en formato JSON válido - se guardarán como texto');
      }
    }

    // Validar formato de tags (convertir a advertencias)
    if (rowData.tags && typeof rowData.tags === 'string' && rowData.tags.trim() !== '') {
      const tags = rowData.tags.split(',').map((tag: string) => tag.trim());
      if (tags.some((tag: string) => tag.length > 50)) {
        warnings.push('Algunos tags son muy largos (máximo 50 caracteres)');
      }
    }

    // Validar URLs de imágenes (convertir a advertencias)
    if (rowData.images && typeof rowData.images === 'string' && rowData.images.trim() !== '') {
      const urls = rowData.images.split(',').map((url: string) => url.trim());
      const invalidUrls = urls.filter((url: string) => !this.isValidUrl(url));
      if (invalidUrls.length > 0) {
        warnings.push('Algunas URLs de imágenes no parecen válidas - se guardarán igual');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Transforma una fila del Excel en un objeto producto
   */
  public async transformRow(row: any[], headers: string[]): Promise<ProcessedProduct> {
    await this.ensureInitialized(); // Asegúrate de que los modelos estén inicializados
    const product: any = {};
    const errors: string[] = [];
    const warnings: string[] = [];

    // Mapear campos básicos usando los headers
    headers.forEach((header, index) => {
      if (row[index] !== undefined && row[index] !== null && row[index] !== '') {
        product[header] = row[index];
      }
    });

    // Validaciones básicas
    if (!product.name) {
      errors.push('El nombre del producto es obligatorio');
    }

    if (!product.sku) {
      product.sku = this.generateSKU(product.name, product.brand);
      warnings.push(`SKU generado automáticamente: ${product.sku}`);
    }

    // Procesar atributos si existen
    if (product.attributes && typeof product.attributes === 'string' && product.attributes.trim() !== '') {
      try {
        const attributesArray = product.attributes.split(';').map((attr: string) => {
          const [name, value] = attr.split(':').map(s => s.trim());
          return { name, value };
        }).filter(attr => attr.name && attr.value);
        
        product.attributes = attributesArray;
      } catch (error) {
        warnings.push('Error procesando atributos');
        product.attributes = [];
      }
    }

    // Procesar variantes de color si existen
    if (product.color_variants && typeof product.color_variants === 'string' && product.color_variants.trim() !== '') {
      try {
        const variantsArray = product.color_variants.split('|').map((variant: string) => {
          const [colorName, colorCode, sku, image] = variant.split(':').map(s => s.trim());
          return {
            colorName,
            colorCode: colorCode || '#000000',
            sku: sku || this.generateColorSKU(colorName),
            image: image || '',
            active: true
          };
        }).filter(variant => variant.colorName);
        
        product.colorVariants = variantsArray;
        
        // Procesar imágenes de variantes si existen
        for (const variant of variantsArray) {
          if (variant.image && variant.image.trim() !== '') {
            try {
              const imageResult = await this.cloudinaryService.downloadAndUpload(variant.image, `${product.name}-${variant.colorName}`);
              if (imageResult.success) {
                variant.image = imageResult.cloudinaryUrl;
              } else {
                warnings.push(`No se pudo descargar imagen para variante ${variant.colorName}`);
                variant.image = '';
              }
            } catch (error) {
              warnings.push(`Error procesando imagen de variante ${variant.colorName}`);
              variant.image = '';
            }
          }
        }
      } catch (error) {
        warnings.push('Error procesando variantes de color');
        product.colorVariants = [];
      }
    }

    // Procesar especificaciones de manera robusta
    if (product.specifications && typeof product.specifications === 'string' && product.specifications.trim() !== '') {
      try {
        product.specifications = JSON.parse(product.specifications);
      } catch (e) {
        // Si no es JSON válido, guardar como objeto simple
        product.specifications = { 
          rawValue: product.specifications,
          note: 'Valor original del Excel (no es JSON válido)'
        };
      }
    }

    // Procesar tags de manera robusta
    if (product.tags && typeof product.tags === 'string' && product.tags.trim() !== '') {
      try {
        product.tags = product.tags.split(',').map((tag: string) => tag.trim()).filter(tag => tag.length > 0);
      } catch (e) {
        // Si falla el procesamiento, guardar como array simple
        product.tags = [product.tags];
      }
    }

    // Procesar variaciones de manera robusta
    if (product.variations && typeof product.variations === 'string' && product.variations.trim() !== '') {
      try {
        const parsed = JSON.parse(product.variations);
        if (Array.isArray(parsed)) {
          product.variations = parsed;
        } else {
          // Si no es array, crear una variación por defecto
          product.variations = [{
            attributes: { default: product.variations },
            stock: 0,
            sku: this.generateSKU(product.name),
            active: true
          }];
        }
      } catch (e) {
        // Si no es JSON válido, crear variación por defecto
        product.variations = [{
          attributes: { rawValue: product.variations },
          stock: 0,
          sku: this.generateSKU(product.name),
          active: true,
          note: 'Valor original del Excel (no es JSON válido)'
        }];
      }
    }

    // Procesar imágenes: descargar desde URLs externas y subir a Cloudflare
    if (product.images && typeof product.images === 'string' && product.images.trim() !== '') {
      try {
        const urls = product.images.split(',').map((url: string) => url.trim()).filter(url => url.length > 0);
        console.log(`🖼️ Procesando ${urls.length} imágenes para producto: ${product.name}`);
        
        // Descargar y subir imágenes a Cloudinary
        const imageResults = await this.cloudinaryService.downloadMultipleImages(urls, product.name);
        
        // Procesar resultados
        const processedImages = [];
        const imageErrors = [];
        
        for (let i = 0; i < imageResults.length; i++) {
          const result = imageResults[i];
          
          if (result.success && result.cloudinaryUrl) {
            processedImages.push({
              url: result.cloudinaryUrl,
              originalUrl: result.originalUrl,
              alt: product.name || 'Producto',
              priority: i,
              size: result.size,
              format: result.format,
              publicId: result.publicId
            });
          } else {
            imageErrors.push({
              originalUrl: result.originalUrl,
              error: result.error
            });
            console.warn(`⚠️ Error procesando imagen ${result.originalUrl}: ${result.error}`);
          }
        }
        
        // Usar imágenes exitosas
        product.images = processedImages;
        
        // Agregar errores de imágenes como metadatos
        if (imageErrors.length > 0) {
          product.imageErrors = imageErrors;
        }
        
        console.log(`✅ Procesadas ${processedImages.length}/${urls.length} imágenes en Cloudinary para: ${product.name}`);
        
      } catch (e) {
        console.error(`❌ Error general procesando imágenes para ${product.name}:`, e);
        // Si falla todo el procesamiento, guardar URLs originales como fallback
        const urls = product.images.split(',').map((url: string) => url.trim()).filter(url => url.length > 0);
        product.images = urls.map((url: string, index: number) => ({
          url: url,
          originalUrl: url,
          alt: product.name || 'Producto',
          priority: index,
          isOriginalUrl: true // Marcar que es URL original, no de Cloudinary
        }));
        
        product.imageProcessingError = e instanceof Error ? e.message : 'Error desconocido procesando imágenes con Cloudinary';
      }
    }

    // Agregar metadatos
    product.active = true;
    product.createdAt = new Date();
    product.updatedAt = new Date();
    product.slug = this.generateSlug(product.name);

    return {
      product,
      errors,
      warnings
    };
  }

  /**
   * Inserta un producto en la base de datos
   */
  public async insertProduct(product: ProcessedProduct): Promise<{
    success: boolean;
    isDuplicate: boolean;
    duplicateReason?: string;
    existingProduct?: any;
  }> {
    await this.ensureInitialized(); // Asegúrate de que los modelos estén inicializados
    try {
      // Verificar duplicados antes de insertar
      const duplicateCheck = await this.checkDuplicate(product);
      
      if (duplicateCheck.isDuplicate) {
        return {
          success: false,
          isDuplicate: true,
          duplicateReason: duplicateCheck.duplicateReason,
          existingProduct: duplicateCheck.existingProduct
        };
      }

      // Si no es duplicado, insertar
      await this.productModel.getCollection().insertOne(product);
      return {
        success: true,
        isDuplicate: false
      };
    } catch (error) {
      console.error('Error insertando producto:', error);
      return {
        success: false,
        isDuplicate: false
      };
    }
  }

  /**
   * Verifica si un producto ya existe en la base de datos
   */
  public async checkDuplicate(product: ProcessedProduct): Promise<{
    isDuplicate: boolean;
    existingProduct?: any;
    duplicateReason: string;
  }> {
    await this.ensureInitialized(); // Asegúrate de que los modelos estén inicializados
    try {
      // Verificar por nombre exacto
      const existingByName = await this.productModel.getCollection().findOne({
        name: product.name
      });

      if (existingByName) {
        return {
          isDuplicate: true,
          existingProduct: existingByName,
          duplicateReason: 'Nombre duplicado'
        };
      }

      // Verificar por SKU si existe
      if (product.variations && product.variations.length > 0) {
        for (const variation of product.variations) {
          if (variation.sku) {
            const existingBySKU = await this.productModel.getCollection().findOne({
              'variations.sku': variation.sku
            });

            if (existingBySKU) {
              return {
                isDuplicate: true,
                existingProduct: existingBySKU,
                duplicateReason: `SKU duplicado: ${variation.sku}`
              };
            }
          }
        }
      }

      // Verificar por combinación de nombre + categoría + marca
      const existingByCombo = await this.productModel.getCollection().findOne({
        name: product.name,
        category: product.category,
        brand: product.brand || { $exists: false }
      });

      if (existingByCombo) {
        return {
          isDuplicate: true,
          existingProduct: existingByCombo,
          duplicateReason: 'Combinación nombre + categoría + marca duplicada'
        };
      }

      return {
        isDuplicate: false,
        duplicateReason: 'No es duplicado'
      };
    } catch (error) {
      console.error('Error verificando duplicados:', error);
      return {
        isDuplicate: false,
        duplicateReason: 'Error al verificar duplicados'
      };
    }
  }

  /**
   * Procesa productos en lotes
   */
  public async processBatch(products: ProcessedProduct[], batchSize: number = 100): Promise<{
    success: number;
    duplicates: number;
    errors: any[];
    processed: number;
    duplicateDetails: any[];
  }> {
    await this.ensureInitialized(); // Asegúrate de que los modelos estén inicializados
    const results = {
      success: 0,
      duplicates: 0,
      errors: [] as any[],
      processed: 0,
      duplicateDetails: [] as any[]
    };

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      for (const product of batch) {
        try {
          const result = await this.insertProduct(product);
          
          if (result.success) {
            results.success++;
          } else if (result.isDuplicate) {
            results.duplicates++;
            results.duplicateDetails.push({
              product: product.name,
              reason: result.duplicateReason,
              existingProduct: result.existingProduct
            });
          } else {
            results.errors.push({
              product: product.name,
              error: 'Error al insertar en la base de datos'
            });
          }
        } catch (error: any) {
          results.errors.push({
            product: product.name,
            error: error.message
          });
        }
        
        results.processed++;
      }

      // Pausa entre lotes
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  /**
   * Genera un SKU único para el producto
   */
  private generateSKU(name: string, brand?: string): string {
    const brandPrefix = brand ? brand.substring(0, 3).toUpperCase() : 'PRD';
    const namePrefix = name.substring(0, 5).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const timestamp = Date.now().toString(36).toUpperCase().substring(0, 4);
    return `${brandPrefix}-${namePrefix}-${timestamp}`;
  }

  /**
   * Genera SKU para variante de color
   */
  private generateColorSKU(colorName: string): string {
    const colorPrefix = colorName.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const timestamp = Date.now().toString(36).toUpperCase().substring(0, 3);
    return `${colorPrefix}-${timestamp}`;
  }

  /**
   * Genera slug del producto
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Valida si una URL es válida
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
