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
  Award,
  LogOut,
  User,
  Menu,
  X,
  ChevronRight,
  Activity,
  Upload
} from 'lucide-react'
import CategoryManager from '@/components/CategoryManager'
import BrandManager from '@/components/BrandManager'
import BulkUpload from '@/components/BulkUpload'

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
    { 
      id: 'products', 
      label: 'Gestión de Productos', 
      icon: Package, 
      href: '#products',
      description: 'Administrar inventario y catálogo'
    },
    { 
      id: 'bulk-upload', 
      label: 'Carga Masiva', 
      icon: Upload, 
      href: '#bulk-upload',
      description: 'Subir productos desde Excel'
    },
    { 
      id: 'categories', 
      label: 'Categorías', 
      icon: Tags, 
      href: '#categories',
      description: 'Organizar clasificaciones'
    },
    { 
      id: 'brands', 
      label: 'Marcas', 
      icon: Award, 
      href: '#brands',
      description: 'Gestionar fabricantes'
    },
    { 
      id: 'statistics', 
      label: 'Analytics', 
      icon: BarChart3, 
      href: '#statistics',
      description: 'Métricas y reportes'
    },
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

  const getTabTitle = () => {
    const currentItem = menuItems.find(item => item.id === activeTab)
    return currentItem ? currentItem.label : 'Dashboard'
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">

        {/* Sidebar ultra-minimalista */}
        <aside className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } sticky top-0 z-50 w-80 bg-white border-r border-gray-100 transform transition-all duration-300 ease-out lg:translate-x-0 h-screen`}>
          <div className="h-full flex flex-col">
            
            {/* Header espacioso y limpio */}
            <div className="px-8 py-8">
              <div className="flex items-center">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 focus:outline-none lg:hidden mr-4 transition-all"
                >
                  {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <Image src={logo} alt="Cyneth Logo" width={130} height={55} />
                    <div className="ml-4 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                  </div>
                  <p className="text-sm text-gray-400 font-light tracking-wide">Panel de Control</p>
                </div>
              </div>
            </div>
            
            {/* Navegación ultra-espaciosa */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-6 space-y-3">
                {menuItems.map((item, index) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-red-50 to-red-50/30 text-red-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-800'
                    } group flex items-center px-5 py-4 rounded-2xl transition-all duration-300 ease-out relative overflow-hidden`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    {/* Línea indicadora */}
                    {activeTab === item.id && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-red-500 rounded-r-full" />
                    )}
                    
                    <div className={`p-3 rounded-xl mr-4 transition-all duration-300 ${
                      activeTab === item.id 
                        ? 'bg-red-500/10 text-red-600 shadow-lg shadow-red-500/20' 
                        : 'bg-gray-100/80 text-gray-500 group-hover:bg-gray-200/80 group-hover:text-gray-600 group-hover:scale-105'
                    }`}>
                      <item.icon size={20} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-base leading-tight ${
                        activeTab === item.id ? 'text-red-700' : 'text-gray-800'
                      }`}>
                        {item.label}
                      </div>
                      <div className={`text-sm mt-1 leading-relaxed ${
                        activeTab === item.id ? 'text-red-500/80' : 'text-gray-500'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                    
                    {/* Indicador de flecha sutil */}
                    <div className={`transition-all duration-300 ${
                      activeTab === item.id 
                        ? 'text-red-400 scale-110' 
                        : 'text-gray-300 group-hover:text-gray-400 group-hover:translate-x-1'
                    }`}>
                      <ChevronRight size={18} />
                    </div>
                  </Link>
                ))}
              </nav>
              
              {/* Sección del usuario espaciosa */}
              <div className="px-6 pt-8 mt-6 border-t border-gray-100">
                {/* Info del admin con más espacio */}
                <div className="flex items-center p-4 mb-6 bg-gray-50/50 rounded-2xl">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-50 rounded-2xl flex items-center justify-center shadow-sm">
                      <User className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-sm animate-pulse" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="font-semibold text-gray-900">Administrador</p>
                    <p className="text-sm text-gray-500 mt-0.5">Sesión activa • Online</p>
                  </div>
                </div>
                
                {/* Botón logout elegante */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-5 py-3.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Contenido principal minimalista */}
        <main className="flex-1 overflow-y-auto focus:outline-none bg-white">
          {/* Header limpio del contenido */}
          <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between px-8 py-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none transition-colors lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">{getTabTitle()}</h1>
                  <p className="text-gray-500 mt-1">
                    {activeTab === 'products' && 'Gestiona tu inventario y catálogo de productos'}
                    {activeTab === 'bulk-upload' && 'Sube múltiples productos desde un archivo Excel'}
                    {activeTab === 'categories' && 'Organiza y estructura las categorías'}
                    {activeTab === 'brands' && 'Administra las marcas y fabricantes'}
                    {activeTab === 'statistics' && 'Analiza métricas y rendimiento'}
                  </p>
                </div>
              </div>
              
              {/* Indicador de estado minimalista */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-500">En línea</span>
              </div>
            </div>
          </div>

          {/* Contenido de las pestañas */}
          <div className="h-full">
            <div className="max-w-full mx-auto h-full">
              {/* Productos */}
              {activeTab === 'products' && (
                <div className="animate-fadeIn h-full">
                  <ProductList />
                </div>
              )}

              {/* Carga Masiva */}
              {activeTab === 'bulk-upload' && (
                <div className="animate-fadeIn h-full">
                  <BulkUpload />
                </div>
              )}


              {/* Gestión de Categorías */}
              {activeTab === 'categories' && (
                <div className="animate-fadeIn">
                  <CategoryManager />
                </div>
              )}

              {/* Gestión de Marcas */}
              {activeTab === 'brands' && (
                <div className="animate-fadeIn">
                  <BrandManager />
                </div>
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
            className="fixed inset-0 z-40 bg-black/20 lg:hidden transition-all duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}
