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
        <div key={category._id} className="group">
          {/* Contenedor principal de la categoría */}
          <div className="flex items-center relative">
            {/* Línea de conexión para jerarquía visual */}
            {level > 0 && (
              <div 
                className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-gray-200 to-transparent"
                style={{ left: `${(level - 1) * 16 + 8}px` }}
              />
            )}
            
            {/* Botón de expansión/colapso mejorado */}
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategory(category._id);
                }}
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full mr-2 transition-all duration-200 cursor-pointer"
                style={{ marginLeft: `${level * 16}px` }}
              >
                <div className={`transition-transform duration-200 ${
                  isExpanded ? 'rotate-0' : '-rotate-90'
                }`}>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                </div>
              </button>
            )}
            
            {/* Espaciado para categorías sin hijos con indicador visual */}
            {!hasChildren && (
              <div 
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center mr-2"
                style={{ marginLeft: `${level * 16}px` }}
              >
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
              </div>
            )}
            
            {/* Botón de la categoría con indicación simplista */}
             <button
               onClick={() => {
                 onCategoryChange(category._id);
               }}
               className={`flex-1 text-left py-2 transition-colors cursor-pointer ${
                 isSelected 
                   ? 'text-red-600 font-medium' 
                   : 'text-gray-700 hover:text-gray-900'
               }`}
             >
               <span className="text-sm tracking-wide">
                 {category.name}
               </span>
             </button>
          </div>
          
          {/* Categorías hijas con mejor espaciado */}
          {hasChildren && isExpanded && category.children && (
            <div className="mt-2 mb-2 relative">
              {renderCategoryHierarchy(category.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Categorías */}
      <div>
        <button
          onClick={() => toggleSection('categories')}
          className="w-full flex items-center justify-between text-left mb-4 pb-3 border-b border-gray-100 cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-[1px] h-4 bg-gray-300"></div>
            <h4 className="text-xs font-light text-gray-900 tracking-wider uppercase">Categorías</h4>
          </div>
          {expandedSections.categories ? (
            <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          )}
        </button>

        {expandedSections.categories && (
          <div className="space-y-1">

            
            {/* Categorías principales con subcategorías integradas */}
            {categories.filter(cat => cat.type === 'main').map((category) => (
              <div key={category._id} className="group">
                {/* Categoría principal */}
                <div className="flex items-center relative">
                  {/* Botón de expansión mejorado */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategory(category._id);
                    }}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-full mr-3 transition-all duration-200 group-hover:bg-gray-100 cursor-pointer"
                  >
                    {isCategoryLoading(category._id) ? (
                      <div className="w-4 h-4 animate-spin border-2 border-gray-200 border-t-gray-600 rounded-full"></div>
                    ) : (
                      <div className={`transition-transform duration-200 ${
                        isCategoryExpanded(category._id) ? 'rotate-0' : '-rotate-90'
                      }`}>
                        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                      </div>
                    )}
                  </button>
                  
                  {/* Nombre de la categoría principal simplificado */}
                   <button
                     onClick={() => {
                       onCategoryChange(category._id);
                       if (!isCategoryExpanded(category._id)) {
                         toggleCategory(category._id);
                       }
                     }}
                     className={`flex-1 text-left py-2 transition-colors cursor-pointer ${
                       selectedCategory === category._id 
                         ? 'text-red-600 font-medium' 
                         : 'text-gray-700 hover:text-gray-900'
                     }`}
                   >
                     <span className={`text-sm tracking-wide uppercase ${
                       selectedCategory === category._id ? 'font-medium' : 'font-light'
                     }`}>
                       {category.name}
                     </span>
                   </button>
                </div>
                
                {/* Subcategorías con mejor espaciado y transición */}
                {isCategoryExpanded(category._id) && hierarchicalCategories[category._id] && (
                  <div className="mt-3 mb-4 ml-6 relative animate-in slide-in-from-top-2 duration-200">
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-gray-300 via-gray-200 to-transparent" />
                    <div className="pl-4">
                      {renderCategoryHierarchy(hierarchicalCategories[category._id], 0)}
                    </div>
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
          className="w-full flex items-center justify-between text-left mb-4 pb-3 border-b border-gray-100 cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-[1px] h-4 bg-gray-300"></div>
            <h4 className="text-xs font-light text-gray-900 tracking-wider uppercase">Marcas</h4>
          </div>
          {expandedSections.brands ? (
            <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          )}
        </button>

        {expandedSections.brands && (
          <div className="space-y-0">
            <label className="flex items-center cursor-pointer py-2.5 group">
              <div className="relative mr-3">
                <input
                  type="radio"
                  name="brand"
                  checked={selectedBrand === ''}
                  onChange={() => {
                    console.log('🏷️ Limpiando filtro de marca')
                    onBrandChange('')
                  }}
                  className="w-3.5 h-3.5 text-gray-900 border-gray-300 focus:ring-gray-900 focus:ring-1 transition-all accent-gray-900"
                />
              </div>
              <span className={`text-sm transition-all duration-200 font-light tracking-wide ${
                selectedBrand === '' ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'
              }`}>
                Todas las marcas
              </span>
            </label>
            
            {brands.map((brand) => (
              <label key={brand._id} className="flex items-center cursor-pointer py-2.5 group">
                <div className="relative mr-3">
                  <input
                    type="radio"
                    name="brand"
                    checked={selectedBrand === brand.name}
                    onChange={() => {
                      console.log('🏷️ Cambiando marca a:', brand.name)
                      onBrandChange(brand.name)
                    }}
                    className="w-3.5 h-3.5 text-gray-900 border-gray-300 focus:ring-gray-900 focus:ring-1 transition-all accent-gray-900"
                  />
                </div>
                <span className={`text-sm transition-all duration-200 font-light tracking-wide ${
                  selectedBrand === brand.name ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'
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
            className="w-full flex items-center justify-between text-left mb-4 pb-3 border-b border-gray-100 cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-[1px] h-4 bg-gray-300"></div>
              <h4 className="text-xs font-light text-gray-900 tracking-wider uppercase">Colores</h4>
            </div>
            {expandedSections.colors ? (
              <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            )}
          </button>

          {expandedSections.colors && (
            <div className="space-y-0">
              <label className="flex items-center cursor-pointer py-2.5 group">
                <div className="relative mr-3">
                  <input
                    type="radio"
                    name="color"
                    checked={selectedColor === ''}
                    onChange={() => onColorChange('')}
                    className="w-3.5 h-3.5 text-gray-900 border-gray-300 focus:ring-gray-900 focus:ring-1 transition-all accent-gray-900"
                  />
                </div>
                <span className={`text-sm transition-all duration-200 font-light tracking-wide ${
                  selectedColor === '' ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'
                }`}>
                  Todos los colores
                </span>
              </label>
              
              {colors.map((color) => (
                <label key={color} className="flex items-center cursor-pointer py-2.5 group">
                  <div className="relative mr-3">
                    <input
                      type="radio"
                      name="color"
                      checked={selectedColor === color}
                      onChange={() => onColorChange(color)}
                      className="w-3.5 h-3.5 text-gray-900 border-gray-300 focus:ring-gray-900 focus:ring-1 transition-all accent-gray-900"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0 transition-all duration-200 border border-gray-200"
                      style={{ 
                        backgroundColor: colorMap[color] || '#CCCCCC'
                      }}
                    ></div>
                    <span className={`text-sm transition-all duration-200 font-light tracking-wide ${
                      selectedColor === color ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'
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