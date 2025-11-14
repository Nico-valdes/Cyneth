import { useEffect, useRef } from 'react'

interface UsePageTitleOptions {
  title: string
  description?: string
  showComeBackMessage?: boolean
  comeBackMessage?: string
}

export function usePageTitle({
  title,
  description,
  showComeBackMessage = true,
  comeBackMessage = '¡Volvé!'
}: UsePageTitleOptions) {
  const originalTitleRef = useRef<string>(title)
  const isBlurredRef = useRef<boolean>(false)

  // Actualizar título y metadata cuando cambian
  useEffect(() => {
    // Actualizar el título original cuando cambia
    originalTitleRef.current = title

    // Si no está en estado "blurred", actualizar el título
    if (!isBlurredRef.current) {
      document.title = title
    }
    
    // Actualizar meta description si existe
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', description)
    }
  }, [title, description])

  // Manejar eventos de blur/focus para el efecto "volvé"
  useEffect(() => {
    // Función para cuando la pestaña pierde el foco
    const handleBlur = () => {
      if (showComeBackMessage && !isBlurredRef.current) {
        isBlurredRef.current = true
        document.title = `${comeBackMessage} - ${originalTitleRef.current}`
      }
    }

    // Función para cuando la pestaña recupera el foco
    const handleFocus = () => {
      if (isBlurredRef.current) {
        isBlurredRef.current = false
        document.title = originalTitleRef.current
      }
    }

    // Agregar event listeners
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    // Cleanup
    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [showComeBackMessage, comeBackMessage])
}
