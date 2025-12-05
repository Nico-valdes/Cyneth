'use client'

import BulkUpload from '@/components/BulkUpload'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function BulkUploadPage() {
  usePageTitle({
    title: 'Carga Masiva de Productos - Admin',
    description: 'Sube múltiples productos desde un archivo Excel'
  })

  return <BulkUpload />
}

