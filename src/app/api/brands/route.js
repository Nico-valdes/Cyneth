import { connectToDatabase } from '@/libs/mongoConnect';
import BrandService from '@/services/BrandService';

// GET - Obtener todas las marcas
export async function GET(request) {
  try {
    // Conectar a MongoDB
    const client = await connectToDatabase();
    const db = client.db('cyneth');
    
    // Crear instancia del servicio
    const brandService = new BrandService(db);
    
    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const sync = searchParams.get('sync');
    
    let data = {};
    
    // Si se solicita sincronización, ejecutarla primero
    if (sync === 'true') {
      await brandService.syncFromProducts();
    }
    
    if (categorySlug) {
      // Obtener marcas de una categoría específica
      const brands = await brandService.getByCategory(categorySlug);
      data = { brands };
    } else {
      // Obtener todas las marcas
      const brands = await brandService.getAll();
      data = { brands };
    }
    
    return Response.json({
      success: true,
      data
    });
    
  } catch (error) {
    console.error('Error en API de marcas:', error);
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}



// PUT - Actualizar marca
export async function PUT(request) {
  try {
    // Conectar a MongoDB
    const client = await connectToDatabase();
    const db = client.db('cyneth');
    
    // Crear instancia del servicio
    const brandService = new BrandService(db);
    
    // Obtener datos del body
    const { id, ...updateData } = await request.json();
    
    // Validar ID
    if (!id) {
      return Response.json(
        { success: false, error: 'ID de marca es requerido' },
        { status: 400 }
      );
    }
    
    // Actualizar marca
    const success = await brandService.update(id, updateData);
    
    if (!success) {
      return Response.json(
        { success: false, error: 'Marca no encontrada' },
        { status: 404 }
      );
    }
    
    return Response.json({
      success: true,
      message: 'Marca actualizada exitosamente'
    });
    
  } catch (error) {
    console.error('Error actualizando marca:', error);
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar marca
export async function DELETE(request) {
  try {
    // Conectar a MongoDB
    const client = await connectToDatabase();
    const db = client.db('cyneth');
    
    // Crear instancia del servicio
    const brandService = new BrandService(db);
    
    // Obtener ID del body
    const { id } = await request.json();
    
    // Validar ID
    if (!id) {
      return Response.json(
        { success: false, error: 'ID de marca es requerido' },
        { status: 400 }
      );
    }
    
    // Eliminar marca
    const success = await brandService.delete(id);
    
    if (!success) {
      return Response.json(
        { success: false, error: 'Marca no encontrada' },
        { status: 404 }
      );
    }
    
    return Response.json({
      success: true,
      message: 'Marca eliminada exitosamente'
    });
    
  } catch (error) {
    console.error('Error eliminando marca:', error);
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva marca
export async function POST(request) {
  try {
    // Conectar a MongoDB
    const client = await connectToDatabase();
    const db = client.db('cyneth');
    
    // Crear instancia del servicio
    const brandService = new BrandService(db);
    
    // Obtener datos del body
    const brandData = await request.json();
    
    // Validar datos requeridos
    if (!brandData.name) {
      return Response.json(
        { success: false, error: 'Nombre de marca es requerido' },
        { status: 400 }
      );
    }
    
    // Crear marca
    const newBrand = await brandService.create(brandData);
    
    return Response.json({
      success: true,
      data: newBrand,
      message: 'Marca creada exitosamente'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creando marca:', error);
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
