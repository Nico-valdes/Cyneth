import { NextRequest, NextResponse } from 'next/server';

// Manejar OPTIONS para CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL de imagen requerida' },
        { status: 400 }
      );
    }

    // Validar que sea una URL válida
    if (!imageUrl.startsWith('http')) {
      return NextResponse.json(
        { error: 'URL inválida' },
        { status: 400 }
      );
    }

    // Descargar la imagen
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageProxy/1.0)',
        'Accept': 'image/*'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Error al cargar la imagen' },
        { status: response.status }
      );
    }

    // Obtener el contenido de la imagen
    const imageBuffer = await response.arrayBuffer();
    
    // Obtener el content-type de la respuesta original
    let contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Asegurar que el content-type sea válido para imágenes
    if (!contentType.startsWith('image/')) {
      // Intentar detectar el tipo de imagen por la URL
      const urlLower = imageUrl.toLowerCase();
      if (urlLower.includes('.png')) {
        contentType = 'image/png';
      } else if (urlLower.includes('.gif')) {
        contentType = 'image/gif';
      } else if (urlLower.includes('.webp')) {
        contentType = 'image/webp';
      } else {
        contentType = 'image/jpeg';
      }
    }

    // Devolver la imagen con headers correctos para mostrar en el navegador
    // CRÍTICO: Content-Disposition: inline permite mostrar la imagen en el navegador
    // en lugar de forzar la descarga
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline; filename="image"', // inline es clave para mostrar, no descargar
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Accept-Ranges': 'bytes',
      },
    });

  } catch (error) {
    console.error('Error en proxy de imagen:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

