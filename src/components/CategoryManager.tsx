'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Package, FolderOpen, Check, ChevronDown, ChevronRight, Edit2, Folder, FileText, MoreHorizontal, ArrowRight, Home } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  productCount: number;
  active: boolean;
}

interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  parent?: string; // ID de la subcategoría padre (para subcategorías anidadas)
  parentSlug?: string;
  productCount: number;
  active: boolean;
}

interface CategoryManagerProps {}

const CategoryManager: React.FC<CategoryManagerProps> = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [newSubcategory, setNewSubcategory] = useState({ name: '', category: '', parent: '' });
  const [editingCategory, setEditingCategory] = useState({ name: '' });
  const [editingSubcategory, setEditingSubcategory] = useState({ name: '', parent: '' });
  const [selectedParentCategory, setSelectedParentCategory] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  const [addingSubcategoryTo, setAddingSubcategoryTo] = useState<string | null>(null);
  const [newInlineSubcategory, setNewInlineSubcategory] = useState({ name: '', parentSubcategory: '' });

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data?.categories || []);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await fetch('/api/subcategories');
      if (response.ok) {
        const data = await response.json();
        setSubcategories(data.data?.subcategories || []);
      }
    } catch (error) {
      console.error('Error cargando subcategorías:', error);
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
        body: JSON.stringify({ name: newCategory.name.trim() }),
      });

      if (response.ok) {
        setNewCategory({ name: '' });
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
          name: editingCategory.name.trim() 
        }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditingCategory({ name: '' });
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

  // Operaciones CRUD optimizadas
  const crudOperations = {
    // Crear subcategoría
    createSubcategory: async () => {
      if (!newSubcategory.name.trim() || !newSubcategory.category) return;

      // Validar profundidad máxima
      if (newSubcategory.parent) {
        const parentDepth = hierarchyHelpers.getSubcategoryDepth(newSubcategory.parent);
        if (parentDepth >= 5) {
          alert('No se puede crear más de 5 niveles de subcategorías.');
          return;
        }
      }

      try {
        const response = await fetch('/api/subcategories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newSubcategory.name,
            category: newSubcategory.category,
            parent: newSubcategory.parent || undefined
          })
        });

        if (response.ok) {
          setNewSubcategory({ name: '', category: '', parent: '' });
          await Promise.all([fetchCategories(), fetchSubcategories()]);
        }
      } catch (error) {
        console.error('Error creando subcategoría:', error);
      }
    },

    // Actualizar subcategoría
    updateSubcategory: async (id: string) => {
      if (!editingSubcategory.name.trim()) return;

      // Validar que no se cree un ciclo
      if (editingSubcategory.parent && hierarchyHelpers.wouldCreateCycle(id, editingSubcategory.parent)) {
        alert('No se puede asignar este padre porque crearía un ciclo en la jerarquía.');
        return;
      }

      // Validar profundidad máxima
      if (editingSubcategory.parent) {
        const parentDepth = hierarchyHelpers.getSubcategoryDepth(editingSubcategory.parent);
        if (parentDepth >= 5) {
          alert('No se puede crear más de 5 niveles de subcategorías.');
          return;
        }
      }

      try {
        const response = await fetch('/api/subcategories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            name: editingSubcategory.name,
            parent: editingSubcategory.parent || undefined
          })
        });

        if (response.ok) {
          setEditingSubId(null);
          setEditingSubcategory({ name: '', parent: '' });
          await Promise.all([fetchCategories(), fetchSubcategories()]);
        }
      } catch (error) {
        console.error('Error actualizando subcategoría:', error);
      }
    },

    // Eliminar subcategoría
    deleteSubcategory: async (id: string) => {
      // Verificar si tiene subcategorías hijas
      if (hierarchyHelpers.hasChildren(id)) {
        const confirmDelete = window.confirm(
          'Esta subcategoría tiene sub-subcategorías. ¿Estás seguro de que quieres eliminarla? Esto también eliminará todas sus subcategorías hijas.'
        );
        if (!confirmDelete) return;
      }

      try {
        const response = await fetch('/api/subcategories', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });

        if (response.ok) {
          await Promise.all([fetchCategories(), fetchSubcategories()]);
        }
      } catch (error) {
        console.error('Error eliminando subcategoría:', error);
      }
    }
  };

  // Funciones de compatibilidad
  const createSubcategory = crudOperations.createSubcategory;
  const updateSubcategory = crudOperations.updateSubcategory;
  const deleteSubcategory = crudOperations.deleteSubcategory;

  // Función para crear subcategoría inline
  const createInlineSubcategory = async (categoryId: string, parentSubcategoryId?: string) => {
    if (!newInlineSubcategory.name.trim()) return;

    // Validar profundidad máxima
    if (parentSubcategoryId) {
      const parentDepth = hierarchyHelpers.getSubcategoryDepth(parentSubcategoryId);
      if (parentDepth >= 5) {
        alert('No se puede crear más de 5 niveles de subcategorías.');
        return;
      }
    }

    try {
      const response = await fetch('/api/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newInlineSubcategory.name,
          category: categoryId,
          parent: parentSubcategoryId || undefined
        })
      });

      if (response.ok) {
        setNewInlineSubcategory({ name: '', parentSubcategory: '' });
        setAddingSubcategoryTo(null);
        await Promise.all([fetchCategories(), fetchSubcategories()]);
      }
    } catch (error) {
      console.error('Error creating inline subcategory:', error);
    }
  };

  // Función para cancelar la creación inline
  const cancelInlineSubcategory = () => {
    setAddingSubcategoryTo(null);
    setNewInlineSubcategory({ name: '', parentSubcategory: '' });
  };

  // Función para iniciar la creación de subcategoría
  const startAddingSubcategory = (categoryId: string, parentSubcategoryId?: string) => {
    // Si se proporciona parentSubcategoryId, estamos agregando una subcategoría hija
    const addingKey = parentSubcategoryId ? `${parentSubcategoryId}-child` : categoryId;
    setAddingSubcategoryTo(addingKey);
    setNewInlineSubcategory({ name: '', parentSubcategory: '' });
    
    // Expandir la categoría si no está expandida
    if (!expandedCategories.has(categoryId)) {
      toggleCategoryExpansion(categoryId);
    }
    
    // Si estamos agregando a una subcategoría, también expandir esa subcategoría
    if (parentSubcategoryId && !expandedSubcategories.has(parentSubcategoryId)) {
      toggleSubcategoryExpansion(parentSubcategoryId);
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

  const toggleSubcategoryExpansion = (subcategoryId: string) => {
    const newExpanded = new Set(expandedSubcategories);
    if (newExpanded.has(subcategoryId)) {
      newExpanded.delete(subcategoryId);
    } else {
      newExpanded.add(subcategoryId);
    }
    setExpandedSubcategories(newExpanded);
  };

  const getSubcategoriesForCategory = (categorySlug: string) => {
    return subcategories.filter(sub => sub.categorySlug === categorySlug && sub.active);
  };

  const startEditing = (category: Category) => {
    setEditingId(category._id);
    setEditingCategory({ name: category.name });
  };

  const startEditingSubcategory = (subcategory: Subcategory) => {
    setEditingSubId(subcategory._id);
    setEditingSubcategory({ name: subcategory.name, parent: subcategory.parent || '' });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingCategory({ name: '' });
  };

  const cancelEditingSubcategory = () => {
    setEditingSubId(null);
    setEditingSubcategory({ name: '', parent: '' });
  };

  // Funciones auxiliares para manejo de jerarquías
  const hierarchyHelpers = {
    // Obtener subcategorías de primer nivel de una categoría
    getTopLevelSubcategories: (categoryId: string) => {
      return subcategories.filter(sub => sub.category === categoryId && !sub.parent);
    },

    // Obtener subcategorías hijas de una subcategoría específica
    getChildSubcategories: (parentId: string) => {
      return subcategories.filter(sub => sub.parent === parentId);
    },

    // Obtener todas las subcategorías disponibles como padre para una categoría
    getAvailableParentSubcategories: (categoryId: string, excludeId?: string) => {
      return subcategories.filter(sub => 
        sub.category === categoryId && 
        sub._id !== excludeId &&
        hierarchyHelpers.getSubcategoryDepth(sub._id) < 4 // Permitir hasta nivel 4 como padre (para crear nivel 5 máximo)
      );
    },

    // Obtener el conteo total de subcategorías (incluyendo anidadas) para una categoría
    getTotalSubcategoryCount: (categoryId: string) => {
      const countSubcategoriesRecursively = (parentId: string | null): number => {
        const children = subcategories.filter(sub => 
          parentId ? sub.parent === parentId : (sub.category === categoryId && !sub.parent)
        );
        
        let total = children.length;
        children.forEach(child => {
          total += countSubcategoriesRecursively(child._id);
        });
        
        return total;
      };
      
      return countSubcategoriesRecursively(null);
    },

    // Verificar si una subcategoría tiene hijos
    hasChildren: (subcategoryId: string) => {
      return subcategories.some(sub => sub.parent === subcategoryId);
    },

    // Obtener la ruta completa de una subcategoría (categoría > subcategoría > sub-subcategoría)
    getSubcategoryPath: (subcategoryId: string) => {
      const buildPathRecursively = (subId: string): string[] => {
        const subcategory = subcategories.find(sub => sub._id === subId);
        if (!subcategory) return [];
        
        const path = [subcategory.name];
        
        if (subcategory.parent) {
          const parentPath = buildPathRecursively(subcategory.parent);
          path.unshift(...parentPath);
        }
        
        return path;
      };
      
      const subcategory = subcategories.find(sub => sub._id === subcategoryId);
      if (!subcategory) return '';
      
      const category = categories.find(cat => cat._id === subcategory.category);
      if (!category) return '';
      
      const path = [category.name, ...buildPathRecursively(subcategoryId)];
      return path.join(' > ');
    },

    // Obtener breadcrumbs estructurados para una subcategoría
    getSubcategoryBreadcrumbs: (subcategoryId: string) => {
      const subcategory = subcategories.find(sub => sub._id === subcategoryId);
      if (!subcategory) return [];
      
      const breadcrumbs = [];
      
      // Agregar categoría principal
      const category = categories.find(cat => cat._id === subcategory.category);
      if (category) {
        breadcrumbs.push({
          id: category._id,
          name: category.name,
          type: 'category' as const,
          isLast: false
        });
      }
      
      // Construir jerarquía de subcategorías
      const buildHierarchy = (subId: string): any[] => {
        const sub = subcategories.find(s => s._id === subId);
        if (!sub) return [];
        
        const hierarchy = [];
        if (sub.parent) {
          hierarchy.push(...buildHierarchy(sub.parent));
        }
        
        hierarchy.push({
          id: sub._id,
          name: sub.name,
          type: 'subcategory' as const,
          isLast: false
        });
        
        return hierarchy;
      };
      
      const subcategoryHierarchy = buildHierarchy(subcategoryId);
      breadcrumbs.push(...subcategoryHierarchy);
      
      // Marcar el último elemento
      if (breadcrumbs.length > 0) {
        breadcrumbs[breadcrumbs.length - 1].isLast = true;
      }
      
      return breadcrumbs;
    },

    // Validar integridad de jerarquía
    validateHierarchy: () => {
      const issues: string[] = [];
      
      subcategories.forEach(subcategory => {
        // Verificar ciclos
        if (hierarchyHelpers.wouldCreateCycle(subcategory._id, subcategory.parent)) {
          issues.push(`Ciclo detectado en subcategoría: ${subcategory.name}`);
        }
        
        // Verificar profundidad máxima
        const depth = hierarchyHelpers.getSubcategoryDepth(subcategory._id);
        if (depth > 5) {
          issues.push(`Subcategoría ${subcategory.name} excede la profundidad máxima (${depth} > 5)`);
        }
      });
      
      return issues;
    },

    // Verificar si asignar un padre crearía un ciclo
    wouldCreateCycle: (subcategoryId: string, parentId: string | null): boolean => {
      if (!parentId) return false;
      
      let currentId = parentId;
      const visited = new Set<string>();
      
      while (currentId) {
        if (visited.has(currentId) || currentId === subcategoryId) {
          return true;
        }
        
        visited.add(currentId);
        const parent = subcategories.find(sub => sub._id === currentId);
        currentId = parent?.parent || null;
      }
      
      return false;
    },

    // Obtener el nivel de profundidad de una subcategoría
    getSubcategoryDepth: (subcategoryId: string): number => {
      let depth = 0;
      let currentId = subcategoryId;
      
      while (currentId) {
        const subcategory = subcategories.find(sub => sub._id === currentId);
        if (!subcategory) break;
        
        depth++;
        currentId = subcategory.parent;
        
        // Prevenir bucles infinitos
        if (depth > 10) break;
      }
      
      return depth;
    },

    // Obtener el nivel visual para mostrar en la interfaz
    getSubcategoryLevel: (subcategoryId: string): number => {
      return Math.min(hierarchyHelpers.getSubcategoryDepth(subcategoryId) - 1, 4);
    }
  };

  // Funciones de compatibilidad (mantener nombres anteriores)
  const getSubcategoriesByCategory = hierarchyHelpers.getTopLevelSubcategories;
  const getChildSubcategories = hierarchyHelpers.getChildSubcategories;
  const getAvailableParentSubcategories = hierarchyHelpers.getAvailableParentSubcategories;

  // Componente Breadcrumbs para mostrar la ruta jerárquica
  const Breadcrumbs: React.FC<{ subcategoryId: string }> = ({ subcategoryId }) => {
    const breadcrumbs = hierarchyHelpers.getSubcategoryBreadcrumbs(subcategoryId);
    
    if (breadcrumbs.length === 0) return null;
    
    return (
      <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
        <Home className="h-3 w-3" />
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.id}>
            {index > 0 && <ChevronRight className="h-3 w-3" />}
            <span 
              className={`${
                crumb.isLast 
                  ? 'text-slate-700 font-medium' 
                  : 'text-slate-500 hover:text-slate-700'
              } transition-colors`}
              title={`${crumb.type === 'category' ? 'Categoría' : 'Subcategoría'}: ${crumb.name}`}
            >
              {crumb.name}
            </span>
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Componente para renderizar subcategorías de forma recursiva
  const SubcategoryItem: React.FC<{ subcategory: Subcategory; level: number }> = ({ subcategory, level }) => {
    const childSubcategories = getChildSubcategories(subcategory._id);
    const isExpanded = expandedSubcategories.has(subcategory._id);
    const hasChildren = childSubcategories.length > 0;
    
    const paddingLeft = level * 16; // Reducido para mejor proporción

    return (
      <div className="relative">
        {/* Línea de conexión jerárquica más sutil */}
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
          {editingSubId === subcategory._id ? (
            <div className="px-3 py-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingSubcategory.name}
                  onChange={(e) => setEditingSubcategory({ ...editingSubcategory, name: e.target.value })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') updateSubcategory(subcategory._id);
                    if (e.key === 'Escape') cancelEditingSubcategory();
                  }}
                  className="flex-1 px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  autoFocus
                />
                <button
                  onClick={() => updateSubcategory(subcategory._id)}
                  className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium"
                >
                  <Check size={12} />
                </button>
                <button
                  onClick={cancelEditingSubcategory}
                  className="px-2 py-1 bg-slate-500 text-white rounded hover:bg-slate-600 transition-colors text-xs font-medium"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ) : (
            <div className="px-3 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  {/* Botón de expansión */}
                  {hasChildren ? (
                    <button
                      onClick={() => toggleSubcategoryExpansion(subcategory._id)}
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
                  
                  {/* Información de la subcategoría - más compacta */}
                  <div className="flex items-center gap-3">
                    <h5 
                      className="font-medium text-slate-900 text-sm cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => startEditingSubcategory(subcategory)}
                      title="Clic para editar"
                    >
                      {subcategory.name}
                    </h5>
                    
                    {/* Métricas compactas */}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Folder className="h-3 w-3" />
                        {childSubcategories.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {subcategory.productCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Botones de acción */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => startAddingSubcategory(subcategory.category, subcategory._id)}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Agregar subcategoría hija"
                  >
                    <Plus size={12} />
                  </button>
                  <button
                    onClick={() => startEditingSubcategory(subcategory)}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Editar subcategoría"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => deleteSubcategory(subcategory._id)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar subcategoría"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Subcategorías hijas - más compactas */}
        {isExpanded && (
          <div className="mt-1" style={{ marginLeft: `${paddingLeft + 16}px` }}>
            {/* Lista de subcategorías hijas existentes */}
            {childSubcategories.length > 0 && (
              <div className="space-y-1">
                {childSubcategories.map((child, index) => (
                  <div key={child._id} className="relative">
                    {/* Línea conectora más sutil */}
                    {index < childSubcategories.length - 1 && (
                      <div 
                        className="absolute top-5 border-l border-slate-200" 
                        style={{ left: '8px', height: 'calc(100% - 20px)' }}
                      />
                    )}
                    <SubcategoryItem 
                      subcategory={child} 
                      level={level + 1}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Formulario inline para nueva subcategoría hija - más compacto */}
            {addingSubcategoryTo === `${subcategory._id}-child` && (
              <div className="px-3 py-2 bg-white border border-slate-200 rounded mt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nombre de la subcategoría..."
                    value={newInlineSubcategory.name}
                    onChange={(e) => setNewInlineSubcategory({ ...newInlineSubcategory, name: e.target.value })}
                    className="flex-1 px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') createInlineSubcategory(subcategory.category, subcategory._id);
                      if (e.key === 'Escape') cancelInlineSubcategory();
                    }}
                    autoFocus
                  />
                  <button
                    onClick={() => createInlineSubcategory(subcategory.category, subcategory._id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium"
                    disabled={!newInlineSubcategory.name.trim()}
                  >
                    <Check size={12} />
                    Crear
                  </button>
                  <button
                    onClick={cancelInlineSubcategory}
                    className="px-3 py-1 bg-slate-500 text-white rounded hover:bg-slate-600 transition-colors text-xs font-medium"
                  >
                    <X size={12} />
                    Cancelar
                  </button>
                </div>
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
      {/* Header simplificado */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Folder className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-slate-900">Categorías</h1>
          </div>
          
          {/* Formulario compacto para nueva categoría */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Nueva categoría..."
              value={newCategory.name}
              onChange={(e) => setNewCategory({ name: e.target.value })}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-48"
              onKeyPress={(e) => e.key === 'Enter' && createCategory()}
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
        {/* Lista de categorías simplificada */}
        <div className="space-y-3">
          {categories.filter(cat => cat.active).map((category) => {
            const categorySubcategories = getSubcategoriesForCategory(category.slug);
            const isExpanded = expandedCategories.has(category._id);
            
            return (
              <div key={category._id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                {/* Header de categoría */}
                <div className="px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Botón de expansión */}
                      {categorySubcategories.length > 0 && (
                        <button
                          onClick={() => toggleCategoryExpansion(category._id)}
                          className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-slate-600" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-slate-600" />
                          )}
                        </button>
                      )}
                      
                                             {/* Información de la categoría */}
                       {editingId === category._id ? (
                         <div className="flex items-center gap-4">
                           <input
                             type="text"
                             value={editingCategory.name}
                             onChange={(e) => setEditingCategory({ name: e.target.value })}
                             onKeyPress={(e) => {
                               if (e.key === 'Enter') updateCategory(category._id);
                               if (e.key === 'Escape') cancelEditing();
                             }}
                             onBlur={() => updateCategory(category._id)}
                             className="px-3 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold"
                             autoFocus
                           />
                           <div className="flex items-center gap-2 text-xs text-slate-500">
                             <span className="flex items-center gap-1">
                               <Folder className="h-3 w-3" />
                               {hierarchyHelpers.getTotalSubcategoryCount(category._id)}
                             </span>
                             <span className="flex items-center gap-1">
                               <Package className="h-3 w-3" />
                               {category.productCount}
                             </span>
                           </div>
                         </div>
                       ) : (
                         <div className="flex items-center gap-3">
                           <h3 
                             className="font-medium text-slate-900 text-base cursor-pointer hover:text-blue-600 transition-colors"
                             onClick={() => startEditing(category)}
                             title="Clic para editar"
                           >
                             {category.name}
                           </h3>
                           <div className="flex items-center gap-2 text-xs text-slate-500">
                             <span className="flex items-center gap-1">
                               <Folder className="h-3 w-3" />
                               {hierarchyHelpers.getTotalSubcategoryCount(category._id)}
                             </span>
                             <span className="flex items-center gap-1">
                               <Package className="h-3 w-3" />
                               {category.productCount}
                             </span>
                           </div>
                         </div>
                       )}
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startAddingSubcategory(category._id)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Agregar subcategoría"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => startEditing(category)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar categoría"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteCategory(category._id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar categoría"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subcategorías expandibles */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/30">
                    {/* Formulario inline para nueva subcategoría */}
                    {addingSubcategoryTo === category._id && (
                      <div className="px-4 py-3 bg-white border-b border-slate-100">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            placeholder="Nombre de la subcategoría..."
                            value={newInlineSubcategory.name}
                            onChange={(e) => setNewInlineSubcategory({ ...newInlineSubcategory, name: e.target.value })}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') createInlineSubcategory(category._id);
                              if (e.key === 'Escape') cancelInlineSubcategory();
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => createInlineSubcategory(category._id)}
                            disabled={!newInlineSubcategory.name.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            <Check size={14} />
                            Crear
                          </button>
                          <button
                            onClick={cancelInlineSubcategory}
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            <X size={14} />
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                                          {/* Lista de subcategorías */}
                      {categorySubcategories.length > 0 && (
                        <div className="px-4 py-3">
                          <div className="space-y-2">
                          {getSubcategoriesByCategory(category._id).map((subcategory) => (
                            <SubcategoryItem 
                              key={subcategory._id} 
                              subcategory={subcategory} 
                              level={0}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {categories.filter(cat => cat.active).length === 0 && (
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