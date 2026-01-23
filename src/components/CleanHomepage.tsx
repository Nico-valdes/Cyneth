'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import { 
  Phone,
  ArrowRight,
  Droplet,
  ShowerHead,
  Wrench,
  Bath,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Thermometer,
  Waves,
  Sparkles,
  Power
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getOptimizedImageUrl, getMainImage } from '@/utils/imageUtils';
import sanitario from "../../public/inodoro_milano.png"
import sanitario2 from "../../public/inodoro_milano2.png"
import sanitario3 from "../../public/inodoro_milano3.png"
import catgrif from "../../public/griferia_cocina.png"
import catduch from "../../public/cat-ducha.jpg"
import catsan from "../../public/cat-sanitario.jpg"
import catacc from "../../public/cat-accesorios.jpg"


// Componente MilanoSlider estilo elegante
function MilanoSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  
  // Imágenes del slider
  const images = [
    sanitario,
    sanitario2,
    sanitario3,
  ];

  // Autoplay
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, images.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  // Touch handlers para swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      goToNext();
    } else if (distance < -minSwipeDistance) {
      goToPrevious();
    }
  };

  return (
    <div 
      className="relative w-full aspect-square max-w-[600px] mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Glow Rojo Tecnológico de Fondo (Ambient Light) */}
      <div 
        className="absolute inset-0 bg-red-500/10 blur-[60px] rounded-full scale-75 pointer-events-none"
        style={{
          animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      ></div>

      {/* Contenedor de la imagen */}
      <div className="relative h-full w-full z-10 group">
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full flex items-center justify-center p-4"
          >
            {/* Marco sutil para la imagen */}
            <div className="relative bg-white/50 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/40 w-full h-full flex items-center justify-center overflow-hidden">
              <Image
                src={images[currentIndex]}
                alt={`Inodoro Milano Smart Tec - Vista ${currentIndex + 1}`}
                fill
                className="object-contain drop-shadow-2xl"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                priority={currentIndex === 0}
              />
              
              {/* Flecha izquierda - Minimalista */}
              <button 
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 transition-colors duration-200 z-30 opacity-0 group-hover:opacity-100"
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={24} strokeWidth={1.5} />
              </button>
              
              {/* Flecha derecha - Minimalista */}
              <button 
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 transition-colors duration-200 z-30 opacity-0 group-hover:opacity-100"
                aria-label="Imagen siguiente"
              >
                <ChevronRight size={24} strokeWidth={1.5} />
              </button>
              
              {/* Indicadores - Minimalistas */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className="transition-all duration-200"
                    aria-label={`Ir a imagen ${idx + 1}`}
                  >
                    <div 
                      className={`rounded-full transition-all duration-200 ${
                        idx === currentIndex 
                          ? 'w-2 h-2 bg-red-500' 
                          : 'w-1.5 h-1.5 bg-gray-400/60 hover:bg-gray-400'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  level: number;
  type: 'main' | 'sub';
}

export default function CleanHomepage() {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isInfoButtonHovered, setIsInfoButtonHovered] = useState(false);
  const [isCatalogButtonHovered, setIsCatalogButtonHovered] = useState(false);
  const [preloadedImageUrl, setPreloadedImageUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  // Precargar un producto y su imagen de Cloudinary para activar la BD y CDN
  useEffect(() => {
    const preloadProduct = async () => {
      try {
        // Consulta silenciosa al backend para obtener un producto
        const response = await fetch('/api/products?limit=1&active=true', {
          method: 'GET',
          // No mostrar errores al usuario
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.products?.length > 0) {
            const product = data.data.products[0];
            // Obtener la imagen principal del producto
            const mainImage = getMainImage(product);
            if (mainImage) {
              // Almacenar la URL para renderizarla de forma oculta
              setPreloadedImageUrl(mainImage);
            }
          }
        }
      } catch (error) {
        // Silenciar errores - esto es solo para precarga
        console.debug('Precarga de producto silenciosa (opcional)');
      }
    };

    // Ejecutar precarga al montar el componente
    preloadProduct();
  }, []);

  // Cargar categorías desde la API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.categories) {
            setCategories(data.data.categories);
            setCategoriesLoaded(true);
          }
        }
      } catch (error) {
        console.error('Error cargando categorías:', error);
        // Si falla, usar valores por defecto
        setCategoriesLoaded(true);
      }
    };

    loadCategories();
  }, []);

  // Función para buscar categoría por nombre (case-insensitive, parcial)
  const findCategoryByName = (searchName: string): Category | null => {
    if (!categories.length) return null;
    
    const normalizedSearch = searchName.toLowerCase().trim();
    
    // Buscar coincidencia exacta primero
    let found = categories.find(cat => 
      cat.name.toLowerCase() === normalizedSearch
    );
    
    // Si no hay coincidencia exacta, buscar parcial
    if (!found) {
      found = categories.find(cat => {
        const catName = cat.name.toLowerCase();
        return catName.includes(normalizedSearch) || normalizedSearch.includes(catName);
      });
    }
    
    // Para búsquedas más específicas
    if (!found) {
      // Mapeo de términos de búsqueda a palabras clave
      const keywordMap: { [key: string]: string[] } = {
        'cocina': ['cocina', 'kitchen', 'griferia cocina'],
        'baño': ['baño', 'bath', 'griferia baño', 'ducha'],
        'sanitario': ['sanitario', 'inodoro', 'wc', 'toilet'],
        'caño': ['caño', 'tubo', 'conexion', 'accesorio']
      };
      
      const keywords = keywordMap[normalizedSearch] || [normalizedSearch];
      found = categories.find(cat => {
        const catName = cat.name.toLowerCase();
        return keywords.some(keyword => catName.includes(keyword));
      });
    }
    
    return found || null;
  };

  // Featured categories data con enlaces dinámicos
  // Puedes poner categoryId directamente o dejar que se busque por searchName
  const featuredCategoriesData = [
    {
      id: 1,
      name: "Griferia para cocina",
      icon: <Droplet className="w-8 h-8" />,
      description: "Diseño europeo y calidad premium",
      image: catgrif,
      categoryId: "68cda5f5ff392fb2b5d73dac",
      searchName: "cocina" 
    },
    {
      id: 2,
      name: "Sanitarios",
      icon: <Bath className="w-8 h-8" />,
      description: "Elegancia y funcionalidad",
      image: catsan,
      categoryId: "68cda5f6ff392fb2b5d73dcd", 
      searchName: "sanitario"
    },
    {
      id: 3,
      name: "Griferia para baño",
      icon: <ShowerHead className="w-8 h-8" />,
      description: "Experiencia de baño única",
      image: catduch,
      categoryId: "68cda5f4ff392fb2b5d73da3",
      searchName: "baño"
    },
    {
      id: 4,
      name: "Caños y conexiones",
      icon: <Wrench className="w-8 h-8" />,
      description: "Complementos esenciales",
      image: catacc,
      categoryId: "68cda5f5ff392fb2b5d73db2",
      searchName: "caño"
    }
  ];

  // Construir categorías con enlaces dinámicos
  const featuredCategories = featuredCategoriesData.map(cat => {
    let link = '/catalogo'; // Fallback por defecto
    
    // Si hay categoryId hardcodeado, usarlo directamente
    if (cat.categoryId) {
      link = `/catalogo?category=${cat.categoryId}`;
    } else if (cat.searchName) {
      // Si no hay categoryId, buscar por nombre
      const foundCategory = findCategoryByName(cat.searchName);
      if (foundCategory) {
        link = `/catalogo?category=${foundCategory._id}`;
      }
    }
    
    return {
      ...cat,
      link
    };
  });

  // Popular products data
  const popularProducts = [
    {
      id: 1,
      name: "Grifería Premium Milano",
      description: "Diseño minimalista con tecnología de última generación. Ahorro de agua y máxima durabilidad.",
      image: "https://griferiapeirano.com/wp-content/uploads/2025/05/62-175GR_Pulse-lavatorio-de-pared-Grafito-500x500.jpg",
      category: "Griferías",
      link: "/productos/1"
    },
    {
      id: 2,
      name: "Inodoro Moderno Berlín",
      description: "Líneas elegantes y funcionalidad superior. Fácil limpieza y diseño contemporáneo.",
      image: "https://ferrum.com/pub/media/catalog/product/cache/723de03bc8ecfa836485d5b2e3f2ed4a/d/a/dadwqdwd.jpg",
      category: "Sanitarios",
      link: "/productos/2"
    },
    {
      id: 3,
      name: "Bomba Presión Pro 500",
      description: "Alto rendimiento y eficiencia energética. Ideal para sistemas de presión constante.",
      image: "https://ferrum.com/pub/media/catalog/product/cache/723de03bc8ecfa836485d5b2e3f2ed4a/l/a/lavatorio-mesada-trento-ferrum-bacha-blanco-tre-ms-301-bl-b_1.jpg",
      category: "Bombas",
      link: "/productos/3"
    },
    {
      id: 4,
      name: "Ducha Rain Experience",
      description: "Experiencia de lluvia relajante. Múltiples funciones de agua para máximo confort.",
      image: "https://griferiapeirano.com/wp-content/uploads/2023/11/IMG_8117-768x654.jpg",
      category: "Accesorios",
      link: "/productos/4"
    },
    {
      id: 5,
      name: "Vanitory Elegance 80cm",
      description: "Elegancia y espacio optimizado. Perfecto para baños modernos y funcionales.",
      image: "https://fvsa.com/wp-content/uploads/2021/07/0103_H6-ARRAYAN.jpg",
      category: "Muebles",
      link: "/productos/5"
    },
    {
      id: 6,
      name: "Grifo Monocomando Cocina",
      description: "Control intuitivo y diseño ergonómico. Resistente y fácil de mantener.",
      image: "https://griferiapeirano.com/wp-content/uploads/2025/05/62-175GR_Pulse-lavatorio-de-pared-Grafito-500x500.jpg",
      category: "Griferías",
      link: "/productos/6"
    }
  ];

  return (
    <motion.div 
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Header />

      {/* Hero Section with Banner Video - Resoluciones fijas por dispositivo */}
      {/* Desktop: 2560x1000 (2.56:1) */}
      <motion.section 
        className="relative w-full aspect-[2560/1000] overflow-hidden hidden lg:block"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <video 
          autoPlay
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/banner-video3.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/10"></div>
      </motion.section>

      {/* Tablet: 16:10 (1.6:1) */}
      <motion.section 
        className="relative w-full aspect-[16/10] overflow-hidden hidden md:block lg:hidden"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <video 
          autoPlay
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/banner-video3-tablet.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/10"></div>
      </motion.section>

      {/* Mobile: 1:1 (cuadrado) */}
      <motion.section 
        className="relative w-full aspect-square overflow-hidden block md:hidden"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <video 
          autoPlay
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/banner-video3-mobile.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/10"></div>
      </motion.section>

      {/* Featured Categories - Contemporary Layout - Responsive */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8 sm:mb-10 md:mb-12"
          >
            <motion.div 
              className="flex items-center mb-3 sm:mb-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div 
                className="w-6 sm:w-8 h-[1px] bg-gray-300 mr-3 sm:mr-4"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              ></motion.div>
              <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-light">Categorías</span>
            </motion.div>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 sm:gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="w-full lg:w-auto"
              >
                <motion.h2 
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-7xl font-extralight text-gray-900 leading-tight mb-2 sm:mb-3"
                >
                  Explorá
                </motion.h2>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 font-light leading-relaxed max-w-2xl">
                  Nuestras categorías principales: productos de calidad premium para transformar tu hogar con diseño y funcionalidad.
                </p>
              </motion.div>
              <Link href="/catalogo" className="w-full lg:w-auto">
                <motion.button 
                  className="group relative inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 rounded-full border-2 border-gray-900 cursor-pointer w-full lg:w-auto justify-center overflow-hidden"
                  onMouseEnter={() => setIsButtonHovered(true)}
                  onMouseLeave={() => setIsButtonHovered(false)}
                >
                  {/* Fondo negro que se expande desde la izquierda hacia la derecha como un sable láser */}
                  <motion.div
                    className="absolute inset-0 bg-black rounded-full z-0"
                    animate={{ scaleX: isButtonHovered ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    style={{ 
                      transformOrigin: 'left center'
                    }}
                  ></motion.div>
                  
                  <span className="relative z-10 text-xs sm:text-sm font-medium tracking-wide text-gray-900 group-hover:text-white transition-colors duration-300">VER TODAS LAS CATEGORÍAS</span>
                  <ArrowRight size={14} className="relative z-10 text-gray-900 group-hover:text-white group-hover:translate-x-2 transition-all duration-300 sm:w-4 sm:h-4" />
                </motion.button>
              </Link>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
            {/* First Category - Large Left - Responsive */}
            <motion.div
              initial={{ opacity: 0, x: -30, scale: 0.95 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="md:col-span-12 lg:col-span-8 h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] relative overflow-hidden group rounded-lg"
            >
              <Link href={featuredCategories[0].link}>
                <div className="w-full h-full relative cursor-pointer">
                  <Image
                    src={featuredCategories[0].image}
                    alt={featuredCategories[0].name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105 grayscale-20 group-hover:grayscale-0"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                  
                  {/* Minimal Icon */}
                  <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 text-white opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 md:bottom-8 md:left-8 md:right-8 text-white">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 sm:gap-0">
                      <div>
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-light mb-2 sm:mb-3 md:mb-4 group-hover:text-white/80 transition-colors duration-500">
                          {featuredCategories[0].name}
                        </h3>
                        <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed max-w-md">
                          {featuredCategories[0].description}
                        </p>
                      </div>
                      <div className="hidden sm:block w-6 sm:w-8 h-[1px] bg-white/50 group-hover:bg-white group-hover:w-12 sm:group-hover:w-16 transition-all duration-500"></div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Right Column Stack - Responsive */}
            <div className="md:col-span-12 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 gap-4 sm:gap-6">
              {featuredCategories.slice(1, 3).map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 + (index * 0.15), ease: "easeOut" }}
                  viewport={{ once: true }}
                  className="relative h-[250px] sm:h-[280px] md:h-[290px] overflow-hidden group rounded-lg"
                >
                  <Link href={category.link}>
                    <div className="w-full h-full relative cursor-pointer">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-105 grayscale-20 group-hover:grayscale-0"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                      
                      {/* Minimal Icon */}
                      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 text-white opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                      </div>
                      
                      {/* Content */}
                      <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white">
                        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 sm:gap-0">
                          <div>
                            <h3 className="text-xl sm:text-2xl font-light mb-1.5 sm:mb-2 group-hover:text-white/80 transition-colors duration-500">
                              {category.name}
                            </h3>
                            <p className="text-white/70 text-xs sm:text-sm font-light leading-relaxed">
                              {category.description}
                            </p>
                          </div>
                          <div className="hidden sm:block w-4 sm:w-6 h-[1px] bg-white/50 group-hover:bg-white group-hover:w-8 sm:group-hover:w-12 transition-all duration-500"></div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Bottom Full Width - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              className="md:col-span-12 h-[250px] sm:h-[280px] md:h-[300px] relative overflow-hidden group rounded-lg"
            >
              <Link href={featuredCategories[3].link}>
                <div className="w-full h-full relative cursor-pointer">
                  <Image
                    src={featuredCategories[3].image}
                    alt={featuredCategories[3].name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105 grayscale-20 group-hover:grayscale-0"
                    sizes="100vw"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                  
                  {/* Minimal Icon */}
                  <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 text-white opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 md:bottom-8 md:left-8 md:right-8 text-white">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 sm:gap-0">
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-light mb-2 sm:mb-3 group-hover:text-white/80 transition-colors duration-500">
                          {featuredCategories[3].name}
                        </h3>
                        <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed max-w-lg">
                          {featuredCategories[3].description}
                        </p>
                      </div>
                      <div className="hidden sm:block w-6 sm:w-8 h-[1px] bg-white/50 group-hover:bg-white group-hover:w-12 sm:group-hover:w-16 transition-all duration-500"></div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Milano Smart Tec Highlight Slider */}
      <section className="py-20 sm:py-28 lg:py-36 bg-white relative overflow-hidden font-sans selection:bg-red-100 selection:text-red-900">
        {/* Textura sutil tipo mármol/tech */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 3px),
                repeating-linear-gradient(90deg, transparent, transparent 2px, #000 2px, #000 3px)
              `,
              backgroundSize: '100px 100px'
            }}
          ></div>
        </div>

        {/* Manchas de color ambiental (Glows) */}
        <div 
          className="absolute top-0 left-0 w-[500px] h-[500px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 0% 0%, rgba(239, 68, 68, 0.05) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        ></div>
        <div 
          className="absolute bottom-0 right-0 w-[600px] h-[600px] pointer-events-none opacity-30"
          style={{
            background: 'radial-gradient(circle at 100% 100%, rgba(6, 182, 212, 0.05) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        ></div>

        {/* Líneas Decorativas Arquitectónicas */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        <div className="absolute left-8 sm:left-12 top-0 h-32 w-px bg-gradient-to-b from-gray-200 to-transparent hidden lg:block"></div>
        
        {/* Números gigantes de fondo (Parallax visual) */}
        <div className="absolute top-10 right-0 hidden xl:block pointer-events-none select-none z-0">
          <span className="text-[250px] font-thin text-gray-50 leading-none tracking-tighter" style={{ fontFamily: 'serif' }}>01</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* COLUMNA IZQUIERDA: TEXTO */}
            <div className="relative">
              {/* Decoración lateral texto */}
              <div className="absolute -left-6 top-0 bottom-0 w-px bg-gradient-to-b from-red-500/20 via-gray-200 to-transparent hidden lg:block"></div>
              
              <div className="space-y-10">
                {/* Header de la sección */}
                <div className="space-y-4">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4"
                  >
                    <span className="text-xs font-bold text-red-500 tracking-[0.25em] uppercase">Producto Destacado</span>
                    <div className="h-px w-12 bg-red-200"></div>
                  </motion.div>
                  
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl sm:text-6xl lg:text-7xl font-light text-gray-900 tracking-tight"
                  >
                    Milano <span className="font-semibold relative inline-block">
                      Smart Tec
                      {/* Subrayado decorativo */}
                      <span className="absolute bottom-2 left-0 w-full h-3 bg-red-100 -z-10 opacity-50 transform -rotate-1"></span>
                    </span>
                  </motion.h2>
                </div>

                {/* Descripción */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6 relative pl-6 border-l-2 border-gray-100"
                >
                  <p className="text-xl text-gray-600 font-light leading-relaxed">
                    Ofrecemos el sanitario inteligente más avanzado del mercado. Tecnología de vanguardia que combina <span className="text-gray-900 font-normal">confort, higiene y diseño minimalista</span> para transformar tu baño.
                  </p>
                  <p className="text-sm text-gray-400">
                    Disponible para proyectos residenciales y comerciales. Consultar compatibilidad de instalación.
                  </p>
                </motion.div>

                {/* Lista de características con Iconos */}
                <div className="pt-4">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-8">
                    {[
                      { icon: Power, text: "Apertura y cierre automático de la tapa" },
                      { icon: Thermometer, text: "Asiento calefaccionado, temperatura regulable" },
                      { icon: Waves, text: "Lavado tipo bidet, agua a temperatura ajustable" },
                      { icon: Sparkles, text: "Desinfección UV contra bacterias" }
                    ].map((feature, index) => (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + (index * 0.1) }}
                        className="group flex items-start gap-4"
                      >
                        {/* Icon Container */}
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-red-50 transition-colors duration-300 flex items-center justify-center border border-gray-100 group-hover:border-red-100">
                            <feature.icon size={20} className="text-gray-400 group-hover:text-red-500 transition-colors duration-300" strokeWidth={1.5} />
                          </div>
                        </div>
                        
                        {/* Text */}
                        <span className="text-sm sm:text-base text-gray-700 font-light leading-snug pt-2 group-hover:text-gray-900 transition-colors">
                          {feature.text}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Botón de acción (CTA) - Mejorado */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="pt-4"
                >
                  <a 
                    href="https://wa.me/541123168857?text=Hola!%20Me%20interesa%20obtener%20más%20información%20sobre%20el%20Inodoro%20Milano%20Smart%20Tec.%20¿Podrían%20brindarme%20detalles%20sobre%20precio%2C%20disponibilidad%20y%20características%20técnicas%3F"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      className="group relative inline-flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-red-200/50 cursor-pointer active:scale-95"
                      onMouseEnter={() => setIsInfoButtonHovered(true)}
                      onMouseLeave={() => setIsInfoButtonHovered(false)}
                    >
                      {/* Fondo con gradiente rojo que se expande desde la izquierda hacia la derecha como un sable láser */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-full z-0"
                        animate={{ scaleX: isInfoButtonHovered ? 1 : 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        style={{ 
                          transformOrigin: 'left center'
                        }}
                      ></motion.div>
                      
                      {/* Efecto de brillo sutil */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-[1]"></div>
                      
                      <span className="relative z-10 text-sm font-medium tracking-wide">SOLICITAR INFORMACIÓN</span>
                      <ArrowRight size={16} className="relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
                    </motion.button>
                  </a>
                </motion.div>
              </div>
            </div>

            {/* COLUMNA DERECHA: IMAGEN / SLIDER */}
            <div className="relative mt-12 lg:mt-0">
              {/* Elemento decorativo detrás del slider (Líneas Tech) */}
              <motion.div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-dashed border-gray-200 rounded-full opacity-30 pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              ></motion.div>
              
              <MilanoSlider />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Products Section - Redesigned with Personality */}
      <section className="py-20 sm:py-28 lg:py-36 bg-white relative overflow-hidden font-sans">
        

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-16 sm:mb-20 md:mb-24"
          >
            <motion.div 
              className="flex items-center mb-4 sm:mb-6 md:mb-8"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div 
                className="w-6 sm:w-8 md:w-12 h-[1px] bg-gray-300 mr-3 sm:mr-4 md:mr-6"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              ></motion.div>
              <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-light">Productos</span>
            </motion.div>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 sm:gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative"
              >
                {/* Decoración lateral texto */}
                <div className="absolute -left-6 top-0 bottom-0 w-px bg-gradient-to-b from-red-500/20 via-gray-200 to-transparent hidden lg:block"></div>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extralight text-gray-900 leading-tight mb-4 sm:mb-6">
                  Populares
                </h2>
                <div className="space-y-4 relative pl-6 border-l-2 border-gray-100">
                  <p className="text-sm sm:text-base md:text-lg text-gray-600 font-light leading-relaxed max-w-2xl">
                    Descubrí los productos más elegidos por nuestros clientes. <span className="text-gray-900 font-normal">Calidad premium y diseño que transforma espacios.</span>
                  </p>
                </div>
              </motion.div>
              <Link href="/catalogo" className="w-full lg:w-auto">
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  className="group relative inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 rounded-full border-2 border-gray-900 cursor-pointer w-full lg:w-auto justify-center overflow-hidden"
                  onMouseEnter={() => setIsCatalogButtonHovered(true)}
                  onMouseLeave={() => setIsCatalogButtonHovered(false)}
                >
                  {/* Fondo negro que se expande desde la izquierda hacia la derecha como un sable láser */}
                  <motion.div
                    className="absolute inset-0 bg-black rounded-full z-0"
                    animate={{ scaleX: isCatalogButtonHovered ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    style={{ 
                      transformOrigin: 'left center'
                    }}
                  ></motion.div>
                  
                  <span className="relative z-10 text-xs sm:text-sm font-medium tracking-wide text-gray-900 group-hover:text-white transition-colors duration-300">VER TODO EL CATÁLOGO</span>
                  <ArrowRight size={14} className="relative z-10 text-gray-900 group-hover:text-white group-hover:translate-x-2 transition-all duration-300 sm:w-4 sm:h-4" />
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Products Grid - Redesigned with Personality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
            {popularProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.5 + (index * 0.1), ease: [0.4, 0, 0.2, 1] }}
                viewport={{ once: true }}
                className="group relative"
              >
                {/* Glow effect behind card */}
                <div 
                  className="absolute inset-0 bg-red-500/5 blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10"
                ></div>
                
                <Link href={product.link}>
                  <div className="relative bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-red-100/50 transition-all duration-700 cursor-pointer h-full flex flex-col">
                    {/* Image Container with enhanced effects */}
                    <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                      <img
                        src={getOptimizedImageUrl(product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        loading="lazy"
                      />
                      
                      
                      
                      {/* Decorative corner element */}
                      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                        <div className="relative">
                          <div className="w-3 h-3 bg-white rounded-full shadow-lg opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-300"></div>
                        </div>
                      </div>
                      
                      {/* Category badge - enhanced */}
                      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                        <div className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          
                        </div>
                      </div>
                    </div>
                    
                    {/* Content - Enhanced */}
                    <div className="p-6 sm:p-8 space-y-3 flex-grow flex flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-light text-gray-900 text-lg sm:text-xl tracking-wide group-hover:text-gray-700 transition-colors duration-500 leading-snug">
                          {product.name}
                        </h3>
                        <div className="w-4 h-[1px] bg-gray-300 group-hover:bg-red-500 group-hover:w-8 transition-all duration-500 flex-shrink-0 mt-2"></div>
                      </div>
                      
                      {/* Description */}
                      {product.description && (
                        <p className="text-sm text-gray-500 font-light leading-relaxed line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      
                      {/* Decorative line */}
                      <div className="w-12 h-[1px] bg-gray-200 group-hover:bg-red-300 group-hover:w-16 transition-all duration-500"></div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section - Enhanced with Company Identity */}
      <motion.section 
        className="py-20 sm:py-28 lg:py-36 bg-gray-900 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {/* Ambient glows */}
        <div 
          className="absolute top-0 left-1/4 w-[600px] h-[600px] pointer-events-none opacity-20"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.15) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        ></div>
        <div 
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] pointer-events-none opacity-15"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        ></div>

        {/* Decorative lines */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="absolute left-8 sm:left-12 top-0 h-40 w-px bg-gradient-to-b from-white/20 to-transparent hidden lg:block"></div>
        <div className="absolute right-8 sm:right-12 bottom-0 h-40 w-px bg-gradient-to-t from-white/20 to-transparent hidden lg:block"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center"
          >
            {/* Header */}
            <div className="mb-12 sm:mb-16 md:mb-20">
              <motion.div 
                className="flex items-center justify-center mb-6 sm:mb-8 md:mb-10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="w-6 sm:w-8 md:w-12 h-[1px] bg-white/30 mr-3 sm:mr-4 md:mr-6"></div>
                <span className="text-[10px] sm:text-xs text-white/60 uppercase tracking-widest font-light">Cyneth</span>
                <div className="w-6 sm:w-8 md:w-12 h-[1px] bg-white/30 ml-3 sm:ml-4 md:ml-6"></div>
              </motion.div>
              
              <motion.h2 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extralight text-white mb-6 sm:mb-8 md:mb-10 leading-tight px-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Transformamos espacios con calidad y diseño
              </motion.h2>
              
              <motion.div 
                className="space-y-4 max-w-3xl mx-auto px-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <p className="text-base sm:text-lg md:text-xl text-white/80 font-light leading-relaxed">
                  En <span className="text-white font-normal">Cyneth</span>, nos especializamos en ofrecer soluciones integrales de plomería y sanitarios de alta gama. 
                </p>
                <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed">
                  Nuestros especialistas te acompañan desde la planificación hasta la instalación, garantizando excelencia en cada proyecto residencial o comercial.
                </p>
              </motion.div>
            </div>

            {/* CTA Buttons - Enhanced */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 justify-center items-center px-4">
              <Link href="/contacto" className="w-full sm:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-full overflow-hidden transition-all duration-300 hover:bg-gray-50 hover:shadow-2xl hover:shadow-red-200/50 cursor-pointer active:scale-95 w-full sm:w-auto justify-center"
                >
                  {/* Fondo animado con gradiente rojo */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Efecto de brillo sutil */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <span className="relative z-10 text-sm font-medium tracking-wide text-gray-900 group-hover:text-white transition-colors duration-300">
                    CONSULTAR CON ESPECIALISTA
                  </span>
                  <ArrowRight size={16} className="relative z-10 group-hover:translate-x-2 transition-transform duration-300 text-gray-900 group-hover:text-white" />
                  
                  {/* Borde sutil que aparece al hover */}
                  <div className="absolute inset-0 rounded-full border-2 border-red-500/0 group-hover:border-red-500/40 transition-all duration-300"></div>
                </motion.button>
              </Link>
              
              <Link href="/catalogo" className="w-full sm:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative inline-flex items-center gap-3 px-8 py-4 border-2 border-white/40 text-white rounded-full overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-white/60 hover:shadow-2xl hover:shadow-red-200/20 cursor-pointer active:scale-95 w-full sm:w-auto justify-center"
                >
                  {/* Efecto de brillo sutil */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <span className="relative z-10 text-sm font-medium tracking-wide">
                    EXPLORAR CATÁLOGO COMPLETO
                  </span>
                  <ArrowRight size={16} className="relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Imagen precargada oculta para activar BD y Cloudinary */}
      {preloadedImageUrl && (
        <div className="hidden">
          <img
            src={getOptimizedImageUrl(preloadedImageUrl, 1, 1)}
            alt=""
            loading="eager"
            style={{ width: '1px', height: '1px', opacity: 0, position: 'absolute', pointerEvents: 'none' }}
            onLoad={() => {
              // Imagen precargada exitosamente
              console.debug('Imagen de producto precargada');
            }}
          />
        </div>
      )}
    </motion.div>
  );
}