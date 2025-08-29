import { ImageUploadResult } from '@/types/image';
import { ImagePresets, getTransformedImageUrl, isCloudflareImagesUrl } from './imageTransformations';

/**
 * Obtiene la URL de la imagen principal de un producto
 */
export function getMainImage(product: any): string | null {
  if (product.images && product.images.length > 0) {
    return product.images[0];
  }
  return product.image || null;
}

/**
 * Obtiene la URL de imagen optimizada para diferentes contextos
 * Usa las transformaciones nativas de Cloudflare Images
 */
export function getOptimizedImageUrl(url: string, width?: number, height?: number): string {
  if (!url) return '';
  
  // Si es una URL de Cloudflare Images, aplicar transformaciones
  if (isCloudflareImagesUrl(url)) {
    return getTransformedImageUrl(url, {
      width,
      height,
      fit: 'cover',
      format: 'auto',
      quality: 85
    });
  }
  
  // Para otras URLs, devolver la original
  return url;
}

/**
 * Obtiene múltiples URLs optimizadas para diferentes tamaños
 */
export function getResponsiveImageUrls(baseUrl: string): {
  tiny: string;
  small: string;
  thumbnail: string;
  list: string;
  detail: string;
  full: string;
} {
  return {
    tiny: ImagePresets.tiny(baseUrl),
    small: ImagePresets.small(baseUrl),
    thumbnail: ImagePresets.thumbnail(baseUrl),
    list: ImagePresets.list(baseUrl),
    detail: ImagePresets.detail(baseUrl),
    full: ImagePresets.full(baseUrl)
  };
}
