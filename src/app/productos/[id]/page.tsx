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
  const [categoryBreadcrumb, setCategoryBreadcrumb] = useState<Array<{id: string, name: string, slug: string}>>([])
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])
  const [recommendedImageErrors, setRecommendedImageErrors] = useState<Set<string>>(new Set())

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
        
        // Construir breadcrumb desde el producto
        if (data.data.categoryBreadcrumb) {
          const parts = data.data.categoryBreadcrumb.split(' > ')
          const breadcrumb = parts.map((name: string, index: number) => ({
            id: `category-${index}`,
            name: name.trim(),
            slug: name.toLowerCase().replace(/\s+/g, '-')
          }))
          setCategoryBreadcrumb(breadcrumb)
        }
        
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
      {/* Breadcrumb Navegable */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/catalogo" className="text-gray-500 hover:text-red-600 transition-colors">
              Catálogo
            </Link>
            <span className="text-gray-400">/</span>
            {categoryBreadcrumb.map((category, index) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Link 
                  href={`/catalogo?search=${encodeURIComponent(category.name)}`}
                  className="text-gray-500 hover:text-red-600 transition-colors"
                >
                  {category.name}
                </Link>
                <span className="text-gray-400">/</span>
              </div>
            ))}
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botón volver */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-gray-600 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </button>
        </div>

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
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="font-medium">{product.brand}</span>
                  <span>SKU: {product.sku}</span>
                </div>
                
                {/* Acciones */}
                <div className="flex gap-3">
                  <button
                    onClick={handleShare}
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir
                  </button>
                </div>
              </div>

              {/* Descripción */}
              {product.description && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                  <p className="text-gray-700 leading-relaxed text-sm">{product.description}</p>
                </div>
              )}

              {/* Variantes de color */}
              {product.colorVariants && product.colorVariants.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Colores Disponibles</h3>
                  <div className="space-y-3">
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
                          setImageError(false) // Reset image error when changing variant
                        }}
                      >
                        <div
                          className="w-6 h-6 rounded-full border-2 border-gray-300 mr-3"
                          style={{ backgroundColor: variant.colorCode }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{variant.colorName}</p>
                          <p className="text-sm text-gray-600">SKU: {variant.sku}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Atributos */}
              {product.attributes && product.attributes.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Especificaciones</h3>
                  <div className="space-y-2">
                    {product.attributes.map((attr, index) => (
                      <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-700">{attr.name}</span>
                        <span className="text-gray-600">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medidas */}
              {product.measurements?.enabled && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
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
                          <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Acciones principales */}
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-800 mb-2">
                    <Info className="w-5 h-5 mr-2" />
                    <span className="font-medium">Información de Contacto</span>
                  </div>
                  <p className="text-red-700 text-sm">
                    Para consultas sobre disponibilidad, precios y pedidos, contáctanos directamente.
                  </p>
                </div>
                
                {/* Botón de WhatsApp */}
                <div className="relative">
                  <a
                    href={`https://wa.me/5491234567890?text=Hola!%20Me%20interesa%20el%20producto:%20${encodeURIComponent(product.name)}%20-%20SKU:%20${product.sku}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-full inline-flex items-center justify-center px-6 py-4 bg-red-600 text-white font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:bg-red-700 hover:shadow-xl hover:scale-105 active:scale-95 transform"
                  >
                    {/* Fondo con gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Contenido del botón */}
                    <div className="relative flex items-center space-x-3 z-10">
                      {/* Ícono de WhatsApp con animación */}
                      <div className="relative">
                        <svg className="w-6 h-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.515"/>
                        </svg>
                        
                        {/* Anillo de pulso */}
                        <div className="absolute -inset-2 border-2 border-white rounded-full opacity-0 group-hover:opacity-60 group-hover:animate-ping"></div>
                      </div>
                      
                      <span className="text-lg font-bold tracking-wide transition-all duration-300 group-hover:tracking-wider">
                        Consultar por Producto
                      </span>
                      
                      {/* Flecha animada */}
                      <div className="transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Sombra interna para profundidad */}
                    <div className="absolute inset-0 rounded-lg shadow-inner opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </a>
                  
                  {/* Texto de ayuda */}
                  <p className="text-center text-xs text-gray-500 mt-2">
                    📱 Te redirigirá a WhatsApp con la información del producto
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Productos Recomendados */}
        {recommendedProducts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Productos Relacionados</h2>
              <p className="text-gray-600">Otros productos que podrían interesarte</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedProducts.map((recommendedProduct) => {
                // Obtener imagen específica para cada producto recomendado
                const recommendedMainImage = getMainImage(recommendedProduct)
                const recommendedOptimizedImage = recommendedMainImage ? getOptimizedImageUrl(recommendedMainImage) : null
                
                return (
                  <Link key={recommendedProduct._id} href={`/productos/${recommendedProduct._id}`}>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 hover:shadow-md transition-all group">
                      {/* Imagen */}
                      <div className="relative aspect-square bg-white">
                        {recommendedOptimizedImage && !recommendedImageErrors.has(recommendedProduct._id) ? (
                          <Image
                            src={recommendedOptimizedImage}
                            alt={recommendedProduct.name}
                            fill
                            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                            onError={() => {
                              setRecommendedImageErrors(prev => new Set(prev).add(recommendedProduct._id))
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="w-8 h-8" />
                          </div>
                        )}
                        {recommendedProduct.featured && (
                          <div className="absolute top-2 left-2">
                            <span className="bg-red-600 text-white text-xs px-1.5 py-0.5 rounded">
                              Destacado
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="p-3 border-t border-gray-100">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-red-600 transition-colors">
                          {recommendedProduct.name}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>{recommendedProduct.brand}</span>
                          <span className="font-mono">{recommendedProduct.sku}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
            
            <div className="text-center mt-6">
              <Link 
                href="/catalogo"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Ver más productos
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}

