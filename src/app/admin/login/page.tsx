'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, User, Lock, Mail } from 'lucide-react'
import Image from 'next/image'
import logo from '../../../../public/Cyneth-logo.png'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // Login
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          })
        })

        const data = await response.json()

        if (response.ok) {
          router.push('/admin')
          router.refresh()
        } else {
          setError(data.error || 'Error al iniciar sesión')
        }
      } else {
        // Registro
        if (formData.password !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden')
          setLoading(false)
          return
        }

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password
          })
        })

        const data = await response.json()

        if (response.ok) {
          if (data.requiresApproval) {
            setError('')
            // Mostrar mensaje de éxito pero indicando que necesita aprobación
            alert('Registro exitoso. Tu cuenta debe ser aprobada por un administrador antes de poder acceder al panel.')
            setIsLogin(true) // Cambiar a modo login
            setFormData({ username: '', email: '', password: '', confirmPassword: '' })
          } else {
            router.push('/admin')
            router.refresh()
          }
        } else {
          setError(data.error || 'Error al registrar usuario')
        }
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src={logo} alt="Cyneth Logo" width={150} height={60} />
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-[1px] bg-gray-300"></div>
              <h1 className="text-2xl font-extralight text-gray-900 tracking-wide uppercase">
                {isLogin ? 'Iniciar Sesión' : 'Registro'}
              </h1>
            </div>
            <p className="text-sm text-gray-500 font-light">
              {isLogin 
                ? 'Accede al panel de administración' 
                : 'Crea una cuenta para acceder al panel de administración'}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-light">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-widest font-light mb-2">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-all bg-white font-light"
                  placeholder="Nombre de usuario"
                  required
                />
              </div>
            </div>

            {/* Email (solo en registro) */}
            {!isLogin && (
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-widest font-light mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-all bg-white font-light"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-widest font-light mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-all bg-white font-light"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Confirm Password (solo en registro) */}
            {!isLogin && (
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-widest font-light mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-all bg-white font-light"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="group relative w-full px-6 py-4 bg-black text-white rounded-full overflow-hidden transition-all cursor-pointer flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              <span className="relative z-10 text-sm font-medium tracking-wide">
                {loading ? 'Procesando...' : (isLogin ? 'INICIAR SESIÓN' : 'REGISTRARSE')}
              </span>
              {!loading && (
                <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              )}
            </motion.button>
          </form>

          {/* Toggle login/register */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setFormData({ username: '', email: '', password: '', confirmPassword: '' })
              }}
              className="text-sm text-gray-500 hover:text-gray-900 font-light transition-colors"
            >
              {isLogin 
                ? '¿No tienes cuenta? Regístrate' 
                : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

