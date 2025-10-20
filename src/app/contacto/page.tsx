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
import Image from 'next/image';
import griferia from "../../../public/griferia.jpg";

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
      content: '+54 11 4567-8900',
      subtitle: 'Línea directa',
      href: 'tel:+541145678900'
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'ventas@cyneth.com.ar',
      subtitle: 'Respuesta en 24h',
      href: 'mailto:ventas@cyneth.com.ar'
    },
    {
      icon: MapPin,
      title: 'Ubicación',
      content: 'Buenos Aires, Argentina',
      subtitle: 'Cobertura nacional',
      href: '#'
    },
    {
      icon: Clock,
      title: 'Horarios',
      content: 'Lun - Vie: 8:00 - 18:00',
      subtitle: 'Sábados: 9:00 - 13:00',
      href: '#'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={griferia}
            alt="Cyneth - Contacto"
            fill
            className="object-cover grayscale-20"
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
              <span className="text-xs text-white/60 uppercase tracking-widest font-light">Contacto</span>
              <div className="w-12 h-[1px] bg-white/30 ml-6"></div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extralight text-white mb-8 leading-tight">
              Hablemos
            </h1>
            
            <p className="text-lg text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
              Estamos aquí para asesorarte en tu próximo proyecto sanitario
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Section */}
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
              <span className="text-xs text-gray-400 uppercase tracking-widest font-light">Información</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-extralight text-gray-900 leading-tight">
              Contacto
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group text-center"
              >
                <div className="space-y-6">
                  <div className="text-gray-400 group-hover:text-gray-600 transition-colors duration-300 flex justify-center">
                    <item.icon className="w-8 h-8" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-light text-gray-900 mb-2 group-hover:text-gray-600 transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">{item.subtitle}</p>
                    <a 
                      href={item.href}
                      className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-light"
                    >
                      {item.content}
                    </a>
                  </div>
                  
                  <div className="w-8 h-[1px] bg-gray-200 group-hover:bg-gray-400 transition-colors duration-300 mx-auto"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="flex items-center mb-8">
              <div className="w-12 h-[1px] bg-gray-300 mr-6"></div>
              <span className="text-xs text-gray-400 uppercase tracking-widest font-light">Formulario</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-extralight text-gray-900 leading-tight">
              Envíanos un mensaje
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-12 rounded-none shadow-lg"
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

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="name" className="block text-sm font-light text-gray-900 mb-3">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-6 py-4 border border-gray-200 focus:border-gray-400 transition-all duration-300 text-lg font-light ${
                      errors.name ? 'border-red-500 bg-red-50' : ''
                    }`}
                    placeholder="Tu nombre completo"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 font-light">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-light text-gray-900 mb-3">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-6 py-4 border border-gray-200 focus:border-gray-400 transition-all duration-300 text-lg font-light ${
                      errors.email ? 'border-red-500 bg-red-50' : ''
                    }`}
                    placeholder="tu@email.com"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 font-light">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="phone" className="block text-sm font-light text-gray-900 mb-3">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-6 py-4 border border-gray-200 focus:border-gray-400 transition-all duration-300 text-lg font-light ${
                      errors.phone ? 'border-red-500 bg-red-50' : ''
                    }`}
                    placeholder="+54 11 1234-5678"
                  />
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600 font-light">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-light text-gray-900 mb-3">
                    Empresa
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 border border-gray-200 focus:border-gray-400 transition-all duration-300 text-lg font-light"
                    placeholder="Nombre de tu empresa"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-light text-gray-900 mb-3">
                  Asunto *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={`w-full px-6 py-4 border border-gray-200 focus:border-gray-400 transition-all duration-300 text-lg font-light ${
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
                  <p className="mt-2 text-sm text-red-600 font-light">{errors.subject}</p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-light text-gray-900 mb-3">
                  Mensaje *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  className={`w-full px-6 py-4 border border-gray-200 focus:border-gray-400 transition-all duration-300 text-lg font-light resize-none ${
                    errors.message ? 'border-red-500 bg-red-50' : ''
                  }`}
                  placeholder="Describa detalladamente su proyecto o consulta técnica..."
                />
                {errors.message && (
                  <p className="mt-2 text-sm text-red-600 font-light">{errors.message}</p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-6 px-8 font-light text-lg transition-all duration-300 flex items-center justify-center space-x-3 ${
                  isSubmitting
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send size={24} />
                    <span>Enviar Mensaje</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
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
                <span className="text-xs text-white/60 uppercase tracking-widest font-light">Explora</span>
                <div className="w-12 h-[1px] bg-white/30 ml-6"></div>
              </div>
              
              <h2 className="text-5xl md:text-7xl font-extralight text-white mb-8 leading-tight">
                ¿Listo para comenzar?
              </h2>
              
              <p className="text-lg text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
                Descubre nuestro catálogo completo de productos sanitarios y encuentra la solución perfecta para tu proyecto.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <Link href="/catalogo">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group bg-white text-gray-900 px-12 py-4 font-light text-lg tracking-wide hover:bg-gray-100 transition-all duration-500 flex items-center"
                >
                  Ver Catálogo
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              
              <Link href="/nosotros">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group border border-white/30 text-white px-12 py-4 font-light text-lg tracking-wide hover:bg-white/5 transition-all duration-500 flex items-center"
                >
                  Conocer más
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
