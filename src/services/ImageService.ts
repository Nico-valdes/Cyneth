import { CloudflareUploadResponse, ImageUploadResult } from '@/types/image';

class ImageService {
  private cloudflareAccountId: string;
  private cloudflareApiToken: string;

  constructor() {
    this.cloudflareAccountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID || '';
    this.cloudflareApiToken = process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN || '';
  }

  /**
   * Descarga una imagen desde una URL externa y la sube a Cloudflare
   */
  async uploadFromUrl(imageUrl: string): Promise<ImageUploadResult> {
    try {
      // Paso 1: Descargar la imagen desde la URL externa
      const imageBuffer = await this.downloadImage(imageUrl);
      
      if (!imageBuffer) {
        return {
          success: false,
          error: 'No se pudo descargar la imagen desde la URL proporcionada'
        };
      }

      // Paso 2: Subir a Cloudflare
      const cloudflareResult = await this.uploadToCloudflare(imageBuffer, this.getFilenameFromUrl(imageUrl));
      
      if (cloudflareResult.success && cloudflareResult.result) {
        // Construir la URL de Cloudflare
        const cloudflareUrl = `https://imagedelivery.net/${this.cloudflareAccountId}/${cloudflareResult.result.id}/public`;
        
        return {
          success: true,
          cloudflareUrl
        };
      } else {
        return {
          success: false,
          error: 'Error al subir la imagen a Cloudflare'
        };
      }

    } catch (error) {
      console.error('Error en uploadFromUrl:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Descarga una imagen desde una URL y la convierte a Buffer
   */
  private async downloadImage(imageUrl: string): Promise<Buffer | null> {
    try {
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
      
    } catch (error) {
      console.error('Error descargando imagen:', error);
      return null;
    }
  }

  /**
   * Sube un buffer de imagen a Cloudflare
   */
  private async uploadToCloudflare(imageBuffer: Buffer, filename: string): Promise<CloudflareUploadResponse> {
    try {
      // Crear FormData para la subida
      const formData = new FormData();
      const blob = new Blob([imageBuffer]);
      formData.append('file', blob, filename);

      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.cloudflareAccountId}/images/v1`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.cloudflareApiToken}`,
          },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error(`Cloudflare API error: ${response.status}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Error subiendo a Cloudflare:', error);
      throw error;
    }
  }

  /**
   * Extrae el nombre del archivo de una URL
   */
  private getFilenameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop() || 'image.jpg';
      
      // Asegurar que tenga una extensión válida
      if (!filename.includes('.')) {
        return `${filename}.jpg`;
      }
      
      return filename;
    } catch {
      return `image_${Date.now()}.jpg`;
    }
  }

  /**
   * Verifica si una URL es válida
   */
  isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const validProtocols = ['http:', 'https:'];
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      
      // Verificar protocolo
      if (!validProtocols.includes(urlObj.protocol)) {
        return false;
      }

      // Verificar extensión
      const hasValidExtension = validExtensions.some(ext => 
        urlObj.pathname.toLowerCase().includes(ext)
      );

      return hasValidExtension;
    } catch {
      return false;
    }
  }
}

export default ImageService;
