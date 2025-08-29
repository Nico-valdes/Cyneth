'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Characteristic {
  name: string;
  content: string;
}

interface ProductCharacteristicsProps {
  characteristics: Characteristic[];
  onChange: (characteristics: Characteristic[]) => void;
  className?: string;
}

const ProductCharacteristics: React.FC<ProductCharacteristicsProps> = ({
  characteristics,
  onChange,
  className = ''
}) => {
  const [newCharacteristic, setNewCharacteristic] = React.useState<Characteristic>({
    name: '',
    content: ''
  });

  const handleCharacteristicChange = (index: number, field: keyof Characteristic, value: string) => {
    const updatedCharacteristics = characteristics.map((char, i) => 
      i === index ? { ...char, [field]: value } : char
    );
    onChange(updatedCharacteristics);
  };

  const addCharacteristic = () => {
    if (newCharacteristic.name.trim() && newCharacteristic.content.trim()) {
      onChange([...characteristics, { ...newCharacteristic }]);
      setNewCharacteristic({ name: '', content: '' });
    }
  };

  const removeCharacteristic = (index: number) => {
    const updatedCharacteristics = characteristics.filter((_, i) => i !== index);
    onChange(updatedCharacteristics);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      addCharacteristic();
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Características del Producto
        <span className="text-xs text-gray-500 ml-1">(Opcionales)</span>
      </label>
      
      <div className="space-y-3">
        {/* Características existentes */}
        {characteristics.map((characteristic, index) => (
          <div key={index} className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={characteristic.name}
                onChange={(e) => handleCharacteristicChange(index, 'name', e.target.value)}
                placeholder="Nombre de la característica (ej: Material, Dimensiones)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <textarea
                value={characteristic.content}
                onChange={(e) => handleCharacteristicChange(index, 'content', e.target.value)}
                placeholder="Descripción de la característica (ej: PVC de alta resistencia, 110mm x 3m)"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
            <button
              type="button"
              onClick={() => removeCharacteristic(index)}
              className="flex-shrink-0 mt-1 text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors"
              title="Eliminar característica"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        
        {/* Formulario para nueva característica */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50/50">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Plus size={16} className="mr-1" />
            Agregar Nueva Característica
          </h4>
          
          <div className="space-y-3">
            <input
              type="text"
              value={newCharacteristic.name}
              onChange={(e) => setNewCharacteristic(prev => ({ ...prev, name: e.target.value }))}
              onKeyPress={handleKeyPress}
              placeholder="Nombre de la característica"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            <textarea
              value={newCharacteristic.content}
              onChange={(e) => setNewCharacteristic(prev => ({ ...prev, content: e.target.value }))}
              onKeyPress={handleKeyPress}
              placeholder="Descripción detallada de la característica"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Presiona Ctrl + Enter para agregar rápidamente
              </span>
              <button
                type="button"
                onClick={addCharacteristic}
                disabled={!newCharacteristic.name.trim() || !newCharacteristic.content.trim()}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 transition-colors"
              >
                <Plus size={16} className="mr-1" />
                Agregar
              </button>
            </div>
          </div>
        </div>
        
        {/* Información de ayuda */}
        {characteristics.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <div className="text-sm">
              <p className="mb-1">No hay características definidas</p>
              <p className="text-xs">
                Las características son opcionales y ayudan a describir mejor el producto
              </p>
            </div>
          </div>
        )}
        
        {characteristics.length > 0 && (
          <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
            {characteristics.length} característica{characteristics.length !== 1 ? 's' : ''} definida{characteristics.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCharacteristics;
export type { Characteristic };