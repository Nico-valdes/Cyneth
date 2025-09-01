'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, Heart, ShoppingCart, Star, Tag } from 'lucide-react'
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

  const mainImage = getMainImage(product)
  const optimizedImage = mainImage ? getOptimizedImageUrl(mainImage) : null

  // Obtener imagen actual (variante seleccionada o imagen principal)
  const currentImage = product.colorVariants && product.colorVariants.length > 0 && product.colorVariants[selectedVariant]?.image
    ? product.colorVariants[selectedVariant].image
    : optimizedImage || ''

  if (viewMode === 'list') {
    return (
      <Link href={`/productos/${product._id}`} className="block">
        <div className="bg-white border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors cursor-pointer">
          <div className="p-3">
            <div className="flex gap-3">
              {/* Imagen */}
              <div className="w-20 h-20 flex-shrink-0">
                <div className="relative w-full h-full bg-white overflow-hidden border border-gray-100">
                  {currentImage && !imageError ? (
                    <Image
                      src={currentImage}
                      alt={product.name}
                      fill
                      className="object-contain p-2"
                      onError={() => setImageError(true)}
                      quality={85}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                      <Tag className="w-5 h-5" />
                    </div>
                  )}
                  {product.featured && (
                    <div className="absolute top-1 left-1">
                      <span className="bg-red-600 text-white text-xs px-1 py-0.5">
                        Destacado
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Información */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-medium text-gray-900 hover:text-red-600 transition-colors line-clamp-2 mb-1.5">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-3 mb-2 text-sm text-gray-600">
                      <span>{product.brand}</span>
                      <span className="font-mono text-xs">SKU: {product.sku}</span>
                    </div>
                  </div>
                </div>

                {product.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* Atributos destacados */}
                {product.attributes && product.attributes.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {product.attributes.slice(0, 3).map((attr, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {attr.name}: {attr.value}
                        </span>
                      ))}
                      {product.attributes.length > 3 && (
                        <span className="text-xs text-gray-500">+{product.attributes.length - 3} más</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Variantes de color */}
                {product.colorVariants && product.colorVariants.length > 0 && (
                  <div className="mb-2">
                    <div className="flex gap-0.5">
                      {product.colorVariants.slice(0, 6).map((variant, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedVariant(index);
                          }}
                          className={`w-3 h-3 border transition-colors ${
                            selectedVariant === index 
                              ? 'border-red-600' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: variant.colorCode }}
                          title={variant.colorName}
                        />
                      ))}
                      {product.colorVariants.length > 6 && (
                        <span className="text-xs text-gray-500 ml-1">+{product.colorVariants.length - 6}</span>
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
    <Link href={`/productos/${product._id}`} className="block h-full">
      <div className="bg-white border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors group flex flex-col h-full cursor-pointer">
        {/* Imagen cuadrada */}
        <div className="relative aspect-square bg-white overflow-hidden">
          {currentImage && !imageError ? (
            <Image
              src={currentImage}
              alt={product.name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
              priority={false}
              quality={85}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
              <Tag className="w-12 h-12" />
            </div>
          )}
          
          {/* Badge destacado */}
          {product.featured && (
            <div className="absolute top-2 left-2">
              <span className="bg-red-600 text-white text-xs px-1.5 py-0.5">
                Destacado
              </span>
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="p-3 border-t border-gray-100 flex flex-col flex-1">
          {/* Título y datos básicos */}
          <div className="mb-2">
            <h3 className="font-medium text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-1.5 leading-tight h-9 text-sm">
              {product.name}
            </h3>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>{product.brand}</span>
              <span className="font-mono">{product.sku}</span>
            </div>
          </div>

          {/* Variantes de color - altura fija */}
          <div className="mb-3 h-4 flex items-center">
            {product.colorVariants && product.colorVariants.length > 0 ? (
              <div className="flex gap-0.5">
                {product.colorVariants.slice(0, 5).map((variant, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedVariant(index);
                    }}
                    className={`w-3 h-3 border transition-colors ${
                      selectedVariant === index 
                        ? 'border-red-600' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: variant.colorCode }}
                    title={variant.colorName}
                  />
                ))}
                {product.colorVariants.length > 5 && (
                  <span className="text-xs text-gray-500 ml-1">+{product.colorVariants.length - 5}</span>
                )}
              </div>
            ) : (
              <div></div>
            )}
          </div>

          {/* Indicador visual de acción */}
          <div className="mt-auto">
            <div className="w-full text-center px-3 py-1.5 bg-red-600 text-white text-xs group-hover:bg-red-700 transition-colors">
              Ver Detalles
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
