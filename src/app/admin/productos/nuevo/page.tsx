'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X } from 'lucide-react';
import ProductFormHybrid from '../../../../components/ProductFormHybrid';

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
    <div className="min-h-screen bg-white">
      {/* Modern Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancel}
                className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-white/60 rounded-xl transition-all duration-200 backdrop-blur-sm"
              >
                <ArrowLeft size={22} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Nuevo Producto</h1>
                <p className="text-gray-600 mt-1">Agregar un nuevo producto al catálogo</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
              >
                <X size={16} className="mr-2 inline" />
                Cancelar
              </button>
              <button
                type="submit"
                form="product-form"
                disabled={isLoading}
                className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Save size={16} className="mr-2" />
                {isLoading ? 'Guardando...' : 'Guardar Producto'}
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
  );
}