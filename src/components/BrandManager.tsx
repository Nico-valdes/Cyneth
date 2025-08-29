'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Tag } from 'lucide-react';

interface Brand {
  _id: string;
  name: string;
  slug: string;
  productCount: number;
  active: boolean;
}

interface BrandManagerProps {}

const BrandManager: React.FC<BrandManagerProps> = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newBrand, setNewBrand] = useState({ name: '' });
  const [editingBrand, setEditingBrand] = useState({ name: '' });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands');
      if (response.ok) {
        const data = await response.json();
        setBrands(data.data?.brands || []);
      }
    } catch (error) {
      console.error('Error cargando marcas:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBrand = async () => {
    if (!newBrand.name.trim()) return;

    try {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newBrand.name.trim() }),
      });

      if (response.ok) {
        setNewBrand({ name: '' });
        fetchBrands();
      } else {
        console.error('Error creando marca');
      }
    } catch (error) {
      console.error('Error creando marca:', error);
    }
  };

  const updateBrand = async (id: string) => {
    if (!editingBrand.name.trim()) return;

    try {
      const response = await fetch('/api/brands', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id, 
          name: editingBrand.name.trim() 
        }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditingBrand({ name: '' });
        fetchBrands();
      } else {
        console.error('Error actualizando marca');
      }
    } catch (error) {
      console.error('Error actualizando marca:', error);
    }
  };

  const deleteBrand = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta marca?')) return;

    try {
      const response = await fetch('/api/brands', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        fetchBrands();
      } else {
        console.error('Error eliminando marca');
      }
    } catch (error) {
      console.error('Error eliminando marca:', error);
    }
  };

  const startEditing = (brand: Brand) => {
    setEditingId(brand._id);
    setEditingBrand({ name: brand.name });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingBrand({ name: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando marcas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Gestión de Marcas</h2>
      </div>

      <div className="p-6">
        {/* Agregar nueva marca */}
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Nueva Marca</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newBrand.name}
              onChange={(e) => setNewBrand({ name: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && createBrand()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
              placeholder="Nombre de la marca"
            />
            <button
              onClick={createBrand}
              disabled={!newBrand.name.trim()}
              className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
            >
              Agregar
            </button>
          </div>
        </div>

        {/* Lista de marcas */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Marcas ({brands.length})</h3>
          <div className="space-y-1">
            {brands.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No hay marcas registradas</p>
              </div>
            ) : (
              brands.map((brand) => (
                <div key={brand._id} className="border border-gray-200 p-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {editingId === brand._id ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={editingBrand.name}
                            onChange={(e) => setEditingBrand({ name: e.target.value })}
                            onKeyPress={(e) => e.key === 'Enter' && updateBrand(brand._id)}
                            className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                          />
                          <button
                            onClick={() => updateBrand(brand._id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <Save size={14} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{brand.name}</h4>
                          <p className="text-xs text-gray-500">
                            {brand.productCount || 0} productos
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {editingId !== brand._id && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEditing(brand)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => deleteBrand(brand._id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandManager;