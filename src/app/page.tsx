'use client';

import CleanHomepage from '@/components/CleanHomepage';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function HomePage() {
  usePageTitle({
    title: 'Cyneth Sanitarios',
    description: 'Descubre nuestra colección de grifería, sanitarios, duchas y accesorios de las mejores marcas. Asesoramiento técnico especializado y precios competitivos.',
    showComeBackMessage: true,
    comeBackMessage: '¡Volvé!'
  });

  return (
    <CleanHomepage />
  )
}
