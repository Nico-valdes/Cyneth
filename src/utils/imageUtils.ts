import { ImageUploadResult } from '@/types/image';
import { ImagePresets, getTransformedImageUrl, isCloudflareImagesUrl } from './imageTransformations';

/**
 * Obtiene la URL de la imagen principal de un producto
 * Si no hay imagen default, usa la primera imagen de color disponible
 */
export function getMainImage(product: any): string | null {
  // Primero, verificar si hay una imagen por defecto
  if (product.defaultImage && product.defaultImage.trim() !== '') {
    return product.defaultImage;
  }
  
  // Si no hay imagen por defecto pero hay variantes de color, usar la primera imagen disponible
  if (product.colorVariants && product.colorVariants.length > 0) {
    // Buscar la primera variante activa con imagen
    const activeVariantWithImage = product.colorVariants.find((variant: any) => 
      variant.active && variant.image
    );
    if (activeVariantWithImage) {
      return activeVariantWithImage.image;
    }
    
    // Si no hay variantes activas con imagen, usar la primera variante con imagen
    const firstVariantWithImage = product.colorVariants.find((variant: any) => variant.image);
    if (firstVariantWithImage) {
      return firstVariantWithImage.image;
    }
  }
  
  // Fallback para compatibilidad con productos antiguos
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
