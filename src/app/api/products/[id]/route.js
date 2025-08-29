import { connectToDatabase } from '@/libs/mongoConnect';
import ProductService from '@/services/ProductService';

// GET - Obtener producto por ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // Conectar a MongoDB
    const client = await connectToDatabase();
    const db = client.db('cyneth');
    
    // Crear instancia del servicio
    const productService = new ProductService(db);
    
    // Obtener producto
    const product = await productService.findById(id);
    
    if (!product) {
      return Response.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    
    return Response.json({
      success: true,
      data: product
    });
    
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar producto
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const updateData = await request.json();
    
    // Conectar a MongoDB
    const client = await connectToDatabase();
    const db = client.db('cyneth');
    
    // Crear instancia del servicio
    const productService = new ProductService(db);
    
    // Actualizar producto
    const success = await productService.update(id, updateData);
    
    if (!success) {
      return Response.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    
    return Response.json({
      success: true,
      message: 'Producto actualizado exitosamente'
    });
    
  } catch (error) {
    console.error('Error actualizando producto:', error);
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar producto (soft delete)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    // Conectar a MongoDB
    const client = await connectToDatabase();
    const db = client.db('cyneth');
    
    // Crear instancia del servicio
    const productService = new ProductService(db);
    
    // Eliminar producto
    const success = await productService.delete(id);
    
    if (!success) {
      return Response.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    
    return Response.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('Error eliminando producto:', error);
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
