// Tipos para Cloudinary API
export interface CloudinaryImageResult {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}

export interface CloudinaryUploadResponse {
  success: boolean;
  result: CloudinaryImageResult;
  error?: string;
}

// Tipos para el servicio de imágenes
export interface ImageUploadResult {
  success: boolean;
  cloudinaryUrl?: string; // URL de Cloudinary (optimizada)
  originalUrl?: string; // URL original
  fileName?: string;
  size?: number;
  contentType?: string;
  publicId?: string;
  error?: string;
}

// Tipos para el hook de subida
export interface ImageUploadState {
  isUploading: boolean;
  error: string | null;
  success: boolean;
}

export interface ImageUploadHookResult {
  cloudinaryUrl: string;
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
  cloudinaryUrl: string | null;
  isUploading: boolean;
  error: string | null;
  success: boolean;
  previewUrl: string;
}
