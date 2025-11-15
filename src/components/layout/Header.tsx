'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu, X, Search, ShoppingCart, Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import logo from "../../../public/Cyneth-logo.png"
import { getMainImage, getOptimizedImageUrl } from '@/utils/imageUtils'
import { useCart } from '@/contexts/CartContext'
import Cart from './Cart'

interface NavLink {
  href: string;
  label: string;
}

interface Product {
  _id: string;
  name: string;
  brand?: string;
  sku: string;
  defaultImage?: string;
  colorVariants?: Array<{
    image?: string;
  }>;
}

const navLinks: NavLink[] = [
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
]

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [lastScrollY, setLastScrollY] = useState<number>(0);
  const { toggleCart, getTotalItems } = useCart();
  
  // Estados para el buscador
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false)
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { addItem: addToCart } = useCart()
  
  // Control de visibilidad del header en scroll
  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false); // Scrolling hacia abajo
      } else if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true); // Scrolling hacia arriba o cerca del tope
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  // Efecto para buscar productos
  useEffect(() => {
    const searchProducts = async () => {
      // Permitir búsqueda con solo 1 carácter
      if (searchQuery.trim().length < 1) {
        setSearchResults([])
        setShowSearchResults(false)
        return
      }

      setIsSearching(true)
      try {
        // Usar el término de búsqueda tal cual - la API debería manejar búsqueda parcial
        const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery.trim())}&limit=10&active=true`)
        
        if (response.ok) {
          const data = await response.json()
          // La API devuelve { success: true, data: { products: [...], pagination: {...} } }
          const products = data?.data?.products || data?.products || []
          
          // Asegurar que products es un array antes de usar slice
          if (Array.isArray(products)) {
            setSearchResults(products.slice(0, 5)) // Limitar a 5 resultados para mostrar
          } else {
            setSearchResults([])
          }
          setShowSearchResults(true)
        } else {
          setSearchResults([])
          setShowSearchResults(true)
        }
      } catch (error) {
        console.error('Error searching products:', error)
        setSearchResults([])
        setShowSearchResults(true)
      } finally {
        setIsSearching(false)
      }
    }

    // Reducir debounce a 200ms para respuesta más rápida
    const debounceTimer = setTimeout(searchProducts, 200)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  // Cerrar resultados al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])


  const toggleNavbar = () => setIsOpen(!isOpen)
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim().length >= 1) {
      // Navegar al catálogo con el término de búsqueda
      router.push(`/catalogo?search=${encodeURIComponent(searchQuery.trim())}`)
      // Limpiar estados
      setShowSearchResults(false)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleProductClick = (productId: string) => {
    router.push(`/productos/${productId}`)
    setShowSearchResults(false)
    setIsSearchOpen(false)
    setSearchQuery('')
  }

  const handleViewAllResults = () => {
    if (searchQuery.trim()) {
      router.push(`/catalogo?search=${encodeURIComponent(searchQuery)}`)
      setShowSearchResults(false)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleAddToCartFromSearch = (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    e.stopPropagation()
    
    const mainImage = getMainImage(product)
    const optimizedImage = mainImage ? getOptimizedImageUrl(mainImage) : undefined
    
    addToCart({
      _id: product._id,
      name: product.name,
      sku: product.sku,
      brand: product.brand || 'Sin marca',
      image: optimizedImage
    })
  }

  const toggleMobileSearch = () => {
    setIsSearchOpen(!isSearchOpen)
    if (!isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }

  return (
    <>
      {/* Este div mantiene el espacio del header */}
      <div className="h-16"></div>
      
      <motion.nav 
        className="fixed w-full top-0 z-50 bg-white shadow-md"
        animate={{
          y: isVisible ? 0 : '-100%'
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* Left side - Mobile menu button + Navigation links */}
            <div className="flex-1 flex items-center">
              {/* Mobile Menu Button - Minimalist */}
              <div className="lg:hidden">
                <button
                  onClick={toggleNavbar}
                  className="inline-flex items-center justify-center p-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
                  aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
                >
                  {isOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>

              {/* Desktop Navigation links */}
              <div className="hidden lg:flex items-center space-x-6 ml-8">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium relative group whitespace-nowrap transition-colors duration-200 ${
                      pathname === href ? 'text-red-600 font-semibold' : ''
                    }`}
                  >
                    {label}
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-red-600 scale-x-0 transition-transform duration-200 group-hover:scale-x-100 origin-center"></span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Center - Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image 
                  src={logo} 
                  alt="Logo Cyneth" 
                  height={45} 
                  width={140} 
                  priority 
                  className="h-auto"
                />
              </Link>
            </div>

            {/* Right side - Search and Cart */}
            <div className="flex-1 flex items-center justify-end gap-4">
              

              {/* Desktop Search */}
              <div className="hidden lg:flex items-center">
                <div className="relative" ref={searchRef}>
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery.length >= 1 && setShowSearchResults(true)}
                      className="w-64 px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm bg-gray-50 hover:bg-white transition-all duration-200"
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                    >
                      <Search size={18} />
                    </button>
                  </form>
                  
                  
                  {/* Resultados de búsqueda Desktop */}
                  {showSearchResults && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto z-50">
                      {isSearching ? (
                        <div className="p-4 text-center text-gray-500">
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          <span className="ml-2">Buscando...</span>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <>
                          {searchResults.map((product) => (
                            <div
                              key={product._id}
                              className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors duration-200 group"
                            >
                              <div
                                onClick={() => handleProductClick(product._id)}
                                className="flex items-center flex-1 min-w-0 cursor-pointer"
                              >
                                <div className="relative w-12 h-12 mr-3 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                  {(() => {
                                    const mainImage = getMainImage(product);
                                    const optimizedImage = mainImage ? getOptimizedImageUrl(mainImage) : null;
                                    
                                    return optimizedImage ? (
                                      <img
                                        src={optimizedImage}
                                        alt={product.name}
                                        className="object-contain w-full h-full p-1"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <Search size={16} className="text-gray-400" />
                                      </div>
                                    );
                                  })()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-gray-900 truncate mb-1">
                                    {product.name}
                                  </h4>
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-500">
                                      {product.brand || 'Sin marca'}
                                    </p>
                                    <p className="text-xs text-gray-400 font-mono">
                                      {product.sku}
                                    </p>
                                  </div>
                                </div>
                                <div className="ml-2 text-gray-400">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                              <button
                                onClick={(e) => handleAddToCartFromSearch(e, product)}
                                className="ml-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200 cursor-pointer opacity-0 group-hover:opacity-100"
                                aria-label="Agregar al carrito"
                                title="Agregar al carrito"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          ))}
                          <div className="p-3 border-t border-gray-100 bg-gray-50">
                            <button
                              onClick={handleViewAllResults}
                              className="w-full text-center text-sm text-red-600 hover:text-red-700 py-2 font-medium transition-colors duration-200"
                            >
                              Ver todos los resultados
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="p-6 text-center text-gray-500">
                          <Search size={24} className="mx-auto mb-2 text-gray-300" />
                          <p className="text-sm font-medium">No se encontraron productos</p>
                          <p className="text-xs text-gray-400 mt-1">Intenta con otros términos de búsqueda</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {/* Desktop Cart Button */}
              <div className="hidden lg:flex items-center">
                    <button
                      onClick={toggleCart}
                      className="relative p-2 text-gray-600 hover:text-red-600 rounded-md transition-colors duration-200 cursor-pointer"
                      aria-label="Abrir carrito"
                    >
                      <ShoppingCart size={22} />
                      {getTotalItems() > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                          {getTotalItems() > 9 ? '9+' : getTotalItems()}
                        </span>
                      )}
                    </button>
                  </div>

              {/* Mobile Search and Cart Buttons - Minimalist */}
              <div className="lg:hidden flex items-center gap-1">
                <button
                  onClick={toggleMobileSearch}
                  className="p-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
                  aria-label="Buscar productos"
                >
                  <Search size={20} />
                </button>
                <button
                  onClick={toggleCart}
                  className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
                  aria-label="Abrir carrito"
                >
                  <ShoppingCart size={20} />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                      {getTotalItems() > 9 ? '9+' : getTotalItems()}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Buscador Mobile - Minimalist */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden border-t border-gray-100 bg-white"
                ref={searchRef}
              >
                <div className="p-4">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Buscar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery.length >= 1 && setShowSearchResults(true)}
                      className="w-full px-4 py-2.5 pr-10 border-b border-gray-300 focus:outline-none focus:border-gray-900 bg-transparent text-sm"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                    >
                      <Search size={18} />
                    </button>
                  </form>
                  
                  {/* Resultados de búsqueda Mobile */}
                  {showSearchResults && (
                    <div className="mt-4 border-t border-gray-100 pt-4 max-h-64 overflow-y-auto">
                      {isSearching ? (
                        <div className="py-8 text-center text-gray-400 text-sm">Buscando...</div>
                      ) : searchResults.length > 0 ? (
                        <>
                          {searchResults.map((product) => (
                            <div
                              key={product._id}
                              onClick={() => handleProductClick(product._id)}
                              className="flex items-center py-3 border-b border-gray-50 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                              <div className="relative w-12 h-12 mr-3 bg-gray-100 flex-shrink-0">
                                {(() => {
                                  const mainImage = getMainImage(product);
                                  const optimizedImage = mainImage ? getOptimizedImageUrl(mainImage) : null;
                                  
                                  return optimizedImage ? (
                                    <img
                                      src={optimizedImage}
                                      alt={product.name}
                                      className="object-contain w-full h-full p-1"
                                    />
                                  ) : null;
                                })()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm text-gray-900 truncate mb-0.5">
                                  {product.name}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {product.brand || 'Sin marca'}
                                </p>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={handleViewAllResults}
                            className="w-full mt-2 py-2 text-sm text-gray-600 hover:text-gray-900 text-center"
                          >
                            Ver todos
                          </button>
                        </>
                      ) : (
                        <div className="py-8 text-center text-gray-400 text-sm">
                          No se encontraron productos
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Navigation Menu - Minimalist with Slide Animation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="lg:hidden bg-white border-t border-gray-100 relative"
            >
              {/* Línea vertical izquierda sutil */}
              <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gray-200"></div>
              
              <nav className="py-2 relative">
                {navLinks.map(({ href, label }, index) => (
                  <Link
                    key={href}
                    href={href}
                    className={`relative block px-6 py-3 text-sm transition-colors ${
                      pathname === href 
                        ? 'text-gray-900 font-medium' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {/* Línea vertical indicadora para item activo */}
                    {pathname === href && (
                      <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-900"
                      />
                    )}
                    
                    {/* Línea horizontal sutil entre items */}
                    {index > 0 && (
                      <div className="absolute top-0 left-6 right-0 h-[1px] bg-gray-100"></div>
                    )}
                    
                    <span className="relative z-10">{label}</span>
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      
      {/* Componente del carrito */}
      <Cart />
    </>
  )
}