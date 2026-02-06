'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Tag, CheckCircle, AlertCircle } from 'lucide-react';
import Notice from '@/components/ui/Notice';

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
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [resultModal, setResultModal] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
      setNotice({ type: 'error', message: 'No se pudieron cargar las marcas. Reintentá más tarde.' });
    } finally {
      setLoading(false);
    }
  };

  const createBrand = async () => {
    if (!newBrand.name.trim()) {
      setNotice({ type: 'warning', message: 'El nombre de la marca es obligatorio.' });
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newBrand.name.trim() }),
      });

      if (response.ok) {
        setNewBrand({ name: '' });
        setNotice({ type: 'success', message: 'Marca creada correctamente.' });
        fetchBrands();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setNotice({ type: 'error', message: errorData.error || 'Error creando marca.' });
      }
    } catch (error) {
      console.error('Error creando marca:', error);
      setNotice({ type: 'error', message: 'Error creando marca.' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateBrand = async (id: string) => {
    if (!editingBrand.name.trim()) {
      setNotice({ type: 'warning', message: 'El nombre de la marca es obligatorio.' });
      return;
    }

    try {
      setIsSaving(true);
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
        setNotice({ type: 'success', message: 'Marca actualizada correctamente.' });
        fetchBrands();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setNotice({ type: 'error', message: errorData.error || 'Error actualizando marca.' });
      }
    } catch (error) {
      console.error('Error actualizando marca:', error);
      setNotice({ type: 'error', message: 'Error actualizando marca.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (brand: Brand) => {
    setBrandToDelete(brand);
    setShowDeleteModal(true);
  };

  const deleteBrand = async () => {
    if (!brandToDelete) return;
    try {
      setIsDeleting(true);
      const response = await fetch('/api/brands', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: brandToDelete._id }),
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setBrandToDelete(null);
        await fetchBrands();
        setResultModal({ type: 'success', message: 'La marca ha sido eliminada correctamente.' });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setShowDeleteModal(false);
        setBrandToDelete(null);
        setResultModal({ type: 'error', message: errorData.error || 'Error al eliminar la marca.' });
      }
    } catch (error) {
      console.error('Error eliminando marca:', error);
      setShowDeleteModal(false);
      setBrandToDelete(null);
      setResultModal({ type: 'error', message: 'Error al eliminar la marca.' });
    } finally {
      setIsDeleting(false);
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
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Gestión de Marcas</h2>
      </div>

      <div className="p-6">
        {notice && (
          <Notice
            type={notice.type}
            message={notice.message}
            onClose={() => setNotice(null)}
            className="mb-4"
          />
        )}
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
              disabled={isSaving}
            />
            <button
              onClick={createBrand}
              disabled={!newBrand.name.trim() || isSaving}
              className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
            >
              {isSaving ? 'Guardando...' : 'Agregar'}
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
                            disabled={isSaving}
                            className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
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
                          onClick={() => handleDeleteClick(brand)}
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

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && brandToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Eliminar marca</h3>
                  <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">
                  ¿Seguro que querés eliminar la marca{' '}
                  <span className="font-medium text-gray-900">"{brandToDelete.name}"</span>?
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setBrandToDelete(null);
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={deleteBrand}
                  disabled={isDeleting}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} className="mr-2" />
                      Eliminar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de resultado (éxito o error) */}
      {resultModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center">
            {resultModal.type === 'success' ? (
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            ) : (
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            )}
            <p className={`text-sm font-medium ${resultModal.type === 'success' ? 'text-gray-900' : 'text-red-700'}`}>
              {resultModal.message}
            </p>
            <button
              type="button"
              onClick={() => setResultModal(null)}
              className={`mt-5 w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                resultModal.type === 'success'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandManager;