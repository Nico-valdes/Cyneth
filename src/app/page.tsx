'use client';

import { useState } from 'react';
import Navbar from '@/components/navbar';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Wrench, 
  Truck, 
  Shield, 
  Phone, 
  Star, 
  Droplets, 
  Hammer, 
  Zap, 
  Bath, 
  Home, 
  Settings 
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Banner Principal con textura generada - Relación 55:9 */}
      <section className="relative w-full overflow-hidden">
        {/* Fondo con textura generada por código y relación de aspecto 55:9 */}
        <div className="relative w-full" style={{ aspectRatio: '55/9' }}>
          {/* Textura de fondo generada por código */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Patrón de puntos decorativos */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="absolute top-20 left-32 w-1 h-1 bg-red-400 rounded-full"></div>
              <div className="absolute top-16 left-48 w-1.5 h-1.5 bg-red-300 rounded-full"></div>
              <div className="absolute top-8 left-64 w-1 h-1 bg-red-500 rounded-full"></div>
              <div className="absolute top-24 left-80 w-2 h-2 bg-red-400 rounded-full"></div>
              <div className="absolute top-12 left-96 w-1 h-1 bg-red-300 rounded-full"></div>
              
              <div className="absolute top-40 left-16 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
              <div className="absolute top-56 left-40 w-1 h-1 bg-red-400 rounded-full"></div>
              <div className="absolute top-48 left-64 w-2 h-2 bg-red-300 rounded-full"></div>
              <div className="absolute top-32 left-88 w-1 h-1 bg-red-500 rounded-full"></div>
              <div className="absolute top-64 left-20 w-1.5 h-1.5 bg-red-400 rounded-full"></div>
              
              <div className="absolute top-80 left-8 w-1 h-1 bg-red-500 rounded-full"></div>
              <div className="absolute top-72 left-32 w-2 h-2 bg-red-400 rounded-full"></div>
              <div className="absolute top-88 left-56 w-1 h-1 bg-red-300 rounded-full"></div>
              <div className="absolute top-96 left-80 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
            </div>
            
            {/* Líneas geométricas sutiles */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-red-500 to-transparent"></div>
              <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-red-400 to-transparent"></div>
              <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-red-300 to-transparent"></div>
              
              <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
              <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-400 to-transparent"></div>
              <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-300 to-transparent"></div>
            </div>
            
            {/* Círculos grandes de fondo */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600 opacity-5 rounded-full -translate-y-48 translate-x-48"></div>
            <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-red-500 opacity-5 rounded-full -translate-y-40 -translate-x-40"></div>
          </div>
          
          {/* Contenido del banner al costado izquierdo */}
          <div className="relative z-10 h-full flex items-center">
            <div className="text-white max-w-2xl ml-16 lg:ml-24 xl:ml-32 px-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                CYNETH
                <span className="block text-2xl md:text-3xl lg:text-4xl font-normal mt-2 text-red-300">
                  SANITARIOS
                </span>
              </h1>
              
              <p className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-8 max-w-xl leading-relaxed">
                Sanitarios y Griferías de Confianza
              </p>
              
              <p className="text-base md:text-lg text-gray-300 mb-10 max-w-lg leading-relaxed">
                Descubrí nuestros productos y solicitá tu cotización fácilmente
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/catalogo">
                  <button className="group relative px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-red-500/25">
                    <span className="relative z-10 text-lg">Ver Catálogo</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </Link>
                
                <button className="px-8 py-4 border-2 border-white/30 hover:border-white/60 text-white font-semibold rounded-lg transition-all duration-300 hover:bg-white/10 backdrop-blur-sm text-lg">
                  Solicitar Cotización
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            <div className="text-center group cursor-pointer">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-50 transition-colors shadow-md">
                <Droplets className="h-10 w-10 text-gray-600 group-hover:text-red-600" />
              </div>
              <h3 className="text-base font-medium text-gray-900 group-hover:text-red-600">Griferías</h3>
            </div>

            <div className="text-center group cursor-pointer">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-50 transition-colors shadow-md">
                <Settings className="h-10 w-10 text-gray-600 group-hover:text-red-600" />
              </div>
              <h3 className="text-base font-medium text-gray-900 group-hover:text-red-600">Caños</h3>
            </div>

            <div className="text-center group cursor-pointer">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-50 transition-colors shadow-md">
                <Bath className="h-10 w-10 text-gray-600 group-hover:text-red-600" />
              </div>
              <h3 className="text-base font-medium text-gray-900 group-hover:text-red-600">Sanitarios</h3>
            </div>

            <div className="text-center group cursor-pointer">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-50 transition-colors shadow-md">
                <Hammer className="h-10 w-10 text-gray-600 group-hover:text-red-600" />
              </div>
              <h3 className="text-base font-medium text-gray-900 group-hover:text-red-600">Accesorios</h3>
            </div>

            <div className="text-center group cursor-pointer">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-50 transition-colors shadow-md">
                <Home className="h-10 w-10 text-gray-600 group-hover:text-red-600" />
              </div>
              <h3 className="text-base font-medium text-gray-900 group-hover:text-red-600">Muebles</h3>
            </div>

            <div className="text-center group cursor-pointer">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-50 transition-colors shadow-md">
                <Zap className="h-10 w-10 text-gray-600 group-hover:text-red-600" />
              </div>
              <h3 className="text-base font-medium text-gray-900 group-hover:text-red-600">Bombas</h3>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Bombas de Presión */}
            <div className="relative bg-red-600 rounded-2xl overflow-hidden h-80 group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500"></div>
              <div className="relative z-10 p-10 h-full flex items-center">
                <div className="flex-1">
                  <h3 className="text-4xl font-bold text-white mb-3">Bombas de</h3>
                  <h3 className="text-4xl font-bold text-white mb-4">Presión</h3>
                  <p className="text-red-100 text-xl">Centrífugas y periféricas</p>
                </div>
                <div className="flex-1 flex justify-end">
                  <img
                    src="/moderna-bomba-presion.png"
                    alt="Bomba de presión"
                    className="w-48 h-48 object-contain opacity-90"
                  />
                </div>
              </div>
              <div className="absolute top-6 right-6 w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Griferías */}
            <div className="relative bg-gray-800 rounded-2xl overflow-hidden h-80 group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700"></div>
              <div className="relative z-10 p-10 h-full flex items-center">
                <div className="flex-1">
                  <h3 className="text-4xl font-bold text-white mb-3">Griferías de</h3>
                  <h3 className="text-4xl font-bold text-white mb-4">Lavatorios</h3>
                  <p className="text-gray-300 text-xl">y Lavamanos</p>
                </div>
                <div className="flex-1 flex justify-end">
                  <img
                    src="/moderna-griferia-bano.png"
                    alt="Grifería de lavatorio"
                    className="w-48 h-48 object-contain opacity-90"
                  />
                </div>
              </div>
              <div className="absolute top-6 right-6 w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Caños y Accesorios */}
            <div className="relative bg-white border-2 border-gray-200 rounded-2xl overflow-hidden h-80 group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="relative z-10 p-10 h-full flex items-center">
                <div className="flex-1">
                  <h3 className="text-4xl font-bold text-gray-800 mb-3">Caños y</h3>
                  <h3 className="text-4xl font-bold text-gray-800 mb-4">Accesorios</h3>
                  <p className="text-gray-600 text-xl">PVC, cobre y acero</p>
                </div>
                <div className="flex-1 flex justify-end">
                  <img src="/plomeria.png" alt="Caños y accesorios" className="w-48 h-48 object-contain opacity-90" />
                </div>
              </div>
              <div className="absolute top-6 right-6 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Sanitarios */}
            <div className="relative bg-red-500 rounded-2xl overflow-hidden h-80 group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-400"></div>
              <div className="relative z-10 p-10 h-full flex items-center">
                <div className="flex-1">
                  <h3 className="text-4xl font-bold text-white mb-3">Sanitarios</h3>
                  <h3 className="text-4xl font-bold text-white mb-4">y Bidets</h3>
                  <p className="text-red-100 text-xl">Inodoros completos</p>
                </div>
                <div className="flex-1 flex justify-end">
                  <img
                    src="/moderno-inodoro-blanco.png"
                    alt="Sanitarios"
                    className="w-48 h-48 object-contain opacity-90"
                  />
                </div>
              </div>
              <div className="absolute top-6 right-6 w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Por qué elegir Cyneth Sanitarios?</h2>
            <p className="text-lg text-gray-600">Comprometidos con la excelencia en cada proyecto</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Calidad Garantizada</h3>
              <p className="text-gray-600">Productos de las mejores marcas con garantía extendida</p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instalación Profesional</h3>
              <p className="text-gray-600">Equipo técnico especializado y certificado</p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Entrega Rápida</h3>
              <p className="text-gray-600">Envíos a todo el país en 24-48 horas</p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Soporte 24/7</h3>
              <p className="text-gray-600">Asistencia técnica disponible todo el año</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="productos" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Productos Destacados</h2>
            <p className="text-lg text-gray-600">Los más vendidos de nuestra tienda</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              <div className="p-6">
                <img
                  src="/placeholder-2n4h7.png"
                  alt="Bombas de presión"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-semibold text-red-600 mb-2">Bombas de Presión</h3>
                <p className="text-gray-600 mb-4">Bombas centrífugas y periféricas para uso doméstico e industrial</p>
              </div>
              <div className="px-6 pb-6">
                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                  <li>• Bombas centrífugas</li>
                  <li>• Bombas periféricas</li>
                  <li>• Sistemas de presurización</li>
                  <li>• Accesorios y repuestos</li>
                </ul>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                  Ver Más
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              <div className="p-6">
                <img
                  src="/plumbing-pipes-fittings.png"
                  alt="Caños y accesorios"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-semibold text-red-600 mb-2">Caños y Accesorios</h3>
                <p className="text-gray-600 mb-4">Tubería de PVC, cobre y acero para todas las instalaciones</p>
              </div>
              <div className="px-6 pb-6">
                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                  <li>• Caños de PVC</li>
                  <li>• Tubería de cobre</li>
                  <li>• Conexiones y codos</li>
                  <li>• Válvulas y llaves</li>
                </ul>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                  Ver Más
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              <div className="p-6">
                <img
                  src="/modern-bathroom-fixtures.png"
                  alt="Grifería y sanitarios"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-semibold text-red-600 mb-2">Grifería y Sanitarios</h3>
                <p className="text-gray-600 mb-4">Griferías, inodoros, lavatorios y accesorios de baño</p>
              </div>
              <div className="px-6 pb-6">
                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                  <li>• Griferías de cocina y baño</li>
                  <li>• Inodoros y bidets</li>
                  <li>• Lavatorios y piletas</li>
                  <li>• Accesorios de baño</li>
                </ul>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                  Ver Más
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">¿Necesitas una cotización personalizada?</h2>
          <p className="text-xl text-red-100 mb-8">Nuestros expertos están listos para ayudarte con tu proyecto</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-red-600 hover:bg-gray-100 font-medium px-8 py-3 rounded-md transition-colors flex items-center justify-center">
              <Phone className="mr-2 h-5 w-5" />
              Llamar Ahora
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-red-600 font-medium px-8 py-3 rounded-md transition-colors bg-transparent">
              Solicitar Cotización
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-red-500 mb-4">CYNETH SANITARIOS</h3>
              <p className="text-gray-300 mb-4">Tu socio confiable en soluciones sanitarias desde 2003.</p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">f</span>
                </div>
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">ig</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Productos</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Bombas de Presión</li>
                <li>Caños y Accesorios</li>
                <li>Grifería</li>
                <li>Sanitarios</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Servicios</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Instalación</li>
                <li>Mantenimiento</li>
                <li>Asesoramiento</li>
                <li>Soporte Técnico</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contacto</h4>
              <div className="space-y-2 text-gray-300">
                <p>+54 11 4567-8900</p>
                <p>info@cynethsanitarios.com</p>
                <p>Buenos Aires, Argentina</p>
                <p>Lun - Vie: 8:00 - 18:00</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Cyneth Sanitarios. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
