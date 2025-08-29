import { NextRequest, NextResponse } from 'next/server';
import { OptimizedImageService } from '@/services/OptimizedImageService';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL de imagen es requerida' },
        { status: 400 }
      );
    }

    // Validar que la URL sea válida
    if (!imageUrl.startsWith('http')) {
      return NextResponse.json(
        { error: 'URL de imagen no válida' },
        { status: 400 }
      );
    }

    // Subir imagen usando Cloudflare Images optimizado
    const optimizedImageService = new OptimizedImageService();
    const result = await optimizedImageService.uploadFromUrl(imageUrl);

    if (result.success && result.cloudflareUrl) {
      return NextResponse.json({
        success: true,
        cloudflareUrl: result.cloudflareUrl,
        originalUrl: imageUrl,
        message: 'Imagen subida exitosamente a Cloudflare'
      });
    } else {
      return NextResponse.json(
        { 
          error: result.error || 'Error al subir la imagen',
          success: false 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error en upload-from-url API:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        success: false 
      },
      { status: 500 }
    );
  }
}
