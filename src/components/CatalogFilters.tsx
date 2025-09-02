'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  parent: string | null
  level: number
  type: 'main' | 'sub'
  productCount: number
  totalProductCount: number
  active: boolean
  children?: Category[]
}

interface Brand {
  _id: string
  name: string
  slug: string
}

interface CatalogFiltersProps {
  categories: Category[]
  brands: Brand[]
  colors: string[]
  selectedCategory: string
  selectedBrand: string
  selectedColor: string
  onCategoryChange: (category: string) => void
  onBrandChange: (brand: string) => void
  onColorChange: (color: string) => void
}

export default function CatalogFilters({
  categories,
  brands,
  colors,
  selectedCategory,
  selectedBrand,
  selectedColor,
  onCategoryChange,
  onBrandChange,
  onColorChange
}: CatalogFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brands: false,
    colors: false
  })
  

    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [hierarchicalCategories, setHierarchicalCategories] = useState<{[categoryId: string]: Category[]}>({}) 
  const [loadingCategories, setLoadingCategories] = useState<Set<string>>(new Set())





  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const toggleCategory = async (categoryId: string) => {
    const isCurrentlyExpanded = expandedCategories.has(categoryId);
    
    if (isCurrentlyExpanded) {
      // Colapsar categoría
      setExpandedCategories(prev => {
        const newSet = new Set(prev);
        newSet.delete(categoryId);
        return newSet;
      });
    } else {
      // Expandir categoría - cargar subcategorías si no las tiene
      setExpandedCategories(prev => new Set(prev).add(categoryId));
      
      if (!hierarchicalCategories[categoryId]) {
        await loadSubcategoriesForCategory(categoryId);
      }
    }
  }



  const isCategoryExpanded = (categoryId: string) => {
    return expandedCategories.has(categoryId);
  }

  const isCategoryLoading = (categoryId: string) => {
    return loadingCategories.has(categoryId);
  }

  const loadSubcategoriesForCategory = async (categoryId: string) => {
    if (hierarchicalCategories[categoryId]) {
      return; // Ya cargadas
    }

    try {
      // Marcar como cargando
      setLoadingCategories(prev => new Set(prev).add(categoryId));
      
      console.time(`⚡ Carga ${categoryId}`);
      
      // Obtener todas las categorías y construir jerarquía
      const response = await fetch('/api/categories');
      
      if (response.ok) {
        const data = await response.json();
        console.timeEnd(`⚡ Carga ${categoryId}`);
        
        if (data.success && data.data.categories) {
          // Filtrar subcategorías de esta categoría y construir jerarquía
          const allCategories = data.data.categories;
          const subcategories = allCategories.filter((cat: Category) => cat.parent === categoryId);
          const hierarchical = buildHierarchy(subcategories, allCategories);
          
          // Guardar subcategorías para esta categoría
          setHierarchicalCategories(prev => ({
            ...prev,
            [categoryId]: hierarchical
          }));
          
          console.log('📊 Subcategorías cargadas:', hierarchical.length);
        }
      } else {
        console.error('❌ Error HTTP:', response.status, categoryId);
      }
    } catch (error) {
      console.error('❌ Error de red:', error);
    } finally {
      // Quitar del estado de carga
      setLoadingCategories(prev => {
        const newSet = new Set(prev);
        newSet.delete(categoryId);
        return newSet;
      });
    }
  }

  // Función para construir jerarquía de categorías
  const buildHierarchy = (categories: Category[], allCategories: Category[]): Category[] => {
    return categories.map(category => ({
      ...category,
      children: buildHierarchy(
        allCategories.filter(cat => cat.parent === category._id),
        allCategories
      )
    }));
  }

  const colorMap: { [key: string]: string } = {
    'Blanco': '#FFFFFF',
    'Blanco Cromo': '#F5F5F5',
    'Negro': '#000000',
    'Negro Cromo': '#2C2C2C',
    'Negro Mate': '#1A1A1A',
    'Gris Cromo': '#C0C0C0',
    'Rojo Cromo': '#8B0000',
    'Satin Greystone': '#696969',
    'Acero': '#708090',
    'Acero Inoxidable': '#B8B8B8',
    'Aluminio': '#D3D3D3',
    'Bronce': '#CD7F32',
    'Cromo': '#C0C0C0',
    'Niquel': '#A8A8A8',
    'Oro': '#FFD700',
    'Rose Gold': '#E8B4B8'
  }

  // Función recursiva para renderizar categorías jerárquicas
  const renderCategoryHierarchy = (categories: Category[], level = 0) => {
    return categories.map((category) => {
      const hasChildren = category.children && category.children.length > 0;
      const isSelected = selectedCategory === category._id;
      const isExpanded = expandedCategories.has(category._id);
      
      return (
        <div key={category._id}>
          {/* Contenedor principal de la categoría */}
          <div className="flex items-center">
                        {/* Botón de expansión/colapso */}
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategory(category._id);
                }}
                className="flex-shrink-0 p-1 hover:bg-gray-100 rounded mr-1 transition-colors"
                style={{ marginLeft: `${level * 12 + 4}px` }}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                ) : (
                  <ChevronUp className="w-3 h-3 text-gray-500 transform rotate-90" />
                )}
              </button>
            )}
            
            {/* Espaciado para categorías sin hijos */}
            {!hasChildren && (
              <div className="w-4 mr-1" style={{ marginLeft: `${level * 12 + 4}px` }} />
            )}
            
            {/* Botón de la categoría */}
            <button
              onClick={() => {
                onCategoryChange(category._id);
              }}
              className={`flex-1 text-left py-1 transition-colors ${
                isSelected 
                  ? 'text-red-600 font-medium' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{category.name}</span>
                {hasChildren && category.children && (
                  <span className="text-xs text-gray-400">
                    {category.children.length}
                  </span>
                )}
              </div>
            </button>
          </div>
          
          {/* Categorías hijas (solo si está expandido) */}
          {hasChildren && isExpanded && category.children && (
            <div className="mt-1 mb-1 border-l border-gray-200 ml-4 pl-2">
              {renderCategoryHierarchy(category.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-8">
      {/* Categorías */}
      <div>
        <button
          onClick={() => toggleSection('categories')}
          className="w-full flex items-center justify-between text-left mb-6 pb-2 border-b border-gray-200"
        >
          <h4 className="text-base font-medium text-gray-900">Categorías</h4>
          {expandedSections.categories ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {expandedSections.categories && (
          <div className="space-y-1">
            {/* Opción "Todas" */}
            <button
              onClick={() => {
                onCategoryChange('');
                setExpandedCategories(new Set());
              }}
              className={`w-full text-left py-2 px-0 transition-colors ${
                selectedCategory === '' 
                  ? 'text-red-600 font-medium' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="text-sm">Todas las categorías</span>
            </button>
            
            {/* Categorías principales con subcategorías integradas */}
            {categories.filter(cat => cat.type === 'main').map((category) => (
              <div key={category._id}>
                {/* Categoría principal */}
                <div className="flex items-center">
                  {/* Botón de expansión */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategory(category._id);
                    }}
                    className="flex-shrink-0 p-1 hover:bg-gray-100 rounded mr-1 transition-colors"
                  >
                    {isCategoryLoading(category._id) ? (
                      <div className="w-3 h-3 animate-spin border border-gray-300 border-t-gray-600 rounded-full"></div>
                    ) : isCategoryExpanded(category._id) ? (
                      <ChevronDown className="w-3 h-3 text-gray-500" />
                    ) : (
                      <ChevronUp className="w-3 h-3 text-gray-500 transform rotate-90" />
                    )}
                  </button>
                  
                  {/* Nombre de la categoría (clickeable) */}
                  <button
                    onClick={() => {
                      onCategoryChange(category._id);
                      if (!isCategoryExpanded(category._id)) {
                        toggleCategory(category._id);
                      }
                    }}
                    className={`flex-1 text-left py-2 transition-colors ${
                      selectedCategory === category._id 
                        ? 'text-red-600 font-medium' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{category.name}</span>
                      {hierarchicalCategories[category._id] && (
                        <span className="text-xs text-gray-400">
                          {hierarchicalCategories[category._id].length}
                        </span>
                      )}
                    </div>
                  </button>
                </div>
                
                {/* Subcategorías (solo si está expandido) */}
                {isCategoryExpanded(category._id) && hierarchicalCategories[category._id] && (
                  <div className="mt-2 mb-2 ml-4 border-l border-gray-200 pl-2">
                    {renderCategoryHierarchy(hierarchicalCategories[category._id], 0)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>



      {/* Marcas */}
      <div>
        <button
          onClick={() => toggleSection('brands')}
          className="w-full flex items-center justify-between text-left mb-6 pb-2 border-b border-gray-200"
        >
          <h4 className="text-base font-medium text-gray-900">Marcas</h4>
          {expandedSections.brands ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {expandedSections.brands && (
          <div className="space-y-1">
            <label className="flex items-center cursor-pointer py-2">
              <input
                type="radio"
                name="brand"
                checked={selectedBrand === ''}
                onChange={() => {
                  console.log('🏷️ Limpiando filtro de marca')
                  onBrandChange('')
                }}
                className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500 mr-3"
              />
              <span className={`text-sm transition-colors ${
                selectedBrand === '' ? 'text-red-600 font-medium' : 'text-gray-600'
              }`}>
                Todas las marcas
              </span>
            </label>
            
            {brands.map((brand) => (
              <label key={brand._id} className="flex items-center cursor-pointer py-2">
                <input
                  type="radio"
                  name="brand"
                  checked={selectedBrand === brand.name}
                  onChange={() => {
                    console.log('🏷️ Cambiando marca a:', brand.name)
                    onBrandChange(brand.name)
                  }}
                  className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500 mr-3"
                />
                <span className={`text-sm transition-colors ${
                  selectedBrand === brand.name ? 'text-red-600 font-medium' : 'text-gray-600'
                }`}>
                  {brand.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Colores */}
      {colors.length > 0 && (
        <div>
          <button
            onClick={() => toggleSection('colors')}
            className="w-full flex items-center justify-between text-left mb-6 pb-2 border-b border-gray-200"
          >
            <h4 className="text-base font-medium text-gray-900">Colores</h4>
            {expandedSections.colors ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {expandedSections.colors && (
            <div className="space-y-1">
              <label className="flex items-center cursor-pointer py-2">
                <input
                  type="radio"
                  name="color"
                  checked={selectedColor === ''}
                  onChange={() => onColorChange('')}
                  className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500 mr-3"
                />
                <span className={`text-sm transition-colors ${
                  selectedColor === '' ? 'text-red-600 font-medium' : 'text-gray-600'
                }`}>
                  Todos los colores
                </span>
              </label>
              
              {colors.map((color) => (
                <label key={color} className="flex items-center cursor-pointer py-2">
                  <input
                    type="radio"
                    name="color"
                    checked={selectedColor === color}
                    onChange={() => onColorChange(color)}
                    className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500 mr-3"
                  />
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                      style={{ 
                        backgroundColor: colorMap[color] || '#CCCCCC',
                        ...(color.toLowerCase().includes('blanco') ? { border: '1px solid #D1D5DB' } : {})
                      }}
                    ></div>
                    <span className={`text-sm transition-colors ${
                      selectedColor === color ? 'text-red-600 font-medium' : 'text-gray-600'
                    }`}>
                      {color}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}