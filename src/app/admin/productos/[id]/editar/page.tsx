'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, X, Loader2 } from 'lucide-react';
import ProductFormHybrid from '../../../../../components/ProductFormHybrid';

export default function EditarProducto() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingProduct(true);
        
        // Cargar producto, categorías y marcas en paralelo
        const [productRes, categoriesRes, brandsRes] = await Promise.all([
          fetch(`/api/products/${params.id}`),
          fetch('/api/categories'),
          fetch('/api/brands')
        ]);
        
        if (!productRes.ok) {
          throw new Error('Producto no encontrado');
        }
        
        const productData = await productRes.json();
        setProduct(productData.data);
        
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          console.log('Categories API response:', categoriesData);
          setCategories(categoriesData.data?.categories || []);
        }
        
        if (brandsRes.ok) {
          const brandsData = await brandsRes.json();
          console.log('Brands API response:', brandsData);
          setBrands(brandsData.data?.brands || brandsData.data || []);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setIsLoadingProduct(false);
      }
    };

    if (params.id) {
      loadData();
    }
  }, [params.id]);

  const handleSave = async (productData: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        router.push('/admin?tab=products');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'No se pudo actualizar el producto'}`);
      }
    } catch (error) {
      console.error('Error actualizando producto:', error);
      alert('Error actualizando el producto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin?tab=products');
  };

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Volver al listado
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancel}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Volver al listado
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">
                Editar Producto: {product?.name}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <X size={16} className="mr-2 inline" />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            {product && (
              <ProductFormHybrid
                product={product}
                categories={categories}
                brands={brands}
                onSave={handleSave}
                onCancel={handleCancel}
                isLoading={isLoading}
                isEditing={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}