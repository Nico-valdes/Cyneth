/**
 * Utilidades para transformaciones de imágenes de Cloudflare Images
 */

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'scale-down' | 'crop';
  format?: 'auto' | 'jpg' | 'png' | 'webp';
  quality?: number;
}

/**
 * Genera una URL transformada de Cloudflare Images
 */
export function getTransformedImageUrl(baseUrl: string, options: ImageTransformOptions = {}): string {
  if (!baseUrl || !isCloudflareImagesUrl(baseUrl)) {
    return baseUrl;
  }

  const url = new URL(baseUrl);
  const params = url.searchParams;

  // Aplicar transformaciones
  if (options.width) params.set('w', options.width.toString());
  if (options.height) params.set('h', options.height.toString());
  if (options.fit) params.set('fit', options.fit);
  if (options.format) params.set('f', options.format);
  if (options.quality) params.set('q', options.quality.toString());

  return url.toString();
}

/**
 * Presets predefinidos para diferentes contextos
 */
export const ImagePresets = {
  // Thumbnail muy pequeño (50x50)
  tiny: (baseUrl: string) => getTransformedImageUrl(baseUrl, { 
    width: 50, 
    height: 50, 
    fit: 'cover', 
    format: 'auto', 
    quality: 80 
  }),

  // Thumbnail pequeño (100x100)
  small: (baseUrl: string) => getTransformedImageUrl(baseUrl, { 
    width: 100, 
    height: 100, 
    fit: 'cover', 
    format: 'auto', 
    quality: 80 
  }),

  // Thumbnail estándar (150x150)
  thumbnail: (baseUrl: string) => getTransformedImageUrl(baseUrl, { 
    width: 150, 
    height: 150, 
    fit: 'cover', 
    format: 'auto', 
    quality: 80 
  }),

  // Lista de productos (300x200)
  list: (baseUrl: string) => getTransformedImageUrl(baseUrl, { 
    width: 300, 
    height: 200, 
    fit: 'cover', 
    format: 'auto', 
    quality: 85 
  }),

  // Vista detallada (800x600)
  detail: (baseUrl: string) => getTransformedImageUrl(baseUrl, { 
    width: 800, 
    height: 600, 
    fit: 'contain', 
    format: 'auto', 
    quality: 90 
  }),

  // Vista completa (1200x800)
  full: (baseUrl: string) => getTransformedImageUrl(baseUrl, { 
    width: 1200, 
    height: 800, 
    fit: 'contain', 
    format: 'auto', 
    quality: 95 
  })
};

/**
 * Genera srcset para imágenes responsivas
 */
export function getResponsiveSrcSet(baseUrl: string): string {
  if (!isCloudflareImagesUrl(baseUrl)) return '';

  const sizes = [
    { width: 50, height: 50, quality: 80 },
    { width: 100, height: 100, quality: 80 },
    { width: 150, height: 150, quality: 80 },
    { width: 300, height: 200, quality: 85 },
    { width: 800, height: 600, quality: 90 }
  ];

  return sizes
    .map(size => {
      const url = getTransformedImageUrl(baseUrl, {
        width: size.width,
        height: size.height,
        fit: 'cover',
        format: 'auto',
        quality: size.quality
      });
      return `${url} ${size.width}w`;
    })
    .join(', ');
}

/**
 * Genera sizes para CSS responsivo
 */
export function getResponsiveSizes(): string {
  return '(max-width: 640px) 50px, (max-width: 768px) 100px, (max-width: 1024px) 150px, (max-width: 1280px) 300px, 800px';
}

/**
 * Verifica si una URL es de Cloudflare Images
 */
export function isCloudflareImagesUrl(url: string): boolean {
  return Boolean(url && url.includes('imagedelivery.net'));
}

/**
 * Extrae el ID de la imagen de una URL de Cloudflare
 */
export function getImageIdFromUrl(url: string): string | null {
  if (!isCloudflareImagesUrl(url)) return null;
  
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    return pathParts[pathParts.length - 2] || null;
  } catch {
    return null;
  }
}
