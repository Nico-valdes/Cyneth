'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X } from 'lucide-react';
import ProductFormHybrid from '../../../../components/ProductFormHybrid';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function NuevoProducto() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    // Cargar categorías y marcas
    const loadData = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/brands')
        ]);
        
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
      }
    };

    loadData();
  }, []);

  const handleSave = async (productData: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        router.push('/admin?tab=products');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'No se pudo crear el producto'}`);
      }
    } catch (error) {
      console.error('Error creando producto:', error);
      alert('Error creando el producto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin?tab=products');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancel}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-500">Nuevo producto</span>
                </div>
                <h1 className="text-lg font-semibold text-gray-900">Crear Producto</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="product-form"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-all shadow-sm"
              >
                <Save size={16} className="mr-1.5 inline" />
                {isLoading ? 'Guardando...' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Content Area */}
      <div className="max-w-5xl mx-auto py-8 px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8">
            <ProductFormHybrid
              product={null}
              categories={categories}
              brands={brands}
              onSave={handleSave}
              onCancel={handleCancel}
              isLoading={isLoading}
              isEditing={false}
            />
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}