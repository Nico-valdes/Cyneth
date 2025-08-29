'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface UploadResult {
  total: number;
  emptyRows: number;
  validRows: number;
  errorRows: number;
  processedRows: number;
  success: number;
  errors: Array<{
    row: number;
    error: string;
    data: any;
    type?: string;
  }>;
  processed: number;
  summary?: {
    totalFilas: number;
    filasVacias: number;
    filasValidas: number;
    filasConErrores: number;
    productosNuevos: number;
    duplicados: number;
    errores: number;
  };
}

const BulkUpload: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.match(/\.(xlsx|xls)$/i)) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Solo se permiten archivos Excel (.xlsx, .xls)');
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setResult(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simular progreso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/products/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en la carga');
      }

      const resultData = await response.json();
      setResult(resultData.results);
      
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Crear template Excel más completo
    const templateData = [
      ['name', 'category', 'subcategory', 'brand', 'description', 'specifications', 'tags', 'variations', 'images'],
      ['Tubería PVC 110mm', 'Tubería', 'PVC', 'Marca ABC', 'Tubería de PVC de 110mm de diámetro para sistemas de drenaje', '{"diameter": "110mm", "length": "3m", "material": "PVC"}', 'tuberia,pvc,drenaje,agua', '[{"attributes": {"diameter": "110mm", "length": "3m"}, "stock": 50, "sku": "PVC-110-3M"}]', 'https://ejemplo.com/tuberia1.jpg,https://ejemplo.com/tuberia2.jpg'],
      ['Codo PVC 90°', 'Accesorios', 'Codos', 'Marca ABC', 'Codo de PVC de 90 grados para cambio de dirección', '{"diameter": "110mm", "angle": "90°", "material": "PVC"}', 'codo,pvc,90grados,accesorio', '[{"attributes": {"diameter": "110mm", "angle": "90°"}, "stock": 25, "sku": "CODO-110-90"}]', 'https://ejemplo.com/codo1.jpg'],
      ['', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', ''],
    ];

    // Crear workbook y worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);

    // Establecer ancho de columnas
    const columnWidths = [
      { wch: 25 }, // name
      { wch: 15 }, // category
      { wch: 15 }, // subcategory
      { wch: 15 }, // brand
      { wch: 40 }, // description
      { wch: 30 }, // specifications
      { wch: 25 }, // tags
      { wch: 40 }, // variations
      { wch: 30 }, // images
    ];
    worksheet['!cols'] = columnWidths;

    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

    // Generar archivo y descargar
    XLSX.writeFile(workbook, 'template_productos.xlsx');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Carga Masiva de Productos
        </h2>

        {/* Descripción */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Instrucciones:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Sube un archivo Excel (.xlsx o .xls) con los productos</li>
            <li>• La primera fila debe contener los nombres de las columnas</li>
            <li>• <strong>Campos obligatorios:</strong> nombre y categoría</li>
            <li>• <strong>Campos opcionales:</strong> subcategoría, marca, descripción, tags</li>
            <li>• Las filas vacías se ignorarán automáticamente</li>
            <li>• Puedes descargar una plantilla de ejemplo abajo</li>
          </ul>
        </div>

        {/* Descargar Template */}
        <div className="mb-6">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            Descargar Plantilla
          </button>
        </div>

        {/* Área de Drop */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
            id="file-input"
          />
          
          <label htmlFor="file-input" className="cursor-pointer">
            <div className="flex flex-col items-center">
              <FileSpreadsheet size={48} className="text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {file ? file.name : 'Arrastra tu archivo Excel aquí o haz clic para seleccionar'}
              </p>
              <p className="text-sm text-gray-500">
                Solo archivos .xlsx y .xls
              </p>
            </div>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle size={20} />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Botón de Carga */}
        {file && !isUploading && (
          <div className="mt-6">
            <button
              onClick={handleUpload}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Upload size={20} />
              Cargar {file.name}
            </button>
          </div>
        )}

        {/* Progreso de Carga */}
        {isUploading && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Procesando archivo...</span>
              <span className="text-sm text-gray-500">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Resultados */}
        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-4">Resultados de la Carga:</h3>
            
            {/* Estadísticas principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{result.success}</div>
                <div className="text-sm text-green-700">Productos Cargados</div>
              </div>
              <div className="text-center p-3 bg-blue-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{result.validRows}</div>
                <div className="text-sm text-blue-700">Filas Válidas</div>
              </div>
              <div className="text-center p-3 bg-yellow-100 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{result.emptyRows}</div>
                <div className="text-sm text-yellow-700">Filas Vacías</div>
              </div>
              <div className="text-center p-3 bg-red-100 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{result.errorRows}</div>
                <div className="text-sm text-red-700">Filas con Errores</div>
              </div>
            </div>

            {/* Resumen detallado */}
            {result.summary && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Resumen del Archivo:</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>• Total de filas: {result.summary.totalFilas}</div>
                  <div>• Filas vacías ignoradas: {result.summary.filasVacias}</div>
                  <div>• Filas válidas procesadas: {result.summary.filasValidas}</div>
                  <div>• Filas con errores: {result.summary.filasConErrores}</div>
                  <div>• Productos nuevos: {result.summary.productosNuevos}</div>
                  <div>• Duplicados detectados: {result.summary.duplicados}</div>
                </div>
              </div>
            )}

            {result.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Errores encontrados:</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {result.errors.map((error, index) => (
                    <div key={index} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                      <span className="font-medium">Fila {error.row}:</span> {error.error}
                      {error.type && <span className="text-xs text-gray-500 ml-2">({error.type})</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUpload;
