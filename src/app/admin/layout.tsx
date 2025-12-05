'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // No proteger la ruta de login
    if (pathname === '/admin/login') {
      setIsAuthenticated(true)
      setIsLoading(false)
      return
    }

    const checkAuth = () => {
      try {
        // Verificar si existe el token en las cookies
        const hasToken = document.cookie.includes('auth-token=')
        
        if (hasToken) {
          setIsAuthenticated(true)
        } else {
          // Redirigir a login si no está autenticado
          router.push('/admin/login')
        }
        
      } catch (error) {
        console.error('AdminLayout - Error:', error)
        router.push('/admin/login')
      } finally {
        setIsLoading(false)
      }
    }

    // Verificar después de un pequeño delay
    setTimeout(checkAuth, 200)
  }, [router, pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si es la ruta de login, mostrar sin protección
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Si no está autenticado, no mostrar nada (ya se redirigió)
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

