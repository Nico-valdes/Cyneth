'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Filter, Grid, List, ChevronDown, X } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import CatalogFilters from '@/components/CatalogFilters'
import { getMainImage } from '@/utils/imageUtils'
import Header from '@/components/layout/Header'

interface Product {
  _id: string
  name: string
  sku: string
  category: string // ID de la categoría en el modelo unificado
  brand: string
  brandSlug?: string
  description?: string
  attributes?: Array<{ name: string; value: string }>
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

function CatalogoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('name')

  // Leer parámetros de URL y aplicar filtros automáticamente
  useEffect(() => {
    const category = searchParams.get('category')
    const level = searchParams.get('level')
    const brand = searchParams.get('brand')
    const color = searchParams.get('color')
    const search = searchParams.get('search')
    
    console.log('🔗 Parámetros de URL:', { category, level, brand, color, search })
    
    if (category) {
      console.log('✅ Aplicando filtro de categoría:', category)
      setSelectedCategory(category)
    }
    if (brand) {
      setSelectedBrand(brand)
    }
    if (color) {
      setSelectedColor(color)
    }
    if (search) {
      setSearchTerm(search)
    }
  }, [searchParams])

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        const [productsRes, categoriesRes, allCategoriesRes, brandsRes] = await Promise.all([
          fetch('/api/products?active=true&limit=100'),
          fetch('/api/categories?type=main'), // Solo categorías principales
          fetch('/api/categories'), // Todas las categorías para filtrado
          fetch('/api/brands')
        ])

