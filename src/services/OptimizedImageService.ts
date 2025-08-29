import { ImageUploadResult } from '@/types/image';

export class OptimizedImageService {
  private accountId: string;
  private accountHash: string;
  private apiToken: string;

  constructor() {
    this.accountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID!;
    this.accountHash = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH || 'Jmy2odwe3Q0Hl0zoLTlR1A';
    this.apiToken = process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN!;
  }

  /**
   * Sube una imagen desde una URL externa a Cloudflare Images
   */
  async uploadFromUrl(imageUrl: string): Promise<ImageUploadResult> {
    try {
      console.log('🔄 Iniciando subida optimizada desde:', imageUrl);

      // Descargar la imagen
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Error descargando imagen: ${response.status}`);
      }

      const imageBuffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      
      // Generar nombre único para la imagen
      const fileName = this.generateFileName(imageUrl, contentType);
      
      // Subir a Cloudflare Images para optimización automática
      const imagesResult = await this.uploadToCloudflareImages(fileName, imageBuffer, contentType);
      
      console.log('✅ Imagen subida exitosamente a Cloudflare Images:', imagesResult.url);
      
      return {
        success: true,
        cloudflareUrl: imagesResult.url, // URL optimizada de Images
        fileName: fileName,
        size: imageBuffer.byteLength,
        contentType: contentType
      };

    } catch (error) {
      console.error('❌ Error en subida optimizada:', error);
      throw error;
    }
  }

  /**
   * Sube a Cloudflare Images para optimización automática
   */
  private async uploadToCloudflareImages(fileName: string, buffer: ArrayBuffer, contentType: string): Promise<{ url: string }> {
    // Crear FormData para la subida
    const formData = new FormData();
    
    // Convertir buffer a Blob para FormData
    const blob = new Blob([buffer], { type: contentType });
    formData.append('file', blob, fileName);
    
    // Agregar metadata
    formData.append('metadata', JSON.stringify({
      fileName: fileName,
      source: 'optimized-upload'
    }));
    
    const imagesApiUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images/v1`;
    
    const response = await fetch(imagesApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`
        // NO incluir Content-Type, FormData lo establece automáticamente
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error subiendo a Images: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`Error en respuesta de Images: ${JSON.stringify(data)}`);
    }

    // Construir URL optimizada usando tu Account Hash
    const imageId = data.result.id;
    const imagesUrl = `https://imagedelivery.net/${this.accountHash}/${imageId}/public`;
    
    return { url: imagesUrl };
  }

  /**
   * Genera un nombre único para el archivo
   */
  private generateFileName(originalUrl: string, contentType: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = this.getExtensionFromContentType(contentType);
    
    return `images/${timestamp}-${randomId}${extension}`;
  }

  /**
   * Obtiene la extensión del archivo basado en el content-type
   */
  private getExtensionFromContentType(contentType: string): string {
    const extensions: { [key: string]: string } = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg'
    };
    
    return extensions[contentType] || '.jpg';
  }

  /**
   * Elimina imagen de Cloudflare Images
   */
  async deleteImage(imageId: string): Promise<boolean> {
    try {
      const imagesApiUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images/v1/${imageId}`;
      
      const response = await fetch(imagesApiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Error eliminando imagen:', error);
      return false;
    }
  }
}
