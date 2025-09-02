'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Tag, 
  Package, 
  Ruler, 
  Info,
  ChevronLeft,
  ChevronRight,
  Star,
  Eye
} from 'lucide-react'
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
  attributes?: Array<{ name: string; value: string }>
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

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)
  const [categoryBreadcrumb, setCategoryBreadcrumb] = useState<Array<{id: string, _id: string, name: string, slug: string, level: number}>>([])
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])
  const [recommendedImageErrors, setRecommendedImageErrors] = useState<Set<string>>(new Set())

    // Función para construir breadcrumb de categorías
  const buildCategoryBreadcrumb = async (productData: any) => {
    try {
      if (productData.categoryBreadcrumb) {
        // Si ya existe un breadcrumb, usarlo
        const parts = productData.categoryBreadcrumb.split(' > ')
        const breadcrumb = parts.map((name: string, index: number) => ({
          id: `category-${index}`,
          name: name.trim(),
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          level: index
        }))
        setCategoryBreadcrumb(breadcrumb)
      } else if (productData.category) {
        // Si no hay breadcrumb pero sí hay categoría, construir la jerarquía completa
        try {
          // Obtener todas las categorías para construir la jerarquía
          const categoryResponse = await fetch('/api/categories?type=all&hierarchical=true')
          if (categoryResponse.ok) {
            const categoryData = await categoryResponse.json()
            const categories = categoryData.data?.categories || []
            console.log('📋 Categorías obtenidas:', categories.length, 'categorías')
            
                         // Buscar la categoría principal del producto por ID
             console.log('🔍 Buscando categoría por ID:', productData.category)
             let currentCategory = categories.find((cat: any) => 
               cat._id === productData.category
             )
             console.log('✅ Categoría encontrada:', currentCategory?.name, 'ID:', currentCategory?._id)
            
            if (currentCategory) {
              const breadcrumb = []
              
                             // Construir jerarquía completa recursivamente
               const buildHierarchy = (categoryId: string): any[] => {
                 const category = categories.find((cat: any) => cat._id === categoryId)
                 if (!category) return []
                 
                 const hierarchy = []
                 
                 // Si tiene padre, construir jerarquía del padre primero
                 if (category.parent) {
                   hierarchy.push(...buildHierarchy(category.parent))
                 }
                 
                 // Agregar la categoría actual
                 hierarchy.push({
                   id: `category-${hierarchy.length}`,
                   _id: category._id,
                   name: category.name,
                   slug: category.slug,
                   level: hierarchy.length
                 })
                 
                 return hierarchy
               }
               
               // Construir breadcrumb completo desde la raíz
               const fullHierarchy = buildHierarchy(currentCategory._id)
               console.log('🌳 Jerarquía completa construida:', fullHierarchy)
               
                              // Agregar todas las categorías de la jerarquía
               breadcrumb.push(...fullHierarchy)
              
              // Si tiene subcategoría, agregarla
              if (productData.subcategory) {
                const subcategory = categories.find((cat: any) => 
                  cat._id === productData.subcategory || cat.name === productData.subcategory
                )
                if (subcategory) {
                  breadcrumb.push({
                    id: `category-${breadcrumb.length}`,
                    name: subcategory.name,
                    slug: subcategory.slug,
                    level: breadcrumb.length
                  })
                }
              }
              
              console.log('🔗 Breadcrumb final:', JSON.stringify(breadcrumb, null, 2))
              setCategoryBreadcrumb(breadcrumb)
            } else {
              // Si no se encuentra la categoría, crear un breadcrumb básico
              console.log('⚠️ Categoría no encontrada, creando breadcrumb básico')
              setCategoryBreadcrumb([{
                id: 'category-0',
                _id: productData.category,
                name: productData.category,
                slug: productData.category.toLowerCase().replace(/\s+/g, '-'),
                level: 0
              }])
            }
          }
        } catch (error) {
          console.error('Error obteniendo jerarquía de categorías:', error)
          // Fallback: crear breadcrumb básico
          setCategoryBreadcrumb([{
            id: 'category-0',
            _id: productData.category,
            name: productData.category,
            slug: productData.category.toLowerCase().replace(/\s+/g, '-'),
            level: 0
          }])
        }
      }
    } catch (error) {
      console.error('Error construyendo breadcrumb de categorías:', error)
    }
  }

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/products/${params.id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Producto no encontrado')
          } else {
            setError('Error cargando el producto')
          }
          return
        }

        const data = await response.json()
        setProduct(data.data)
        
        // Construir breadcrumb de categorías
        await buildCategoryBreadcrumb(data.data)
        
        // Obtener productos recomendados (simulado por ahora)
        try {
          const productsResponse = await fetch('/api/products?active=true&limit=8')
          if (productsResponse.ok) {
            const productsData = await productsResponse.json()
            const allProducts = productsData.data?.products || []
            const related = allProducts
              .filter((p: Product) => p._id !== data.data._id)
              .slice(0, 4)
            setRecommendedProducts(related)
          }
        } catch (error) {
          console.error('Error fetching recommended products:', error)
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        setError('Error cargando el producto')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Producto no encontrado</h2>
          <p className="text-gray-600 mb-6">{error || 'El producto que buscas no existe'}</p>
          <Link 
            href="/catalogo"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al catálogo
          </Link>
        </div>
      </div>
    )
  }

  // Obtener imagen basada en la variante seleccionada
  const getDisplayImage = () => {
    if (product.colorVariants && product.colorVariants.length > 0) {
      // Si hay variantes de color, mostrar la imagen de la variante seleccionada
      const selectedVariantData = product.colorVariants[selectedVariant]
      if (selectedVariantData?.image) {
        return getOptimizedImageUrl(selectedVariantData.image)
      }
    }
    // Si no hay variantes o la variante no tiene imagen, mostrar imagen por defecto
    const mainImage = getMainImage(product)
    return mainImage ? getOptimizedImageUrl(mainImage) : null
  }

  const currentImage = getDisplayImage()

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      // Aquí podrías mostrar un toast de confirmación
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Natural Integrado */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/catalogo" className="hover:text-red-600 transition-colors">
              Catálogo
            </Link>
            {categoryBreadcrumb.length > 0 && <span className="text-gray-300">/</span>}
            {categoryBreadcrumb.map((category, index) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Link 
                  href={`/catalogo?category=${category._id}&level=${category.level}`}
                  className="hover:text-red-600 transition-colors"
                  title={`Ver productos de ${category.name}`}
                >
                  {category.name}
                </Link>
                {index < categoryBreadcrumb.length - 1 && (
                  <span className="text-gray-300">/</span>
                )}
              </div>
            ))}
            {categoryBreadcrumb.length > 0 && <span className="text-gray-300">/</span>}
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galería de imágenes */}
          <div>
            {/* Imagen principal */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden mb-3">
              {currentImage && !imageError ? (
                <Image
                  src={currentImage}
                  alt={product.name}
                  fill
                  className="object-contain p-2"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Package className="w-16 h-16" />
                </div>
              )}

              {/* Badges */}
              {product.featured && (
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center px-3 py-1 bg-yellow-500 text-white text-sm font-medium rounded-full">
                    <Star className="w-4 h-4 mr-1" />
                    Destacado
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Información del producto */}
          <div>
            <div className="sticky top-8">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
                <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                  <span className="font-medium text-gray-700">{product.brand}</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">SKU: {product.sku}</span>
                </div>
              </div>

              {/* Descripción */}
              {product.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Variantes de color */}
              {product.colorVariants && product.colorVariants.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Colores Disponibles</h3>
                  <div className="space-y-2">
                    {product.colorVariants.map((variant, index) => (
                      <div
                        key={index}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedVariant === index 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          setSelectedVariant(index)
                          setImageError(false)
                        }}
                      >
                        <div
                          className="w-5 h-5 rounded-full border-2 border-gray-300 mr-3 flex-shrink-0"
                          style={{ backgroundColor: variant.colorCode }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{variant.colorName}</p>
                          <p className="text-xs text-gray-500">SKU: {variant.sku}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Atributos */}
              {product.attributes && product.attributes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Especificaciones</h3>
                  <div className="space-y-2">
                    {product.attributes.map((attr, index) => (
                      <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <span className="font-medium text-gray-700">{attr.name}</span>
                        <span className="text-gray-600">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medidas */}
              {product.measurements?.enabled && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Ruler className="w-5 h-5 mr-2" />
                    Medidas Disponibles
                  </h3>
                  {product.measurements.description && (
                    <p className="text-gray-700 mb-3">{product.measurements.description}</p>
                  )}
                  {product.measurements.availableSizes.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium text-gray-700">Tamaños disponibles:</p>
                      <div className="flex flex-wrap gap-2">
                        {product.measurements.availableSizes.map((size, index) => (
                          <span key={index} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
                {/* Botón de WhatsApp */}
                <div className="mt-8">
                  <a
                    href={`https://wa.me/5491234567890?text=Hola!%20Me%20interesa%20el%20producto:%20${encodeURIComponent(product.name)}%20-%20SKU:%20${product.sku}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full px-6 py-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.515"/>
                    </svg>
                    Consultar por WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
      
        
        {/* Productos Recomendados */}
        {recommendedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-gray-200">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Productos Relacionados</h2>
              <p className="text-gray-600 text-lg">Otros productos que podrían interesarte</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((recommendedProduct) => {
                // Obtener imagen específica para cada producto recomendado
                const recommendedMainImage = getMainImage(recommendedProduct)
                const recommendedOptimizedImage = recommendedMainImage ? getOptimizedImageUrl(recommendedMainImage) : null
                
                return (
                  <Link key={recommendedProduct._id} href={`/productos/${recommendedProduct._id}`}>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all duration-300 group h-full">
                      {/* Imagen */}
                      <div className="relative aspect-square bg-white">
                        {recommendedOptimizedImage && !recommendedImageErrors.has(recommendedProduct._id) ? (
                          <Image
                            src={recommendedOptimizedImage}
                            alt={recommendedProduct.name}
                            fill
                            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                            onError={() => {
                              setRecommendedImageErrors(prev => new Set(prev).add(recommendedProduct._id))
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="w-12 h-12" />
                          </div>
                        )}
                        {recommendedProduct.featured && (
                          <div className="absolute top-3 left-3">
                            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                              ⭐ Destacado
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="p-4 border-t border-gray-100 bg-white">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2 group-hover:text-red-600 transition-colors line-clamp-2 min-h-[2.5rem]">
                          {recommendedProduct.name}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span className="font-medium text-gray-700 truncate max-w-[40%]">{recommendedProduct.brand}</span>
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-600 flex-shrink-0">{recommendedProduct.sku}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
            
            <div className="text-center mt-10">
              <Link 
                href="/catalogo"
                className="inline-flex items-center px-6 py-3 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300 font-medium text-lg"
              >
                Ver más productos
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}

