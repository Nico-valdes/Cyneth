import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    // Limpiar cookie de autenticación
    const cookieStore = await cookies()
    cookieStore.delete('auth-token')
    
    console.log('Cookie deleted successfully')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Logout exitoso' 
    })
    
  } catch (error) {
    console.error('Error en logout:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}
