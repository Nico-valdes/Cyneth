'use client'

import React, { useState, useRef } from 'react'
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X, Eye, ExternalLink } from 'lucide-react'

interface UploadResult {
  message: string
  results: {
    total: number
    emptyRows: number
    validRows: number
    errorRows: number
    processedRows: number
    success: number
    duplicates: number
    errors: any[]
    processed: number
    validationErrors: number
    validProducts: number
    summary: {
      totalFilas: number
      filasVacias: number
      filasValidas: number
      filasConErrores: number
      productosNuevos: number
      duplicados: number
      errores: number
    }
  }
}

interface ProcessingProgress {
  isProcessing: boolean
  currentStep: string
  progress: number
  details: string
}

export default function BulkUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<ProcessingProgress>({
    isProcessing: false,
    currentStep: '',
    progress: 0,
    details: ''
  })
  const [showDetails, setShowDetails] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
        setError('Solo se permiten archivos Excel (.xlsx, .xls)')
        return
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
        setError('El archivo es demasiado grande (máximo 10MB)')
        return
      }
      setFile(selectedFile)
      setError(null)
      setUploadResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setProgress({
      isProcessing: true,
      currentStep: 'Subiendo archivo...',
      progress: 10,
      details: 'Preparando archivo para procesamiento'
    })

    try {
      const formData = new FormData()
      formData.append('file', file)

      setProgress({
        isProcessing: true,
        currentStep: 'Analizando Excel...',
        progress: 30,
        details: 'Leyendo filas y validando formato'
      })

      const response = await fetch('/api/products/bulk-upload', {
        method: 'POST',
        body: formData,
      })

      setProgress({
        isProcessing: true,
        currentStep: 'Procesando productos...',
        progress: 60,
        details: 'Descargando imágenes y creando productos'
      })

      const result = await response.json()

      setProgress({
        isProcessing: true,
        currentStep: 'Finalizando...',
        progress: 90,
        details: 'Completando proceso'
      })

      if (response.ok) {
        setUploadResult(result)
        setError(null)
        setProgress({
          isProcessing: false,
          currentStep: 'Completado',
          progress: 100,
          details: 'Proceso finalizado exitosamente'
        })
      } else {
        setError(result.error || 'Error desconocido')
        setProgress({
          isProcessing: false,
          currentStep: 'Error',
          progress: 0,
          details: result.error || 'Error desconocido'
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión'
      setError(errorMessage)
      setProgress({
        isProcessing: false,
        currentStep: 'Error',
        progress: 0,
        details: errorMessage
      })
    }
  }

  const resetUpload = () => {
    setFile(null)
    setUploadResult(null)
    setError(null)
    setProgress({
      isProcessing: false,
      currentStep: '',
      progress: 0,
      details: ''
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadTemplate = () => {
    // Crear un Excel de ejemplo con formato completo para scraping
    const headers = [
      'name',           // Nombre del producto
      'sku',            // SKU principal
      'brand',          // Marca
      'description',    // Descripción
      'attributes',     // Atributos separados por ; (ej: "Material:Acero;Instalación:Mural;Garantía:2 años")
      'images',         // URLs de imágenes separadas por ,
      'color_variants'  // Variantes de color (ej: "Blanco:#FFFFFF:SKU-BLANCO:URL_IMAGEN|Cromado:#C0C0C0:SKU-CROMADO:URL_IMAGEN")
    ]
    
    const exampleRows = [
      [
        'Grifo Monocomando de Cocina Premium',
        'HG-MONO-KIT-001',
        'Hansgrohe',
        'Grifo monocomando de cocina con tecnología de ahorro de agua y diseño moderno',
        'Material:Acero inoxidable;Instalación:Mural;Tecnología:Monocomando;Garantía:5 años',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500,https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
        'Cromado:#C0C0C0:HG-MONO-KIT-001-CROM:https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500|Blanco:#FFFFFF:HG-MONO-KIT-001-BLAN:https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500'
      ],
      [
        'Inodoro One Piece Moderno',
        'RC-INOD-OP-002',
        'Roca',
        'Inodoro one piece con sistema de descarga dual y diseño minimalista',
        'Tipo:One Piece;Descarga:Dual;Material:Cerámica;Instalación:Suelo',
        'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=500',
        'Blanco:#FFFFFF:RC-INOD-OP-002-BLAN:https://images.unsplash.com/photo-1620626011761-996317b8d101?w=500'
      ],
      [
        'Ducha de Lluvia 25cm',
        'GH-DUCHA-LL-003',
        'Grohe',
        'Ducha de lluvia de 25cm con tecnología de ahorro de agua',
        'Tamaño:25cm;Tipo:Lluvia;Material:Latón cromado;Presión:2.5 bar',
        'https://images.unsplash.com/photo-1620135203207-b9e0ddc2dfa9?w=500,https://images.unsplash.com/photo-1584537516085-63b6b6b18985?w=500',
        'Cromado:#C0C0C0:GH-DUCHA-LL-003-CROM:https://images.unsplash.com/photo-1620135203207-b9e0ddc2dfa9?w=500|Negro:#000000:GH-DUCHA-LL-003-NEG:https://images.unsplash.com/photo-1584537516085-63b6b6b18985?w=500'
      ]
    ]

    const csvContent = [headers, ...exampleRows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'plantilla-scraping-productos.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header minimalista */}
      <div className="border-b border-gray-100">
        <div className="px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Carga Masiva</h1>
              <p className="text-gray-500 mt-1">Importa productos desde Excel con imágenes automáticas</p>
            </div>
            
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-5 py-2.5 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all font-medium cursor-pointer"
            >
              <Download size={18} />
              Plantilla de Ejemplo
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Instrucciones para scraping */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Formato para Scraping</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-900">Columnas obligatorias:</span>
                  <p className="text-gray-600">name, sku, brand, description</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Atributos:</span>
                  <p className="text-gray-600">Material:Acero;Instalación:Mural (separados por ;)</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Imágenes:</span>
                  <p className="text-gray-600">URLs separadas por comas</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-900">Variantes de color:</span>
                  <p className="text-gray-600">Color:#HEX:SKU:URL_IMAGEN (separadas por |)</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Estado:</span>
                  <p className="text-gray-600">Todos los productos se crean como activos</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Categoría:</span>
                  <p className="text-gray-600">Se asigna automáticamente o manualmente</p>
                </div>
              </div>
            </div>
          </div>

          {/* Área de subida modernizada */}
          <div className="border border-gray-200 rounded-lg p-12 text-center hover:bg-gray-50/50 transition-all">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              disabled={progress.isProcessing}
            />
            
            {!file ? (
              <div className="space-y-6">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <FileSpreadsheet className="h-8 w-8 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900">Subir archivo Excel</h3>
                  <p className="text-gray-500">Arrastra tu archivo aquí o haz clic para seleccionar</p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium cursor-pointer"
                  disabled={progress.isProcessing}
                >
                  Seleccionar Archivo
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FileSpreadsheet className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleUpload}
                    disabled={progress.isProcessing}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <Upload size={18} />
                    {progress.isProcessing ? 'Procesando...' : 'Iniciar Importación'}
                  </button>
                  
                  <button
                    onClick={resetUpload}
                    disabled={progress.isProcessing}
                    className="px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar modernizada */}
          {progress.isProcessing && (
            <div className="border border-gray-200 rounded-lg p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{progress.currentStep}</h3>
                  <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{progress.progress}%</span>
                </div>
                
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress.progress}%` }}
                  ></div>
                </div>
                
                <p className="text-gray-600">{progress.details}</p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-900">Error en la carga</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Results modernizados */}
          {uploadResult && (
            <div className="space-y-6">
              {/* Resumen con diseño contemporáneo */}
              <div className="bg-white border border-gray-200 rounded-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Importación Completada</h3>
                    <p className="text-gray-500">Proceso finalizado exitosamente</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{uploadResult.results.summary.productosNuevos}</div>
                    <div className="text-sm text-green-700 font-medium">Productos Nuevos</div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600">{uploadResult.results.summary.duplicados}</div>
                    <div className="text-sm text-amber-700 font-medium">Duplicados</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{uploadResult.results.summary.errores}</div>
                    <div className="text-sm text-red-700 font-medium">Errores</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">{uploadResult.results.summary.filasValidas}</div>
                    <div className="text-sm text-gray-700 font-medium">Total Procesadas</div>
                  </div>
                </div>
              </div>

              {/* Botón para ver detalles */}
              {uploadResult.results.errors.length > 0 && (
                <div className="text-center">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-2 mx-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <Eye size={16} />
                    {showDetails ? 'Ocultar' : 'Ver'} Detalles de Errores ({uploadResult.results.errors.length})
                  </button>
                </div>
              )}

              {/* Detalles de errores */}
              {showDetails && uploadResult.results.errors.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Detalles de Errores y Duplicados</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {uploadResult.results.errors.map((error, index) => (
                      <div key={index} className="bg-white p-3 rounded border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                error.type === 'validation' ? 'bg-red-100 text-red-700' :
                                error.type === 'duplicate' ? 'bg-amber-100 text-amber-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {error.type === 'validation' ? 'Validación' :
                                 error.type === 'duplicate' ? 'Duplicado' :
                                 'Inserción'}
                              </span>
                              {error.row !== 'N/A' && (
                                <span className="text-xs text-gray-500">Fila {error.row}</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-900 font-medium">
                              {error.data?.name || 'Producto sin nombre'}
                            </p>
                            <p className="text-sm text-gray-600">{error.error}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
