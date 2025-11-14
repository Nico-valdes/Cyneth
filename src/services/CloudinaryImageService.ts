import { ImageUploadResult } from '@/types/image';

export interface CloudinaryUploadResult {
  success: boolean;
  originalUrl: string;
  cloudinaryUrl?: string;
  error?: string;
  size?: number;
  format?: string;
  publicId?: string;
}

export class CloudinaryImageService {
  private cloudinaryUrl: string;
  private cloudName: string;
  private apiKey: string;
  private apiSecret: string;
  private maxFileSize = 10 * 1024 * 1024; // 10MB
  private allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  private timeout = 30000; // 30 segundos

  constructor() {
    this.cloudinaryUrl = process.env.CLOUDINARY_URL || '';
    
    if (!this.cloudinaryUrl) {
      throw new Error('CLOUDINARY_URL no está configurado');
    }

    // Parsear la URL de Cloudinary para extraer credenciales
    const url = new URL(this.cloudinaryUrl);
    this.cloudName = url.hostname.split('.')[0];
    this.apiKey = url.username;
    this.apiSecret = url.password;
  }

  /**
   * Descarga una imagen desde una URL externa y la sube a Cloudinary
   */
  async downloadAndUpload(
    imageUrl: string, 
    productName: string, 
    index: number = 0
  ): Promise<CloudinaryUploadResult> {
    try {
      console.log(`🌐 Descargando imagen: ${imageUrl}`);

      // Validar URL
      if (!this.isValidImageUrl(imageUrl)) {
        return {
          success: false,
          originalUrl: imageUrl,
          error: 'URL de imagen inválida'
        };
      }

      // Descargar imagen con timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(imageUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ProductImporter/1.0)',
          'Accept': 'image/*'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          originalUrl: imageUrl,
          error: `Error al descargar: ${response.status} ${response.statusText}`
        };
      }

      // Verificar tipo de contenido
      const contentType = response.headers.get('content-type');
      if (!contentType || !this.allowedFormats.includes(contentType.toLowerCase())) {
        return {
          success: false,
          originalUrl: imageUrl,
          error: `Formato no soportado: ${contentType}`
        };
      }

