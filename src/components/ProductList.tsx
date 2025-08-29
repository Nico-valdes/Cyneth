'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Edit, Eye, Plus, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { getMainImage, getOptimizedImageUrl } from '@/utils/imageUtils'

interface Product {
  _id: string
  name: string
  sku: string
  category: string
  categorySlug: string
  subcategory?: string
  subcategorySlug?: string
  categoryBreadcrumb?: string
  brand: string
  brandSlug?: string
  description?: string
  attributes?: Array<{ name: string; value: string }> | string // Atributos estructurados o string legacy
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

export default function ProductList({ onEdit, onView, onDelete }: ProductListProps) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(15)
  const [totalProducts, setTotalProducts] = useState(0)
  
  // Categorías y marcas para filtros
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [brands, setBrands] = useState<string[]>([])
  
  // Modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Ref para el input de búsqueda
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Debounce para búsqueda usando useCallback para mantener la referencia estable
  const debouncedSearchUpdate = useCallback(
    (term: string) => {
      const timer = setTimeout(() => {
        setDebouncedSearchTerm(term)
      }, 300)
      return () => clearTimeout(timer)
    },
    []
  )

  useEffect(() => {
    const cleanup = debouncedSearchUpdate(searchTerm)
    return cleanup
  }, [searchTerm, debouncedSearchUpdate])

