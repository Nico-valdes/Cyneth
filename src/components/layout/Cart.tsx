'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X, ShoppingCart, Trash2, Plus, Minus, MessageCircle, ArrowRight } from 'lucide-react'
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
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header minimalista */}
            <div className="flex items-center justify-between px-6 sm:px-8 py-6 sm:py-8 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-4">
                <div className="w-6 h-[1px] bg-gray-300"></div>
                <h2 className="text-xl sm:text-2xl font-extralight text-gray-900 tracking-wide uppercase">
                  Carrito
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
                aria-label="Cerrar carrito"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 sm:p-12 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <ShoppingCart className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extralight text-gray-900 mb-3 tracking-wide">
                    Tu carrito está vacío
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500 font-light mb-8 max-w-sm leading-relaxed">
                    Agrega productos para consultar precios y detalles
                  </p>
                  <Link href="/catalogo" onClick={closeCart}>
                    <motion.button 
                      className="group relative inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 rounded-full border-2 border-gray-900 cursor-pointer overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="relative z-10 text-xs sm:text-sm font-medium tracking-wide">EXPLORAR CATÁLOGO</span>
                      <ArrowRight size={14} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                    </motion.button>
                  </Link>
                </div>
              ) : (
                <div className="p-6 sm:p-8 space-y-6">
                  {items.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-white border border-gray-100 rounded-lg p-4 sm:p-6 hover:border-gray-200 transition-all"
                    >
                      <div className="flex gap-4 sm:gap-6">
                        {/* Imagen */}
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <Image
                              src={getOptimizedImageUrl(item.image, 200, 200)}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ShoppingCart className="w-8 h-8" />
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
                            <h3 className="font-light text-gray-900 text-sm sm:text-base mb-2 hover:text-gray-700 transition-colors line-clamp-2 tracking-wide leading-snug">
                              {item.name}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-3 mb-2">
                            <p className="text-xs sm:text-sm text-gray-600 font-light">
                              {item.brand}
                            </p>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <p className="text-xs text-gray-400 font-mono">
                              {item.sku}
                            </p>
                          </div>
                          {item.colorVariant && (
                            <div className="flex items-center gap-2 mb-4">
                              <div
                                className="w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                                style={{ backgroundColor: item.colorVariant.colorCode }}
                              />
                              <span className="text-xs text-gray-500 font-light">
                                {item.colorVariant.colorName}
                              </span>
                            </div>
                          )}

                          {/* Controles de cantidad */}
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-1 border border-gray-200 rounded-full">
                              <button
                                onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                className="p-2 hover:bg-gray-50 transition-colors cursor-pointer rounded-l-full"
                                aria-label="Disminuir cantidad"
                              >
                                <Minus className="w-3.5 h-3.5 text-gray-600" />
                              </button>
                              <span className="px-4 py-2 text-sm font-light text-gray-900 min-w-[3rem] text-center border-x border-gray-200">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                className="p-2 hover:bg-gray-50 transition-colors cursor-pointer rounded-r-full"
                                aria-label="Aumentar cantidad"
                              >
                                <Plus className="w-3.5 h-3.5 text-gray-600" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.cartItemId)}
                              className="p-2 hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer rounded-full"
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

            {/* Footer minimalista */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 bg-white p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-[1px] bg-gray-300"></div>
                    <span className="text-xs text-gray-400 uppercase tracking-widest font-light">
                      Total
                    </span>
                  </div>
                  <span className="font-extralight text-lg text-gray-900">
                    {getTotalItems()} {getTotalItems() === 1 ? 'producto' : 'productos'}
                  </span>
                </div>
                
                <div className="flex flex-col gap-3">
                  <motion.button
                    onClick={handleWhatsApp}
                    className="group relative w-full px-6 sm:px-8 py-3 sm:py-4 bg-black text-white rounded-full overflow-hidden transition-all cursor-pointer flex items-center justify-center gap-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MessageCircle className="w-4 h-4 relative z-10" />
                    <span className="relative z-10 text-xs sm:text-sm font-medium tracking-wide">
                      CONSULTAR POR WHATSAPP
                    </span>
                    <ArrowRight size={14} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                  </motion.button>
                  
                  <button
                    onClick={clearCart}
                    className="w-full px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-light text-gray-600 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer tracking-wide rounded-full"
                  >
                    Limpiar todo
                  </button>
                </div>
                
                <p className="text-xs text-gray-400 text-center font-light leading-relaxed pt-2 border-t border-gray-100">
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

