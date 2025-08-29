'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import ProductList from '@/components/ProductList'
import Statistics from '@/components/Statistics'
import Image from 'next/image'
import logo from "../../../public/Cyneth-logo.png"
import { 
  Package, 
  BarChart3,
  Tags,
  Award
} from 'lucide-react'
import CategoryManager from '@/components/CategoryManager'
import BrandManager from '@/components/BrandManager'

interface Product {
  _id: string
  name: string
  category: string
  brand?: string
  active: boolean
  featured?: boolean
  createdAt: string
}

export default function AdminPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()



  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const menuItems = [
    { id: 'products', label: 'Listado de Productos', icon: Package, href: '#products' },
    { id: 'categories', label: 'Gestionar Categorías', icon: Tags, href: '#categories' },
    { id: 'brands', label: 'Gestionar Marcas', icon: Award, href: '#brands' },
    { id: 'statistics', label: 'Estadísticas', icon: BarChart3, href: '#statistics' },
  ]



  // Función para recargar productos
  const reloadProducts = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Iniciando carga de productos...'); // Debug log
      
      const response = await fetch('/api/products?page=1&limit=50&active=true');
      console.log('📡 Response status:', response.status); // Debug log
      console.log('📡 Response ok:', response.ok); // Debug log
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 API Response completa:', data); // Debug log
        console.log('📦 Data type:', typeof data); // Debug log
        console.log('📦 Data.success:', data?.success); // Debug log
        console.log('📦 Data.data:', data?.data); // Debug log
        console.log('📦 Data.data.products:', data?.data?.products); // Debug log
        console.log('📦 Is products array:', Array.isArray(data?.data?.products)); // Debug log
        
        // La API devuelve { success: true, data: { products: [...] } }
        const productsArray = data?.data?.products || [];
        console.log('✅ Products Array final:', productsArray); // Debug log
        console.log('✅ Products count:', productsArray.length); // Debug log
        setProducts(productsArray);
      } else {
        console.error('❌ Error recargando productos:', response.statusText);
        setProducts([]); // Establecer array vacío en caso de error
      }
    } catch (error) {
      console.error('❌ Error recargando productos:', error);
      setProducts([]); // Establecer array vacío en caso de error
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar productos reales de la base de datos
  useEffect(() => {
    reloadProducts();
  }, []);

  // Función para eliminar producto (mantenida para compatibilidad)
  const handleDeleteProduct = async (productId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Recargar productos para obtener datos actualizados
          await reloadProducts();
        } else {
          alert('Error eliminando el producto');
        }
      } catch (error) {
        console.error('Error eliminando producto:', error);
        alert('Error eliminando el producto');
      }
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white flex">

        {/* Sidebar profesional con colores corporativos */}
        <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} sticky top-0 z-50 w-80 bg-neutral-900 shadow-2xl transform transition-all duration-300 ease-in-out lg:translate-x-0 h-screen`}>
          <div className="h-full flex flex-col">
            {/* Header del sidebar */}
            <div className="px-6 py-8 border-b border-neutral-700">
              <div className="flex items-center">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 lg:hidden mr-3"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div>
                  <Image src={logo} alt="Cyneth Logo" width={120} height={50} className="mb-1" />
                  <p className="text-sm text-gray-400 font-medium">Panel de Administración</p>
                </div>
              </div>
            </div>
            
            {/* Navegación */}
            <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
              <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`${
                      activeTab === item.id
                        ? 'text-white border-l-4 border-red-500 bg-neutral-800 pl-3'
                        : 'text-gray-300 hover:bg-neutral-800 hover:text-white pl-4'
                    } group flex items-center py-4 pr-4 text-sm font-medium transition-all duration-200`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon size={20} className={`mr-4 ${
                      activeTab === item.id ? 'text-red-400' : 'text-gray-400'
                    }`} />
                    <span className="font-semibold">{item.label}</span>
                  </Link>
                ))}
                

              </nav>
              
              {/* Información del usuario y logout en la parte inferior */}
              <div className="px-4 pt-4 border-t border-neutral-700">
                {/* Información del usuario */}
                <div className="flex items-center p-4 bg-neutral-800 rounded-xl hover:bg-neutral-700 transition-all duration-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg font-bold">A</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-base font-semibold text-white">Administrador</p>
                    <p className="text-sm text-gray-400">admin@cyneth.com</p>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="w-full mt-4 flex items-center justify-center px-4 py-3.5 text-base font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all duration-200 group"
                >
                  <svg className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Contenido principal sin header */}
        <main className="flex-1 overflow-y-auto focus:outline-none bg-gray-50">
          <div className="h-full">
            <div className="max-w-full mx-auto px-8 py-8 h-full">
              {/* Productos */}
              {activeTab === 'products' && (
                <div className="animate-fadeIn h-full">
                  <ProductList />
                </div>
              )}

              {/* Gestión de Categorías */}
              {activeTab === 'categories' && (
                <CategoryManager />
              )}

              {/* Gestión de Marcas */}
              {activeTab === 'brands' && (
                <BrandManager />
              )}

              {/* Estadísticas */}
              {activeTab === 'statistics' && (
                <div className="animate-fadeIn h-full">
                  <Statistics products={products} />
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Overlay para móvil */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-60 lg:hidden transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        

      </div>
    </ProtectedRoute>
  )
}
