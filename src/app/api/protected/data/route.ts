import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Esta ruta está protegida por el middleware
    // Solo usuarios autenticados pueden acceder
    
    const data = {
      message: 'Datos protegidos accedidos exitosamente',
      timestamp: new Date().toISOString(),
      user: 'admin',
      data: [
        { id: 1, name: 'Item 1', status: 'active' },
        { id: 2, name: 'Item 2', status: 'pending' },
        { id: 3, name: 'Item 3', status: 'completed' }
      ]
    }
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error en API protegida:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Procesar datos enviados
    const result = {
      message: 'Datos procesados exitosamente',
      received: body,
      timestamp: new Date().toISOString(),
      status: 'success'
    }
    
    return NextResponse.json(result, { status: 201 })
    
  } catch (error) {
    console.error('Error procesando datos:', error)
    return NextResponse.json({ 
      error: 'Error procesando los datos' 
    }, { status: 400 })
  }
}

