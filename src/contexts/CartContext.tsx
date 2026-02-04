'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface CartItem {
  _id: string
  cartItemId: string // ID único para identificar el item en el carrito (incluye variante si existe)
  name: string
  sku: string
  brand: string
  image?: string
  colorVariant?: {
    colorName: string
    colorCode: string
    sku: string
  }
  measurementVariant?: {
    size: string
    sku: string
  }
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Omit<CartItem, 'quantity' | 'cartItemId'>, quantity?: number) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  getTotalItems: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const addItem = useCallback((product: Omit<CartItem, 'quantity' | 'cartItemId'>, quantity: number = 1) => {
    setItems(prevItems => {
      // ID único: producto + variante de color (si hay) + variante de medida (si hay)
      const parts = [product._id]
      if (product.colorVariant) parts.push(product.colorVariant.colorName)
      if (product.measurementVariant) parts.push(product.measurementVariant.sku)
      const cartItemId = parts.join('-')

      // Buscar si el producto ya existe en el carrito
      const existingItemIndex = prevItems.findIndex(item => item.cartItemId === cartItemId)

      if (existingItemIndex >= 0) {
        // Si existe, incrementar la cantidad
        const newItems = [...prevItems]
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity
        }
        return newItems
      } else {
        // Si no existe, agregarlo con el cartItemId
        return [...prevItems, { ...product, cartItemId, quantity }]
      }
    })
    
    // Abrir el carrito automáticamente al agregar un producto
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((cartItemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId))
  }, [])

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartItemId)
      return
    }
    setItems(prevItems =>
      prevItems.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    )
  }, [removeItem])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const toggleCart = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const openCart = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeCart = useCallback(() => {
    setIsOpen(false)
  }, [])

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }, [items])

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

