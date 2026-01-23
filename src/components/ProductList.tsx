'use client'

import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Edit, Eye, Plus, Search, Filter, ChevronLeft, ChevronRight, X, RotateCcw, Star } from 'lucide-react'
import { getMainImage, getOptimizedImageUrl } from '@/utils/imageUtils'
import { useSearchDebounce } from '@/hooks/useDebounce'
import { useCategoryFilters } from '@/hooks/useCategoryFilters'
import Notice from '@/components/ui/Notice'

interface Product {
  _id: string
  name: string
  sku: string
  category: string
  brand: string
  brandSlug?: string
  description?: string
  attributes?: Array<{ name: string; value: string }> | string
  measurements?: {
    enabled: boolean
    unit: string
    description: string
    availableSizes: string[]
  }
  colorVariants?: Array<{
    colorName: string
    colorCode: string
    image?: string
    sku: string
    active: boolean
  }>
  defaultImage?: string
  active: boolean
  featured?: boolean
  createdAt: string
}

interface ProductListProps {
  onEdit?: (product: Product) => void
  onView?: (product: Product) => void
  onDelete?: (productId: string) => void
}

// Componente memoizado para cada producto para evitar re-renders
const ProductItem = memo(({ 
  product, 
  onView, 
  onEdit, 
  onDelete,
  onToggleFeatured,
  getActiveColorVariants 
}: {
  product: Product
  onView: () => void
  onEdit: () => void  
  onDelete: (product: Product) => void
  onToggleFeatured: (product: Product) => void
  getActiveColorVariants: (product: Product) => any[]
}) => {
  return (
    <div className="group flex items-center gap-6 p-4 hover:bg-gray-50/50 rounded-lg transition-all duration-200">
      {/* Imagen del producto */}
      <div className="flex-shrink-0">
        <div className="h-16 w-16 relative">
          {(() => {
            const rawMainImage = getMainImage(product);
            const mainImage = rawMainImage ? getOptimizedImageUrl(rawMainImage, 300, 200) : null;
            
            if (mainImage) {
              return (
                <img
                  className="h-16 w-16 rounded-lg object-cover border border-gray-200 group-hover:shadow-md transition-all duration-200"
                  src={mainImage}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              );
            }
            
            return (
              <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
                </svg>
              </div>
            );
          })()}
        </div>
      </div>
      
      {/* Información del producto */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-gray-700 transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {product.sku}
              </span>
              {product.brand && (
                <span className="text-xs text-gray-600">
                  {product.brand}
                </span>
              )}
              {/* Colores */}
              {getActiveColorVariants(product).length > 0 && (
                <div className="flex items-center gap-1">
                  {getActiveColorVariants(product).slice(0, 3).map((variant, index) => (
                    <div 
                      key={index}
                      className="w-4 h-4 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: variant.colorCode || '#f3f4f6' }}
                      title={variant.colorName}
                    />
                  ))}
                  {getActiveColorVariants(product).length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{getActiveColorVariants(product).length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
            {product.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                {product.description.length > 100 ? product.description.substring(0, 100) + '...' : product.description}
              </p>
            )}
          </div>
          
          {/* Estado y acciones */}
          <div className="flex items-center gap-3 ml-4">
            {/* Estado */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                product.active 
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  product.active ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                {product.active ? 'Activo' : 'Inactivo'}
              </span>
              {product.featured && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  ⭐ Destacado
                </span>
              )}
            </div>
            
            {/* Acciones */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onToggleFeatured(product)}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  product.featured
                    ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50'
                    : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                }`}
                title={product.featured ? 'Quitar de destacados' : 'Marcar como destacado'}
              >
                <Star size={16} fill={product.featured ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={onView}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                title="Ver producto"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                title="Editar producto"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onDelete(product)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                title="Eliminar producto"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default function ProductList({ onEdit, onView, onDelete }: ProductListProps) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Búsqueda con debounce optimizada
  const { searchTerm, debouncedSearchTerm, setSearchTerm } = useSearchDebounce('', 500) // Incrementado a 500ms
  
  // Filtros jerárquicos de categorías
  const {
    allCategories,
    getAvailableCategories,
    selectCategory,
    clearFilterFromLevel,
    clearAllFilters: clearCategoryFilters,
    getSelectedCategoryId,
    getCategoryPath,
    hasActiveFilters: hasActiveCategoryFilters,
    selectedFilters: categoryFilters
  } = useCategoryFilters()
  
  // Otros filtros
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Paginación optimizada
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(25) // Incrementado para mejor rendimiento
  const [totalProducts, setTotalProducts] = useState(0)
  
  // Marcas para filtros (cargadas una sola vez)
  const [brands, setBrands] = useState<string[]>([])
  
  // Etiquetas para los niveles de categorías
  const levelLabels = [
    { label: 'Categoría Principal' },
    { label: 'Subcategoría' },
    { label: 'Tipo de Producto' },
    { label: 'Variante' }
  ]
  
  // Modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; message: string } | null>(null)

  // Ref para el input de búsqueda
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Cargar productos optimizado para servidor
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: productsPerPage.toString(),
        sortBy: sortBy,
        sortOrder: sortOrder
      })
      
      // Enviar todos los filtros al servidor
      if (debouncedSearchTerm.trim()) {
        params.append('search', debouncedSearchTerm.trim())
      }
      
      const selectedCategoryId = getSelectedCategoryId()
      if (selectedCategoryId) {
        params.append('category', selectedCategoryId)
      }
      
      if (selectedBrand) {
        params.append('brand', selectedBrand)
      }
      
      if (selectedStatus !== 'all') {
        params.append('active', selectedStatus === 'active' ? 'true' : 'false')
      }
      
      if (showFeaturedOnly) {
        params.append('featured', 'true')
      }
      
      const url = `/api/products?${params}`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Error cargando productos')
      
      const data = await response.json()
      if (data.success) {
        // El servidor ya devuelve los datos filtrados, ordenados y paginados
        setProducts(data.data.products || [])
        setTotalProducts(data.data.pagination?.total || 0)
      } else {
        throw new Error(data.error || 'Error en la respuesta')
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [currentPage, debouncedSearchTerm, getSelectedCategoryId, selectedBrand, selectedStatus, showFeaturedOnly, sortBy, sortOrder, productsPerPage])

  // Cargar marcas para filtros (solo una vez)
  const fetchBrands = useCallback(async () => {
    try {
      const brandsRes = await fetch('/api/brands')
      
      if (brandsRes.ok) {
        const brandsData = await brandsRes.json()
        
        if (Array.isArray(brandsData)) {
          const brandNames = brandsData.map((brand: any) => brand.name)
          setBrands(brandNames)
        } else if (brandsData.data && brandsData.data.brands && Array.isArray(brandsData.data.brands)) {
          const brandNames = brandsData.data.brands.map((brand: any) => brand.name)
          setBrands(brandNames)
        } else if (brandsData.data && Array.isArray(brandsData.data)) {
          const brandNames = brandsData.data.map((brand: any) => brand.name)
          setBrands(brandNames)
        } else {
          setBrands([])
        }
      }
    } catch (err) {
      console.error('Error cargando marcas:', err)
    }
  }, [])

  useEffect(() => {
    fetchBrands()
  }, [fetchBrands])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm, getSelectedCategoryId, selectedBrand, selectedStatus, showFeaturedOnly])

  // Memoizar cálculos costosos
  const getActiveColorVariants = useCallback((product: Product) => {
    return product.colorVariants?.filter(variant => variant.active) || []
  }, [])

  // Memoizar el cálculo de páginas para evitar re-renders
  const totalPages = useMemo(() => {
    return Math.ceil(totalProducts / productsPerPage)
  }, [totalProducts, productsPerPage])

  // Memoizar la función de limpiar filtros
  const clearFilters = useCallback(() => {
    setSearchTerm('')
    clearCategoryFilters()
    setSelectedBrand('')
    setSelectedStatus('all')
    setShowFeaturedOnly(false)
    setSortBy('name')
    setSortOrder('asc')
    setCurrentPage(1)
  }, [setSearchTerm, clearCategoryFilters])

  const handleDeleteClick = useCallback((product: Product) => {
    setProductToDelete(product)
    setShowDeleteModal(true)
  }, [])

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/products/${productToDelete._id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchProducts()
        setShowDeleteModal(false)
        setProductToDelete(null)
        setNotice({ type: 'success', message: 'Producto eliminado correctamente.' })
        
        if (onDelete) {
          onDelete(productToDelete._id)
        }
      } else {
        throw new Error('Error al eliminar el producto')
      }
    } catch (err) {
      setNotice({ type: 'error', message: err instanceof Error ? err.message : 'Error al eliminar producto' })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setProductToDelete(null)
  }

  // Función para toggle de destacado
  const handleToggleFeatured = async (product: Product) => {
    try {
      const newFeaturedValue = !product.featured;
      const response = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          featured: newFeaturedValue
        })
      })
      
      if (response.ok) {
        // Actualizar el producto en el estado local inmediatamente
        setProducts(prevProducts => 
          prevProducts.map(p => 
            p._id === product._id 
              ? { ...p, featured: newFeaturedValue }
              : p
          )
        )
        // Recargar productos para asegurar sincronización con la BD
        await fetchProducts()
        setNotice({ type: 'success', message: newFeaturedValue ? 'Producto marcado como destacado.' : 'Producto removido de destacados.' })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar el producto')
      }
    } catch (err) {
      console.error('Error al actualizar destacado:', err)
      setNotice({ type: 'error', message: err instanceof Error ? err.message : 'Error al actualizar producto' })
      // Revertir cambio local si falló
      await fetchProducts()
    }
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button
          onClick={fetchProducts}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header limpio y minimalista */}
      <div className="border-b border-gray-100">
        <div className="px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Productos</h1>
              <p className="text-gray-500 mt-1">{totalProducts} productos en total</p>
            </div>
            
            <button 
              onClick={() => router.push('/admin/productos/nuevo')}
              className="bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium cursor-pointer"
            >
              <Plus size={18} />
              Nuevo Producto
            </button>
          </div>
          {notice && (
            <Notice
              type={notice.type}
              message={notice.message}
              onClose={() => setNotice(null)}
              className="mt-4"
            />
          )}
        </div>
      </div>

      {/* Filtros modernos y mejorados */}
      <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
        <div className="space-y-5">
          {/* Barra de búsqueda principal mejorada */}
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar por nombre, SKU o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all bg-white shadow-sm hover:shadow-md"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Chips de filtros activos */}
          {(searchTerm || hasActiveCategoryFilters || selectedBrand || selectedStatus !== 'all' || showFeaturedOnly) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Filtros activos:</span>
              {searchTerm && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm">
                  <span>Búsqueda: "{searchTerm}"</span>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-blue-500 hover:text-blue-700 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {hasActiveCategoryFilters && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm">
                  <span>{getCategoryPath()}</span>
                  <button
                    onClick={clearCategoryFilters}
                    className="text-purple-500 hover:text-purple-700 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {selectedBrand && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm">
                  <span>Marca: {selectedBrand}</span>
                  <button
                    onClick={() => setSelectedBrand('')}
                    className="text-green-500 hover:text-green-700 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {selectedStatus !== 'all' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm">
                  <span>Estado: {selectedStatus === 'active' ? 'Activos' : 'Inactivos'}</span>
                  <button
                    onClick={() => setSelectedStatus('all')}
                    className="text-amber-500 hover:text-amber-700 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {showFeaturedOnly && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                  <Star size={14} className="fill-current" />
                  <span>Destacados</span>
                  <button
                    onClick={() => setShowFeaturedOnly(false)}
                    className="text-yellow-500 hover:text-yellow-700 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {(searchTerm || hasActiveCategoryFilters || selectedBrand || selectedStatus !== 'all' || showFeaturedOnly) && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Limpiar todo</span>
                </button>
              )}
            </div>
          )}

          {/* Filtros organizados en grupos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {/* Grupo: Categorías */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Categorías</label>
              <div className="space-y-2">
                {[0, 1, 2, 3].map((level) => {
                  const availableCategories = getAvailableCategories(level)
                  const currentFilter = categoryFilters.find(f => f.level === level)
                  
                  if (level > 0 && !categoryFilters.find(f => f.level === level - 1)) {
                    return null
                  }
                  
                  if (availableCategories.length === 0) return null
                  
                  return (
                    <select
                      key={level}
                      value={currentFilter?.categoryId || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          const selectedCategory = availableCategories.find(cat => cat._id === e.target.value)
                          if (selectedCategory) {
                            selectCategory(level, selectedCategory._id, selectedCategory.name)
                          }
                        } else {
                          clearFilterFromLevel(level)
                        }
                      }}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/30 focus:border-red-500 bg-white transition-all text-sm cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <option value="">
                        {levelLabels[level].label}
                      </option>
                      {availableCategories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  )
                })}
              </div>
            </div>

            {/* Grupo: Marca y Estado */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Marca</label>
              {brands.length > 0 ? (
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/30 focus:border-red-500 bg-white transition-all text-sm cursor-pointer shadow-sm hover:shadow-md"
                >
                  <option value="">Todas las marcas</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              ) : (
                <div className="px-3 py-2.5 text-sm text-gray-400 bg-gray-100 rounded-lg">Sin marcas</div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/30 focus:border-red-500 bg-white transition-all text-sm cursor-pointer shadow-sm hover:shadow-md"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>

            {/* Grupo: Destacados */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Destacados</label>
              <label className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg bg-white cursor-pointer select-none shadow-sm hover:shadow-md transition-all hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={showFeaturedOnly}
                  onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500/20"
                />
                <Star size={16} className={showFeaturedOnly ? 'text-amber-500 fill-current' : 'text-gray-400'} />
                <span className="text-sm text-gray-700">Solo destacados</span>
              </label>
            </div>

            {/* Grupo: Ordenamiento */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ordenar por</label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/30 focus:border-red-500 bg-white transition-all text-sm cursor-pointer shadow-sm hover:shadow-md"
                >
                  <option value="name">Nombre</option>
                  <option value="brand">Marca</option>
                  <option value="createdAt">Fecha</option>
                  <option value="sku">SKU</option>
                </select>
                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-sm cursor-pointer shadow-sm hover:shadow-md bg-white"
                  title={sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de productos optimizada */}
      <div className="px-8 py-6">
        {/* Header de resultados */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-600">
            Mostrando {products.length} de {totalProducts} productos
          </p>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
              Actualizando...
            </div>
          )}
        </div>

        {/* Grid de productos optimizado */}
        <div className="space-y-4">
          {products.map((product) => (
            <ProductItem
              key={product._id}
              product={product}
              onView={() => router.push(`/admin/productos/${product._id}`)}
              onEdit={() => router.push(`/admin/productos/${product._id}/editar`)}
              onDelete={handleDeleteClick}
              onToggleFeatured={handleToggleFeatured}
              getActiveColorVariants={getActiveColorVariants}
            />
          ))}
        </div>

        {/* Paginación minimalista */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              
              {/* Páginas */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm rounded transition-all cursor-pointer ${
                        page === currentPage
                          ? 'bg-red-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {products.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-300 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              {searchTerm || hasActiveCategoryFilters || selectedBrand 
                ? 'No se encontraron productos con los filtros aplicados.'
                : 'Comienza agregando tu primer producto al catálogo.'
              }
            </p>
            {searchTerm || hasActiveCategoryFilters || selectedBrand ? (
              <button
                onClick={clearFilters}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Limpiar filtros
              </button>
            ) : (
              <button 
                onClick={() => router.push('/admin/productos/nuevo')}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
              >
                Crear primer producto
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && productToDelete && (
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
                  <h3 className="text-lg font-medium text-gray-900">
                    Eliminar Producto
                  </h3>
                  <p className="text-sm text-gray-500">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700">
                  ¿Estás seguro de que deseas eliminar el producto{' '}
                  <span className="font-medium text-gray-900">"{productToDelete.name}"</span>?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  SKU: {productToDelete.sku}
                </p>
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
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
    </div>
  )
}