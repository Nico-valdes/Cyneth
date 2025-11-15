'use client';

import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import { 
  Users,
  Target,
  Eye,
  Heart,
  Lightbulb,
  Shield,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePageTitle } from '@/hooks/usePageTitle';
import local from "../../../public/local.jpg"
import banner from "../../../public/fondo-nosotros.jpg"

export default function NosotrosPage() {
  usePageTitle({
    title: 'Nosotros | Cyneth Sanitarios',
    description: 'Conoce la historia de Cyneth. Desde 2021 ofrecemos soluciones integrales para obras y proyectos, con compromiso, calidad y confianza.',
    showComeBackMessage: true,
    comeBackMessage: '¡Volvé!'
  });
  // Company values data
  const values = [
    {
      id: 1,
      title: "Compromiso",
      description: "Con cada cliente y cada obra",
      icon: <Heart className="w-8 h-8" />
    },
    {
      id: 2,
      title: "Calidad",
      description: "En productos y servicios",
      icon: <Shield className="w-8 h-8" />
    },
    {
      id: 3,
      title: "Confianza",
      description: "Y transparencia en cada operación",
      icon: <CheckCircle className="w-8 h-8" />
    },
    {
      id: 4,
      title: "Innovación",
      description: "Y mejora continua para estar a la vanguardia",
      icon: <Lightbulb className="w-8 h-8" />
    },
    {
      id: 5,
      title: "Trabajo en equipo",
      description: "Con personal capacitado y motivado",
      icon: <Users className="w-8 h-8" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section - Responsive */}
      <section className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={banner}
            alt="Cyneth - Nosotros"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 h-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center text-white max-w-4xl mx-auto px-4 sm:px-6"
          >
            <div className="flex items-center justify-center mb-4 sm:mb-6 md:mb-8">
              <div className="w-6 sm:w-8 md:w-12 h-[1px] bg-white/30 mr-3 sm:mr-4 md:mr-6"></div>
              <span className="text-[10px] sm:text-xs text-white/60 uppercase tracking-widest font-light">Nosotros</span>
              <div className="w-6 sm:w-8 md:w-12 h-[1px] bg-white/30 ml-3 sm:ml-4 md:ml-6"></div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extralight text-white mb-4 sm:mb-6 md:mb-8 leading-tight px-4">
              Nuestra Historia
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-2xl mx-auto font-light leading-relaxed px-4">
              Desde 2021, construyendo soluciones integrales para obras y proyectos de cualquier escala
            </p>
          </motion.div>
        </div>
      </section>

      {/* Company Story Section - Responsive */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="space-y-8 sm:space-y-10 md:space-y-12"
            >
              <div className="space-y-6 sm:space-y-8">
                <div className="flex items-center">
                  <div className="w-6 sm:w-8 h-[1px] bg-gray-400 mr-3 sm:mr-4"></div>
                  <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-light">Origen</span>
                </div>
                
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extralight text-gray-900 leading-[0.9]">
                  2021
                  <span className="block text-lg sm:text-xl md:text-2xl font-light text-gray-500 mt-2 sm:mt-3 md:mt-4">
                    año de fundación
                  </span>
                </h2>
                
                <p className="text-sm sm:text-base md:text-lg text-gray-600 font-light leading-relaxed max-w-md">
                  El origen de Cyneth se remonta al año 2021, cuando Cynthia Blanco y Ethel Sedepski decidieron fundar una empresa orientada a brindar soluciones integrales para obras y proyectos de cualquier escala.
                </p>
              </div>
              
              <div className="border-l border-gray-200 pl-4 sm:pl-6 md:pl-8">
                <h4 className="text-xs sm:text-sm text-gray-900 font-medium mb-2 sm:mb-3 uppercase tracking-wide">Crecimiento Sostenido</h4>
                <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                  Lo que comenzó como un emprendimiento con visión de futuro rápidamente se consolidó como una casa de sanitarios de confianza, reconocida por la calidad de sus productos y la atención personalizada.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              viewport={{ once: true }}
              className="relative mt-8 lg:mt-0"
            >
              <div className="aspect-[4/5] relative overflow-hidden rounded-lg">
                <Image
                  src={local}
                  alt="Local Cyneth"
                  fill
                  className="object-cover transition-all duration-1000"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                
                <div className="absolute inset-0 bg-black/5"></div>
                
                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full shadow-lg"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section - Preserving Essence */}
      <section className="py-10 sm:py-14 md:py-20 lg:py-28 xl:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 sm:mb-14 md:mb-18 lg:mb-20"
          >
            <div className="flex items-center mb-4 sm:mb-5 md:mb-6 lg:mb-8">
              <div className="w-5 sm:w-6 md:w-8 lg:w-12 h-[1px] bg-gray-300 mr-2.5 sm:mr-3 md:mr-4 lg:mr-6"></div>
              <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-light">Propósito</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-extralight text-gray-900 leading-tight">
              Misión y Visión
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-14 lg:gap-16">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="space-y-5 sm:space-y-6 md:space-y-7 lg:space-y-8"
            >
              <div className="flex items-center mb-4 sm:mb-5 md:mb-6">
                <Target className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400 mr-3 sm:mr-4 flex-shrink-0" />
                <h3 className="text-xl sm:text-2xl md:text-3xl font-light text-gray-900">Misión</h3>
              </div>
              
              <p className="text-sm sm:text-base md:text-lg text-gray-600 font-light leading-relaxed">
                Ofrecer a cada cliente las mejores marcas del mercado, asesoramiento técnico especializado y precios competitivos, construyendo relaciones basadas en la transparencia y el respeto.
              </p>
              
              <div className="border-l border-gray-200 pl-4 sm:pl-5 md:pl-6">
                <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed">
                  Desde sus inicios, Cyneth mantiene un crecimiento sostenido gracias al compromiso con la innovación y la mejora continua de sus servicios.
                </p>
              </div>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-5 sm:space-y-6 md:space-y-7 lg:space-y-8"
            >
              <div className="flex items-center mb-4 sm:mb-5 md:mb-6">
                <Eye className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400 mr-3 sm:mr-4 flex-shrink-0" />
                <h3 className="text-xl sm:text-2xl md:text-3xl font-light text-gray-900">Visión</h3>
              </div>
              
              <p className="text-sm sm:text-base md:text-lg text-gray-600 font-light leading-relaxed">
                Posicionarnos como una referencia en el sector sanitario, destacándonos no solo por la variedad y calidad de los productos, sino también por un servicio ágil, moderno y adaptado a las necesidades actuales de profesionales, empresas y particulares.
              </p>
              
              <div className="border-l border-gray-200 pl-4 sm:pl-5 md:pl-6">
                <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed">
                  Hoy, Cyneth acompaña tanto a grandes proyectos como a clientes particulares, asegurando siempre soluciones sanitarias eficientes, confiables y adaptadas a cada necesidad.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section - Preserving Essence */}
      <section className="py-10 sm:py-14 md:py-20 lg:py-28 xl:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 sm:mb-14 md:mb-18 lg:mb-20"
          >
            <div className="flex items-center mb-4 sm:mb-5 md:mb-6 lg:mb-8">
              <div className="w-5 sm:w-6 md:w-8 lg:w-12 h-[1px] bg-gray-300 mr-2.5 sm:mr-3 md:mr-4 lg:mr-6"></div>
              <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-light">Valores</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-extralight text-gray-900 leading-tight">
              Lo que nos guía
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12 lg:gap-14">
            {values.map((value, index) => (
              <motion.div
                key={value.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  <div className="text-gray-400 group-hover:text-gray-600 transition-colors duration-300">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8">
                      {value.icon}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-light text-gray-900 mb-2 sm:mb-2.5 md:mb-3 group-hover:text-gray-600 transition-colors duration-300">
                      {value.title}
                    </h3>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 font-light leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                  
                  <div className="w-5 sm:w-6 md:w-8 h-[1px] bg-gray-200 group-hover:bg-gray-400 transition-colors duration-300"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Responsive */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="mb-10 sm:mb-12 md:mb-16">
              <div className="flex items-center justify-center mb-4 sm:mb-6 md:mb-8">
                <div className="w-6 sm:w-8 md:w-12 h-[1px] bg-white/30 mr-3 sm:mr-4 md:mr-6"></div>
                <span className="text-[10px] sm:text-xs text-white/60 uppercase tracking-widest font-light">Contacto</span>
                <div className="w-6 sm:w-8 md:w-12 h-[1px] bg-white/30 ml-3 sm:ml-4 md:ml-6"></div>
              </div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extralight text-white mb-4 sm:mb-6 md:mb-8 leading-tight px-4">
                ¿Trabajamos juntos?
              </h2>
              
              <p className="text-sm sm:text-base md:text-lg text-white/70 max-w-2xl mx-auto font-light leading-relaxed px-4">
                Conoce más sobre nuestros productos y servicios. Estamos aquí para asesorarte en tu próximo proyecto.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 justify-center items-center px-4">
              <Link href="/catalogo" className="w-full sm:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group w-full sm:w-auto bg-white text-gray-900 px-8 sm:px-10 md:px-12 py-3 sm:py-3.5 md:py-4 font-light text-sm sm:text-base md:text-lg tracking-wide hover:bg-gray-100 active:bg-gray-200 transition-all duration-500 flex items-center justify-center cursor-pointer touch-manipulation rounded"
                >
                  Ver Catálogo
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </motion.button>
              </Link>
              
              <Link href="/contacto" className="w-full sm:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group w-full sm:w-auto border border-white/30 text-white px-8 sm:px-10 md:px-12 py-3 sm:py-3.5 md:py-4 font-light text-sm sm:text-base md:text-lg tracking-wide hover:bg-white/5 active:bg-white/10 transition-all duration-500 flex items-center justify-center cursor-pointer touch-manipulation rounded"
                >
                  Contactar
                  <div className="hidden sm:block w-4 h-[1px] bg-white/50 group-hover:bg-white group-hover:w-8 ml-4 transition-all duration-500"></div>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
