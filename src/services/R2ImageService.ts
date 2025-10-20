import { ImageUploadResult } from '@/types/image';

export class R2ImageService {
  private accountId: string;
  private apiToken: string;
  private bucketName: string;

  constructor() {
    this.accountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID!;
    this.apiToken = process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN!;
    this.bucketName = process.env.NEXT_PUBLIC_R2_BUCKET_NAME || 'cyneth-images';
  }

  /**
   * Sube una imagen desde una URL externa a R2
   */
  async uploadFromUrl(imageUrl: string): Promise<ImageUploadResult> {
    try {
      console.log('🔄 Iniciando subida a R2 desde:', imageUrl);

      // Descargar la imagen
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Error descargando imagen: ${response.status}`);
      }

      const imageBuffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      
      // Generar nombre único para la imagen
      const fileName = this.generateFileName(imageUrl, contentType);
      
      // Subir a R2 usando la API de Cloudflare
      const uploadResult = await this.uploadToR2(fileName, imageBuffer, contentType);
      
      console.log('✅ Imagen subida exitosamente a R2:', uploadResult.url);
      
      return {
        success: true,
        cloudflareUrl: uploadResult.url, // URL de R2
        r2Url: uploadResult.url, // URL de R2
        fileName: fileName,
        size: imageBuffer.byteLength,
        contentType: contentType
      };

    } catch (error) {
      console.error('❌ Error subiendo imagen a R2:', error);
      throw error;
    }
  }

  /**
   * Sube un buffer de imagen a R2 (método público)
   */
  async uploadBuffer(buffer: Buffer | ArrayBuffer, fileName: string, contentType: string): Promise<ImageUploadResult> {
    try {
      const uploadResult = await this.uploadToR2(fileName, buffer, contentType);
      
      return {
        success: true,
        url: uploadResult.url,
        cloudflareUrl: uploadResult.url,
        r2Url: uploadResult.url,
        fileName: fileName,
        size: buffer.byteLength || (buffer as Buffer).length,
        contentType: contentType
      };
    } catch (error) {
      console.error('❌ Error subiendo buffer a R2:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Sube un buffer de imagen a R2 (método privado)
   */
  private async uploadToR2(fileName: string, buffer: ArrayBuffer | Buffer, contentType: string): Promise<{ url: string }> {
    // Usar la API de R2 de Cloudflare
    const r2ApiUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/storage/buckets/${this.bucketName}/objects/${fileName}`;
    
    const response = await fetch(r2ApiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': contentType,
        'X-Content-Type': contentType
      },
      body: buffer
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error subiendo a R2: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    // Construir la URL pública de R2
    const publicUrl = `https://${this.accountId}.r2.cloudflarestorage.com/${this.bucketName}/${fileName}`;
    
    return { url: publicUrl };
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
   * Elimina una imagen de R2
   */
  async deleteImage(fileName: string): Promise<boolean> {
    try {
      const r2ApiUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/storage/buckets/${this.bucketName}/objects/${fileName}`;
      
      const response = await fetch(r2ApiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Error eliminando imagen de R2:', error);
      return false;
    }
  }
}
