'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useInView, useScroll, useTransform, useSpring } from 'framer-motion'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Facebook,
  Instagram,
  Building2,
  Users,
  Award,
  Shield,
  Truck,
  Headphones
} from 'lucide-react'
import Header from '@/components/layout/Header'

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
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Refs para animaciones
  const heroRef = useRef(null)
  const contactInfoRef = useRef(null)
  const formRef = useRef(null)
  const bottomRef = useRef(null)

  // Hooks de animación
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" })
  const contactInfoInView = useInView(contactInfoRef, { once: true, margin: "-50px" })
  const formInView = useInView(formRef, { once: true, margin: "-50px" })
  const bottomInView = useInView(bottomRef, { once: true, margin: "-50px" })

  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'El asunto es requerido'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Simular envío del formulario
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSubmitStatus('success')
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: ''
      })
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: Phone,
      title: 'Teléfono Corporativo',
      content: '+54 11 4567-8900',
      subtitle: 'Línea directa de ventas',
      href: 'tel:+541145678900',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      icon: Mail,
      title: 'Email Institucional',
      content: 'ventas@cyneth.com.ar',
      subtitle: 'Respuesta en 24 horas',
      href: 'mailto:ventas@cyneth.com.ar',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      icon: MapPin,
      title: 'Sede Central',
      content: 'Buenos Aires, Argentina',
      subtitle: 'Cobertura nacional',
      href: '#',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      icon: Clock,
      title: 'Horarios Comerciales',
      content: 'Lun - Vie: 8:00 - 18:00',
      subtitle: 'Sábados: 9:00 - 13:00',
      href: '#',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ]

  const companyFeatures = [
    {
      icon: Award,
      title: 'Certificaciones ISO',
      description: 'Cumplimos con los más altos estándares de calidad internacional'
    },
    {
      icon: Shield,
      title: 'Garantía Extendida',
      description: 'Todos nuestros productos cuentan con garantía de 2 años'
    },
    {
      icon: Truck,
      title: 'Logística Nacional',
      description: 'Entregas a todo el país en 48-72 horas hábiles'
    },
    {
      icon: Headphones,
      title: 'Soporte Técnico',
      description: 'Asistencia especializada las 24 horas del día'
    }
  ]

  const socialLinks = [
    {
      icon: Facebook,
      href: 'https://www.facebook.com/cynethsanitarios',
      label: 'Facebook'
    },
    {
      icon: Instagram,
      href: 'https://www.instagram.com/cynethsanitarios',
      label: 'Instagram'
    }
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        {/* Hero Section Profesional */}
        <motion.div 
          ref={heroRef}
          style={{ y, opacity }}
          className="relative bg-gradient-to-br from-red-600 via-red-700 to-neutral-800 text-white py-24"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                className="text-5xl md:text-6xl font-bold mb-6 text-white"
              >
                Contacto Corporativo
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-8"
              >
                CYNETH SANITARIOS - Líderes en soluciones profesionales de sanitarios y plomería desde 1999
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">25+</div>
                  <div className="text-white/80">Años de experiencia</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">500+</div>
                  <div className="text-white/80">Proyectos completados</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">100%</div>
                  <div className="text-white/80">Satisfacción garantizada</div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Sección de Información Integrada */}
        <motion.div
          ref={contactInfoRef}
          initial={{ opacity: 0, y: 50 }}
          animate={contactInfoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-gradient-to-br from-neutral-50 to-white py-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={contactInfoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-neutral-800 mb-6">
                Conecte con Nuestro Equipo Profesional
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
                CYNETH SANITARIOS S.A. - Líderes en soluciones sanitarias de alta gama con más de 25 años de experiencia
              </p>
            </motion.div>

            {/* Grid de Contacto Integrado */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              {contactInfo.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={contactInfoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -5 }}
                  className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className={`inline-flex p-4 rounded-2xl ${item.bgColor} mb-4`}>
                    <item.icon size={32} className={item.color} />
                  </div>
                  <h3 className="font-bold text-neutral-800 mb-2 text-lg">{item.title}</h3>
                  <p className="text-sm text-neutral-500 mb-3">{item.subtitle}</p>
                  <a 
                    href={item.href}
                    className="text-neutral-600 hover:text-red-600 transition-colors duration-300 text-lg font-medium"
                  >
                    {item.content}
                  </a>
                </motion.div>
              ))}
            </div>

            {/* Características en una sola fila */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={contactInfoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16"
            >
              {companyFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={contactInfoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 1.0 + index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -3 }}
                  className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="inline-flex p-3 bg-red-50 rounded-xl mb-3">
                    <feature.icon size={24} className="text-red-600" />
                  </div>
                  <h4 className="font-bold text-neutral-800 mb-2 text-sm">{feature.title}</h4>
                  <p className="text-neutral-600 text-xs leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Redes Sociales Integradas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={contactInfoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="text-center"
            >
              <h3 className="text-2xl font-bold text-neutral-800 mb-6">Síganos en Redes Sociales</h3>
              <div className="flex justify-center space-x-6">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={contactInfoInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ delay: 1.6 + index * 0.2, duration: 0.6 }}
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-4 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                    aria-label={social.label}
                  >
                    <social.icon size={24} className="text-neutral-600 group-hover:text-red-600 transition-colors duration-300" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Formulario de Contacto */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, y: 50 }}
            animate={formInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-white p-10 rounded-3xl shadow-2xl border border-neutral-100"
          >
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={formInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-4xl font-bold text-neutral-800 mb-4"
              >
                Solicite su Cotización
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={formInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-lg text-neutral-600 mb-8 leading-relaxed"
              >
                Complete el formulario y nuestro equipo de especialistas se pondrá en contacto con usted en un plazo máximo de 24 horas
              </motion.p>
              
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl flex items-center space-x-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <CheckCircle className="text-green-600" size={24} />
                  </motion.div>
                  <p className="text-green-800 font-medium">¡Mensaje enviado correctamente! Te contactaremos pronto.</p>
                </motion.div>
              )}

              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <AlertCircle className="text-red-600" size={24} />
                  </motion.div>
                  <p className="text-red-800 font-medium">Hubo un error al enviar el mensaje. Inténtalo nuevamente.</p>
                </motion.div>
              )}

              <motion.form 
                onSubmit={handleSubmit} 
                className="space-y-8"
                initial={{ opacity: 0 }}
                animate={formInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={formInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    <label htmlFor="name" className="block text-sm font-bold text-neutral-800 mb-3">
                      Nombre completo *
                    </label>
                    <motion.input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      whileFocus={{ scale: 1.02 }}
                      className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 text-lg ${
                        errors.name ? 'border-red-500 bg-red-50' : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                      placeholder="Tu nombre completo"
                    />
                    {errors.name && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-600 font-medium"
                      >
                        {errors.name}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={formInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  >
                    <label htmlFor="email" className="block text-sm font-bold text-neutral-800 mb-3">
                      Email *
                    </label>
                    <motion.input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      whileFocus={{ scale: 1.02 }}
                      className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 text-lg ${
                        errors.email ? 'border-red-500 bg-red-50' : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                      placeholder="tu@email.com"
                    />
                    {errors.email && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-600 font-medium"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={formInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 1.0, duration: 0.6 }}
                  >
                    <label htmlFor="phone" className="block text-sm font-bold text-neutral-800 mb-3">
                      Teléfono *
                    </label>
                    <motion.input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      whileFocus={{ scale: 1.02 }}
                      className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 text-lg ${
                        errors.phone ? 'border-red-500 bg-red-50' : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                      placeholder="+54 11 1234-5678"
                    />
                    {errors.phone && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-600 font-medium"
                      >
                        {errors.phone}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={formInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                  >
                    <label htmlFor="company" className="block text-sm font-bold text-neutral-800 mb-3">
                      Empresa
                    </label>
                    <motion.input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      whileFocus={{ scale: 1.02 }}
                      className="w-full px-6 py-4 border-2 border-neutral-200 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 text-lg hover:border-neutral-300"
                      placeholder="Nombre de tu empresa"
                    />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={formInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                >
                  <label htmlFor="subject" className="block text-sm font-bold text-neutral-800 mb-3">
                    Asunto *
                  </label>
                  <motion.select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    whileFocus={{ scale: 1.02 }}
                    className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 text-lg ${
                      errors.subject ? 'border-red-500 bg-red-50' : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <option value="">Seleccione el tipo de consulta</option>
                    <option value="cotizacion-proyecto">Cotización para proyecto</option>
                    <option value="consulta-productos">Consulta sobre productos específicos</option>
                    <option value="soporte-tecnico">Soporte técnico especializado</option>
                    <option value="distribuidor">Oportunidad de distribución</option>
                    <option value="mantenimiento">Servicios de mantenimiento</option>
                    <option value="otro">Otra consulta</option>
                  </motion.select>
                  {errors.subject && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-600 font-medium"
                    >
                      {errors.subject}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={formInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 1.6, duration: 0.6 }}
                >
                  <label htmlFor="message" className="block text-sm font-bold text-neutral-800 mb-3">
                    Mensaje *
                  </label>
                  <motion.textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    whileFocus={{ scale: 1.02 }}
                    className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 text-lg resize-none ${
                      errors.message ? 'border-red-500 bg-red-50' : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                    placeholder="Describa detalladamente su proyecto o consulta técnica..."
                  />
                  {errors.message && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-600 font-medium"
                    >
                      {errors.message}
                    </motion.p>
                  )}
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  initial={{ opacity: 0, y: 20 }}
                  animate={formInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 1.8, duration: 0.6 }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(220, 38, 38, 0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-6 px-8 rounded-2xl font-bold text-white transition-all duration-300 flex items-center justify-center space-x-3 text-lg ${
                    isSubmitting
                      ? 'bg-neutral-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-xl'
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
                      <span>Solicitar Cotización</span>
                    </>
                  )}
                </motion.button>
              </motion.form>
          </motion.div>
        </div>

        {/* Información Adicional Integrada */}
        <motion.div
          ref={bottomRef}
          initial={{ opacity: 0, y: 50 }}
          animate={bottomInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-gradient-to-br from-neutral-50 to-white py-20"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={bottomInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center mb-12"
            >
              <h3 className="text-3xl font-bold text-neutral-800 mb-4">Información Adicional</h3>
              <p className="text-lg text-neutral-600">Horarios, cobertura y servicios especializados</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Horarios */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={bottomInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-white p-8 rounded-2xl shadow-lg"
              >
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-red-600 rounded-xl mr-4">
                    <Clock className="text-white" size={24} />
                  </div>
                  <h4 className="text-2xl font-bold text-neutral-800">Horarios Comerciales</h4>
                </div>
                <div className="space-y-4">
                  {[
                    { day: "Lunes - Viernes", time: "8:00 - 18:00", description: "Atención comercial completa" },
                    { day: "Sábados", time: "9:00 - 13:00", description: "Solo consultas urgentes" },
                    { day: "Domingos", time: "Cerrado", description: "Emergencias 24/7" }
                  ].map((schedule, index) => (
                    <div key={schedule.day} className="py-3 border-b border-neutral-100 last:border-b-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-neutral-800">{schedule.day}</span>
                        <span className="text-neutral-600 font-medium">{schedule.time}</span>
                      </div>
                      <p className="text-sm text-neutral-500">{schedule.description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Cobertura */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={bottomInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="bg-white p-8 rounded-2xl shadow-lg"
              >
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-red-600 rounded-xl mr-4">
                    <MapPin className="text-white" size={24} />
                  </div>
                  <h4 className="text-2xl font-bold text-neutral-800">Cobertura Nacional</h4>
                </div>
                <div className="space-y-4">
                  <p className="text-neutral-600 leading-relaxed">
                    Sede central en Buenos Aires con cobertura nacional. Atendemos proyectos en todo el territorio argentino con logística especializada.
                  </p>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
                    <p className="text-sm text-neutral-500 mb-1 font-medium">Visitas técnicas:</p>
                    <p className="font-bold text-neutral-800">Coordinación previa requerida</p>
                    <p className="text-sm text-neutral-600 mt-1">Agende su cita con 48 horas de anticipación</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}
