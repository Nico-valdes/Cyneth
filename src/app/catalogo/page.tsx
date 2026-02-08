'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Filter, Grid, List, ChevronDown, X, Settings, FilterX } from 'lucide-react'
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
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const productsPerPage = 50
  const isUpdatingFromURL = useRef(false)
  const initialLoadComplete = useRef(false)
  const filterDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const FILTER_DEBOUNCE_MS = 280

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

  // Leer parámetros de URL y aplicar filtros automáticamente (solo al montar o cuando cambia la URL)
  useEffect(() => {
    const category = searchParams.get('category')
    const brand = searchParams.get('brand')
    const color = searchParams.get('color')
    const search = searchParams.get('search')
    
    isUpdatingFromURL.current = true
    setSelectedCategory(category || '')
    setSelectedBrand(brand || '')
    setSelectedColor(color || '')
    setSearchTerm(search || '')
    
    // Si es la primera carga y hay filtros en la URL, cargar productos inmediatamente
    if (!initialLoadComplete.current && (category || brand || color || search)) {
      setLoading(true)
      
      const params = new URLSearchParams()
      params.set('active', 'true')
      params.set('page', '1')
      params.set('limit', productsPerPage.toString())
      
      if (category) params.set('category', category)
      if (brand) params.set('brand', brand)
      if (color) params.set('color', color)
      if (search) params.set('search', search)
      
      const productsUrl = `/api/products?${params.toString()}`
      
      fetch(productsUrl)
        .then(response => response.json())
        .then(data => {
          const newProducts = data.data?.products || []
          const pagination = data.data?.pagination || {}
          
          setProducts(newProducts)
          setTotalProducts(typeof pagination.total === 'number' ? pagination.total : 0)
          setTotalPages(Math.max(1, pagination.pages ?? 1))
          setLoading(false)
          initialLoadComplete.current = true
        })
        .catch(() => {
          setLoading(false)
          setTotalProducts(0)
          setTotalPages(1)
          initialLoadComplete.current = true
        })
    }
    
    // Resetear el flag después de un breve delay
    setTimeout(() => {
      isUpdatingFromURL.current = false
    }, 100)
  }, [searchParams])

  // Sincronizar URL con filtros activos (solo cuando cambian por interacción del usuario)
  useEffect(() => {
    // No actualizar URL si el cambio viene de leer la URL
    if (isUpdatingFromURL.current) {
      return
    }
    
    const currentCategory = searchParams.get('category') || ''
    const currentBrand = searchParams.get('brand') || ''
    const currentColor = searchParams.get('color') || ''
    const currentSearch = searchParams.get('search') || ''
    
    // Solo actualizar URL si hay diferencias
    if (
      selectedCategory !== currentCategory ||
      selectedBrand !== currentBrand ||
      selectedColor !== currentColor ||
      searchTerm !== currentSearch
    ) {
      const params = new URLSearchParams()
      
      if (selectedCategory) params.set('category', selectedCategory)
      if (selectedBrand) params.set('brand', selectedBrand)
      if (selectedColor) params.set('color', selectedColor)
      if (searchTerm) params.set('search', searchTerm)
      
      const newUrl = params.toString() 
        ? `/catalogo?${params.toString()}`
        : '/catalogo'
      
      router.replace(newUrl, { scroll: false })
    }
  }, [selectedCategory, selectedBrand, selectedColor, searchTerm, router, searchParams])

  // Función para construir URL de API con filtros y paginación
  const buildProductsUrl = (page: number = 1) => {
    const params = new URLSearchParams()
    params.set('active', 'true')
    params.set('page', page.toString())
    params.set('limit', productsPerPage.toString())
    
    // Aplicar filtros
    if (selectedCategory) params.set('category', selectedCategory)
    if (selectedBrand) params.set('brand', selectedBrand)
    if (selectedColor) params.set('color', selectedColor)
    if (searchTerm) params.set('search', searchTerm)
    
    // Ordenamiento - destacados primero, luego el orden seleccionado
    if (sortBy) {
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)
    }
    
    return `/api/products?${params.toString()}`
  }

  // Función para cargar productos desde el backend
  const fetchProducts = async (page: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const url = buildProductsUrl(page)
      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        const newProducts = data.data?.products || []
        const pagination = data.data?.pagination || {}
        
        if (append) {
          // Agregar productos a los existentes
          setProducts(prev => [...prev, ...newProducts])
        } else {
          // Reemplazar productos
          setProducts(newProducts)
        }
        
        setTotalProducts(typeof pagination.total === 'number' ? pagination.total : 0)
        setTotalPages(Math.max(1, pagination.pages ?? 1))
      }
    } catch {
      setTotalProducts(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Cargar datos iniciales - Optimizado con caché
  useEffect(() => {
    const fetchData = async () => {
      try {
        // OPTIMIZACIÓN: Usar caché del navegador (sessionStorage) para categorías y marcas
        const cacheKey = 'catalog_metadata'
        const cacheExpiry = 5 * 60 * 1000 // 5 minutos
        const cached = sessionStorage.getItem(cacheKey)
        const cacheTime = cached ? JSON.parse(cached).timestamp : 0
        const isCacheValid = Date.now() - cacheTime < cacheExpiry

        let categoriesData, brandsData

        if (isCacheValid && cached) {
          const cachedData = JSON.parse(cached)
          categoriesData = cachedData.categories
          brandsData = cachedData.brands
          console.log('📦 Usando datos del caché')
        } else {
          const [allCategoriesRes, brandsRes] = await Promise.all([
            fetch('/api/categories'),
            fetch('/api/brands')
          ])

          if (allCategoriesRes.ok) {
            const response = await allCategoriesRes.json()
            categoriesData = response.data?.categories || []
          }

          if (brandsRes.ok) {
            const response = await brandsRes.json()
            brandsData = response.data?.brands || []
          }

          sessionStorage.setItem(cacheKey, JSON.stringify({
            categories: categoriesData,
            brands: brandsData,
            timestamp: Date.now()
          }))
        }

        if (categoriesData) {
          setAllCategories(categoriesData)
          const mainCats = categoriesData.filter((cat: Category) => cat.level === 0 || cat.type === 'main')
          setCategories(mainCats)
        }

        if (brandsData) {
          setBrands(brandsData)
        }

        // Leer filtros de la URL
        const categoryFromURL = searchParams.get('category')
        const brandFromURL = searchParams.get('brand')
        const colorFromURL = searchParams.get('color')
        const searchFromURL = searchParams.get('search')
        
        // Aplicar filtros de URL al estado
        if (categoryFromURL) setSelectedCategory(categoryFromURL)
        if (brandFromURL) setSelectedBrand(brandFromURL)
        if (colorFromURL) setSelectedColor(colorFromURL)
        if (searchFromURL) setSearchTerm(searchFromURL)
        
        // Solo cargar productos si NO hay filtros en la URL
        // Si hay filtros, el efecto que lee la URL los cargará
        const hasFilters = categoryFromURL || brandFromURL || colorFromURL || searchFromURL
        
        if (!hasFilters) {
          // Cargar todos los productos sin filtros
          const params = new URLSearchParams()
          params.set('active', 'true')
          params.set('page', '1')
          params.set('limit', productsPerPage.toString())
          
          const productsUrl = `/api/products?${params.toString()}`
          
          try {
            setLoading(true)
            const response = await fetch(productsUrl)
            
            if (response.ok) {
              const data = await response.json()
              const newProducts = data.data?.products || []
              const pagination = data.data?.pagination || {}
              
              setProducts(newProducts)
              
              setTotalProducts(typeof pagination.total === 'number' ? pagination.total : 0)
              setTotalPages(Math.max(1, pagination.pages ?? 1))
            }
      } catch {
        setTotalProducts(0)
        setTotalPages(1)
      } finally {
            setLoading(false)
            initialLoadComplete.current = true
          }
        }
      } catch {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Recargar productos cuando cambian los filtros (debounced para mejor UX y menos requests)
  useEffect(() => {
    if (!initialLoadComplete.current || isUpdatingFromURL.current) return

    if (filterDebounceRef.current) clearTimeout(filterDebounceRef.current)
    filterDebounceRef.current = setTimeout(() => {
      filterDebounceRef.current = null
      if (!loading) {
        setCurrentPage(1)
        fetchProducts(1, false)
      }
    }, FILTER_DEBOUNCE_MS)

    return () => {
      if (filterDebounceRef.current) clearTimeout(filterDebounceRef.current)
    }
  }, [selectedCategory, selectedBrand, selectedColor, searchTerm, sortBy, sortOrder])

  // Obtener colores únicos de los productos cargados (para el filtro)
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
    setCurrentPage(1)
  }

  const hasActiveFilters = selectedCategory || selectedBrand || selectedColor || searchTerm

  // Función para cargar más productos (siguiente página)
  const handleShowMore = () => {
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    fetchProducts(nextPage, true) // append = true para agregar productos
  }

  // Verificar si hay más productos
  const hasMoreProducts = currentPage < totalPages

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
              {/* Contador de productos (siempre visible, incluye 0) */}
                <div className="text-xs sm:text-sm lg:text-base text-white font-light flex-shrink-0" role="status" aria-live="polite">
                  {loading ? '…' : `${totalProducts} producto${totalProducts !== 1 ? 's' : ''}`}
                </div>
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
                      {totalProducts === 0 ? 'Ver resultados (0)' : `Ver ${totalProducts} producto${totalProducts !== 1 ? 's' : ''}`}
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
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="py-16 sm:py-24 text-center"
              >
                {hasActiveFilters ? (
                  <>
                    <FilterX className="w-10 h-10 text-gray-300 mx-auto mb-4" strokeWidth={1.25} />
                    <p className="text-3xl font-light text-gray-400 mb-2">0</p>
                    <p className="text-gray-600 text-sm font-light tracking-wide mb-6 max-w-xs mx-auto">
                      No hay productos con esta combinación. Probá otros filtros.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="text-sm font-light tracking-wide uppercase text-gray-900 border-b border-gray-400 hover:border-gray-900 transition-colors cursor-pointer pb-0.5"
                    >
                      Limpiar filtros
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-400 text-sm font-light tracking-wide">
                      No hay productos en el catálogo.
                    </p>
                  </>
                )}
              </motion.div>
            ) : (
              <>
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-16 auto-rows-fr mt-6 sm:mt-8 md:mt-12'
                  : 'space-y-4 sm:space-y-6 md:space-y-12 mt-6 sm:mt-8 md:mt-12'
                }>
                  {products.map((product) => (
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
                      disabled={loadingMore}
                      className="px-6 sm:px-8 py-2.5 sm:py-3 bg-black text-white text-sm sm:text-base font-light tracking-wide uppercase hover:bg-gray-800 active:bg-gray-700 transition-colors duration-200 cursor-pointer touch-manipulation rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingMore ? 'Cargando...' : 'Mostrar más'}
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