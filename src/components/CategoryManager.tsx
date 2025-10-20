'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Package, FolderOpen, Check, ChevronDown, ChevronRight, Edit2, Folder, FileText, MoreHorizontal, ArrowRight, Home } from 'lucide-react';

// Función para generar slug
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent: string | null;
  level: number;
  type: 'main' | 'sub';
  productCount: number;
  totalProductCount: number;
  order: number;
  active: boolean;
  children?: Category[];
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryManagerProps {}

const CategoryManager: React.FC<CategoryManagerProps> = () => {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [hierarchicalCategories, setHierarchicalCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', parent: '' });
  const [editingCategory, setEditingCategory] = useState({ name: '', parent: '' });
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [addingSubcategoryTo, setAddingSubcategoryTo] = useState<string | null>(null);
  const [newInlineCategory, setNewInlineCategory] = useState({ name: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Obtener todas las categorías
      const allResponse = await fetch('/api/categories');
      if (allResponse.ok) {
        const allData = await allResponse.json();
        setAllCategories(allData.data?.categories || []);
      }

      // Obtener categorías principales con jerarquía
      const mainResponse = await fetch('/api/categories?type=main&hierarchical=true');
      if (mainResponse.ok) {
        const mainData = await mainResponse.json();
        setHierarchicalCategories(mainData.data?.categories || []);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async () => {
    if (!newCategory.name.trim()) return;

    try {
      const categoryData = {
        name: newCategory.name.trim(),
        slug: generateSlug(newCategory.name.trim()),
        parent: newCategory.parent || null,
        level: newCategory.parent ? 1 : 0, // Se calculará automáticamente en el servidor
        active: true
      };

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        setNewCategory({ name: '', parent: '' });
        fetchCategories();
      } else {
        const errorData = await response.json();
        console.error('Error creando categoría:', errorData.error);
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creando categoría:', error);
      alert('Error al crear la categoría');
    }
  };

  const updateCategory = async (id: string) => {
    if (!editingCategory.name.trim()) return;

    try {
      const updateData = {
        id,
        name: editingCategory.name.trim(),
        slug: generateSlug(editingCategory.name.trim()),
        parent: editingCategory.parent || null
      };

      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setEditingId(null);
        setEditingCategory({ name: '', parent: '' });
        fetchCategories();
      } else {
        const errorData = await response.json();
        console.error('Error actualizando categoría:', errorData.error);
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error actualizando categoría:', error);
      alert('Error al actualizar la categoría');
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) return;

    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCategories();
      } else {
        const errorData = await response.json();
        console.error('Error eliminando categoría:', errorData.error);
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      alert('Error al eliminar la categoría');
    }
  };

  // Función para crear subcategoría/categoría hija
  const createInlineCategory = async (parentId?: string) => {
    if (!newInlineCategory.name.trim()) return;

    // Validar profundidad máxima (máximo 4 niveles)
    if (parentId) {
      const parentCategory = allCategories.find(cat => cat._id === parentId);
      if (parentCategory && parentCategory.level >= 3) {
        alert('No se puede crear más de 4 niveles de categorías.');
        return;
      }
    }

    try {
      const categoryData = {
        name: newInlineCategory.name.trim(),
        slug: generateSlug(newInlineCategory.name.trim()),
        parent: parentId || null,
        active: true
      };

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });

      if (response.ok) {
        setNewInlineCategory({ name: '' });
        setAddingSubcategoryTo(null);
        fetchCategories();
      } else {
        const errorData = await response.json();
        console.error('Error creando categoría:', errorData.error);
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creando categoría:', error);
      alert('Error al crear la categoría');
    }
  };

  // Función para cancelar la creación inline
  const cancelInlineCategory = () => {
    setAddingSubcategoryTo(null);
    setNewInlineCategory({ name: '' });
  };



  // Función para iniciar la creación de subcategoría
  const startAddingSubcategory = (categoryId: string) => {
    setAddingSubcategoryTo(categoryId);
    setNewInlineCategory({ name: '' });
    
    // Expandir la categoría si no está expandida
    if (!expandedCategories.has(categoryId)) {
      toggleCategoryExpansion(categoryId);
    }
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };



  const getChildrenForCategory = (categoryId: string) => {
    return allCategories.filter(cat => cat.parent === categoryId && cat.active);
  };

  const startEditing = (category: Category) => {
    setEditingId(category._id);
    setEditingCategory({ 
      name: category.name, 
      parent: category.parent || ''
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingCategory({ name: '', parent: '' });
  };

  // Funciones auxiliares para manejo de jerarquías
  const hierarchyHelpers = {
    // Obtener hijos directos de una categoría
    getDirectChildren: (categoryId: string) => {
      return allCategories.filter(cat => cat.parent === categoryId);
    },

    // Obtener el conteo total de subcategorías (incluyendo anidadas) para una categoría
    getTotalSubcategoryCount: (categoryId: string) => {
      const countRecursively = (parentId: string): number => {
        const children = allCategories.filter(cat => cat.parent === parentId);
        let total = children.length;
        children.forEach(child => {
          total += countRecursively(child._id);
        });
        return total;
      };
      
      return countRecursively(categoryId);
    },

    // Verificar si una categoría tiene hijos
    hasChildren: (categoryId: string) => {
      return allCategories.some(cat => cat.parent === categoryId);
    },

    // Obtener la ruta completa de una categoría
    getCategoryPath: (categoryId: string) => {
      const buildPathRecursively = (catId: string): string[] => {
        const category = allCategories.find(cat => cat._id === catId);
        if (!category) return [];
        
        const path = [category.name];
        
        if (category.parent) {
          const parentPath = buildPathRecursively(category.parent);
          path.unshift(...parentPath);
        }
        
        return path;
      };
      
      return buildPathRecursively(categoryId).join(' > ');
    },

    // Verificar si asignar un padre crearía un ciclo
    wouldCreateCycle: (categoryId: string, parentId: string | null): boolean => {
      if (!parentId) return false;
      
      let currentId = parentId;
      const visited = new Set<string>();
      
      while (currentId) {
        if (visited.has(currentId) || currentId === categoryId) {
          return true;
        }
        
        visited.add(currentId);
        const parent = allCategories.find(cat => cat._id === currentId);
        currentId = parent?.parent || '';
      }
      
      return false;
    },

    // Obtener categorías disponibles como padre
    getAvailableParentCategories: (excludeId?: string) => {
      return allCategories.filter(cat => 
        cat._id !== excludeId &&
        cat.level < 3 && // Máximo 4 niveles
        cat.active
      );
    }
  };



  // Componente para mostrar la ruta jerárquica
  const CategoryPath: React.FC<{ category: Category }> = ({ category }) => {
    const path = hierarchyHelpers.getCategoryPath(category._id);
    
    if (!path) return null;
    
    return (
      <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
        <Home className="h-3 w-3" />
        <span className="text-slate-700">{path}</span>
      </div>
    );
  };

  // Componente para renderizar categorías de forma recursiva
  const CategoryItem: React.FC<{ category: Category; level: number }> = ({ category, level }) => {
    const childCategories = hierarchyHelpers.getDirectChildren(category._id);
    const isExpanded = expandedCategories.has(category._id);
    const hasChildren = childCategories.length > 0;
    
    const paddingLeft = level * 20;

    return (
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div 
          className="group hover:bg-gray-50/50 transition-colors"
          style={{ marginLeft: `${paddingLeft}px` }}
        >
          {editingId === category._id ? (
            <div className="px-3 py-2">
              <div className="space-y-2">
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') updateCategory(category._id);
                    if (e.key === 'Escape') cancelEditing();
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
                  placeholder="Nombre de la categoría..."
                  autoFocus
                />
                {/* Selector de categoría padre */}
                <select
                  value={editingCategory.parent}
                  onChange={(e) => setEditingCategory({ ...editingCategory, parent: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm cursor-pointer"
                >
                  <option value="">Sin categoría padre (principal)</option>
                  {hierarchyHelpers.getAvailableParentCategories(editingId || undefined).map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {hierarchyHelpers.getCategoryPath(cat._id)}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateCategory(category._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <Check size={14} />
                    Guardar
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <X size={14} />
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-3 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  {/* Botón de expansión */}
                  {hasChildren ? (
                    <button
                      onClick={() => toggleCategoryExpansion(category._id)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title={isExpanded ? 'Contraer subcategorías' : 'Expandir subcategorías'}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </button>
                  ) : (
                    <div className="p-1">
                      <FileText className="h-3 w-3 text-slate-400" />
                    </div>
                  )}
                  
                  {/* Información de la categoría */}
                  <div className="flex items-center gap-3">
                    <h5 
                      className={`font-medium text-gray-900 cursor-pointer hover:text-red-600 transition-colors ${
                        level === 0 ? 'text-base' : 'text-sm'
                      }`}
                      onClick={() => startEditing(category)}
                      title="Clic para editar"
                    >
                      {category.name}
                    </h5>
                    
                    {/* Métricas */}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Folder className="h-3 w-3" />
                        {childCategories.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {category.productCount || 0}
                      </span>
                      <span className="text-xs bg-slate-100 px-1 rounded">
                        Nivel {category.level}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Botones de acción */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {category.level < 3 && (
                    <button
                      onClick={() => startAddingSubcategory(category._id)}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Agregar subcategoría"
                    >
                      <Plus size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => startEditing(category)}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Editar categoría"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => deleteCategory(category._id)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar categoría"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Subcategorías/categorías hijas */}
        {isExpanded && (
          <div className="mt-1" style={{ marginLeft: `${paddingLeft + 16}px` }}>
            {/* Formulario inline para nueva subcategoría */}
            {addingSubcategoryTo === category._id && (
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg mb-2">
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Nombre de la subcategoría..."
                    value={newInlineCategory.name}
                    onChange={(e) => setNewInlineCategory({ ...newInlineCategory, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') createInlineCategory(category._id);
                      if (e.key === 'Escape') cancelInlineCategory();
                    }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => createInlineCategory(category._id)}
                      disabled={!newInlineCategory.name.trim()}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 transition-colors text-sm font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <Check size={14} />
                      Crear
                    </button>
                    <button
                      onClick={cancelInlineCategory}
                      className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <X size={14} />
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de subcategorías existentes */}
            {childCategories.length > 0 && (
              <div className="space-y-1">
                {childCategories.map((child) => (
                  <CategoryItem 
                    key={child._id}
                    category={child} 
                    level={level + 1}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header limpio y minimalista */}
      <div className="border-b border-gray-100">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Categorías</h1>
              <p className="text-gray-500 mt-1">Gestiona la estructura jerárquica de categorías ({allCategories.length} categorías)</p>
            </div>
          
            <button 
              onClick={() => {
                // Expandir formulario de creación
                const formSection = document.getElementById('category-creation-form');
                if (formSection) {
                  formSection.style.display = formSection.style.display === 'none' ? 'block' : 'none';
                }
              }}
              className="bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium cursor-pointer"
            >
              <Plus size={18} />
              Nueva Categoría
            </button>
          </div>
        </div>
      </div>

      {/* Formulario de creación flotante */}
      <div id="category-creation-form" className="px-8 py-4 bg-gray-50 border-b border-gray-100" style={{display: 'none'}}>
        <div className="max-w-4xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nombre de la categoría..."
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
              onKeyPress={(e) => e.key === 'Enter' && createCategory()}
            />
            <select
              value={newCategory.parent}
              onChange={(e) => setNewCategory({ ...newCategory, parent: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm cursor-pointer"
            >
              <option value="">Categoría principal</option>
              {hierarchyHelpers.getAvailableParentCategories().map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {hierarchyHelpers.getCategoryPath(cat._id)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={createCategory}
              disabled={!newCategory.name.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Crear Categoría
            </button>
            <button
              onClick={() => {
                setNewCategory({ name: '', parent: '' });
                document.getElementById('category-creation-form')!.style.display = 'none';
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Lista de categorías jerárquicas */}
        {hierarchicalCategories.length > 0 ? (
          <div className="space-y-3">
            {hierarchicalCategories.map((category) => (
              <CategoryItem 
                key={category._id}
                category={category} 
                level={0}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-300 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 1v6" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 1v6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay categorías</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Comienza creando tu primera categoría para organizar tus productos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryManager;