'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X, ShoppingCart, Trash2, Plus, Minus, MessageCircle } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { getOptimizedImageUrl } from '@/utils/imageUtils'
import Image from 'next/image'
import Link from 'next/link'

export default function Cart() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, clearCart, getTotalItems } = useCart()

  const handleWhatsApp = () => {
    const message = items.map(item => {
      const variantInfo = item.colorVariant 
        ? ` - Color: ${item.colorVariant.colorName} (SKU: ${item.colorVariant.sku})`
        : ''
      return `${item.name} (SKU: ${item.sku})${variantInfo} - Cantidad: ${item.quantity}`
    }).join('%0A')

    const whatsappUrl = `https://wa.me/5491234567890?text=Hola!%20Me%20interesa%20consultar%20sobre%20los%20siguientes%20productos:%0A%0A${message}%0A%0A¿Podrían%20brindarme%20más%20información%20y%20precios?`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={closeCart}
          />

          {/* Panel del carrito */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-light text-gray-900 tracking-wide">
                  Carrito de Consulta
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Cerrar carrito"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCart className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-light text-gray-900 mb-2 tracking-wide">
                    Tu carrito está vacío
                  </h3>
                  <p className="text-sm text-gray-500 font-light mb-6">
                    Agrega productos para consultar precios y detalles
                  </p>
                  <button
                    onClick={closeCart}
                    className="px-6 py-2 bg-gray-900 text-white font-light tracking-wide hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Explorar catálogo
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex gap-4">
                        {/* Imagen */}
                        <div className="relative w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <Image
                              src={getOptimizedImageUrl(item.image)}
                              alt={item.name}
                              fill
                              className="object-contain p-2"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ShoppingCart className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        {/* Información */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/productos/${item._id}`}
                            onClick={closeCart}
                            className="block"
                          >
                            <h3 className="font-light text-gray-900 text-sm mb-1 hover:text-red-600 transition-colors line-clamp-2 tracking-wide">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-xs text-gray-500 font-light mb-1">
                            {item.brand}
                          </p>
                          <p className="text-xs text-gray-400 font-mono mb-2">
                            SKU: {item.sku}
                          </p>
                          {item.colorVariant && (
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: item.colorVariant.colorCode }}
                              />
                              <span className="text-xs text-gray-600 font-light">
                                {item.colorVariant.colorName}
                              </span>
                            </div>
                          )}

                          {/* Controles de cantidad */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2 border border-gray-200 rounded">
                              <button
                                onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                className="p-1.5 hover:bg-gray-100 transition-colors cursor-pointer"
                                aria-label="Disminuir cantidad"
                              >
                                <Minus className="w-3 h-3 text-gray-600" />
                              </button>
                              <span className="px-3 py-1 text-sm font-light text-gray-900 min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                className="p-1.5 hover:bg-gray-100 transition-colors cursor-pointer"
                                aria-label="Aumentar cantidad"
                              >
                                <Plus className="w-3 h-3 text-gray-600" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.cartItemId)}
                              className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer rounded"
                              aria-label="Eliminar producto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 bg-white p-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-light tracking-wide">
                    Total de productos:
                  </span>
                  <span className="font-light text-gray-900">
                    {getTotalItems()} {getTotalItems() === 1 ? 'producto' : 'productos'}
                  </span>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={clearCart}
                    className="flex-1 px-4 py-3 text-sm font-light text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer tracking-wide"
                  >
                    Limpiar todo
                  </button>
                  <button
                    onClick={handleWhatsApp}
                    className="flex-1 px-4 py-3 text-sm font-light text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer tracking-wide flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Consultar por WhatsApp
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 text-center font-light">
                  Este carrito es para consultas. No se realizan compras online.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

