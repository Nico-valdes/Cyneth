'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, Heart, ShoppingCart, Star, Tag, Plus } from 'lucide-react'
import { getMainImage, getOptimizedImageUrl, isCloudinaryUrl, shouldUseNextImage } from '@/utils/imageUtils'
import { useCart } from '@/contexts/CartContext'

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

interface ProductCardProps {
  product: Product
  viewMode: 'grid' | 'list'
}

export default function ProductCard({ product, viewMode }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState(0)
  const { addItem } = useCart()

  const mainImage = getMainImage(product)
  
  // Obtener imagen actual (variante seleccionada o imagen principal)
  const variantImage = product.colorVariants && product.colorVariants.length > 0 && product.colorVariants[selectedVariant]?.image
    ? product.colorVariants[selectedVariant].image
    : null
  const rawImage = variantImage || mainImage || ''
  
  // Ajustar tamaño según el modo de vista
  // Vista lista: imagen pequeña (96x96)
  // Vista grid: imagen mediana (400x400)
  const imageSize = viewMode === 'list' ? 96 : 400
  const currentImage = rawImage ? getOptimizedImageUrl(rawImage, imageSize, imageSize) : ''

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const selectedVariantData = product.colorVariants?.[selectedVariant]
    
    addItem({
      _id: product._id,
      name: product.name,
      sku: product.sku, // Siempre usar el SKU principal del producto
      brand: product.brand,
      image: currentImage,
      colorVariant: selectedVariantData ? {
        colorName: selectedVariantData.colorName,
        colorCode: selectedVariantData.colorCode,
        sku: selectedVariantData.sku // El SKU de la variante solo se guarda en colorVariant para referencia
      } : undefined
    })
  }

  if (viewMode === 'list') {
    return (
      <Link href={`/productos/${product._id}`} className="block no-underline outline-none focus:outline-none">
        <div className="bg-white overflow-hidden hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="p-2 sm:p-3 md:p-4">
            <div className="flex gap-2 sm:gap-3 md:gap-4">
              {/* Imagen - Responsive */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0">
                <div className="relative w-full h-full bg-white overflow-hidden rounded">
                  {currentImage && !imageError ? (
                    shouldUseNextImage(currentImage) ? (
                      <Image
                        src={currentImage}
                        alt={product.name}
                        fill
                        className="object-contain p-1 sm:p-2"
                        onError={() => setImageError(true)}
                        quality={85}
                        sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
                      />
                    ) : (
                      <img
                        src={currentImage}
                        alt={product.name}
                        className="w-full h-full object-contain p-1 sm:p-2"
                        onError={() => setImageError(true)}
                        loading="lazy"
                        width={96}
                        height={96}
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                      <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  )}
                </div>
              </div>

              {/* Información */}
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-medium text-gray-900 hover:text-red-600 transition-colors line-clamp-2 mb-1 sm:mb-1.5 leading-tight">
                    {product.name}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 md:gap-3 mb-1 sm:mb-2">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">{product.brand}</span>
                    <span className="font-mono text-[10px] sm:text-xs text-gray-500">SKU: {product.sku}</span>
                  </div>
                </div>

                {product.description && (
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 md:mb-4 line-clamp-2 hidden sm:block">
                    {product.description}
                  </p>
                )}

                {/* Atributos destacados - Solo en pantallas medianas+ */}
                {product.attributes && product.attributes.length > 0 && (
                  <div className="mb-2 sm:mb-3 md:mb-4 hidden sm:block">
                    <div className="flex flex-wrap gap-1">
                      {product.attributes.slice(0, 3).map((attr, index) => (
                        <span key={index} className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-700 text-[10px] sm:text-xs rounded">
                          {attr.name}: {attr.value}
                        </span>
                      ))}
                      {product.attributes.length > 3 && (
                        <span className="text-[10px] sm:text-xs text-gray-500">+{product.attributes.length - 3} más</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Variantes de color - Mejorado para móvil */}
                {product.colorVariants && product.colorVariants.length > 0 && (
                  <div className="mb-2 sm:mb-2">
                    <div className="flex gap-1 sm:gap-0.5 items-center">
                      {product.colorVariants.slice(0, 6).map((variant, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedVariant(index);
                          }}
                          className={`w-4 h-4 sm:w-3 sm:h-3 border-2 transition-colors cursor-pointer touch-manipulation ${
                            selectedVariant === index 
                              ? 'border-red-600 scale-110' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: variant.colorCode }}
                          title={variant.colorName}
                          aria-label={`Color ${variant.colorName}`}
                        />
                      ))}
                      {product.colorVariants.length > 6 && (
                        <span className="text-[10px] sm:text-xs text-gray-500 ml-1">+{product.colorVariants.length - 6}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Vista de grid (cuadrada) - Toda la tarjeta clickeable
  return (
    <Link href={`/productos/${product._id}`} className="block h-full no-underline outline-none focus:outline-none">
      <div className="bg-white overflow-hidden transition-all duration-300 group flex flex-col h-full cursor-pointer">
        {/* Imagen cuadrada - Responsive */}
        <div className="relative aspect-square bg-white overflow-hidden">
          {currentImage && !imageError ? (
            shouldUseNextImage(currentImage) ? (
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => setImageError(true)}
                priority={false}
                quality={85}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => setImageError(true)}
                loading="lazy"
                width={400}
                height={400}
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
              <Tag className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
            </div>
          )}
        </div>

        {/* Información del producto - Responsive */}
        <div className="p-2 sm:p-3 md:p-4 flex flex-col flex-1 min-h-0">
          {/* Título y datos básicos */}
          <div className="mb-2 sm:mb-3">
            <h3 className="font-light text-gray-900 group-hover:text-black transition-colors line-clamp-2 mb-1 sm:mb-2 leading-tight text-xs sm:text-sm tracking-wide">
              {product.name}
            </h3>
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500">
              <span className="font-light uppercase tracking-wider truncate pr-2">{product.brand}</span>
            </div>
          </div>

          {/* Variantes de color - Responsive y táctil */}
          <div className="mb-2 sm:mb-3 md:mb-4 h-4 sm:h-5 flex items-center">
            {product.colorVariants && product.colorVariants.length > 0 ? (
              <div className="flex gap-1 sm:gap-1.5 items-center">
                {product.colorVariants.slice(0, 4).map((variant, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedVariant(index);
                    }}
                    className={`w-5 h-5 sm:w-4 sm:h-4 transition-all duration-200 cursor-pointer touch-manipulation rounded-full ${
                      selectedVariant === index 
                        ? 'ring-2 ring-black ring-offset-1 scale-110' 
                        : 'hover:ring-1 hover:ring-gray-300 hover:ring-offset-1'
                    }`}
                    style={{ backgroundColor: variant.colorCode }}
                    title={variant.colorName}
                    aria-label={`Color ${variant.colorName}`}
                  />
                ))}
                {product.colorVariants.length > 4 && (
                  <span className="text-[10px] sm:text-xs text-gray-400 ml-1 sm:ml-2 font-light">
                    +{product.colorVariants.length - 4}
                  </span>
                )}
              </div>
            ) : (
              <div></div>
            )}
          </div>

          {/* Línea animada */}
          <div className="mt-auto relative overflow-hidden">
            <div className="w-full h-px bg-gray-200"></div>
            <div className="absolute top-0 left-0 h-px bg-black w-0 group-hover:w-full transition-all duration-500 ease-out"></div>
          </div>
        </div>
      </div>
    </Link>
  )
}
