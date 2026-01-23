'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { usePageTitle } from '@/hooks/usePageTitle';

interface FormData {
  name: string
  email: string
  phone: string
  company: string
  subject: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  subject?: string
  message?: string
}

export default function ContactoPage() {
  usePageTitle({
    title: 'Contacto | Cyneth Sanitarios',
    description: 'Contacta con nuestros especialistas. Estamos aquí para asesorarte en tu próximo proyecto sanitario. Respuesta en 24 horas.',
    showComeBackMessage: true,
    comeBackMessage: '¡Volvé!'
  });

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'El asunto es requerido';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Teléfono',
      content: '+54 11 2316-8857',
      subtitle: 'Línea directa',
      href: 'tel:+541123168857'
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'ventas@cyneth.com.ar',
      subtitle: 'Respuesta en 24h',
      href: 'mailto:ventas@cyneth.com.ar'
    },
    {
      icon: Clock,
      title: 'Horarios',
      content: 'Lun - Vie: 8:00 - 17:00',
      subtitle: 'Sábados: 9:00 - 13:00',
      href: '#'
    }
  ];

  const locations = [
    {
      title: 'Sucursal Wilde',
      address: 'Av. Ramon Franco 6181',
      href: 'https://www.google.com/maps/search/?api=1&query=Av.+Ramon+Franco+6181,+Wilde,+Buenos+Aires'
    },
    {
      title: 'Sucursal Hudson',
      address: 'Calle 47 N° 6750, Local 26',
      address2: 'Polo Design',
      href: 'https://www.google.com/maps/search/?api=1&query=Calle+47+N°+6750,+Local+26,+Polo+Design,+Hudson,+Buenos+Aires'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section - Responsive */}
      <section className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden bg-gray-900">
        <div className="absolute inset-0">
          <svg
            className="w-full h-full"
            viewBox="0 0 1920 1080"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Gradiente de fondo */}
            <defs>
              <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1f2937" stopOpacity="1" />
                <stop offset="100%" stopColor="#111827" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="shapeGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.03" />
              </linearGradient>
              <linearGradient id="shapeGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            
            {/* Fondo con gradiente */}
            <rect width="100%" height="100%" fill="url(#bgGradient)" />
            
            {/* Formas geométricas abstractas */}
            {/* Círculo grande superior izquierdo */}
            <circle
              cx="200"
              cy="150"
              r="180"
              fill="url(#shapeGradient1)"
              opacity="0.6"
            />
            
            {/* Rectángulo rotado centro-derecha */}
            <rect
              x="1400"
              y="200"
              width="320"
              height="120"
              fill="url(#shapeGradient2)"
              opacity="0.5"
              transform="rotate(25 1560 260)"
            />
            
            {/* Círculo mediano inferior izquierdo */}
            <circle
              cx="300"
              cy="850"
              r="140"
              fill="url(#shapeGradient1)"
              opacity="0.4"
            />
            
            {/* Líneas diagonales */}
            <line
              x1="0"
              y1="400"
              x2="800"
              y2="0"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="2"
            />
            <line
              x1="1200"
              y1="1080"
              x2="1920"
              y2="600"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="2"
            />
            
            {/* Rectángulo delgado horizontal */}
            <rect
              x="1000"
              y="500"
              width="600"
              height="4"
              fill="rgba(255, 255, 255, 0.08)"
              opacity="0.7"
              transform="rotate(-15 1300 502)"
            />
            
            {/* Círculo pequeño superior derecha */}
            <circle
              cx="1700"
              cy="300"
              r="100"
              fill="url(#shapeGradient2)"
              opacity="0.5"
            />
            
            {/* Rectángulo vertical centro */}
            <rect
              x="900"
              y="350"
              width="80"
              height="400"
              fill="url(#shapeGradient1)"
              opacity="0.3"
              transform="rotate(10 940 550)"
            />
            
            {/* Formas adicionales para profundidad */}
            <ellipse
              cx="1600"
              cy="800"
              rx="200"
              ry="120"
              fill="url(#shapeGradient2)"
              opacity="0.35"
              transform="rotate(-20 1600 800)"
            />
            
            {/* Líneas horizontales sutiles */}
            <line
              x1="0"
              y1="250"
              x2="1920"
              y2="250"
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="750"
              x2="1920"
              y2="750"
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth="1"
            />
            
            {/* Polígono abstracto */}
            <polygon
              points="500,600 700,500 800,650 600,750"
              fill="url(#shapeGradient1)"
              opacity="0.25"
            />
          </svg>
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
              <span className="text-[10px] sm:text-xs text-white/60 uppercase tracking-widest font-light">Contacto</span>
              <div className="w-6 sm:w-8 md:w-12 h-[1px] bg-white/30 ml-3 sm:ml-4 md:ml-6"></div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extralight text-white mb-4 sm:mb-6 md:mb-8 leading-tight px-4">
              Hablemos
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-2xl mx-auto font-light leading-relaxed px-4">
              Estamos acá para asesorarte en lo que necesites.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Section - Responsive */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 sm:mb-16 md:mb-20"
          >
            <div className="flex items-center mb-4 sm:mb-6 md:mb-8">
              <div className="w-6 sm:w-8 md:w-12 h-[1px] bg-gray-300 mr-3 sm:mr-4 md:mr-6"></div>
              <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-light">Información</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extralight text-gray-900 leading-tight">
              Contacto
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {contactInfo.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group text-center"
              >
                <div className="space-y-4 sm:space-y-6">
                  <div className="text-gray-400 group-hover:text-gray-600 transition-colors duration-300 flex justify-center">
                    <item.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg sm:text-xl font-light text-gray-900 mb-1.5 sm:mb-2 group-hover:text-gray-600 transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">{item.subtitle}</p>
                    <a 
                      href={item.href}
                      className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors duration-300 font-light break-words"
                    >
                      {item.content}
                    </a>
                  </div>
                  
                  <div className="w-6 sm:w-8 h-[1px] bg-gray-200 group-hover:bg-gray-400 transition-colors duration-300 mx-auto"></div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Locations Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 sm:mt-16 md:mt-20 lg:mt-24"
          >
            {/* Header Section */}
            <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
              <div className="flex items-center justify-center mb-4 sm:mb-5 md:mb-6">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-gray-400" />
              </div>
              <div className="flex items-center justify-center mb-4 sm:mb-5 md:mb-6">
                <div className="w-5 sm:w-6 md:w-8 lg:w-12 h-[1px] bg-gray-300 mr-2.5 sm:mr-3 md:mr-4 lg:mr-6"></div>
                <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-light">Ubicaciones</span>
                <div className="w-5 sm:w-6 md:w-8 lg:w-12 h-[1px] bg-gray-300 ml-2.5 sm:ml-3 md:ml-4 lg:ml-6"></div>
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extralight text-gray-900 leading-tight">
                Nuestros Locales
              </h3>
            </div>

            {/* Locations Grid */}
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 xl:gap-20 relative">
                {/* Divider vertical - solo desktop */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-200 transform -translate-x-1/2"></div>
                
                {locations.map((location, index) => (
                  <motion.div
                    key={location.title}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center px-4 sm:px-6 md:px-8 lg:px-12 h-full flex flex-col items-center"
                  >
                    <h4 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6">
                      {location.title}
                    </h4>
                    <div className="flex-1 flex flex-col items-center">
                      <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-7 md:mb-8">
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 font-light">
                          {location.address}
                        </p>
                        {location.address2 && (
                          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 font-light">
                            {location.address2}
                          </p>
                        )}
                      </div>
                    </div>
                    <a
                      href={location.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs sm:text-sm md:text-base text-gray-700 hover:text-gray-900 transition-colors duration-300 group font-light"
                    >
                      <span>Ver en Google Maps</span>
                      <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section - Responsive */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 sm:mb-16 md:mb-20"
          >
            <div className="flex items-center mb-4 sm:mb-6 md:mb-8">
              <div className="w-6 sm:w-8 md:w-12 h-[1px] bg-gray-300 mr-3 sm:mr-4 md:mr-6"></div>
              <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-light">Formulario</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extralight text-gray-900 leading-tight">
              Envíanos un mensaje
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-6 sm:p-8 md:p-12 rounded-none shadow-lg"
          >
            {submitStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mb-8 p-6 bg-green-50 border border-green-200 rounded-none flex items-center space-x-4"
              >
                <CheckCircle className="text-green-600" size={24} />
                <p className="text-green-800 font-light">¡Mensaje enviado correctamente! Te contactaremos pronto.</p>
              </motion.div>
            )}

            {submitStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mb-8 p-6 bg-red-50 border border-red-200 rounded-none flex items-center space-x-4"
              >
                <AlertCircle className="text-red-600" size={24} />
                <p className="text-red-800 font-light">Hubo un error al enviar el mensaje. Inténtalo nuevamente.</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <label htmlFor="name" className="block text-xs sm:text-sm font-light text-gray-900 mb-2 sm:mb-3">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 sm:px-6 py-3 sm:py-4 border border-gray-200 focus:border-gray-400 transition-all duration-300 text-sm sm:text-base md:text-lg font-light touch-manipulation ${
                      errors.name ? 'border-red-500 bg-red-50' : ''
                    }`}
                    placeholder="Tu nombre completo"
                  />
                  {errors.name && (
                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 font-light">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-light text-gray-900 mb-2 sm:mb-3">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 sm:px-6 py-3 sm:py-4 border border-gray-200 focus:border-gray-400 transition-all duration-300 text-sm sm:text-base md:text-lg font-light touch-manipulation ${
                      errors.email ? 'border-red-500 bg-red-50' : ''
                    }`}
                    placeholder="tu@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 font-light">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <label htmlFor="phone" className="block text-xs sm:text-sm font-light text-gray-900 mb-2 sm:mb-3">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 sm:px-6 py-3 sm:py-4 border border-gray-200 focus:border-gray-400 transition-all duration-300 text-sm sm:text-base md:text-lg font-light touch-manipulation ${
                      errors.phone ? 'border-red-500 bg-red-50' : ''
                    }`}
                    placeholder="+54 11 1234-5678"
                  />
                  {errors.phone && (
                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 font-light">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="company" className="block text-xs sm:text-sm font-light text-gray-900 mb-2 sm:mb-3">
                    Empresa
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 border border-gray-200 focus:border-gray-400 transition-all duration-300 text-sm sm:text-base md:text-lg font-light touch-manipulation"
                    placeholder="Nombre de tu empresa"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-xs sm:text-sm font-light text-gray-900 mb-2 sm:mb-3">
                  Asunto *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={`w-full px-4 sm:px-6 py-3 sm:py-4 border border-gray-200 focus:border-gray-400 transition-all duration-300 text-sm sm:text-base md:text-lg font-light touch-manipulation ${
                    errors.subject ? 'border-red-500 bg-red-50' : ''
                  }`}
                >
                  <option value="">Seleccione el tipo de consulta</option>
                  <option value="cotizacion-proyecto">Cotización para proyecto</option>
                  <option value="consulta-productos">Consulta sobre productos específicos</option>
                  <option value="soporte-tecnico">Soporte técnico especializado</option>
                  <option value="distribuidor">Oportunidad de distribución</option>
                  <option value="mantenimiento">Servicios de mantenimiento</option>
                  <option value="otro">Otra consulta</option>
                </select>
                {errors.subject && (
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 font-light">{errors.subject}</p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-xs sm:text-sm font-light text-gray-900 mb-2 sm:mb-3">
                  Mensaje *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  className={`w-full px-4 sm:px-6 py-3 sm:py-4 border border-gray-200 focus:border-gray-400 transition-all duration-300 text-sm sm:text-base md:text-lg font-light resize-none touch-manipulation ${
                    errors.message ? 'border-red-500 bg-red-50' : ''
                  }`}
                  placeholder="Describa detalladamente su proyecto o consulta técnica..."
                />
                {errors.message && (
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 font-light">{errors.message}</p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 sm:py-5 md:py-6 px-6 sm:px-8 font-light text-sm sm:text-base md:text-lg transition-all duration-300 flex items-center justify-center space-x-2 sm:space-x-3 touch-manipulation rounded ${
                  isSubmitting
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full flex-shrink-0"
                    />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} className="sm:w-6 sm:h-6 flex-shrink-0" />
                    <span>Enviar Mensaje</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
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
                <span className="text-[10px] sm:text-xs text-white/60 uppercase tracking-widest font-light">Explora</span>
                <div className="w-6 sm:w-8 md:w-12 h-[1px] bg-white/30 ml-3 sm:ml-4 md:ml-6"></div>
              </div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extralight text-white mb-4 sm:mb-6 md:mb-8 leading-tight px-4">
                ¿Listo para empezar?
              </h2>
              
              <p className="text-sm sm:text-base md:text-lg text-white/70 max-w-2xl mx-auto font-light leading-relaxed px-4">
                Descubrí nuestro catálogo completo de productos sanitarios y encontrá la solución perfecta para tu proyecto.
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
              
              <Link href="/nosotros" className="w-full sm:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group w-full sm:w-auto border border-white/30 text-white px-8 sm:px-10 md:px-12 py-3 sm:py-3.5 md:py-4 font-light text-sm sm:text-base md:text-lg tracking-wide hover:bg-white/5 active:bg-white/10 transition-all duration-500 flex items-center justify-center cursor-pointer touch-manipulation rounded"
                >
                  Conocer más
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
