'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Filter, Grid, List, ChevronDown, X, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import ProductCard from '@/components/ProductCard'
import CatalogFilters from '@/components/CatalogFilters'
import { getMainImage } from '@/utils/imageUtils'
import Header from '@/components/layout/Header'
import { usePageTitle } from '@/hooks/usePageTitle'
import banner from "../../../public/copia1.jpg"

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
  const [loadingAllProducts, setLoadingAllProducts] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('')
  const [productsToShow, setProductsToShow] = useState(25)

  // Metadata dinámica basada en filtros
  const categoryName = selectedCategory 
    ? allCategories.find(c => c._id === selectedCategory)?.name 
    : null
  
  const pageTitle = categoryName 
    ? `Catálogo - ${categoryName} | Cyneth Sanitarios`
    : searchTerm
    ? `Búsqueda: ${searchTerm} | Catálogo Cyneth`
    : 'Catálogo | Cyneth Sanitarios'
  
  const pageDescription = categoryName
    ? `Explora nuestra colección de ${categoryName.toLowerCase()}. Productos premium con asesoramiento técnico especializado.`
    : searchTerm
    ? `Resultados de búsqueda para "${searchTerm}". Encuentra los mejores productos sanitarios en CYNETH.`
    : 'Descubre nuestra completa colección de grifería, sanitarios, duchas y accesorios. Filtra por categoría, marca y color. Productos premium para obras y proyectos.'

  usePageTitle({
    title: pageTitle,
    description: pageDescription,
    showComeBackMessage: true,
    comeBackMessage: '¡Volvé!'
  })

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

  // Cargar datos iniciales - Primero destacados, luego todos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Primero cargar categorías y marcas (necesarios para filtros)
        const [categoriesRes, allCategoriesRes, brandsRes] = await Promise.all([
          fetch('/api/categories?type=main'), // Solo categorías principales
          fetch('/api/categories'), // Todas las categorías para filtrado
          fetch('/api/brands')
        ])

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

        // PRIMERO: Cargar solo productos destacados para mostrar rápido
        try {
          const featuredRes = await fetch('/api/products?active=true&featured=true&limit=50')
          if (featuredRes.ok) {
            const featuredData = await featuredRes.json()
            const featuredProducts = featuredData.data?.products || []
            setProducts(featuredProducts)
            console.log('⭐ Productos destacados cargados:', featuredProducts.length)
          }
        } catch (error) {
          console.error('Error cargando productos destacados:', error)
        } finally {
          setLoading(false)
        }

        // DESPUÉS: Cargar todos los productos en segundo plano
        setLoadingAllProducts(true)
        try {
          const allProductsRes = await fetch('/api/products?active=true&limit=1500')
          if (allProductsRes.ok) {
            const allProductsData = await allProductsRes.json()
            const allProducts = allProductsData.data?.products || []
            setProducts(allProducts)
            console.log('📦 Todos los productos cargados:', allProducts.length)
          }
        } catch (error) {
          console.error('Error cargando todos los productos:', error)
        } finally {
          setLoadingAllProducts(false)
        }
      } catch (error) {
        console.error('Error cargando datos del catálogo:', error)
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

  // Ordenar productos - Destacados primero
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // Prioridad 1: Productos destacados siempre primero
    if (a.featured && !b.featured) return -1
    if (!a.featured && b.featured) return 1
    
    // Si ambos son destacados o ninguno, aplicar ordenamiento normal
    if (!sortBy) {
      // Ordenamiento por defecto: alfabético por nombre
      return a.name.localeCompare(b.name)
    }
    
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'brand':
        return a.brand.localeCompare(b.brand)
      case 'sku':
        return a.sku.localeCompare(b.sku)
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

  // Resetear productos a mostrar cuando cambian los filtros
  useEffect(() => {
    setProductsToShow(25)
  }, [selectedCategory, selectedBrand, selectedColor, searchTerm, sortBy])

  // Limitar productos mostrados
  const displayedProducts = sortedProducts.slice(0, productsToShow)
  const hasMoreProducts = sortedProducts.length > productsToShow

  const clearFilters = () => {
    setSelectedCategory('')
    setSelectedBrand('')
    setSelectedColor('')
    setSearchTerm('')
  }

  const hasActiveFilters = selectedCategory || selectedBrand || selectedColor || searchTerm

  const handleShowMore = () => {
    setProductsToShow(prev => prev + 25)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* Header del catálogo */}
      <div className="relative">
        <div className="absolute inset-0">
          <Image
            src={banner}
            alt="Fondo catálogo"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 sm:py-12 md:py-16">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-white tracking-wide uppercase text-center">Catálogo</h1>
            <p className="mt-3 sm:mt-4 md:mt-6 text-sm sm:text-base text-white/80 text-center font-light tracking-wide max-w-2xl mx-auto px-4">
              Descubre nuestra colección cuidadosamente seleccionada
            </p>
          </div>
          
          {/* Controles del Catálogo - Estilo Profesional */}
          <div className="border-t border-white/10 pt-4 sm:pt-6 pb-4 sm:pb-6">
            {/* Barra de controles - Móvil y Desktop */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
              {/* Contador de productos */}
                <div className="text-xs sm:text-sm lg:text-base text-white font-light flex-shrink-0"> 1081 productos</div>
              {/* Ordenar */}
              {loading ? (
                <div className="h-8 w-32 bg-white/20 rounded animate-pulse"></div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-transparent border-0 border-b border-white/30 text-white text-xs sm:text-sm lg:text-base font-light appearance-none cursor-pointer focus:outline-none focus:border-white/50 transition-all pr-5 sm:pr-6 lg:pr-8 w-auto min-w-[120px] sm:min-w-[140px] lg:min-w-[160px] max-w-[180px] lg:max-w-[200px]"
                    >
                      <option value="" className="bg-gray-900 text-white">Ordenar por</option>
                      <option value="name" className="bg-gray-900 text-white">Alfabético</option>
                      <option value="brand" className="bg-gray-900 text-white">Por Marca</option>
                      <option value="sku" className="bg-gray-900 text-white">Por SKU</option>
                      <option value="newest" className="bg-gray-900 text-white">Más Recientes</option>
                      <option value="oldest" className="bg-gray-900 text-white">Más Antiguos</option>
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-white/60 pointer-events-none" />
                  </div>
                </div>
              )}
              
              {/* Botón Filtrar - Solo móvil */}
              {loading ? (
                <div className="lg:hidden h-8 w-20 bg-white/20 rounded animate-pulse"></div>
              ) : (
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-white/30 hover:border-white/50 hover:bg-white/5 transition-all flex-shrink-0"
                  aria-label="Filtrar"
                >
                  <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  <span className="text-xs sm:text-sm text-white font-light tracking-wide hidden min-[340px]:inline">Filtrar</span>
                  {hasActiveFilters && (
                    <span className="w-4 h-4 sm:w-5 sm:h-5 bg-white text-gray-900 text-[9px] sm:text-[10px] rounded-full flex items-center justify-center font-medium">
                      {[selectedCategory, selectedBrand, selectedColor].filter(Boolean).length}
                    </span>
                  )}
                </button>
              )}
            </div>
            
            {/* Filtros activos - Móvil y Desktop */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-3 pt-4 mt-4 border-t border-white/10">
                <span className="text-xs text-white/60 font-light tracking-wider uppercase">Filtros:</span>
                {selectedCategory && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-light">
                    {allCategories.find(c => c._id === selectedCategory)?.name}
                    <button onClick={() => setSelectedCategory('')} className="hover:text-white/60 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedBrand && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-light">
                    {selectedBrand}
                    <button onClick={() => setSelectedBrand('')} className="hover:text-white/60 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedColor && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-light">
                    {selectedColor}
                    <button onClick={() => setSelectedColor('')} className="hover:text-white/60 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-white/60 hover:text-white font-light tracking-wider uppercase transition-colors ml-auto"
                >
                  Limpiar todos
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal - Responsive */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-16">
          {/* Sidebar de filtros */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            {loading ? (
              <div className="bg-white p-8 sticky top-8">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-4 w-full bg-gray-200 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-4 w-full bg-gray-200 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
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
            )}
          </div>

          {/* Sidebar de filtros - Móvil Minimalista */}
          <AnimatePresence>
            {showFilters && (
              <div className="lg:hidden fixed inset-0 z-50">
                {/* Overlay sutil */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                  onClick={() => setShowFilters(false)}
                />
                
                {/* Panel minimalista */}
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute bottom-0 left-0 right-0 bg-white max-h-[90vh] overflow-hidden flex flex-col"
                >
                {/* Línea superior decorativa */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gray-200"></div>
                
                {/* Header minimalista */}
                <div className="relative px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Línea vertical izquierda */}
                      <div className="w-[1px] h-6 bg-gray-300"></div>
                      <h3 className="text-sm font-light text-gray-900 tracking-wider uppercase">Filtros</h3>
                    </div>
                    <button 
                      onClick={() => setShowFilters(false)}
                      className="p-2 -mr-2 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Contador de filtros activos - sutil */}
                  {hasActiveFilters && (
                    <div className="mt-3 text-xs text-gray-500 font-light">
                      {[selectedCategory, selectedBrand, selectedColor].filter(Boolean).length} filtro{[selectedCategory, selectedBrand, selectedColor].filter(Boolean).length !== 1 ? 's' : ''} activo{[selectedCategory, selectedBrand, selectedColor].filter(Boolean).length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                
                {/* Contenido scrolleable */}
                <div className="flex-1 overflow-y-auto">
                  <div className="px-6 py-6">
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
                
                {/* Footer minimalista */}
                <div className="border-t border-gray-100 px-6 py-4 bg-white">
                  <div className="flex gap-3">
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="flex-1 px-4 py-3 text-sm font-light text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        Limpiar
                      </button>
                    )}
                    <button
                      onClick={() => setShowFilters(false)}
                      className="flex-1 px-4 py-3 text-sm font-light text-white bg-gray-900 hover:bg-gray-800 transition-colors"
                    >
                      Ver {sortedProducts.length}
                    </button>
                  </div>
                </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Grid de productos elegante - Responsive */}
          <div className="flex-1 w-full">
            {loading ? (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-16 auto-rows-fr mt-6 sm:mt-8 md:mt-12'
                : 'space-y-4 sm:space-y-6 md:space-y-12 mt-6 sm:mt-8 md:mt-12'
              }>
                {Array.from({ length: 12 }).map((_, index) => (
                  viewMode === 'grid' ? (
                    <div key={index} className="bg-white overflow-hidden">
                      {/* Skeleton de imagen cuadrada */}
                      <div className="relative aspect-square bg-gray-200 animate-pulse"></div>
                      {/* Skeleton de contenido */}
                      <div className="p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3">
                        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ) : (
                    <div key={index} className="bg-white overflow-hidden hover:bg-gray-50 transition-colors">
                      <div className="p-2 sm:p-3 md:p-4">
                        <div className="flex gap-2 sm:gap-3 md:gap-4">
                          {/* Skeleton de imagen pequeña */}
                          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 bg-gray-200 rounded animate-pulse"></div>
                          {/* Skeleton de contenido */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-12 sm:py-16 md:py-24">
                <div className="text-gray-300 mb-6 sm:mb-8">
                  <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-light text-gray-900 mb-3 sm:mb-4 tracking-wide px-4">No se encontraron productos</h3>
                <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 font-light tracking-wide px-4">
                  No hay productos que coincidan con los criterios de búsqueda actuales.
                </p>
                {hasActiveFilters && (
                  <button 
                    onClick={clearFilters}
                    className="bg-black text-white px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-light tracking-wide uppercase hover:bg-gray-800 active:bg-gray-700 transition-colors duration-200 cursor-pointer touch-manipulation rounded"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-16 auto-rows-fr mt-6 sm:mt-8 md:mt-12'
                  : 'space-y-4 sm:space-y-6 md:space-y-12 mt-6 sm:mt-8 md:mt-12'
                }>
                  {displayedProducts.map((product) => (
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
                {hasMoreProducts && (
                  <div className="flex justify-center mt-8 sm:mt-12">
                    <button
                      onClick={handleShowMore}
                      className="px-6 sm:px-8 py-2.5 sm:py-3 bg-black text-white text-sm sm:text-base font-light tracking-wide uppercase hover:bg-gray-800 active:bg-gray-700 transition-colors duration-200 cursor-pointer touch-manipulation rounded"
                    >
                      Mostrar más
                    </button>
                  </div>
                )}
              </>
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
      <div className="min-h-screen bg-white">
        <Header />
        {/* Header del catálogo - Siempre visible */}
        <div className="relative">
          <div className="absolute inset-0">
            <Image
              src={banner}
              alt="Fondo catálogo"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8 sm:py-12 md:py-16">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-white tracking-wide uppercase text-center">Catálogo</h1>
              <p className="mt-3 sm:mt-4 md:mt-6 text-sm sm:text-base text-white/80 text-center font-light tracking-wide max-w-2xl mx-auto px-4">
                Descubre nuestra colección cuidadosamente seleccionada
              </p>
            </div>
            {/* Skeleton de controles */}
            <div className="border-t border-white/10 pt-4 sm:pt-6 pb-4 sm:pb-6">
              <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
                <div className="h-4 w-24 bg-white/20 rounded animate-pulse"></div>
                <div className="h-8 w-32 bg-white/20 rounded animate-pulse"></div>
                <div className="lg:hidden h-8 w-20 bg-white/20 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        {/* Skeleton de contenido */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-16">
            {/* Skeleton sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="bg-white p-8 sticky top-8">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-3">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      <div className="space-y-2">
                        {[1, 2, 3, 4].map((j) => (
                          <div key={j} className="h-4 w-full bg-gray-200 rounded animate-pulse" style={{ animationDelay: `${j * 100}ms` }}></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Skeleton productos */}
            <div className="flex-1 w-full">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-16 auto-rows-fr mt-6 sm:mt-8 md:mt-12">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="bg-white overflow-hidden">
                    <div className="relative aspect-square bg-gray-200 animate-pulse"></div>
                    <div className="p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3">
                      <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <CatalogoContent />
    </Suspense>
  )
}