      // Verificar tamaño
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > this.maxFileSize) {
        return {
          success: false,
          originalUrl: imageUrl,
          error: `Imagen demasiado grande: ${(parseInt(contentLength) / 1024 / 1024).toFixed(2)}MB`
        };
      }

      // Obtener buffer de la imagen
      const imageBuffer = Buffer.from(await response.arrayBuffer());
      
      if (imageBuffer.length > this.maxFileSize) {
        return {
          success: false,
          originalUrl: imageUrl,
          error: `Imagen demasiado grande: ${(imageBuffer.length / 1024 / 1024).toFixed(2)}MB`
        };
      }

      // Generar nombre de archivo único
      const fileName = this.generateFileName(productName, index);
      const publicId = `products/${fileName}`;

      console.log(`📤 Subiendo a Cloudinary: ${publicId}`);

      // Subir a Cloudinary
      const uploadResult = await this.uploadToCloudinary(
        imageBuffer,
        publicId,
        contentType
      );

      if (!uploadResult.success) {
        return {
          success: false,
          originalUrl: imageUrl,
          error: `Error subiendo a Cloudinary: ${uploadResult.error}`
        };
      }

      console.log(`✅ Imagen subida exitosamente: ${uploadResult.url}`);

      return {
        success: true,
        originalUrl: imageUrl,
        cloudinaryUrl: uploadResult.url,
        size: imageBuffer.length,
        format: contentType,
        publicId: uploadResult.publicId
      };

    } catch (error: any) {
      console.error(`❌ Error procesando imagen ${imageUrl}:`, error);
      
      if (error.name === 'AbortError') {
        return {
          success: false,
          originalUrl: imageUrl,
          error: 'Timeout al descargar la imagen'
        };
      }

      return {
        success: false,
        originalUrl: imageUrl,
        error: error.message || 'Error desconocido'
      };
    }
  }

  /**
   * Procesa múltiples URLs de imágenes en paralelo (con límite de concurrencia)
   */
  async downloadMultipleImages(
    imageUrls: string[], 
    productName: string,
    maxConcurrency: number = 3
  ): Promise<CloudinaryUploadResult[]> {
    console.log(`🔄 Procesando ${imageUrls.length} imágenes para producto: ${productName}`);

    const results: CloudinaryUploadResult[] = [];
    
    // Procesar en lotes para controlar la concurrencia
    for (let i = 0; i < imageUrls.length; i += maxConcurrency) {
      const batch = imageUrls.slice(i, i + maxConcurrency);
      
      const batchPromises = batch.map((url, batchIndex) => 
        this.downloadAndUpload(url, productName, i + batchIndex)
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Pausa pequeña entre lotes para no sobrecargar
      if (i + maxConcurrency < imageUrls.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`📊 Resultado de imágenes para ${productName}: ${successful} exitosas, ${failed} fallidas`);

    return results;
  }

  /**
   * Sube una imagen a Cloudinary usando autenticación
   */
  private async uploadToCloudinary(
    imageBuffer: Buffer,
    publicId: string,
    contentType: string
  ): Promise<{ success: boolean; url?: string; publicId?: string; error?: string }> {
    try {
      // Convertir buffer a base64
      const base64 = imageBuffer.toString('base64');
      const dataUrl = `data:${contentType};base64,${base64}`;

      // Crear FormData para la subida con autenticación
      const formData = new FormData();
      formData.append('file', dataUrl);
      formData.append('public_id', publicId);
      formData.append('folder', 'products');
      formData.append('overwrite', 'true');
      formData.append('resource_type', 'image');
      formData.append('api_key', this.apiKey);
      formData.append('timestamp', Math.round(new Date().getTime() / 1000).toString());

      // Generar signature para autenticación
      const signature = this.generateSignature(publicId, formData.get('timestamp') as string);
      formData.append('signature', signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: `Error subiendo a Cloudinary: ${response.status} - ${JSON.stringify(errorData)}`
        };
      }

      const result = await response.json();
      
      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Error desconocido subiendo a Cloudinary'
      };
    }
  }

  /**
   * Genera la signature para autenticación de Cloudinary
   */
  private generateSignature(publicId: string, timestamp: string): string {
    const crypto = require('crypto');
    // Los parámetros deben estar en orden alfabético para la signature
    const params = `folder=products&overwrite=true&public_id=${publicId}&timestamp=${timestamp}${this.apiSecret}`;
    return crypto.createHash('sha1').update(params).digest('hex');
  }

  /**
   * Valida si una URL apunta a una imagen
   */
  private isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      
      // Verificar protocolo
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Genera un nombre de archivo único para la imagen
   */
  private generateFileName(productName: string, index: number): string {
    // Limpiar nombre del producto
    const cleanName = productName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);

    // Timestamp para unicidad
    const timestamp = Date.now();
    
    // Formato: producto-index-timestamp
    return `${cleanName}-${index}-${timestamp}`;
  }

  /**
   * Obtiene información de una imagen sin descargarla completamente
   */
  async getImageInfo(imageUrl: string): Promise<{
    isValid: boolean;
    contentType?: string;
    size?: number;
    error?: string;
  }> {
    try {
      const response = await fetch(imageUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ProductImporter/1.0)'
        }
      });

      if (!response.ok) {
        return {
          isValid: false,
          error: `Error: ${response.status} ${response.statusText}`
        };
      }

      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');

      return {
        isValid: contentType ? this.allowedFormats.includes(contentType.toLowerCase()) : false,
        contentType: contentType || undefined,
        size: contentLength ? parseInt(contentLength) : undefined
      };

    } catch (error: any) {
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  /**
   * Genera una URL optimizada de Cloudinary que evita descargas
   */
  getOptimizedUrl(publicId: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  } = {}): string {
    const baseUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload`;
    const transformations = [];
    
    // Agregar transformaciones
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);
    
    // Agregar transformación para evitar descarga
    transformations.push('fl_attachment:false');
    
    const transformString = transformations.length > 0 ? transformations.join(',') + '/' : '';
    
    return `${baseUrl}/${transformString}${publicId}`;
  }

  /**
   * Elimina una imagen de Cloudinary
   */
  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            public_id: publicId,
            api_key: this.apiKey,
            api_secret: this.apiSecret
          })
        }
      );

      const result = await response.json();
      return result.result === 'ok';
    } catch (error) {
      console.error('❌ Error eliminando imagen de Cloudinary:', error);
      return false;
    }
  }
}
