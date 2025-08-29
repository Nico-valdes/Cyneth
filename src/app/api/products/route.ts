import { connectToDatabase } from '@/libs/mongoConnect';
import ProductService from '@/services/ProductService';

// GET - Obtener productos
export async function GET(request: Request) {
  try {
    // Conectar a MongoDB
    const client = await connectToDatabase();
    const db = client.db('cyneth'); // Usar tu base de datos
    
    // Crear instancia del servicio
    const productService = new ProductService(db);
    
    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const subcategory = searchParams.get('subcategory') || undefined;
    const brand = searchParams.get('brand') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const showAll = searchParams.get('showAll') === 'true'; // Parámetro temporal para debug
    const active = searchParams.get('active') !== 'false'; // Por defecto true
    
    // Construir filtros
    const filters: any = {};
    if (category) filters.category = category;
    if (subcategory) filters.subcategory = subcategory;
    if (brand) filters.brand = brand;
    if (search) filters.search = search;
    if (showAll) filters.showAll = true; // Pasar el parámetro al servicio
    if (!active) filters.showAll = true; // Si active es false, mostrar todos
    
    // Opciones de consulta
    const options = {
      limit,
      skip,
      sort: { createdAt: -1 }
    };
    
    // Obtener productos (OPTIMIZADO)
    const products = await productService.findWithCategories(filters, options);
    
    // Contar total de productos para paginación
    const total = await productService.count(filters);
    
    return Response.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Error en API de productos:', error);
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo producto
export async function POST(request: Request) {
  try {
    // Conectar a MongoDB
    const client = await connectToDatabase();
    const db = client.db('cyneth');
    
    // Crear instancia del servicio
    const productService = new ProductService(db);
    
    // Obtener datos del body
    const productData = await request.json();
    
    // Validar datos requeridos
    if (!productData.name || !productData.category) {
      return Response.json(
        { success: false, error: 'Nombre y categoría son requeridos' },
        { status: 400 }
      );
    }
    
    // Crear producto
    const newProduct = await productService.create(productData);
    
    return Response.json({
      success: true,
      data: newProduct,
      message: 'Producto creado exitosamente'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creando producto:', error);
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
