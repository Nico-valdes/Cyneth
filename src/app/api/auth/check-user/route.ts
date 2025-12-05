import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/libs/mongoConnect'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()
    
    if (!username) {
      return NextResponse.json({ 
        error: 'Username es requerido' 
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
        error: 'Usuario no encontrado' 
      }, { status: 404 })
    }
    
    // Retornar información del usuario (sin contraseña)
    return NextResponse.json({ 
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        isAdminType: typeof user.isAdmin,
        role: user.role,
        active: user.active,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })
    
  } catch (error) {
    console.error('Error verificando usuario:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}

