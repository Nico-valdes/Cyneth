import fetch from 'node-fetch';
import { R2ImageService } from './R2ImageService';

export interface ImageDownloadResult {
  success: boolean;
  originalUrl: string;
  cloudflareUrl?: string;
  error?: string;
  size?: number;
  format?: string;
}

export class ImageDownloadService {
  private r2Service: R2ImageService;
  private maxFileSize = 10 * 1024 * 1024; // 10MB
  private allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  private timeout = 30000; // 30 segundos

  constructor() {
    this.r2Service = new R2ImageService();
  }

  /**
   * Descarga una imagen desde una URL externa y la sube a Cloudflare R2
   */
  async downloadAndUpload(
    imageUrl: string, 
    productName: string, 
    index: number = 0
  ): Promise<ImageDownloadResult> {
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
      const imageBuffer = await response.buffer();
      
      if (imageBuffer.length > this.maxFileSize) {
        return {
          success: false,
          originalUrl: imageUrl,
          error: `Imagen demasiado grande: ${(imageBuffer.length / 1024 / 1024).toFixed(2)}MB`
        };
      }

      // Generar nombre de archivo único
      const extension = this.getFileExtension(contentType);
      const fileName = this.generateFileName(productName, index, extension);

      console.log(`📤 Subiendo a Cloudflare: ${fileName}`);

      // Subir a Cloudflare R2
      const uploadResult = await this.r2Service.uploadBuffer(
        imageBuffer,
        fileName,
        contentType
      );

      if (!uploadResult.success) {
        return {
          success: false,
          originalUrl: imageUrl,
          error: `Error subiendo a Cloudflare: ${uploadResult.error}`
        };
      }

      console.log(`✅ Imagen subida exitosamente: ${uploadResult.url}`);

      return {
        success: true,
        originalUrl: imageUrl,
        cloudflareUrl: uploadResult.url,
        size: imageBuffer.length,
        format: contentType
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
  ): Promise<ImageDownloadResult[]> {
    console.log(`🔄 Procesando ${imageUrls.length} imágenes para producto: ${productName}`);

    const results: ImageDownloadResult[] = [];
    
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
   * Valida si una URL apunta a una imagen
   */
  private isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      
      // Verificar protocolo
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }

      // Verificar extensión en la URL (opcional, no siempre confiable)
      const pathname = urlObj.pathname.toLowerCase();
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg'];
      
      // No es obligatorio que tenga extensión, el content-type es más confiable
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene la extensión de archivo basada en el content-type
   */
  private getFileExtension(contentType: string): string {
    const typeMap: { [key: string]: string } = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/bmp': 'bmp',
      'image/svg+xml': 'svg'
    };

    return typeMap[contentType.toLowerCase()] || 'jpg';
  }

  /**
   * Genera un nombre de archivo único para la imagen
   */
  private generateFileName(productName: string, index: number, extension: string): string {
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
    
    // Formato: producto-index-timestamp.ext
    return `products/${cleanName}-${index}-${timestamp}.${extension}`;
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
}

