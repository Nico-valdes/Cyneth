import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    console.log('Login attempt:', { username, password })
    
    // Validación básica para demo
    if (username === 'admin' && password === 'admin123') {
      // Generar token simple
      const token = `demo-token-${Date.now()}`
      
      console.log('Credentials valid, setting token:', token)
      
      // Setear cookie básica
      const cookieStore = await cookies()
      cookieStore.set('auth-token', token, {
        httpOnly: false, // Cambiado a false para que sea accesible desde JS
        secure: false, // Cambiado a false para desarrollo
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 horas
        path: '/'
      })
      
      console.log('Cookie set successfully')
      
      return NextResponse.json({ 
        success: true, 
        message: 'Login exitoso',
        user: { username, role: 'admin' }
      })
    }
    
    console.log('Invalid credentials')
    return NextResponse.json({ 
      error: 'Usuario o contraseña incorrectos' 
    }, { status: 401 })
    
  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}
