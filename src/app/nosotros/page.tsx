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
import griferia from "../../../public/Cyneth-logo.png"
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

      {/* Hero Section */}
      <section className="relative h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={banner}
            alt="Cyneth - Nosotros"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 h-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center text-white max-w-4xl mx-auto px-6"
          >
            <div className="flex items-center justify-center mb-8">
              <div className="w-12 h-[1px] bg-white/30 mr-6"></div>
              <span className="text-xs text-white/60 uppercase tracking-widest font-light">Nosotros</span>
              <div className="w-12 h-[1px] bg-white/30 ml-6"></div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extralight text-white mb-8 leading-tight">
              Nuestra Historia
            </h1>
            
            <p className="text-lg text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
              Desde 2021, construyendo soluciones integrales para obras y proyectos de cualquier escala
            </p>
          </motion.div>
        </div>
      </section>

      {/* Company Story Section */}
      <section className="py-32 bg-white">
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
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-light">Origen</span>
                </div>
                
                <h2 className="text-6xl lg:text-7xl font-extralight text-gray-900 leading-[0.9]">
                  2021
                  <span className="block text-2xl font-light text-gray-500 mt-4">
                    año de fundación
                  </span>
                </h2>
                
                <p className="text-lg text-gray-600 font-light leading-relaxed max-w-md">
                  El origen de Cyneth se remonta al año 2021, cuando Cynthia Blanco y Ethel Sedepski decidieron fundar una empresa orientada a brindar soluciones integrales para obras y proyectos de cualquier escala.
                </p>
              </div>
              
              <div className="border-l border-gray-200 pl-8">
                <h4 className="text-sm text-gray-900 font-medium mb-3 uppercase tracking-wide">Crecimiento Sostenido</h4>
                <p className="text-gray-600 font-light text-sm leading-relaxed">
                  Lo que comenzó como un emprendimiento con visión de futuro rápidamente se consolidó como una casa de sanitarios de confianza, reconocida por la calidad de sus productos y la atención personalizada.
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
                  alt="Cyneth Historia"
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                />
                
                <div className="absolute inset-0 bg-black/5"></div>
                
                <div className="absolute bottom-8 left-8">
                  <div className="w-3 h-3 bg-white rounded-full shadow-lg"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="flex items-center mb-8">
              <div className="w-12 h-[1px] bg-gray-300 mr-6"></div>
              <span className="text-xs text-gray-400 uppercase tracking-widest font-light">Propósito</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-extralight text-gray-900 leading-tight">
              Misión y Visión
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="flex items-center mb-6">
                <Target className="w-8 h-8 text-gray-400 mr-4" />
                <h3 className="text-3xl font-light text-gray-900">Misión</h3>
              </div>
              
              <p className="text-lg text-gray-600 font-light leading-relaxed">
                Ofrecer a cada cliente las mejores marcas del mercado, asesoramiento técnico especializado y precios competitivos, construyendo relaciones basadas en la transparencia y el respeto.
              </p>
              
              <div className="border-l border-gray-200 pl-6">
                <p className="text-sm text-gray-500 font-light">
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
              className="space-y-8"
            >
              <div className="flex items-center mb-6">
                <Eye className="w-8 h-8 text-gray-400 mr-4" />
                <h3 className="text-3xl font-light text-gray-900">Visión</h3>
              </div>
              
              <p className="text-lg text-gray-600 font-light leading-relaxed">
                Posicionarnos como una referencia en el sector sanitario, destacándonos no solo por la variedad y calidad de los productos, sino también por un servicio ágil, moderno y adaptado a las necesidades actuales de profesionales, empresas y particulares.
              </p>
              
              <div className="border-l border-gray-200 pl-6">
                <p className="text-sm text-gray-500 font-light">
                  Hoy, Cyneth acompaña tanto a grandes proyectos como a clientes particulares, asegurando siempre soluciones sanitarias eficientes, confiables y adaptadas a cada necesidad.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
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
              <span className="text-xs text-gray-400 uppercase tracking-widest font-light">Valores</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-extralight text-gray-900 leading-tight">
              Lo que nos guía
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {values.map((value, index) => (
              <motion.div
                key={value.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="space-y-6">
                  <div className="text-gray-400 group-hover:text-gray-600 transition-colors duration-300">
                    {value.icon}
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-light text-gray-900 mb-3 group-hover:text-gray-600 transition-colors duration-300">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 font-light leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                  
                  <div className="w-8 h-[1px] bg-gray-200 group-hover:bg-gray-400 transition-colors duration-300"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="mb-16">
              <div className="flex items-center justify-center mb-8">
                <div className="w-12 h-[1px] bg-white/30 mr-6"></div>
                <span className="text-xs text-white/60 uppercase tracking-widest font-light">Contacto</span>
                <div className="w-12 h-[1px] bg-white/30 ml-6"></div>
              </div>
              
              <h2 className="text-5xl md:text-7xl font-extralight text-white mb-8 leading-tight">
                ¿Trabajamos juntos?
              </h2>
              
              <p className="text-lg text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
                Conoce más sobre nuestros productos y servicios. Estamos aquí para asesorarte en tu próximo proyecto.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <Link href="/catalogo">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group bg-white text-gray-900 px-12 py-4 font-light text-lg tracking-wide hover:bg-gray-100 transition-all duration-500 flex items-center cursor-pointer"
                >
                  Ver Catálogo
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              
              <Link href="/contacto">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group border border-white/30 text-white px-12 py-4 font-light text-lg tracking-wide hover:bg-white/5 transition-all duration-500 flex items-center cursor-pointer"
                >
                  Contactar
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
