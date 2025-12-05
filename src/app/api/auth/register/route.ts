import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { connectToDatabase } from '@/libs/mongoConnect'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()
    
    // Validaciones básicas
    if (!username || !email || !password) {
      return NextResponse.json({ 
        error: 'Todos los campos son requeridos' 
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      }, { status: 400 })
    }

    if (!email.includes('@')) {
      return NextResponse.json({ 
        error: 'Email inválido' 
      }, { status: 400 })
    }

    // Conectar a la base de datos
    const client = await connectToDatabase()
    const db = client.db('cyneth')
    
    // Crear instancia del modelo de usuario
    const userModel = new User(db)
    
    // Crear usuario (por defecto no es admin, se asigna manualmente desde MongoDB)
    const newUser = await userModel.create({
      username,
      email,
      password
    })

    // No crear cookie ni permitir acceso hasta que sea admin
    // El usuario debe esperar a que se le asigne isAdmin: true manualmente desde MongoDB

    return NextResponse.json({ 
      success: true, 
      message: 'Registro exitoso. Tu cuenta debe ser aprobada por un administrador antes de poder acceder.',
      requiresApproval: true,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        isAdmin: false
      }
    })
    
  } catch (error: any) {
    console.error('Error en registro:', error)
    
    if (error.message.includes('ya existe')) {
      return NextResponse.json({ 
        error: error.message 
      }, { status: 409 })
    }
    
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}

