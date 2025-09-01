'use client'

import { useContext, useEffect, useState } from 'react'
import { CartContext } from '../../context/CartContext'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Form from './Form'

export default function Cart({ isOpen, onClose }) {
  const { cartItems, removeItem, updateQuantity } = useContext(CartContext)
  const [showForm, setShowForm] = useState(false);

  const handleContinuePurchase = () => {
    setShowForm(true);
  };

  const handleContinueShopping = () => {
    onClose();
  };

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 250 }}
            className="relative h-full w-[95%] max-w-[450px] bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Carrito de Compras</h2>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Cerrar carrito"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              {!showForm && (
                <p className="text-sm text-gray-500 mt-1">{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</p>
              )}
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto">
              {!showForm ? (
                cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <ShoppingCart size={32} className="text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-800">Tu carrito está vacío</p>
                    <p className="mt-2 text-sm text-gray-500">Explora nuestros productos y comienza a agregar</p>
                    <button
                      onClick={handleContinueShopping}
                      className="mt-6 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Explorar Productos
                    </button>
                  </div>
                ) : (
                  <div className="p-5">
                    <AnimatePresence>
                      {cartItems.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center py-4 border-b border-gray-100 last:border-0"
                        >
                          <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-gray-50">
                            <Image 
                              src={item.image} 
                              alt={item.name} 
                              layout="fill" 
                              objectFit="cover"
                              className="hover:scale-105 transition-transform duration-300" 
                            />
                          </div>
                          <div className="flex-grow ml-4">
                            <h3 className="font-medium text-gray-800">{item.name}</h3>
                            <div className="flex items-center mt-2">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                aria-label="Disminuir cantidad"
                              >
                                <Minus size={14} className="text-gray-600" />
                              </button>
                              <span className="mx-3 font-medium text-sm w-6 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                aria-label="Aumentar cantidad"
                              >
                                <Plus size={14} className="text-gray-600" />
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-2"
                            aria-label="Eliminar artículo"
                          >
                            <Trash2 size={16} className="text-gray-400 hover:text-red-500" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )
              ) : (
                <Form onBack={() => setShowForm(false)} cartItems={cartItems} />
              )}
            </div>

            {/* Footer */}
            {!showForm && cartItems.length > 0 && (
              <div className="p-5 border-t border-gray-100">
                <div className="space-y-3">
                  <button 
                    onClick={handleContinuePurchase}
                    className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    Finalizar Compra
                  </button>
                  <button
                    onClick={handleContinueShopping}
                    className="w-full bg-white text-gray-800 py-3 px-4 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Seguir Comprando
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}