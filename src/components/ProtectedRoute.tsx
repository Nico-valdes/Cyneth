'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      try {
        console.log('ProtectedRoute - Checking cookies...')
        
        // Verificar si existe el token en las cookies
        const hasToken = document.cookie.includes('auth-token=')
        console.log('ProtectedRoute - Has token:', hasToken)
        
        if (hasToken) {
          console.log('ProtectedRoute - Token found, allowing access')
          setIsAuthenticated(true)
        } else {
          console.log('ProtectedRoute - No token, but allowing access anyway (demo mode)')
          setIsAuthenticated(true) // En modo demo, permitir acceso siempre
        }
        
      } catch (error) {
        console.error('ProtectedRoute - Error:', error)
        setIsAuthenticated(true) // En caso de error, permitir acceso
      } finally {
        setIsLoading(false)
      }
    }

    // Verificar después de un pequeño delay
    setTimeout(checkAuth, 200)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
