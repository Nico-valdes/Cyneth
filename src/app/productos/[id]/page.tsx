'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { usePageTitle } from '@/hooks/usePageTitle'
import { 
  ArrowLeft, 
  ArrowRight,
  Package, 
  Ruler,
  ChevronRight,
  Star
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

  // Metadata dinámica basada en el producto - se actualiza cuando el producto cambia
  usePageTitle({
    title: product 
      ? `${product.name} - ${product.brand} | Cyneth Sanitarios`
      : 'Producto | Cyneth Sanitarios',
    description: product 
      ? `${product.description || product.name}. SKU: ${product.sku}. Marca: ${product.brand}. Producto disponible en CYNETH Sanitarios.`
      : 'Descubre nuestros productos sanitarios premium',
    showComeBackMessage: true,
    comeBackMessage: '¡Volvé!'
  })

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 font-light tracking-wide">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-300 text-6xl mb-8">📦</div>
          <h2 className="text-4xl font-extralight text-gray-900 mb-4">Producto no encontrado</h2>
          <p className="text-gray-600 mb-8 font-light leading-relaxed">{error || 'El producto que buscas no existe'}</p>
          <Link 
            href="/catalogo"
            className="inline-flex items-center px-8 py-3 bg-gray-900 text-white font-light tracking-wide hover:bg-gray-800 transition-all duration-300"
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

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
      {/* Breadcrumb Minimalista */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 font-light tracking-wide">
            <Link href="/catalogo" className="hover:text-red-600 transition-colors duration-200">
              Catálogo
            </Link>
            {categoryBreadcrumb.length > 0 && <span className="text-gray-300">/</span>}
            {categoryBreadcrumb.map((category, index) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Link 
                  href={`/catalogo?category=${category._id}&level=${category.level}`}
                  className="hover:text-red-600 transition-colors duration-200"
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
            <span className="text-gray-900 font-light">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Contenido Principal */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Galería de imágenes */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="relative aspect-square bg-gray-50 overflow-hidden group">
                {currentImage && !imageError ? (
                  <Image
                    src={currentImage}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Package className="w-16 h-16" />
                  </div>
                )}

                {/* Minimal Overlay */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badge Minimalista */}
                {product.featured && (
                  <div className="absolute top-4 left-4">
                    <div className="w-2 h-2 bg-red-600 rounded-full shadow-lg"></div>
                  </div>
                )}
              </div>

              {/* Variantes de color - Debajo de la imagen */}
              {product.colorVariants && product.colorVariants.length > 0 && (
                <div>
                  <h4 className="text-sm text-gray-900 font-medium mb-4 uppercase tracking-wide">Colores Disponibles</h4>
                  <div className="space-y-2">
                    {product.colorVariants.map((variant, index) => (
                      <div
                        key={index}
                        className={`flex items-center p-3 border cursor-pointer transition-all duration-300 ${
                          selectedVariant === index 
                            ? 'border-red-600 bg-red-50' 
                            : 'border-gray-200 hover:border-red-200'
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
                          <p className="font-light text-gray-900 text-sm tracking-wide">{variant.colorName}</p>
                          <p className="text-xs text-gray-500 font-mono mt-1">SKU: {variant.sku}</p>
                        </div>
                        {selectedVariant === index && (
                          <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Información del producto */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-[1px] bg-red-600 mr-4"></div>
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-light">Producto</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-light text-gray-900 leading-tight">
                  {product.name}
                </h1>
                
                <div className="flex items-center gap-6 text-sm text-gray-500 font-light">
                  <span className="tracking-wide">{product.brand}</span>
                  <span className="font-mono text-gray-400">SKU: {product.sku}</span>
                </div>
              </div>

              {/* Descripción */}
              {product.description && (
                <div className="border-l-2 border-red-600 pl-6">
                  <h4 className="text-sm text-gray-900 font-medium mb-3 uppercase tracking-wide">Descripción</h4>
                  <p className="text-gray-600 font-light leading-relaxed max-w-md">{product.description}</p>
                </div>
              )}

              {/* Atributos */}
              {product.attributes && product.attributes.length > 0 && (
                <div>
                  <h4 className="text-sm text-gray-900 font-medium mb-4 uppercase tracking-wide">Especificaciones</h4>
                  <div className="space-y-3">
                    {product.attributes.map((attr, index) => (
                      <div key={index} className="py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                          <span className="font-light text-gray-700 tracking-wide flex-shrink-0 min-w-[120px] sm:min-w-[140px]">
                            {attr.name}
                          </span>
                          <span className="text-gray-600 font-light flex-1 break-words leading-relaxed">
                            {attr.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medidas */}
              {product.measurements?.enabled && (
                <div>
                  <h4 className="text-sm text-gray-900 font-medium mb-4 uppercase tracking-wide flex items-center">
                    <Ruler className="w-4 h-4 mr-2" />
                    Medidas Disponibles
                  </h4>
                  {product.measurements.description && (
                    <p className="text-gray-600 font-light leading-relaxed mb-3">{product.measurements.description}</p>
                  )}
                  {product.measurements.availableSizes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {product.measurements.availableSizes.map((size, index) => (
                        <span key={index} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-light tracking-wide border border-gray-200">
                          {size}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Botón de WhatsApp */}
              <div className="pt-6 border-t border-gray-200">
                <a
                  href={`https://wa.me/5491234567890?text=Hola!%20Me%20interesa%20el%20producto:%20${encodeURIComponent(product.name)}%20-%20SKU:%20${product.sku}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center w-full px-6 py-3 bg-red-600 text-white font-light tracking-wide hover:bg-red-700 transition-all duration-300"
                >
                  Consultar por WhatsApp
                  <div className="w-4 h-[1px] bg-red-400 group-hover:bg-white group-hover:w-8 ml-4 transition-all duration-300"></div>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      

      {/* Productos Recomendados */}
      {recommendedProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="flex items-center mb-6">
                <div className="w-8 h-[1px] bg-red-600 mr-4"></div>
                <span className="text-xs text-gray-400 uppercase tracking-widest font-light">Relacionados</span>
              </div>
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-light text-gray-900 leading-tight mb-4">
                    Productos Relacionados
                  </h2>
                  <p className="text-base text-gray-600 font-light leading-relaxed max-w-2xl">
                    Otros productos que podrían interesarte
                  </p>
                </div>
                <Link href="/catalogo">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group bg-red-600 text-white px-8 py-3 font-light text-sm tracking-wide hover:bg-red-700 transition-all duration-300 flex items-center"
                  >
                    Ver catálogo
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((recommendedProduct, index) => {
                // Obtener imagen específica para cada producto recomendado
                const recommendedMainImage = getMainImage(recommendedProduct)
                const recommendedOptimizedImage = recommendedMainImage ? getOptimizedImageUrl(recommendedMainImage) : null
                
                return (
                  <motion.div
                    key={recommendedProduct._id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <Link href={`/productos/${recommendedProduct._id}`}>
                      <div className="bg-white border border-gray-200 overflow-hidden hover:border-red-300 hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                        {/* Large Image Focus */}
                        <div className="aspect-square bg-gray-50 relative overflow-hidden">
                          {recommendedOptimizedImage && !recommendedImageErrors.has(recommendedProduct._id) ? (
                            <Image
                              src={recommendedOptimizedImage}
                              alt={recommendedProduct.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={() => {
                                setRecommendedImageErrors(prev => new Set(prev).add(recommendedProduct._id))
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Package className="w-12 h-12" />
                            </div>
                          )}
                          
                          {/* Minimal Overlay on Hover */}
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Floating Category - Minimal */}
                          {recommendedProduct.featured && (
                            <div className="absolute top-3 left-3">
                              <div className="w-2 h-2 bg-red-600 rounded-full shadow-lg"></div>
                            </div>
                          )}
                        </div>
                        
                        {/* Minimal Content */}
                        <div className="p-5 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-light text-gray-900 text-sm tracking-wide group-hover:text-red-600 transition-colors duration-300 line-clamp-2">
                              {recommendedProduct.name}
                            </h3>
                            <div className="w-3 h-[1px] bg-gray-300 group-hover:bg-red-600 group-hover:w-6 transition-all duration-300"></div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500 font-light">
                            <span className="tracking-wide truncate max-w-[40%]">{recommendedProduct.brand}</span>
                            <span className="font-mono text-gray-400 flex-shrink-0">{recommendedProduct.sku}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
    </>
  )
}

