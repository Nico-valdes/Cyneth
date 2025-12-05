'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProductList from '@/components/ProductList'
import Image from 'next/image'
import logo from "../../../public/Cyneth-logo.png"
import { 
  Package, 
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
    <div className="min-h-screen bg-gray-50 flex">

        {/* Sidebar minimalista */}
        <aside className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } sticky top-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0 h-screen`}>
          <div className="h-full flex flex-col">
            
            {/* Header simple */}
            <div className="px-6 py-6">
              <div className="flex items-center">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none lg:hidden mr-3"
                >
                  {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center">
                    <Image src={logo} alt="Cyneth Logo" width={120} height={50} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Navegación simple */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-4 space-y-1">
                {menuItems.map((item, index) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`${
                      activeTab === item.id
                        ? 'bg-red-50 text-red-700 border-l-2 border-red-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                    } flex items-center px-4 py-3 rounded-lg transition-colors duration-150`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <div className={`p-2 rounded-lg mr-3 ${
                      activeTab === item.id 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      <item.icon size={18} />
                    </div>
                    
                    <div className="flex-1">
                      <div className={`font-medium text-sm ${
                        activeTab === item.id ? 'text-red-700' : 'text-gray-800'
                      }`}>
                        {item.label}
                      </div>
                    </div>
                  </Link>
                ))}
              </nav>
              
              {/* Sección del usuario simple */}
              <div className="px-4 pt-4 mt-4 border-t border-gray-200">
                <div className="flex items-center p-3 mb-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-medium text-gray-900 text-sm">Administrador</p>
                    <p className="text-xs text-gray-500">Sesión activa</p>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto bg-white">

          {/* Contenido de las pestañas */}
          <div className="h-full">
            
              {/* Productos */}
              {activeTab === 'products' && (
                <div className="h-full">
                  <ProductList />
                </div>
              )}

              {/* Carga Masiva */}
              {activeTab === 'bulk-upload' && (
                <div className="h-full">
                  <BulkUpload />
                </div>
              )}

              {/* Gestión de Categorías */}
              {activeTab === 'categories' && (
                <div>
                  <CategoryManager />
                </div>
              )}

              {/* Gestión de Marcas */}
              {activeTab === 'brands' && (
                <div>
                  <BrandManager />
                </div>
              )}
            </div>
        </main>

        {/* Overlay para móvil */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/20 lg:hidden transition-opacity duration-200"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
  )
}
