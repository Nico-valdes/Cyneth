'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Package, FolderOpen, Check, ChevronDown, ChevronRight, Edit2, Folder, FileText, MoreHorizontal, ArrowRight, Home } from 'lucide-react';

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
  const [newCategory, setNewCategory] = useState({ name: '', description: '', parent: '' });
  const [editingCategory, setEditingCategory] = useState({ name: '', description: '', parent: '' });
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [addingSubcategoryTo, setAddingSubcategoryTo] = useState<string | null>(null);
  const [newInlineCategory, setNewInlineCategory] = useState({ name: '', description: '' });

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
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: newCategory.name.trim(),
          description: newCategory.description.trim() || undefined,
          parent: newCategory.parent || undefined
        }),
      });

      if (response.ok) {
        setNewCategory({ name: '', description: '', parent: '' });
        fetchCategories();
      } else {
        console.error('Error creando categoría');
      }
    } catch (error) {
      console.error('Error creando categoría:', error);
    }
  };

  const updateCategory = async (id: string) => {
    if (!editingCategory.name.trim()) return;

    try {
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id, 
          name: editingCategory.name.trim(),
          description: editingCategory.description.trim() || undefined,
          parent: editingCategory.parent || undefined
        }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditingCategory({ name: '', description: '', parent: '' });
        fetchCategories();
      } else {
        console.error('Error actualizando categoría');
      }
    } catch (error) {
      console.error('Error actualizando categoría:', error);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) return;

    try {
      const response = await fetch('/api/categories', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        fetchCategories();
      } else {
        console.error('Error eliminando categoría');
      }
    } catch (error) {
      console.error('Error eliminando categoría:', error);
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
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newInlineCategory.name.trim(),
          description: newInlineCategory.description.trim() || undefined,
          parent: parentId || undefined
        })
      });

      if (response.ok) {
        setNewInlineCategory({ name: '', description: '' });
        setAddingSubcategoryTo(null);
        fetchCategories();
      }
    } catch (error) {
      console.error('Error creando categoría:', error);
    }
  };

  // Función para cancelar la creación inline
  const cancelInlineCategory = () => {
    setAddingSubcategoryTo(null);
    setNewInlineCategory({ name: '', description: '' });
  };



  // Función para iniciar la creación de subcategoría
  const startAddingSubcategory = (categoryId: string) => {
    setAddingSubcategoryTo(categoryId);
    setNewInlineCategory({ name: '', description: '' });
    
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
      description: category.description || '',
      parent: category.parent || ''
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingCategory({ name: '', description: '', parent: '' });
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
    
    const paddingLeft = level * 16;

    return (
      <div className="relative">
        {/* Línea de conexión jerárquica */}
        {level > 0 && (
          <div 
            className="absolute top-5 border-l border-slate-200" 
            style={{ left: `${(level - 1) * 16 + 8}px`, height: '100%' }}
          />
        )}
        
        <div 
          className="group hover:bg-slate-50 transition-colors rounded"
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
                  className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Nombre de la categoría..."
                  autoFocus
                />
                <input
                  type="text"
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Descripción (opcional)..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => updateCategory(category._id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium"
                  >
                    <Check size={12} /> Guardar
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-3 py-1 bg-slate-500 text-white rounded hover:bg-slate-600 transition-colors text-xs font-medium"
                  >
                    <X size={12} /> Cancelar
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
                      className={`font-medium text-slate-900 cursor-pointer hover:text-blue-600 transition-colors ${
                        level === 0 ? 'text-base' : 'text-sm'
                      }`}
                      onClick={() => startEditing(category)}
                      title="Clic para editar"
                    >
                      {category.name}
                    </h5>
                    
                    {category.description && (
                      <span className="text-xs text-slate-500 italic">
                        {category.description}
                      </span>
                    )}
                    
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
              <div className="px-3 py-2 bg-white border border-slate-200 rounded mb-2">
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Nombre de la subcategoría..."
                    value={newInlineCategory.name}
                    onChange={(e) => setNewInlineCategory({ ...newInlineCategory, name: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') createInlineCategory(category._id);
                      if (e.key === 'Escape') cancelInlineCategory();
                    }}
                    autoFocus
                  />
                  <input
                    type="text"
                    placeholder="Descripción (opcional)..."
                    value={newInlineCategory.description}
                    onChange={(e) => setNewInlineCategory({ ...newInlineCategory, description: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => createInlineCategory(category._id)}
                      disabled={!newInlineCategory.name.trim()}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-slate-300 transition-colors text-xs font-medium"
                    >
                      <Check size={12} /> Crear
                    </button>
                    <button
                      onClick={cancelInlineCategory}
                      className="px-3 py-1 bg-slate-500 text-white rounded hover:bg-slate-600 transition-colors text-xs font-medium"
                    >
                      <X size={12} /> Cancelar
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Folder className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Categorías</h1>
              <p className="text-sm text-slate-500">Gestiona la estructura jerárquica de categorías</p>
            </div>
          </div>
          
          {/* Formulario para nueva categoría principal */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Nueva categoría principal..."
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-48"
              onKeyPress={(e) => e.key === 'Enter' && createCategory()}
            />
            <input
              type="text"
              placeholder="Descripción (opcional)..."
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-48"
            />
            <button
              onClick={createCategory}
              disabled={!newCategory.name.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Crear
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Lista de categorías jerárquicas */}
        <div className="space-y-3">
          {hierarchicalCategories.length > 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="p-4">
                <div className="space-y-2">
                  {hierarchicalCategories.map((category) => (
                    <CategoryItem 
                      key={category._id}
                      category={category} 
                      level={0}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <FolderOpen className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No hay categorías</h3>
              <p className="text-slate-500">Crea tu primera categoría usando el formulario de arriba</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoryManager;