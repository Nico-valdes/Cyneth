// Tipos para Cloudflare Images API
export interface CloudflareImageResult {
  id: string;
  filename: string;
  uploaded: string;
  requireSignedURLs: boolean;
  variants: string[];
}

export interface CloudflareUploadResponse {
  success: boolean;
  result: CloudflareImageResult;
  errors: any[];
  messages: any[];
}

// Tipos para el servicio de imágenes
export interface ImageUploadResult {
  success: boolean;
  cloudflareUrl?: string; // URL de Cloudflare Images (optimizada)
  r2Url?: string; // URL de R2 (backup)
  fileName?: string;
  size?: number;
  contentType?: string;
  error?: string;
}

// Tipos para el hook de subida
export interface ImageUploadState {
  isUploading: boolean;
  error: string | null;
  success: boolean;
}

export interface ImageUploadHookResult {
  cloudflareUrl: string;
  originalUrl: string;
}

// Tipos para el componente de campo de imagen
export interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  className?: string;
  showPreview?: boolean;
}

// Tipos para validación de URLs
export interface ImageUrlValidation {
  isValid: boolean;
  protocol: string;
  extension: string;
  domain: string;
}

// Tipos para el estado de la imagen
export interface ImageState {
  originalUrl: string;
  cloudflareUrl: string | null;
  isUploading: boolean;
  error: string | null;
  success: boolean;
  previewUrl: string;
}
