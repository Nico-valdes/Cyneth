'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import { 
  ChevronLeft,
  ChevronRight,
  Phone,
  Globe,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function CleanHomepage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Banners principales - Imágenes de alta calidad de ancho completo
  const banners = [
    {
      id: 1,
      title: "Griferías Premium",
      subtitle: "Diseño europeo para baños modernos - Calidad garantizada",
      image: "/banners/banner-griferias.jpg", // Imagen de banner real de ancho completo
      cta: "Ver Griferías",
      link: "/catalogo?category=griferias",
      offer: "Oferta Limitada 25% Off"
    },
    {
      id: 2,
      title: "Sanitarios de Lujo",
      subtitle: "Porcelana de primera calidad - Elegancia y funcionalidad",
      image: "/banners/banner-sanitarios.jpg", // Imagen de banner real de ancho completo
      cta: "Ver Sanitarios",
      link: "/catalogo?category=sanitarios",
      offer: "Nueva Colección 2024"
    },
    {
      id: 3,
      title: "Bombas de Presión",
      subtitle: "Tecnología de vanguardia - Máximo rendimiento",
      image: "/banners/banner-bombas.jpg", // Imagen de banner real de ancho completo
      cta: "Ver Bombas",
      link: "/catalogo?category=bombas",
      offer: "Instalación Incluida"
    }
  ];

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Productos populares simulados
  const popularProducts = [
    {
      id: 1,
      name: "Grifería Premium Milano",
      image: "/products/griferia-milano.jpg",
      category: "Griferías",
      link: "/productos/1"
    },
    {
      id: 2,
      name: "Inodoro Moderno Berlín",
      image: "/products/inodoro-berlin.jpg",
      category: "Sanitarios",
      link: "/productos/2"
    },
    {
      id: 3,
      name: "Bomba Presión Pro 500",
      image: "/products/bomba-pro-500.jpg",
      category: "Bombas",
      link: "/productos/3"
    },
    {
      id: 4,
      name: "Ducha Rain Experience",
      image: "/products/ducha-rain.jpg",
      category: "Accesorios",
      link: "/productos/4"
    },
    {
      id: 5,
      name: "Vanitory Elegance 80cm",
      image: "/products/vanitory-elegance.jpg",
      category: "Muebles",
      link: "/productos/5"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Banner Principal - Estilo imagen de fondo completa */}
      <section className="relative h-[70vh] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* Imagen de fondo del banner - ancho completo */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ 
                backgroundImage: `url(${banners[currentSlide].image})`,
              }}
            >
              {/* Overlay gradiente elegante */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
            </div>

            {/* Contenido del banner - alineado a la izquierda */}
            <div className="relative h-full flex items-center">
              <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
                <div className="max-w-2xl">
                  
                  {/* Badge de oferta */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="inline-block mb-4"
                  >
                    <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      {banners[currentSlide].offer}
                    </span>
                  </motion.div>

                  {/* Título principal */}
                  <motion.h1 
                    className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    {banners[currentSlide].title}
                  </motion.h1>
                  
                  {/* Subtítulo */}
                  <motion.p 
                    className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                  >
                    {banners[currentSlide].subtitle}
                  </motion.p>

                  {/* Botones de acción */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.8 }}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <Link href={banners[currentSlide].link}>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-xl flex items-center justify-center">
                        {banners[currentSlide].cta}
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </button>
                    </Link>
                    
                    <button className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-semibold transition-all">
                      Conocer más
                    </button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Controles de navegación - estilo minimalista */}
        <div className="absolute bottom-6 left-6 flex items-center space-x-3">
          <button
            onClick={prevSlide}
            className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          
          <button
            onClick={nextSlide}
            className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Indicadores de slide */}
        <div className="absolute bottom-6 right-6 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-8 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Productos Populares */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          {/* Título de sección */}
          <div className="flex items-center justify-between mb-12">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900"
            >
              Productos Populares
            </motion.h2>
            
            <Link href="/catalogo">
              <button className="text-red-600 hover:text-red-700 font-semibold flex items-center transition-colors">
                Ver todos
                <ArrowRight className="ml-1 w-4 h-4" />
              </button>
            </Link>
          </div>

          {/* Grid de productos */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {popularProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <Link href={product.link}>
                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer">
                    {/* Imagen del producto */}
                    <div className="aspect-square bg-gray-50 relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                      
                      {/* Badge de categoría */}
                      <div className="absolute top-3 left-3">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                          {product.category}
                        </span>
                      </div>
                    </div>
                    
                    {/* Información del producto */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-red-600 transition-colors">
                        {product.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Contacto */}
      <section className="py-12 bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              ¿Necesitas asesoramiento profesional?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Nuestros especialistas te ayudan a encontrar la solución perfecta para tu proyecto
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-all flex items-center justify-center">
                <Phone className="w-5 h-5 mr-2" />
                Contactar Ahora
              </button>
              
              <Link href="/catalogo">
                <button className="border border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3 rounded-lg font-semibold transition-all">
                  Explorar Catálogo
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              CYNETH SANITARIOS
            </h3>
            <p className="text-gray-600 mb-4">Productos premium desde 1999</p>
            
            <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <span>+54 11 4567-8900</span>
              </div>
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-2" />
                <span>Buenos Aires, Argentina</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}