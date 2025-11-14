import { NextRequest, NextResponse } from 'next/server';
import { CloudinaryImageService } from '@/services/CloudinaryImageService';

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

    // Subir imagen usando Cloudinary
    const cloudinaryService = new CloudinaryImageService();
    const result = await cloudinaryService.downloadAndUpload(imageUrl, 'uploaded-image');

    if (result.success && result.cloudinaryUrl) {
      return NextResponse.json({
        success: true,
        cloudinaryUrl: result.cloudinaryUrl,
        originalUrl: imageUrl,
        message: 'Imagen subida exitosamente a Cloudinary'
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
