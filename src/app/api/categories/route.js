import { connectToDatabase } from '@/libs/mongoConnect';
import CategoryService from '@/services/CategoryService';

// GET - Obtener categorías y subcategorías
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
    const type = searchParams.get('type');
    const hierarchical = searchParams.get('hierarchical');
    const sync = searchParams.get('sync');
    
    let data = {};
    
    // Si se solicita sincronización, ejecutarla primero
    if (sync === 'true') {
      await categoryService.syncFromProducts();
    }
    
    if (categorySlug) {
      // Obtener subcategorías jerárquicas de una categoría específica
      const hierarchicalTree = await categoryService.getHierarchicalTree(categorySlug);
      const category = await categoryService.getBySlug(categorySlug);
      data = { 
        category: category ? category.name : categorySlug, 
        subcategories: hierarchicalTree,
        categoryInfo: category
      };
    } else if (type === 'main' && hierarchical === 'true') {
      // Obtener categorías principales con jerarquía completa
      const mainCategories = await categoryService.getMainCategories();
      const categoriesWithHierarchy = [];
      
      for (const category of mainCategories) {
        const hierarchicalTree = await categoryService.getHierarchicalTree(category.slug);
        categoriesWithHierarchy.push({
          ...category,
          children: hierarchicalTree
        });
      }
      
      data = { categories: categoriesWithHierarchy };
    } else if (type === 'main') {
      // Solo categorías principales
      const categories = await categoryService.getMainCategories();
      data = { categories };
    } else {
      // Obtener todas las categorías
      const categories = await categoryService.getAll();
      data = { categories };
    }
    
    return Response.json({
      success: true,
      data
    });
    
  } catch (error) {
    console.error('Error en API de categorías:', error);
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva categoría
export async function POST(request) {
  try {
    // Conectar a MongoDB
    const client = await connectToDatabase();
    const db = client.db('cyneth');
    
    // Crear instancia del servicio
    const categoryService = new CategoryService(db);
    
    // Obtener datos del body
    const categoryData = await request.json();
    
    // Validar datos requeridos
    if (!categoryData.name) {
      return Response.json(
        { success: false, error: 'Nombre de categoría es requerido' },
        { status: 400 }
      );
    }
    
    // Crear categoría
    const newCategory = await categoryService.create(categoryData);
    
    return Response.json({
      success: true,
      data: newCategory,
      message: 'Categoría creada exitosamente'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creando categoría:', error);
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar categoría
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
    
    // Actualizar categoría
    const success = await categoryService.update(id, updateData);
    
    if (!success) {
      return Response.json(
        { success: false, error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }
    
    return Response.json({
      success: true,
      message: 'Categoría actualizada exitosamente'
    });
    
  } catch (error) {
    console.error('Error actualizando categoría:', error);
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar categoría
export async function DELETE(request) {
  try {
    // Conectar a MongoDB
    const client = await connectToDatabase();
    const db = client.db('cyneth');
    
    // Crear instancia del servicio
    const categoryService = new CategoryService(db);
    
    // Obtener ID del query parameter
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Validar ID
    if (!id) {
      return Response.json(
        { success: false, error: 'ID de categoría es requerido' },
        { status: 400 }
      );
    }
    
    // Eliminar categoría
    const success = await categoryService.delete(id);
    
    if (!success) {
      return Response.json(
        { success: false, error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }
    
    return Response.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
    
  } catch (error) {
    console.error('Error eliminando categoría:', error);
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
