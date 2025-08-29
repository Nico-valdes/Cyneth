import { ImageUploadResult } from '@/types/image';

export class SmartImageService {
  private accountId: string;
  private apiToken: string;
  private bucketName: string;

  constructor() {
    this.accountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID!;
    this.apiToken = process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN!;
    this.bucketName = process.env.NEXT_PUBLIC_R2_BUCKET_NAME || 'cyneth-images';
  }

  /**
   * Sube una imagen desde una URL externa usando estrategia híbrida inteligente
   */
  async uploadFromUrl(imageUrl: string): Promise<ImageUploadResult> {
    try {
      console.log('🔄 Iniciando subida inteligente desde:', imageUrl);

      // Descargar la imagen
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Error descargando imagen: ${response.status}`);
      }

      const imageBuffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      
      // Generar nombre único para la imagen
      const fileName = this.generateFileName(imageUrl, contentType);
      
      // Subir a R2 para almacenamiento principal (gratis)
      const r2Result = await this.uploadToR2(fileName, imageBuffer, contentType);
      
      // Subir a Cloudflare Images para optimización ($5)
      const imagesResult = await this.uploadToCloudflareImages(fileName, imageBuffer, contentType);
      
      console.log('✅ Imagen subida exitosamente con estrategia inteligente');
      console.log('  R2 URL (almacenamiento):', r2Result.url);
      console.log('  Images URL (optimización):', imagesResult.url);
      
      return {
        success: true,
        cloudflareUrl: imagesResult.url, // Usar Images como URL principal (optimizada)
        r2Url: r2Result.url, // Guardar R2 como backup
        fileName: fileName,
        size: imageBuffer.byteLength,
        contentType: contentType
      };

    } catch (error) {
      console.error('❌ Error en subida inteligente:', error);
      throw error;
    }
  }

  /**
   * Sube a R2 para almacenamiento principal (gratis)
   */
  private async uploadToR2(fileName: string, buffer: ArrayBuffer, contentType: string): Promise<{ url: string }> {
    const r2ApiUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/storage/buckets/${this.bucketName}/objects/${fileName}`;
    
    const response = await fetch(r2ApiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': contentType
      },
      body: buffer
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error subiendo a R2: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const publicUrl = `https://${this.accountId}.r2.cloudflarestorage.com/${this.bucketName}/${fileName}`;
    return { url: publicUrl };
  }

  /**
   * Sube a Cloudflare Images para optimización ($5)
   */
  private async uploadToCloudflareImages(fileName: string, buffer: ArrayBuffer, contentType: string): Promise<{ url: string }> {
    // Convertir buffer a base64 para la API de Images
    const base64 = Buffer.from(buffer).toString('base64');
    
    const imagesApiUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images/v1`;
    
    const response = await fetch(imagesApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        file: `data:${contentType};base64,${base64}`,
        metadata: {
          fileName: fileName,
          source: 'smart-upload'
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error subiendo a Images: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`Error en respuesta de Images: ${JSON.stringify(data)}`);
    }

    // Construir URL de Images con variantes
    const imageId = data.result.id;
    const imagesUrl = `https://imagedelivery.net/${this.accountId}/${imageId}/public`;
    
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
   * Elimina imagen de ambos servicios
   */
  async deleteImage(fileName: string, imageId?: string): Promise<boolean> {
    try {
      let success = true;

      // Eliminar de R2
      try {
        const r2ApiUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/storage/buckets/${this.bucketName}/objects/${fileName}`;
        const r2Response = await fetch(r2ApiUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
          }
        });
        if (!r2Response.ok) success = false;
      } catch (error) {
        console.error('Error eliminando de R2:', error);
        success = false;
      }

      // Eliminar de Images si tenemos el ID
      if (imageId) {
        try {
          const imagesApiUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images/v1/${imageId}`;
          const imagesResponse = await fetch(imagesApiUrl, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${this.apiToken}`
            }
          });
          if (!imagesResponse.ok) success = false;
        } catch (error) {
          console.error('Error eliminando de Images:', error);
          success = false;
        }
      }

      return success;
    } catch (error) {
      console.error('❌ Error eliminando imagen:', error);
      return false;
    }
  }
}
