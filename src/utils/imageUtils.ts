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
 * Agrega transformaciones de Cloudinary a una URL
 * Solo si es una URL de Cloudinary
 * Formato: https://res.cloudinary.com/cloud_name/image/upload/w_400,h_400,c_fill/image_id
 */
export function addCloudinaryTransform(url: string, width?: number, height?: number, fit: 'fill' | 'fit' | 'scale' = 'fill'): string {
  if (!url || !isCloudinaryUrl(url)) {
    return url;
  }
  
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(p => p); // Filtrar strings vacíos
    
    // Buscar el índice de 'upload'
    const uploadIndex = pathParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      return url; // No se encontró 'upload', devolver original
    }
    
    // Construir la transformación
    const transforms: string[] = [];
    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    transforms.push(`c_${fit}`);
    
    const transformString = transforms.join(',');
    
    // Verificar si ya hay transformaciones después de 'upload'
    // Si el siguiente elemento después de 'upload' no parece ser un nombre de archivo, puede ser una transformación existente
    const nextAfterUpload = pathParts[uploadIndex + 1];
    const hasExistingTransform = nextAfterUpload && (
      nextAfterUpload.includes('w_') || 
      nextAfterUpload.includes('h_') || 
      nextAfterUpload.includes('c_')
    );
    
    if (hasExistingTransform) {
      // Reemplazar la transformación existente
      pathParts[uploadIndex + 1] = transformString;
    } else {
      // Insertar nueva transformación después de 'upload'
      pathParts.splice(uploadIndex + 1, 0, transformString);
    }
    
    urlObj.pathname = '/' + pathParts.join('/');
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Obtiene la URL de imagen optimizada para diferentes contextos
 * Cloudinary ya optimiza las imágenes, pero podemos agregar transformaciones de tamaño
 * Solo URLs externas (no Cloudinary) pasan por el proxy
 */
export function getOptimizedImageUrl(url: string, width?: number, height?: number): string {
  if (!url) return '';
  
  // Si es Cloudinary y se especifican dimensiones, agregar transformación
  if (isCloudinaryUrl(url) && (width || height)) {
    return addCloudinaryTransform(url, width, height);
  }
  
  // Si es una URL externa, usar el proxy para evitar descargas forzadas
  if (isExternalUrl(url)) {
    return getProxiedImageUrl(url);
  }
  
  // Para otras URLs, devolver la original
  return url;
}

/**
 * Verifica si una URL es externa (no del mismo dominio)
 */
function isExternalUrl(url: string): boolean {
  try {
    // Si no es una URL completa, no es externa
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return false;
    }
    
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Dominios permitidos que NO necesitan proxy (servicios de imágenes confiables)
    const allowedDomains = [
      'res.cloudinary.com',
      'imagedelivery.net',
      'cloudinary.com',
      'localhost',
      '127.0.0.1',
    ];
    
    // Verificar si es un dominio permitido
    const isAllowedDomain = allowedDomains.some(domain => hostname.includes(domain));
    
    // Si es un dominio permitido, no es externa (no necesita proxy)
    if (isAllowedDomain) {
      return false;
    }
    
    // Verificar si es del mismo dominio de la aplicación (en runtime)
    if (typeof window !== 'undefined') {
      const currentHost = window.location.hostname.toLowerCase();
      if (hostname === currentHost || hostname.endsWith('.' + currentHost)) {
        return false;
      }
    }
    
    // Todas las demás URLs son externas y necesitan proxy
    return true;
  } catch {
    // Si no se puede parsear como URL, no es externa
    return false;
  }
}

/**
 * Genera la URL del proxy de imágenes
 */
function getProxiedImageUrl(originalUrl: string): string {
  const encodedUrl = encodeURIComponent(originalUrl);
  return `/api/proxy-image?url=${encodedUrl}`;
}

/**
 * Verifica si una URL es del proxy de imágenes
 */
export function isProxiedImageUrl(url: string): boolean {
  if (!url) return false;
  return url.includes('/api/proxy-image');
}

/**
 * Verifica si una URL es de Cloudinary
 */
export function isCloudinaryUrl(url: string): boolean {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    return hostname.includes('cloudinary.com') || hostname.includes('res.cloudinary.com');
  } catch {
    return false;
  }
}

/**
 * Verifica si una URL necesita usar el componente Image de Next.js
 * Cloudinary ya optimiza las imágenes, así que no necesitan optimización adicional
 */
export function shouldUseNextImage(url: string): boolean {
  if (!url) return false;
  
  // Cloudinary ya optimiza, no usar Next.js Image
  if (isCloudinaryUrl(url)) return false;
  
  // URLs del proxy tampoco necesitan optimización de Next.js (ya están optimizadas)
  if (isProxiedImageUrl(url)) return false;
  
  // URLs locales o relativas pueden usar Next.js Image
  if (url.startsWith('/')) return true;
  
  // Para otras URLs externas, usar Next.js Image solo si no pasan por proxy
  return !isExternalUrl(url);
}

