'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu, X, Search } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import logo from "../../../public/Cyneth-logo.png"
import { getMainImage, getOptimizedImageUrl } from '@/utils/imageUtils'

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
  
  // Estados para el buscador
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false)
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  
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
              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <button
                  onClick={toggleNavbar}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-600"
                  aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
                >
                  {isOpen ? <X size={24} /> : <Menu size={24} />}
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

            {/* Right side - Search */}
            <div className="flex-1 flex items-center justify-end">
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
                              onClick={() => handleProductClick(product._id)}
                              className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200"
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

              {/* Mobile Search Button */}
              <div className="lg:hidden">
                <button
                  onClick={toggleMobileSearch}
                  className="text-gray-600 hover:text-red-600 p-2 rounded-md transition-colors duration-200"
                  aria-label="Buscar productos"
                >
                  <Search size={22} />
                </button>
              </div>
            </div>
          </div>

          {/* Buscador Mobile */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden border-t border-gray-200 bg-white"
              >
                <div className="p-4" ref={searchRef}>
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery.length >= 1 && setShowSearchResults(true)}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent bg-gray-50"
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                    >
                      <Search size={20} />
                    </button>
                  </form>
                  
                  {/* Resultados de búsqueda Mobile */}
                  {showSearchResults && (
                    <div className="mt-3 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
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
                              onClick={() => handleProductClick(product._id)}
                              className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200"
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
                                      <Search size={14} className="text-gray-400" />
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
                          <Search size={20} className="mx-auto mb-2 text-gray-300" />
                          <p className="text-sm font-medium">No se encontraron productos</p>
                          <p className="text-xs text-gray-400 mt-1">Intenta con otros términos</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="lg:hidden bg-white shadow-lg border-t border-gray-200"
              initial={{ opacity: 0, x: '-100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="py-4">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`block px-6 py-3 text-base font-medium border-l-4 transition-all duration-200 ${
                      pathname === href 
                        ? 'text-red-600 border-red-600 bg-red-50 font-semibold' 
                        : 'text-gray-700 border-transparent hover:text-red-600 hover:border-red-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
                
                {/* Enlace al panel admin solo visible desde el header */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link
                    href="/admin"
                    className="block px-6 py-3 text-sm text-gray-500 hover:text-red-600 transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Panel Administrativo
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  )
}