        if (productsRes.ok) {
          const productsData = await productsRes.json()
          setProducts(productsData.data?.products || [])
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData.data?.categories || [])
          console.log('📋 Categorías principales cargadas:', categoriesData.data?.categories?.length || 0);
        }

        if (allCategoriesRes.ok) {
          const allCategoriesData = await allCategoriesRes.json()
          setAllCategories(allCategoriesData.data?.categories || [])
        }

        if (brandsRes.ok) {
          const brandsData = await brandsRes.json()
          setBrands(brandsData.data?.brands || [])
        }
      } catch (error) {
        console.error('Error cargando datos del catálogo:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

    // Función para verificar si un producto coincide con la categoría seleccionada (jerarquía)
  const checkCategoryMatch = (productCategoryId: string, selectedCategoryId: string): boolean => {
    // Si no hay categoría seleccionada, mostrar todos
    if (!selectedCategoryId) return true;
    
    // Si la categoría del producto coincide exactamente con la seleccionada
    if (productCategoryId === selectedCategoryId) return true;
    
    // Buscar la categoría del producto
    const productCategory = allCategories.find(cat => cat._id === productCategoryId);
    if (!productCategory) return false;
    
    // Verificar si es descendiente de la categoría seleccionada
    let currentCategory = productCategory;
    while (currentCategory && currentCategory.parent) {
      if (currentCategory.parent === selectedCategoryId) {
        return true;
      }
      const parentCategory = allCategories.find(cat => cat._id === currentCategory.parent);
      if (!parentCategory) break;
      currentCategory = parentCategory;
    }
    
    return false;
  }

  // Filtrar productos con lógica jerárquica
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtrado jerárquico: buscar en categoría y sus descendientes
    const matchesCategory = !selectedCategory || checkCategoryMatch(product.category, selectedCategory)
    console.log(`🔍 Producto ${product.name}: categoría=${product.category}, seleccionada=${selectedCategory}, coincide=${matchesCategory}`)
    const matchesBrand = !selectedBrand || product.brand === selectedBrand
    console.log(`🏷️ Producto ${product.name}: brand=${product.brand}, seleccionada=${selectedBrand}, coincide=${matchesBrand}`)
    
    const matchesColor = !selectedColor || 
      (product.colorVariants && product.colorVariants.some(variant => 
        variant.colorName.toLowerCase().includes(selectedColor.toLowerCase())
      ))

    return matchesSearch && matchesCategory && matchesBrand && matchesColor
  })

  // Ordenar productos
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'brand':
        return a.brand.localeCompare(b.brand)
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      default:
        return 0
    }
  })

  // Obtener colores únicos de todos los productos
  const availableColors = [...new Set(
    products.flatMap(product => 
      product.colorVariants?.map(variant => variant.colorName) || []
    )
  )].sort()

  const clearFilters = () => {
    setSelectedCategory('')
    setSelectedBrand('')
    setSelectedColor('')
    setSearchTerm('')
  }

  const hasActiveFilters = selectedCategory || selectedBrand || selectedColor || searchTerm

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando catálogo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* Header del catálogo */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16">
            <h1 className="text-4xl font-light text-gray-900 tracking-wide uppercase text-center">Catálogo</h1>
            <p className="mt-6 text-gray-500 text-center font-light tracking-wide max-w-2xl mx-auto">
              Descubre nuestra colección cuidadosamente seleccionada
            </p>
          </div>
          
          {/* Móvil - Diseño optimizado */}
          <div className="lg:hidden space-y-4">
            {/* Búsqueda móvil */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-base"
              />
            </div>
            
            {/* Controles móvil */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-3 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-base cursor-pointer"
              >
                <option value="name">Alfabético</option>
                <option value="brand">Por Marca</option>
                <option value="newest">Más Recientes</option>
                <option value="oldest">Más Antiguos</option>
              </select>
              
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-colors cursor-pointer ${
                    viewMode === 'grid' 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-colors cursor-pointer ${
                    viewMode === 'list' 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="relative flex items-center px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {[selectedCategory, selectedBrand, selectedColor].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
            
            {/* Contador de productos móvil */}
            <div className="text-center text-sm text-gray-500">
              <span className="font-medium text-gray-900">{sortedProducts.length}</span> producto{sortedProducts.length !== 1 ? 's' : ''} encontrado{sortedProducts.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          {/* Desktop - Diseño contemporáneo */}
          <div className="hidden lg:flex lg:items-center lg:justify-between gap-8 py-6">
            <div className="text-sm text-gray-400 font-light tracking-wide">
              <span className="font-medium text-black">{sortedProducts.length}</span> productos
            </div>
            
            <div className="flex items-center gap-6">
              {/* Búsqueda desktop */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 border-0 border-b border-gray-200 bg-transparent focus:border-black focus:outline-none transition-all duration-300 w-72 text-sm font-light tracking-wide placeholder-gray-400"
                />
              </div>

              {/* Ordenar */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border-0 border-b border-gray-200 bg-transparent focus:border-black focus:outline-none transition-all duration-300 appearance-none cursor-pointer text-sm font-light tracking-wide text-gray-700 pr-8"
                >
                  <option value="name">Alfabético</option>
                  <option value="brand">Por Marca</option>
                  <option value="newest">Más Recientes</option>
                  <option value="oldest">Más Antiguos</option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Vista */}
              <div className="flex border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-all duration-200 cursor-pointer ${
                    viewMode === 'grid' 
                      ? 'bg-black text-white' 
                      : 'text-gray-400 hover:text-black hover:bg-gray-50'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-all duration-200 border-l border-gray-200 cursor-pointer ${
                    viewMode === 'list' 
                      ? 'bg-black text-white' 
                      : 'text-gray-400 hover:text-black hover:bg-gray-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filtros activos - Solo desktop */}
          {hasActiveFilters && (
            <div className="hidden lg:flex mt-8 flex-wrap items-center gap-3 pb-6 border-b border-gray-100">
              <span className="text-xs text-gray-400 font-light tracking-wider uppercase">Filtros aplicados:</span>
              {selectedCategory && (
                <span className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-900 text-sm font-light tracking-wide border border-gray-200">
                  {allCategories.find(c => c._id === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory('')} className="ml-3 hover:text-black transition-colors cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedBrand && (
                <span className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-900 text-sm font-light tracking-wide border border-gray-200">
                  {selectedBrand}
                  <button onClick={() => setSelectedBrand('')} className="ml-3 hover:text-black transition-colors cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedColor && (
                <span className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-900 text-sm font-light tracking-wide border border-gray-200">
                  {selectedColor}
                  <button onClick={() => setSelectedColor('')} className="ml-3 hover:text-black transition-colors cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-black font-light tracking-wider uppercase transition-colors duration-200 ml-2 cursor-pointer"
              >
                Limpiar todos
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex gap-16">
          {/* Sidebar de filtros */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white p-8 sticky top-8">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <h3 className="text-lg font-light text-gray-900 tracking-wide uppercase">Filtros</h3>
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-500 hover:text-black font-light tracking-wide transition-colors duration-200 uppercase cursor-pointer"
                >
                  Limpiar
                </button>
              </div>
              <CatalogFilters
                categories={allCategories}
                brands={brands}
                colors={availableColors}
                selectedCategory={selectedCategory}
                selectedBrand={selectedBrand}
                selectedColor={selectedColor}
                onCategoryChange={setSelectedCategory}
                onBrandChange={setSelectedBrand}
                onColorChange={setSelectedColor}
              />
            </div>
          </div>

          {/* Sidebar de filtros - Móvil rediseñado */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50">
              {/* Overlay */}
              <div 
                className="absolute inset-0 bg-black bg-opacity-50 cursor-pointer"
                onClick={() => setShowFilters(false)}
              ></div>
              
              {/* Panel */}
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-hidden">
                {/* Header fijo */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                    {hasActiveFilters && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        {[selectedCategory, selectedBrand, selectedColor].filter(Boolean).length} activo{[selectedCategory, selectedBrand, selectedColor].filter(Boolean).length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                {/* Contenido scrolleable */}
                <div className="overflow-y-auto p-4 pb-20">
                  <CatalogFilters
                    categories={allCategories}
                    brands={brands}
                    colors={availableColors}
                    selectedCategory={selectedCategory}
                    selectedBrand={selectedBrand}
                    selectedColor={selectedColor}
                    onCategoryChange={setSelectedCategory}
                    onBrandChange={setSelectedBrand}
                    onColorChange={setSelectedColor}
                  />
                </div>
                
                {/* Footer con acciones */}
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                  <div className="flex gap-3">
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        Limpiar todo
                      </button>
                    )}
                    <button
                      onClick={() => setShowFilters(false)}
                      className="flex-1 px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      Ver {sortedProducts.length} producto{sortedProducts.length !== 1 ? 's' : ''}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid de productos elegante */}
          <div className="flex-1">
            {sortedProducts.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-gray-300 mb-8">
                  <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
                  </svg>
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-4 tracking-wide">No se encontraron productos</h3>
                <p className="text-gray-500 mb-8 font-light tracking-wide">
                  No hay productos que coincidan con los criterios de búsqueda actuales.
                </p>
                {hasActiveFilters && (
                  <button 
                    onClick={clearFilters}
                    className="bg-black text-white px-8 py-3 font-light tracking-wide uppercase hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-16 auto-rows-fr mt-12'
                : 'space-y-12 mt-12'
              }>
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={{
                      ...product,
                      categorySlug: allCategories.find(c => c._id === product.category)?.slug || ''
                    }}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando catálogo...</p>
        </div>
      </div>
    }>
      <CatalogoContent />
    </Suspense>
  )
}