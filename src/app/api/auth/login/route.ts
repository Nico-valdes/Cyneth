import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { connectToDatabase } from '@/libs/mongoConnect'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    if (!username || !password) {
      return NextResponse.json({ 
        error: 'Usuario y contraseña son requeridos' 
      }, { status: 400 })
    }
    
    // Conectar a la base de datos
    const client = await connectToDatabase()
    const db = client.db('cyneth')
    
    // Crear instancia del modelo de usuario
    const userModel = new User(db)
    
    // Buscar usuario por username o email
    const user = await userModel.findByUsername(username) || await userModel.findByEmail(username)
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Usuario o contraseña incorrectos' 
      }, { status: 401 })
    }
    
    // Verificar que el usuario esté activo
    if (user.active === false) {
      return NextResponse.json({ 
        error: 'Tu cuenta está desactivada. Contacta al administrador.' 
      }, { status: 403 })
    }
    
    // Verificar contraseña
    const isValidPassword = await userModel.verifyPassword(password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json({ 
        error: 'Usuario o contraseña incorrectos' 
      }, { status: 401 })
    }
    
    // Debug: Log del usuario encontrado
    console.log('🔍 Usuario encontrado:', {
      username: user.username,
      isAdmin: user.isAdmin,
      isAdminType: typeof user.isAdmin,
      isAdminValue: JSON.stringify(user.isAdmin),
      role: user.role,
      active: user.active,
      allFields: Object.keys(user)
    })
    
    // Verificar que el usuario sea admin (manejar casos donde el campo no existe, es null, o es string)
    // Aceptar: true, "true", 1, "1"
    const isAdmin = user.isAdmin === true || 
                    user.isAdmin === 'true' || 
                    user.isAdmin === 1 || 
                    user.isAdmin === '1' ||
                    String(user.isAdmin).toLowerCase() === 'true'
    
    console.log('🔐 Verificación isAdmin:', {
      rawValue: user.isAdmin,
      type: typeof user.isAdmin,
      isAdminResult: isAdmin
    })
    
    if (!isAdmin) {
      console.log('❌ Usuario no es admin. isAdmin value:', user.isAdmin, 'Type:', typeof user.isAdmin)
      return NextResponse.json({ 
        error: 'No tienes permisos para acceder al panel de administración. Contacta al administrador para obtener acceso. Verifica que isAdmin esté en true en MongoDB.' 
      }, { status: 403 })
    }
    
    console.log('✅ Usuario es admin, permitiendo acceso')
    
    // Generar token
    const token = `auth-token-${Date.now()}-${user._id}`
    
    // Setear cookie
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/'
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Login exitoso',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin
      }
    })
    
  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}
