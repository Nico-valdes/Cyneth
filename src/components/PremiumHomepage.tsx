'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { 
  ChevronRight, 
  ArrowUpRight,
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
  Settings,
  Sparkles,
  Eye,
  Play,
  Award,
  TrendingUp,
  Users,
  Globe,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';





export default function PremiumHomepage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Categorías interactivas - Paleta elegante
  const categories = [
    { icon: Droplets, name: "Griferías", color: "from-gray-900 to-black", count: "150+" },
    { icon: Settings, name: "Caños", color: "from-gray-800 to-gray-900", count: "200+" },
    { icon: Bath, name: "Sanitarios", color: "from-gray-900 to-black", count: "80+" },
    { icon: Hammer, name: "Accesorios", color: "from-gray-800 to-gray-900", count: "300+" },
    { icon: Home, name: "Muebles", color: "from-gray-900 to-black", count: "120+" },
    { icon: Zap, name: "Bombas", color: "from-gray-800 to-gray-900", count: "90+" },
  ];

  // Productos destacados - Paleta elegante enfocada en e-commerce
  const featuredProducts = [
    {
      title: "Bombas de",
      subtitle: "Presión",
      description: "Tecnología de vanguardia en sistemas de presurización",
      image: "/moderna-bomba-presion.png",
      gradient: "bg-gradient-to-br from-gray-900 to-black",
      hoverGradient: "bg-gradient-to-br from-red-600 to-gray-900"
    },
    {
      title: "Griferías",
      subtitle: "Premium",
      description: "Diseño europeo con certificación de calidad internacional",
      image: "/moderna-griferia-bano.png",
      gradient: "bg-gradient-to-br from-black to-gray-800",
      hoverGradient: "bg-gradient-to-br from-gray-900 to-red-600"
    },
    {
      title: "Sanitarios",
      subtitle: "de Lujo",
      description: "Porcelana de primera calidad con tecnología eco-eficiente",
      image: "/moderno-inodoro-blanco.png",
      gradient: "bg-gradient-to-br from-gray-800 to-gray-900",
      hoverGradient: "bg-gradient-to-br from-red-600 to-black"
    },
    {
      title: "Accesorios",
      subtitle: "Pro",
      description: "Sistemas completos de tubería y conexiones profesionales",
      image: "/plomeria.png",
      gradient: "bg-gradient-to-br from-gray-900 to-black",
      hoverGradient: "bg-gradient-to-br from-black to-red-600"
    }
  ];

  // Estadísticas impresionantes
  const stats = [
    { value: 2500, suffix: "+", label: "Productos Premium", icon: Award },
    { value: 15000, suffix: "+", label: "Clientes Satisfechos", icon: Users },
    { value: 25, suffix: "", label: "Años de Experiencia", icon: TrendingUp },
    { value: 50, suffix: "+", label: "Ciudades Atendidas", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Loading simple */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-white text-3xl font-bold">
              CYNETH
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section Profesional - Estilo E-commerce */}
      <section className="relative min-h-screen bg-black flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Contenido principal */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              {/* Título principal */}
              <div className="space-y-4">
                <motion.h1 
                  className="text-5xl md:text-7xl font-bold text-white leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  Sanitarios
                  <span className="block text-red-500">Premium</span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl text-gray-300 max-w-lg leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  Más de 2,500 productos de calidad profesional. 
                  Griferías, sanitarios y accesorios para proyectos exigentes.
                </motion.p>
              </div>

              {/* Estadísticas clave */}
              <motion.div 
                className="flex gap-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <div>
                  <div className="text-2xl font-bold text-white">2,500+</div>
                  <div className="text-sm text-gray-400">Productos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">25</div>
                  <div className="text-sm text-gray-400">Años</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">15k+</div>
                  <div className="text-sm text-gray-400">Clientes</div>
                </div>
              </motion.div>

              {/* CTA Principal */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <Link href="/catalogo">
                  <motion.button
                    className="px-8 py-4 bg-red-600 text-white font-semibold rounded-lg transition-all hover:bg-red-700"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Ver Catálogo
                  </motion.button>
                </Link>
                
                <motion.button
                  className="px-8 py-4 border border-gray-600 text-white font-semibold rounded-lg transition-all hover:border-gray-500"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Contactar
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Imagen principal del producto */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            >
              <div className="relative aspect-square bg-gray-900 rounded-3xl overflow-hidden">
                <img
                  src="/moderna-griferia-bano.png"
                  alt="Grifería Premium"
                  className="w-full h-full object-contain p-12"
                />
                
                {/* Badge de calidad */}
                <div className="absolute top-6 left-6 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Premium
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>



      {/* Categorías Principales - Estilo E-commerce */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Categorías Principales
            </h2>
            <p className="text-lg text-gray-600">
              Encuentra exactamente lo que necesitas para tu proyecto
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <Link href={`/catalogo?category=${category.name.toLowerCase()}`}>
                  <div className="bg-gray-100 rounded-xl p-6 text-center transition-all hover:bg-gray-200 hover:shadow-lg cursor-pointer">
                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-red-600 transition-colors">
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.count}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Catálogo Visual - E-commerce Focus */}
      <section className="py-20 relative bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 className="text-5xl font-black text-gray-900 mb-6">
              Explora Nuestro Catálogo
            </motion.h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Más de 2,500 productos organizados por categorías para facilitar tu búsqueda
            </p>
          </motion.div>

          {/* Grid de productos destacados simplificado */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <motion.div
                  className="bg-gray-100 rounded-2xl p-8 text-center h-80 flex flex-col justify-center relative overflow-hidden"
                  whileHover={{ 
                    scale: 1.02,
                    backgroundColor: "#f9fafb"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Imagen del producto */}
                  <motion.div
                    className="relative h-32 mb-6"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-contain mx-auto"
                    />
                  </motion.div>
                  
                  {/* Información del producto */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {product.title} {product.subtitle}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {product.description}
                    </p>
                    
                    {/* Botón de explorar */}
                    <motion.button
                      className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium transition-colors hover:bg-red-700"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Ver Productos
                    </motion.button>
                  </div>

                  {/* Indicador de hover */}
                  <motion.div
                    className="absolute top-4 right-4 w-3 h-3 bg-red-600 rounded-full opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* CTA Principal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link href="/catalogo">
              <motion.button
                className="px-12 py-4 bg-gray-900 text-white rounded-lg font-bold text-xl shadow-xl"
                whileHover={{ 
                  scale: 1.02,
                  backgroundColor: "#ef4444",
                  boxShadow: "0 20px 40px rgba(239, 68, 68, 0.3)"
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                Ver Catálogo Completo
                <motion.span
                  className="inline-block ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  →
                </motion.span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>



      {/* CTA Section elegante */}
      <section className="py-20 relative bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-5xl font-black text-white mb-6"
            >
              ¿Necesitas Asesoramiento?
            </motion.h2>
            
            <motion.p
              className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Nuestros especialistas te ayudan a encontrar los productos perfectos para tu proyecto
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                className="px-10 py-4 bg-red-600 text-white font-bold rounded-lg shadow-xl border border-red-700"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 15px 30px rgba(239, 68, 68, 0.4)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center gap-3 text-lg">
                  <Phone className="w-5 h-5" />
                  Contactar Ahora
                </span>
              </motion.button>

              <motion.button
                className="px-10 py-4 border-2 border-white/30 text-white font-semibold rounded-lg backdrop-blur-sm"
                whileHover={{ 
                  scale: 1.02,
                  borderColor: "rgba(239, 68, 68, 0.8)",
                  backgroundColor: "rgba(239, 68, 68, 0.1)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-lg">Solicitar Cotización</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer elegante minimalista */}
      <footer className="bg-black py-12">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.h3
              className="text-3xl font-bold text-white mb-3"
            >
              CYNETH SANITARIOS
            </motion.h3>
            <p className="text-gray-400 mb-6">Productos premium desde 1999</p>
            
            <motion.div
              className="flex justify-center space-x-8 mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {[
                { icon: Phone, label: "+54 11 4567-8900" },
                { icon: Globe, label: "Buenos Aires, Argentina" },
              ].map((contact, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <contact.icon className="w-4 h-4" />
                  <span className="text-sm">{contact.label}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="border-t border-white/10 pt-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-gray-500 text-sm">
                &copy; 2024 Cyneth Sanitarios. Todos los derechos reservados.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}
