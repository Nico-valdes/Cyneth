'use client';

import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import { 
  Phone,
  ArrowRight,
  Droplet,
  ShowerHead,
  Wrench,
  Bath,
  Lightbulb
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import griferia from "../../public/griferia.jpg"
import catgrif from "../../public/cat-griferia.jpg"
import catduch from "../../public/cat-ducha.jpg"
import catsan from "../../public/cat-sanitario.jpg"
import catacc from "../../public/cat-accesorios.jpg"


// Importar videos con resoluciones específicas - COMENTADO HASTA TENER LAS 3 RESOLUCIONES
// import videoMobile from "../../public/videos/loop-ferrettistore-2024-movil-home.mp4"
// import videoTablet from "../../public/videos/loop-ferrettistore-home-2024-tablet.mp4"
// import videoDesktop from "../../public/videos/loop-ferrettistore-home-2024-desktop.mp4"

export default function CleanHomepage() {
  // Featured categories data
  const featuredCategories = [
    {
      id: 1,
      name: "Griferías",
      icon: <Droplet className="w-8 h-8" />,
      description: "Diseño europeo y calidad premium",
      image: catgrif,
      link: "/catalogo/griferias"
    },
    {
      id: 2,
      name: "Sanitarios",
      icon: <Bath className="w-8 h-8" />,
      description: "Elegancia y funcionalidad",
      image: catsan,
      link: "/catalogo/sanitarios"
    },
    {
      id: 3,
      name: "Duchas",
      icon: <ShowerHead className="w-8 h-8" />,
      description: "Experiencia de baño única",
      image: catduch,
      link: "/catalogo/duchas"
    },
    {
      id: 4,
      name: "Accesorios",
      icon: <Wrench className="w-8 h-8" />,
      description: "Complementos esenciales",
      image: catacc,
      link: "/catalogo/accesorios"
    }
  ];

  // Popular products data
  const popularProducts = [
    {
      id: 1,
      name: "Grifería Premium Milano",
      image: "https://griferiapeirano.com/wp-content/uploads/2025/05/62-175GR_Pulse-lavatorio-de-pared-Grafito-500x500.jpg",
      category: "Griferías",
      link: "/productos/1"
    },
    {
      id: 2,
      name: "Inodoro Moderno Berlín",
      image: "https://ferrum.com/pub/media/catalog/product/cache/723de03bc8ecfa836485d5b2e3f2ed4a/d/a/dadwqdwd.jpg",
      category: "Sanitarios",
      link: "/productos/2"
    },
    {
      id: 3,
      name: "Bomba Presión Pro 500",
      image: "https://ferrum.com/pub/media/catalog/product/cache/723de03bc8ecfa836485d5b2e3f2ed4a/l/a/lavatorio-mesada-trento-ferrum-bacha-blanco-tre-ms-301-bl-b_1.jpg",
      category: "Bombas",
      link: "/productos/3"
    },
    {
      id: 4,
      name: "Ducha Rain Experience",
      image: "https://griferiapeirano.com/wp-content/uploads/2023/11/IMG_8117-768x654.jpg",
      category: "Accesorios",
      link: "/productos/4"
    },
    {
      id: 5,
      name: "Vanitory Elegance 80cm",
      image: "https://fvsa.com/wp-content/uploads/2021/07/0103_H6-ARRAYAN.jpg",
      category: "Muebles",
      link: "/productos/5"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section with Banner Video */}
      <section className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[80vh] overflow-hidden">
        <video 
          autoPlay
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/banner-video3.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay opcional para mejor legibilidad del contenido */}
        <div className="absolute inset-0 bg-black/10"></div>
      </section>

      {/* Featured Categories - Contemporary Layout */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="flex items-center mb-8">
              <div className="w-12 h-[1px] bg-gray-300 mr-6"></div>
              <span className="text-xs text-gray-400 uppercase tracking-widest font-light">Categorías</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-extralight text-gray-900 leading-tight">
              Explora
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* First Category - Large Left */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-8 h-[600px] relative overflow-hidden group"
            >
              <Link href={featuredCategories[0].link}>
                <div className="w-full h-full relative cursor-pointer">
                  <Image
                    src={featuredCategories[0].image}
                    alt={featuredCategories[0].name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105 grayscale-20 group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                  
                  {/* Minimal Icon */}
                  <div className="absolute top-8 left-8 text-white opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="absolute bottom-8 left-8 right-8 text-white">
                    <div className="flex items-end justify-between">
                      <div>
                        <h3 className="text-4xl font-light mb-4 group-hover:text-white/80 transition-colors duration-500">
                          {featuredCategories[0].name}
                        </h3>
                        <p className="text-white/70 font-light leading-relaxed max-w-md">
                          {featuredCategories[0].description}
                        </p>
                      </div>
                      <div className="w-8 h-[1px] bg-white/50 group-hover:bg-white group-hover:w-16 transition-all duration-500"></div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Right Column Stack */}
            <div className="md:col-span-4 grid grid-rows-2 gap-6">
              {featuredCategories.slice(1, 3).map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative h-[290px] overflow-hidden group"
                >
                  <Link href={category.link}>
                    <div className="w-full h-full relative cursor-pointer">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-105 grayscale-20 group-hover:grayscale-0"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                      
                      {/* Minimal Icon */}
                      <div className="absolute top-6 left-6 text-white opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                      
                      {/* Content */}
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <div className="flex items-end justify-between">
                          <div>
                            <h3 className="text-2xl font-light mb-2 group-hover:text-white/80 transition-colors duration-500">
                              {category.name}
                            </h3>
                            <p className="text-white/70 text-sm font-light leading-relaxed">
                              {category.description}
                            </p>
                          </div>
                          <div className="w-6 h-[1px] bg-white/50 group-hover:bg-white group-hover:w-12 transition-all duration-500"></div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Bottom Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-12 h-[300px] relative overflow-hidden group"
            >
              <Link href={featuredCategories[3].link}>
                <div className="w-full h-full relative cursor-pointer">
                  <Image
                    src={featuredCategories[3].image}
                    alt={featuredCategories[3].name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105 grayscale-20 group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                  
                  {/* Minimal Icon */}
                  <div className="absolute top-8 left-8 text-white opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="absolute bottom-8 left-8 right-8 text-white">
                    <div className="flex items-end justify-between">
                      <div>
                        <h3 className="text-3xl font-light mb-3 group-hover:text-white/80 transition-colors duration-500">
                          {featuredCategories[3].name}
                        </h3>
                        <p className="text-white/70 font-light leading-relaxed max-w-lg">
                          {featuredCategories[3].description}
                        </p>
                      </div>
                      <div className="w-8 h-[1px] bg-white/50 group-hover:bg-white group-hover:w-16 transition-all duration-500"></div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Highlight Section - Contemporary */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="space-y-8">
                <div className="flex items-center">
                  <div className="w-8 h-[1px] bg-gray-400 mr-4"></div>
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-light">Innovación</span>
                </div>
                
                <h2 className="text-6xl lg:text-7xl font-extralight text-gray-900 leading-[0.9]">
                  30%
                  <span className="block text-2xl font-light text-gray-500 mt-4">
                    menos consumo de agua
                  </span>
                </h2>
                
                <p className="text-lg text-gray-600 font-light leading-relaxed max-w-md">
                  Tecnología de aireación avanzada que mantiene la presión 
                  mientras reduce significativamente el consumo.
                </p>
              </div>
              
              <div className="border-l border-gray-200 pl-8">
                <h4 className="text-sm text-gray-900 font-medium mb-3 uppercase tracking-wide">Eco-Friendly</h4>
                <p className="text-gray-600 font-light text-sm leading-relaxed">
                  Cuida el medio ambiente y reduce costos mensualmente
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/5] relative overflow-hidden">
                <Image
                  src={griferia}
                  alt="Grifería Eco"
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                />
                
                {/* Minimal Overlay */}
                <div className="absolute inset-0 bg-black/5"></div>
                
                {/* Floating Indicator */}
                <div className="absolute bottom-8 left-8">
                  <div className="w-3 h-3 bg-white rounded-full shadow-lg"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="flex items-center mb-8">
              <div className="w-12 h-[1px] bg-gray-300 mr-6"></div>
              <span className="text-xs text-gray-400 uppercase tracking-widest font-light">Productos</span>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              <div>
                <h2 className="text-5xl md:text-7xl font-extralight text-gray-900 leading-tight mb-6">
                  Populares
                </h2>
                <p className="text-lg text-gray-600 font-light leading-relaxed max-w-2xl">
                  Descubre los productos más elegidos por nuestros clientes
                </p>
              </div>
              <Link href="/catalogo">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group bg-gray-900 text-white px-12 py-4 font-light text-lg tracking-wide hover:bg-gray-800 transition-all duration-500 flex items-center"
                >
                  Ver todo el catálogo
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Products Grid */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
             {popularProducts.map((product, index) => (
               <motion.div
                 key={product.id}
                 initial={{ opacity: 0, y: 40 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                 viewport={{ once: true }}
                 className="group"
               >
                 <Link href={product.link}>
                   <div className="bg-white border border-gray-50 rounded-none overflow-hidden hover:shadow-xl transition-all duration-700 cursor-pointer">
                     {/* Large Image Focus */}
                     <div className="aspect-square bg-gray-50 relative overflow-hidden">
                       <img
                         src={product.image}
                         alt={product.name}
                         className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                       />
                       
                       {/* Minimal Overlay on Hover */}
                       <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                       
                       {/* Floating Category - Minimal */}
                       <div className="absolute top-6 left-6">
                         <div className="w-2 h-2 bg-white rounded-full shadow-lg opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                       </div>
                     </div>
                     
                     {/* Minimal Content */}
                     <div className="p-8 space-y-3">
                       <div className="flex items-center justify-between">
                         <h3 className="font-light text-gray-900 text-lg tracking-wide group-hover:text-gray-600 transition-colors duration-500">
                           {product.name}
                         </h3>
                         <div className="w-4 h-[1px] bg-gray-300 group-hover:bg-red-500 group-hover:w-8 transition-all duration-500"></div>
                       </div>
                       
                       <p className="text-xs text-gray-400 uppercase tracking-widest font-light">
                         {product.category}
                       </p>
                     </div>
                   </div>
                 </Link>
               </motion.div>
             ))}
           </div>
        </div>
      </section>

      {/* Contact Section - Contemporary */}
      <section className="py-32 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center"
          >
            {/* Header */}
            <div className="mb-16">
              <div className="flex items-center justify-center mb-8">
                <div className="w-12 h-[1px] bg-white/30 mr-6"></div>
                <span className="text-xs text-white/60 uppercase tracking-widest font-light">Contacto</span>
                <div className="w-12 h-[1px] bg-white/30 ml-6"></div>
              </div>
              
              <h2 className="text-5xl md:text-7xl font-extralight text-white mb-8 leading-tight">
                ¿Necesitas ayuda?
              </h2>
              
              <p className="text-lg text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
                Nuestros especialistas te acompañan desde la planificación hasta la instalación.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-20">
              <Link href="/contacto">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group bg-white text-gray-900 px-12 py-4 font-light text-lg tracking-wide hover:bg-gray-100 transition-all duration-500 flex items-center cursor-pointer"
                >
                  Contactar Especialista
                  <div className="w-4 h-[1px] bg-gray-400 group-hover:bg-red-500 group-hover:w-8 ml-4 transition-all duration-500"></div>
                </motion.button>
              </Link>
              
              <Link href="/catalogo">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group border border-white/30 text-white px-12 py-4 font-light text-lg tracking-wide hover:bg-white/5 transition-all duration-500 flex items-center cursor-pointer"
                >
                  Explorar Catálogo
                  <div className="w-4 h-[1px] bg-white/50 group-hover:bg-white group-hover:w-8 ml-4 transition-all duration-500"></div>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}