import { useState, useCallback } from 'react';
import { ImageUploadState, ImageUploadHookResult } from '@/types/image';

export const useImageUpload = () => {
  const [state, setState] = useState<ImageUploadState>({
    isUploading: false,
    error: null,
    success: false
  });

  const uploadImageFromUrl = useCallback(async (imageUrl: string): Promise<ImageUploadHookResult | null> => {
          console.log('Iniciando subida de imagen:', imageUrl);
    setState({
      isUploading: true,
      error: null,
      success: false
    });

    try {
      const response = await fetch('/api/images/upload-from-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl })
      });

      const data = await response.json();
              console.log('Respuesta de la API:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir la imagen');
      }

      if (data.success && data.cloudflareUrl) {
        console.log('Imagen subida exitosamente a Cloudflare:', data.cloudflareUrl);
        setState({
          isUploading: false,
          error: null,
          success: true
        });

        return {
          cloudflareUrl: data.cloudflareUrl,
          originalUrl: data.originalUrl
        };
      } else {
        throw new Error(data.error || 'Error desconocido');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error en uploadImageFromUrl:', error);
      
      setState({
        isUploading: false,
        error: errorMessage,
        success: false
      });

      return null;
    }
  });

  const resetState = useCallback(() => {
    setState({
      isUploading: false,
      error: null,
      success: false
    });
  });

  return {
    ...state,
    uploadImageFromUrl,
    resetState
  };
};
