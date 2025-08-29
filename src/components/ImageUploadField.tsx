import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { ImageUploadFieldProps } from '@/types/image';
import { getOptimizedImageUrl } from '@/utils/imageUtils';

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = "https://ejemplo.com/imagen.jpg",
  description,
  className = "",
  showPreview = true
}) => {
  const [inputValue, setInputValue] = useState(value);
  const { isUploading, error, success, uploadImageFromUrl, resetState } = useImageUpload();

  // Debug: Log cuando cambia el valor
  console.log('ImageUploadField renderizado con valor:', value);
  console.log('inputValue actual:', inputValue);

  // Sincronizar inputValue cuando cambie value (prop)
  React.useEffect(() => {
    if (value !== inputValue) {
      console.log('useEffect: actualizando inputValue de', inputValue, 'a', value);
      setInputValue(value);
    }
  }, [value, inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };

  const handleUploadClick = async () => {
    if (!inputValue.trim()) {
      return;
    }

    const result = await uploadImageFromUrl(inputValue);
    
    if (result) {
      // Actualizar el campo con la URL de Cloudflare
      onChange(result.cloudflareUrl);
      setInputValue(result.cloudflareUrl);
      
      // Mostrar mensaje de éxito temporalmente
      setTimeout(() => {
        resetState();
      }, 3000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUploadClick();
    }
  };

  const isValidUrl = React.useMemo(() => {
    return inputValue && inputValue.startsWith('http');
  }, [inputValue]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-800">
          {label}
        </label>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            placeholder={placeholder}
            disabled={isUploading}
          />
          
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={!isValidUrl || isUploading}
            className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap min-w-fit ${
              isValidUrl && !isUploading
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Subiendo...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Subir a Cloudflare</span>
                <span className="sm:hidden">Subir</span>
              </>
            )}
          </button>
        </div>

        {description && (
          <p className="text-xs text-gray-500">
            {description}
          </p>
        )}

        {/* Estados de la subida */}
        {isUploading && (
          <div className="flex items-center gap-2 text-blue-600 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Subiendo imagen a Cloudflare...
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            ¡Imagen subida exitosamente a Cloudflare!
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            Error: {error}
          </div>
        )}

        {/* Información adicional */}
        {inputValue && inputValue.includes('imagedelivery.net') && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            Imagen alojada en Cloudflare
            <a 
              href={inputValue} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Ver
            </a>
          </div>
        )}
        
        {/* Debug: Mostrar el valor actual */}
        <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
          <strong>Valor actual:</strong> {inputValue || 'Vacío'}
        </div>
        
        {/* Indicador de imagen existente */}
        {inputValue && !inputValue.includes('imagedelivery.net') && inputValue.startsWith('http') && (
          <div className="flex items-center gap-2 text-blue-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            URL externa - Haz clic en "Subir a Cloudflare" para optimizarla
          </div>
        )}
      </div>

        {/* Vista previa de la imagen */}
        {React.useMemo(() => {
          if (!showPreview || !inputValue) return null;
          
          // Usar URL optimizada para imágenes de Cloudflare
          const imageUrl = getOptimizedImageUrl(inputValue, 128, 128);
          
          return (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Vista previa:</h4>
              <div className="relative inline-block">
                <img
                  src={imageUrl}
                  alt="Vista previa"
                  className="w-32 h-32 object-cover rounded-xl border border-gray-200 shadow-sm"
                  onError={(e) => {
                    console.log('Error en vista previa de imagen:', imageUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('Vista previa cargada exitosamente:', imageUrl);
                  }}
                />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          );
        }, [showPreview, inputValue])}
    </div>
  );
};

export default ImageUploadField;
