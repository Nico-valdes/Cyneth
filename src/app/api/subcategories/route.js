import { connectToDatabase } from '@/libs/mongoConnect';
import CategoryService from '@/services/CategoryService';

// GET - Obtener todas las subcategorías (ahora categorías de nivel > 0)
export async function GET(request) {
  try {
    // Conectar a MongoDB
    const client = await connectToDatabase();
    const db = client.db('cyneth');
    
    // Crear instancia del servicio
    const categoryService = new CategoryService(db);
    
    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const sync = searchParams.get('sync');
    const hierarchical = searchParams.get('hierarchical');
    
    let data = {};
    
    // Si se solicita sincronización, ejecutarla primero
    if (sync === 'true') {
      await categoryService.updateProductCounts();
    }
    
    if (categorySlug) {
      // Obtener subcategorías de una categoría específica
      if (hierarchical === 'true') {
        const subcategories = await categoryService.getHierarchicalTree(categorySlug);
        data = { subcategories, hierarchical: true };
      } else {
        const parent = await categoryService.getBySlug(categorySlug);
        if (parent) {
          const subcategories = await categoryService.getDirectChildren(parent._id);
          data = { subcategories };
        } else {
          data = { subcategories: [] };
        }
      }
    } else {
      // Obtener todas las subcategorías (categorías con level > 0)
      const allCategories = await categoryService.getAll();
      const subcategories = allCategories.filter(cat => cat.level > 0);
      data = { subcategories };
    }
    
    return Response.json({
      success: true,
      data
    });
    
  } catch (error) {
    console.error('Error en API de subcategorías:', error);
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

  // POST - Crear nueva subcategoría
export async function POST(request) {
  try {
    // Conectar a MongoDB
    const client = await connectToDatabase();
    const db = client.db('cyneth');
    
    // Crear instancia del servicio
    const categoryService = new CategoryService(db);
    
    // Obtener datos del body
    const subcategoryData = await request.json();
    
    // Log para debugging
    console.log('📝 Datos recibidos para crear subcategoría:', {
      name: subcategoryData.name,
      category: subcategoryData.category,
      parent: subcategoryData.parent,
      parentType: typeof subcategoryData.parent
    });
    
    // Validar datos requeridos
    if (!subcategoryData.name) {
      return Response.json(
        { success: false, error: 'Nombre es requerido' },
        { status: 400 }
      );
    }
    
    // Validar que el padre existe si se especifica
    if (subcategoryData.parent) {
      const parentExists = await categoryService.getById(subcategoryData.parent);
      if (!parentExists) {
        return Response.json(
          { success: false, error: 'La categoría padre especificada no existe' },
          { status: 400 }
        );
      }
    }
    
    // Crear subcategoría (ahora es una categoría con level > 0)
    const newSubcategory = await categoryService.create(subcategoryData);
    
    return Response.json({
      success: true,
      data: newSubcategory,
      message: 'Subcategoría creada exitosamente'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creando subcategoría:', error);
    
    // Manejar errores específicos de validación
    if (error.message.includes('No se puede crear una subcategoría más allá del nivel 4')) {
      return Response.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    if (error.message.includes('No se puede crear un ciclo en la jerarquía')) {
      return Response.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar subcategoría
export async function PUT(request) {
  try {
    // Conectar a MongoDB
    const client = await connectToDatabase();
    const db = client.db('cyneth');
    
    // Crear instancia del servicio
    const categoryService = new CategoryService(db);
    
    // Obtener datos del body
    const { id, ...updateData } = await request.json();
    
    // Validar ID
    if (!id) {
      return Response.json(
        { success: false, error: 'ID de categoría es requerido' },
        { status: 400 }
      );
    }
    
    // Validar que el nuevo padre existe si se especifica
    if (updateData.parent) {
      const parentExists = await categoryService.getById(updateData.parent);
      if (!parentExists) {
        return Response.json(
          { success: false, error: 'La categoría padre especificada no existe' },
          { status: 400 }
        );
      }
    }
    
    // Actualizar subcategoría
    const success = await categoryService.update(id, updateData);
    
    if (!success) {
      return Response.json(
        { success: false, error: 'Subcategoría no encontrada' },
        { status: 404 }
      );
    }
    
    return Response.json({
      success: true,
      message: 'Subcategoría actualizada exitosamente'
    });
    
  } catch (error) {
    console.error('Error actualizando subcategoría:', error);
    
    // Manejar errores específicos de validación
    if (error.message.includes('No se puede mover la subcategoría más allá del nivel 4')) {
      return Response.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    if (error.message.includes('No se puede crear un ciclo en la jerarquía')) {
      return Response.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar subcategoría
export async function DELETE(request) {
  try {
    // Conectar a MongoDB
    const client = await connectToDatabase();
    const db = client.db('cyneth');
    
    // Crear instancia del servicio
    const categoryService = new CategoryService(db);
    
    // Obtener datos del body
    const { id } = await request.json();
    
    // Validar ID
    if (!id) {
      return Response.json(
        { success: false, error: 'ID de categoría es requerido' },
        { status: 400 }
      );
    }
    
    // Eliminar subcategoría
    const success = await categoryService.delete(id);
    
    if (!success) {
      return Response.json(
        { success: false, error: 'Subcategoría no encontrada' },
        { status: 404 }
      );
    }
    
    return Response.json({
      success: true,
      message: 'Subcategoría eliminada exitosamente'
    });
    
  } catch (error) {
    console.error('Error eliminando subcategoría:', error);
    
    // Manejar errores específicos de validación
    if (error.message.includes('No se puede eliminar una categoría que tiene subcategorías')) {
      return Response.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}