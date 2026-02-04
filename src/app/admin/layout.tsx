import type { Metadata } from 'next'
import AdminGuard from '@/components/AdminGuard'

/**
 * Panel de administración: NO indexar ni enlazar.
 * No se muestra en buscadores ni en enlaces públicos.
 */
export const metadata: Metadata = {
  title: 'Panel de administración',
  description: 'Acceso restringido.',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    googleBot: { index: false, follow: false },
  },
  openGraph: { robots: 'noindex, nofollow' },
  other: {
    'referrer': 'no-referrer',
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminGuard>{children}</AdminGuard>
}