  // Cargar productos
  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: productsPerPage.toString()
      })
      
      // Solo agregar parámetros que tienen valor
      if (debouncedSearchTerm.trim()) params.append('search', debouncedSearchTerm.trim())
      if (selectedCategory) {
        // El campo category en productos almacena el ID de la categoría, no el nombre
        const category = categories.find(cat => cat.name === selectedCategory)
        if (category && category._id) {
          params.append('category', category._id)
        }
      }
      if (selectedSubcategory) {
        // El campo subcategory en productos almacena el ID de la subcategoría, no el nombre
        const subcategory = subcategories.find(sub => sub.name === selectedSubcategory)
        if (subcategory && subcategory._id) {
          params.append('subcategory', subcategory._id)
        }
      }
      if (selectedBrand) params.append('brand', selectedBrand)
      if (!showActiveOnly) params.append('active', 'false')
      
      const response = await fetch(`/api/products?${params}`)
      if (!response.ok) throw new Error('Error cargando productos')
      
      const data = await response.json()
      if (data.success) {
        console.log('📦 Productos recibidos de la API:', data.data.products);
        // Debug: verificar estructura de cada producto
        data.data.products.forEach((product: any, index: number) => {
          console.log(`🔍 Producto ${index + 1}:`, {
            name: product.name,
            defaultImage: product.defaultImage,
            colorVariants: product.colorVariants,
            hasDefaultImage: !!product.defaultImage,
            hasColorVariants: !!(product.colorVariants && product.colorVariants.length > 0)
          });
        });
        setProducts(data.data.products || [])
        setTotalProducts(data.data.pagination.total || 0)
      } else {
        throw new Error(data.error || 'Error en la respuesta')
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  // Cargar categorías, subcategorías y marcas para filtros
  const fetchFilters = async () => {
    try {
      const [categoriesRes, subcategoriesRes, brandsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/subcategories'),
        fetch('/api/brands')
      ])
      
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        console.log('Categories response:', categoriesData) // Debug
        
        // Verificar si es un array o tiene una estructura específica
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData)
        } else if (categoriesData.data && categoriesData.data.categories && Array.isArray(categoriesData.data.categories)) {
          setCategories(categoriesData.data.categories)
        } else if (categoriesData.data && Array.isArray(categoriesData.data)) {
          setCategories(categoriesData.data)
        } else {
          console.warn('Formato de categorías no reconocido:', categoriesData)
          setCategories([])
        }
      }

      if (subcategoriesRes.ok) {
        const subcategoriesData = await subcategoriesRes.json()
        console.log('Subcategories response:', subcategoriesData) // Debug
        
        if (Array.isArray(subcategoriesData)) {
          setSubcategories(subcategoriesData)
        } else if (subcategoriesData.data && subcategoriesData.data.subcategories && Array.isArray(subcategoriesData.data.subcategories)) {
          setSubcategories(subcategoriesData.data.subcategories)
        } else if (subcategoriesData.data && Array.isArray(subcategoriesData.data)) {
          setSubcategories(subcategoriesData.data)
        } else {
          console.warn('Formato de subcategorías no reconocido:', subcategoriesData)
          setSubcategories([])
        }
      }
      
      if (brandsRes.ok) {
        const brandsData = await brandsRes.json()
        console.log('Brands response:', brandsData) // Debug
        
        // Verificar si es un array o tiene una estructura específica
        if (Array.isArray(brandsData)) {
          setBrands(brandsData.map((brand: any) => brand.name))
        } else if (brandsData.data && brandsData.data.brands && Array.isArray(brandsData.data.brands)) {
          setBrands(brandsData.data.brands.map((brand: any) => brand.name))
        } else if (brandsData.data && Array.isArray(brandsData.data)) {
          setBrands(brandsData.data.map((brand: any) => brand.name))
        } else {
          console.warn('Formato de marcas no reconocido:', brandsData)
          setBrands([])
        }
      }
    } catch (err) {
      console.error('Error cargando filtros:', err)
    }
  }

  // Cargar datos al montar componente
  useEffect(() => {
    fetchFilters()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [currentPage, debouncedSearchTerm, selectedCategory, selectedSubcategory, selectedBrand, showActiveOnly])

  // Reset página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm, selectedCategory, selectedSubcategory, selectedBrand, showActiveOnly])

  // Calcular paginación
  const totalPages = Math.ceil(totalProducts / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage + 1
  const endIndex = Math.min(currentPage * productsPerPage, totalProducts)

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Obtener imagen principal del producto
  const getMainImage = (product: Product) => {
    console.log('getMainImage llamado para:', product.name);
    console.log('  defaultImage:', product.defaultImage);
    console.log('  colorVariants:', product.colorVariants);
    console.log('  defaultImage length:', product.defaultImage?.length);
    console.log('  defaultImage truthy:', !!product.defaultImage);
    
    // Si tiene variantes de color, mostrar la imagen de la primera variante activa
    if (product.colorVariants && product.colorVariants.length > 0) {
      const activeVariant = product.colorVariants.find(variant => variant.active)
      if (activeVariant && activeVariant.image) {
        const optimizedUrl = getOptimizedImageUrl(activeVariant.image, 300, 200);
        console.log('  Retornando imagen de variante (optimizada):', optimizedUrl);
        return optimizedUrl;
      }
    }
    
    // Si no hay variantes de color, usar la imagen por defecto
    if (product.defaultImage && product.defaultImage.trim() !== '') {
      const optimizedUrl = getOptimizedImageUrl(product.defaultImage, 300, 200);
      console.log('  Retornando defaultImage (optimizada):', optimizedUrl);
      return optimizedUrl;
    }
    
    console.log('  No hay imagen disponible');
    return null
  }

  // Obtener todas las variantes de color activas
  const getActiveColorVariants = (product: Product) => {
    return product.colorVariants?.filter(variant => variant.active) || []
  }

  // Obtener SKU principal del producto
  const getMainSku = (product: Product) => {
    return product.sku
  }

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedSubcategory('')
    setSelectedBrand('')
    setShowActiveOnly(true)
    setCurrentPage(1)
  }

  // Obtener información de medidas del producto
  const getMeasurementsInfo = (product: Product) => {
    if (product.measurements?.enabled && product.measurements.availableSizes?.length > 0) {
      return product.measurements.availableSizes.join(', ')
    }
    return null
  }

  // Manejar eliminación de producto
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/products/${productToDelete._id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Actualizar la lista de productos
        await fetchProducts()
        setShowDeleteModal(false)
        setProductToDelete(null)
        
        // Llamar callback si existe
        if (onDelete) {
          onDelete(productToDelete._id)
        }
      } else {
        throw new Error('Error al eliminar el producto')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar producto')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setProductToDelete(null)
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
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header con filtros - diseño minimalista */}
      <div className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Productos</h2>
            <p className="text-gray-600 mt-1">
              {totalProducts} producto{totalProducts !== 1 ? 's' : ''} registrados
            </p>
          </div>
          
          <button 
            onClick={() => router.push('/admin/productos/nuevo')}
            className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all flex items-center gap-2 font-medium shadow-sm"
          >
            <Plus size={18} />
            Nuevo Producto
          </button>
        </div>

        {/* Filtros minimalistas */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white transition-colors"
            />
          </div>

          {/* Filtro por categoría */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setSelectedSubcategory('') // Reset subcategoría cuando cambia categoría
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white transition-colors min-w-[140px]"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category._id || category} value={category.name || category}>
                {category.name || category}
              </option>
            ))}
          </select>

          {/* Filtro por subcategoría */}
          <select
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white transition-colors min-w-[140px]"
          >
            <option value="">Todas las subcategorías</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory._id || subcategory} value={subcategory.name || subcategory}>
                {subcategory.name || subcategory}
              </option>
            ))}
          </select>

          {/* Filtro por marca */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white transition-colors min-w-[120px]"
          >
            <option value="">Todas las marcas</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>

          {/* Botón limpiar */}
          {(searchTerm || selectedCategory || selectedSubcategory || selectedBrand) && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
            >
              <Filter size={14} />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Tabla de productos - diseño compacto */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Colores
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Marca
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                {/* Columna de Imagen */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex-shrink-0 h-12 w-12 relative">
                    {(() => {
                      const mainImage = getMainImage(product);
                      console.log(`Renderizando imagen para ${product.name}:`, mainImage);
                      
                      if (mainImage) {
                        return (
                          <>
                            <img
                              className="h-12 w-12 rounded object-cover border border-gray-200"
                              src={mainImage}
                              alt={product.name}
                              onError={(e) => {
                                console.log('Error cargando imagen:', mainImage);
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                              onLoad={() => {
                                console.log('Imagen cargada exitosamente:', mainImage);
                              }}
                            />

                            {/* Fallback si la imagen falla */}
                            <div className="hidden h-12 w-12 rounded bg-gray-100 flex items-center justify-center border border-gray-200">
                              <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          </>
                        );
                      } else {
                        return (
                          <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center border border-gray-200">
                            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </td>
                
                {/* Columna de Nombre */}
                <td className="px-4 py-3">
                  <div className="max-w-xs">
                    <div className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</div>
                    {product.description && (
                      <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                        {product.description.length > 50 ? product.description.substring(0, 50) + '...' : product.description}
                      </div>
                    )}
                  </div>
                </td>
                
                {/* Columna de SKU */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-xs font-mono text-gray-800">{getMainSku(product)}</div>
                </td>
                
                {/* Columna de Variantes de Color */}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {getActiveColorVariants(product).length > 0 ? (
                      getActiveColorVariants(product).slice(0, 3).map((variant, index) => (
                        <div 
                          key={index}
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: variant.colorCode || '#f3f4f6' }}
                          title={variant.colorName}
                        />
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                    {getActiveColorVariants(product).length > 3 && (
                      <span className="text-xs text-gray-500">+{getActiveColorVariants(product).length - 3}</span>
                    )}
                  </div>
                </td>
                
                {/* Columna de Categoría */}
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900 max-w-32">
                    {(() => {
                      // Debug: Mostrar información de categoría
                      console.log('Producto:', product.name, 'CategoryBreadcrumb:', product.categoryBreadcrumb, 'Category:', product.category, 'Subcategory:', product.subcategory);
                      
                      if (product.categoryBreadcrumb) {
                        return (
                          <div className="text-xs leading-tight line-clamp-2">
                            {product.categoryBreadcrumb.replace(/ > /g, ' › ')}
                          </div>
                        );
                      } else {
                        return (
                          <div>
                            <div className="font-medium text-xs">{product.category}</div>
                            {product.subcategory && (
                              <div className="text-xs text-gray-500">{product.subcategory}</div>
                            )}
                          </div>
                        );
                      }
                    })()}
                  </div>
                </td>
                
                {/* Columna de Marca */}
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700">
                  {product.brand || '—'}
                </td>
                
                {/* Columna de Estado */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      product.active 
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {product.active ? 'Activo' : 'Inactivo'}
                    </span>
                    {product.featured && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700">
                        ★
                      </span>
                    )}
                  </div>
                </td>
                {/* Columna de Acciones */}
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => router.push(`/admin/productos/${product._id}`)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                      title="Ver producto"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => router.push(`/admin/productos/${product._id}/editar`)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                      title="Editar producto"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(product)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded"
                      title="Eliminar producto"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación - diseño minimalista */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50/30 border-t border-gray-100">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2.5 border border-gray-200 text-sm font-medium rounded-xl text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2.5 border border-gray-200 text-sm font-medium rounded-xl text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Mostrando <span className="font-semibold text-gray-800">{(currentPage - 1) * productsPerPage + 1}</span> a{' '}
                <span className="font-semibold text-gray-800">
                  {Math.min(currentPage * productsPerPage, totalProducts)}
                </span>{' '}
                de <span className="font-semibold text-gray-800">{totalProducts}</span> productos
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-xl shadow-sm border border-gray-200 bg-white" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-3 py-2.5 rounded-l-xl text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2.5 text-sm font-medium transition-all ${
                      page === currentPage
                        ? 'z-10 bg-red-50 text-red-600 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-3 py-2.5 rounded-r-xl text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {products.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="text-gray-300 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-700 mb-2">No hay productos</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            {searchTerm || selectedCategory || selectedBrand 
              ? 'No se encontraron productos con los filtros aplicados. Intenta ajustar los criterios de búsqueda.'
              : 'Comienza agregando tu primer producto al catálogo.'
            }
          </p>
          {searchTerm || selectedCategory || selectedBrand ? (
            <button
              onClick={clearFilters}
              className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all font-medium shadow-sm"
            >
              Limpiar filtros
            </button>
          ) : (
            <button 
              onClick={() => router.push('/admin/productos/nuevo')}
              className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all font-medium shadow-sm"
            >
              Crear producto
            </button>
          )}
        </div>
      )}
      
      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-600" />
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
                <p className="text-sm text-gray-700">
                  ¿Estás seguro de que deseas eliminar el producto{' '}
                  <span className="font-medium text-gray-900">"{productToDelete.name}"</span>?
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  SKU: {productToDelete.sku}
                </p>
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
