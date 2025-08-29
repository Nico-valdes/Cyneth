import { connectToDatabase } from '@/libs/mongoConnect';
import SubcategoryService from '@/services/SubcategoryService';

// GET - Obtener subcategorías por categoría
export async function GET(request, { params }) {
  try {
    const { categoryId } = params;
    
    // Conectar a MongoDB
    const client = await connectToDatabase();
    const db = client.db('cyneth');
    
    // Crear instancia del servicio
    const subcategoryService = new SubcategoryService(db);
    
    // Obtener subcategorías por categoría
    const subcategories = await subcategoryService.getByCategory(categoryId);
    
    return Response.json({
      success: true,
      data: {
        category: categoryId,
        subcategories
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo subcategorías:', error);
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}