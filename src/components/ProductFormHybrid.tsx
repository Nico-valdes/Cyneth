'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Palette, Package, Ruler, Tag, Edit2 } from 'lucide-react';
import ImageUploadField from './ImageUploadField';
import Notice from '@/components/ui/Notice';

interface MeasurementVariant {
  size: string;
  sku: string;
  active: boolean;
}

interface Measurement {
  enabled: boolean;
  description: string;
  variants: MeasurementVariant[];
}

interface ColorVariant {
  colorCode: string;
  colorName: string;
  image: string;
  sku: string;
  active: boolean;
}

interface ProductAttribute {
  name: string;
  value: string;
}

interface FormData {
  name: string;
  sku: string;
  category: string; // Ahora es ObjectId de la categoría más específica
  brand: string;
  brandSlug: string;
  description: string;
  attributes: ProductAttribute[];
  defaultImage: string;
  measurements: Measurement;
  colorVariants: ColorVariant[];
  active: boolean;
  featured: boolean;
}

interface ProductFormProps {
  product?: any;
  categories?: any[];
  brands?: any[];
  onSave: (product: FormData) => void;
  onCancel: () => void;
  isEditing?: boolean;
  isLoading?: boolean;
}

const ProductFormHybrid: React.FC<ProductFormProps> = ({ 
  product, 
  categories = [],
  brands = [],
  onSave, 
  onCancel, 
  isEditing = false,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    sku: '',
    category: '', // Ahora solo una categoría
    brand: '',
    brandSlug: '',
    description: '',
    attributes: [],
    defaultImage: '',
    measurements: {
      enabled: false,
      description: '',
      variants: []
    },
    colorVariants: [],
    active: true,
    featured: false
  });

  const [newVariant, setNewVariant] = useState({ 
    colorCode: '', 
    colorName: '', 
    image: '', 
    sku: ''
  });
  const [newAttribute, setNewAttribute] = useState({ name: '', value: '' });
  const [newSize, setNewSize] = useState('');
  const [availableBrands, setAvailableBrands] = useState<any[]>([]);
  // Lista de todas las categorías del modelo unificado
  const [allCategories, setAllCategories] = useState<any[]>([]);
  // Estados simples para jerarquía
  const [categoryLevels, setCategoryLevels] = useState<any[][]>([[]]); 
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [editingAttribute, setEditingAttribute] = useState<{index: number, attribute: ProductAttribute} | null>(null);
  const [editingVariant, setEditingVariant] = useState<{index: number, variant: ColorVariant} | null>(null);
  const [editingMeasurementVariant, setEditingMeasurementVariant] = useState<{ index: number; variant: MeasurementVariant } | null>(null);
  const [formNotice, setFormNotice] = useState<{ type: 'error' | 'success' | 'info' | 'warning'; message: string } | null>(null);

  // Normaliza measurements desde BD (soporta formato viejo availableSizes o nuevo variants)
  const normalizeMeasurements = (m: any, baseSku: string): Measurement => {
    if (!m || typeof m !== 'object') {
      return { enabled: false, description: '', variants: [] };
    }
    if (Array.isArray(m.variants) && !('availableSizes' in m)) {
      return {
        enabled: Boolean(m.enabled),
        description: m.description || '',
        variants: m.variants.map((v: any) => ({
          size: v.size || '',
          sku: v.sku || '',
          active: v.active !== false
        }))
      };
    }
    const availableSizes = Array.isArray(m.availableSizes) ? m.availableSizes : [];
    const sku = baseSku || 'PROD';
    return {
      enabled: Boolean(m.enabled),
      description: m.description || '',
      variants: availableSizes.map((size: string, i: number) => ({
        size: String(size).trim(),
        sku: `${sku}-${i}`,
        active: true
      }))
    };
  };
  
  const [availableColors] = useState([
    { name: 'Blanco Cromo', code: '#F5F5F5' },
    { name: 'Gris Cromo', code: '#C0C0C0' },
    { name: 'Negro', code: '#000000' },
    { name: 'Negro Cromo', code: '#2C2C2C' },
    { name: 'Negro Mate', code: '#1A1A1A' },
    { name: 'Rojo Cromo', code: '#8B0000' },
    { name: 'Satin Greystone', code: '#696969' },
    { name: 'Acero', code: '#708090' },
    { name: 'Acero Inoxidable', code: '#B8B8B8' },
    { name: 'Aluminio', code: '#D3D3D3' },
    { name: 'Black', code: '#000000' },
    { name: 'Blanco', code: '#FFFFFF' },
    { name: 'Bronce', code: '#CD7F32' },
    { name: 'Brushed Brass', code: '#B8860B' },
    { name: 'Cromo', code: '#C0C0C0' },
    { name: 'Negro / Cromo', code: '#2C2C2C' },
    { name: 'Niquel', code: '#A8A8A8' },
    { name: 'Oro', code: '#FFD700' },
    { name: 'Peltre / Oro', code: '#B8860B' },
    { name: 'Platil / Cromo', code: '#C0C0C0' },
    { name: 'Polished Brass', code: '#B8860B' },
    { name: 'Rose Gold', code: '#E8B4B8' }
  ]);

  // Cargar marcas disponibles
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brands');
        if (response.ok) {
          const data = await response.json();
          setAvailableBrands(data.data?.brands || []);
        }
      } catch (error) {
        console.error('Error cargando marcas:', error);
      }
    };
    
    fetchBrands();
  }, []);

  // Cargar todas las categorías
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          const categories = data.data?.categories || [];
          setAllCategories(categories);
          // Inicializar con categorías nivel 0
          setCategoryLevels([categories.filter((cat: any) => cat.level === 0)]);
        }
      } catch (error) {
        console.error('Error cargando categorías:', error);
      }
    };
    
    fetchAllCategories();
  }, []);

  // Inicializar formulario con datos del producto
  useEffect(() => {
    if (product) {
      const finalAttributes = Array.isArray(product.attributes) ? product.attributes : [];
      
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || '', // Simplificado - solo una categoría
        brand: product.brand || '',
        brandSlug: product.brandSlug || '',
        description: product.description || '',
        attributes: finalAttributes,
        defaultImage: product.defaultImage || '',
        measurements: normalizeMeasurements(product.measurements, product.sku),
        colorVariants: product.colorVariants || [],
        active: product.active !== undefined ? product.active : true,
        featured: product.featured !== undefined ? product.featured : false
      });
      
      // Cargar ruta para edición
      if (product.category && allCategories.length > 0) {
        loadPathForEdit(product.category);
      }
    }
  }, [product, categories, allCategories]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMeasurementChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [field]: value
      }
    }));
  };

  // Cargar ruta completa para edición
  const loadPathForEdit = (categoryId: string) => {
    const category = allCategories.find((cat: any) => cat._id === categoryId);
    if (!category) return;
    
    const path: string[] = [];
    let current = category;
    while (current) {
      path.unshift(current._id);
      current = current.parent ? allCategories.find((cat: any) => cat._id === current.parent) : null;
    }
    
    setSelectedPath(path);
    
    // Construir niveles
    const levels = [allCategories.filter((cat: any) => cat.level === 0)];
    for (let i = 0; i < path.length - 1; i++) {
      const children = allCategories.filter((cat: any) => cat.parent === path[i]);
      if (children.length > 0) levels.push(children);
    }
    setCategoryLevels(levels);
  };
  
  // Manejar selección por nivel
  const handleLevelSelection = (categoryId: string, level: number) => {
    const newPath = [...selectedPath];
    newPath[level] = categoryId;
    newPath.splice(level + 1);
    setSelectedPath(newPath);
    
    setFormData(prev => ({ ...prev, category: categoryId }));
    
    // Cargar siguiente nivel
    const children = allCategories.filter((cat: any) => cat.parent === categoryId);
    const newLevels = [...categoryLevels];
    if (children.length > 0) {
      newLevels[level + 1] = children;
    }
    newLevels.splice(level + (children.length > 0 ? 2 : 1));
    setCategoryLevels(newLevels);
  };



  const handleBrandChange = (brandSlug: string) => {
    const brand = availableBrands.find(b => b.slug === brandSlug);
    setFormData(prev => ({
      ...prev,
      brand: brand?.name || '',
      brandSlug: brandSlug
    }));
  };

  const addAttribute = () => {
    if (newAttribute.name.trim() && newAttribute.value.trim()) {
      setFormData(prev => ({
        ...prev,
        attributes: [...prev.attributes, { 
          name: newAttribute.name.trim(),
          value: newAttribute.value.trim()
        }]
      }));
      setNewAttribute({ name: '', value: '' });
    }
  };

  const removeAttribute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

  const startEditingAttribute = (index: number) => {
    setEditingAttribute({
      index,
      attribute: { ...formData.attributes[index] }
    });
  };

  const saveEditingAttribute = () => {
    if (editingAttribute && editingAttribute.attribute.name.trim() && editingAttribute.attribute.value.trim()) {
      setFormData(prev => ({
        ...prev,
        attributes: prev.attributes.map((attr, index) => 
          index === editingAttribute.index ? editingAttribute.attribute : attr
        )
      }));
      setEditingAttribute(null);
    }
  };

  const cancelEditingAttribute = () => {
    setEditingAttribute(null);
  };

  const addColorVariant = () => {
    if (newVariant.colorName && newVariant.colorCode) {
      // Generar SKU automáticamente si no se proporciona
      const variantSku = newVariant.sku || generateVariantSku(formData.sku, newVariant.colorName);
      
      // Verificar que el SKU base esté definido
      if (!formData.sku) {
        setFormNotice({ type: 'error', message: 'Definí el SKU base del producto antes de agregar variantes de color.' });
        return;
      }
      
      // Verificar que no exista ya una variante con el mismo SKU
      const existingSku = formData.colorVariants.find(v => v.sku === variantSku);
      if (existingSku) {
        setFormNotice({ type: 'error', message: `Ya existe una variante con el SKU: ${variantSku}` });
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        colorVariants: [...prev.colorVariants, { 
          colorName: newVariant.colorName,
          colorCode: newVariant.colorCode,
          image: newVariant.image,
          sku: variantSku,
          active: true
        }]
      }));
      setNewVariant({ colorCode: '', colorName: '', image: '', sku: '' });
    }
  };

  const removeColorVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      colorVariants: prev.colorVariants.filter((_, i) => i !== index)
    }));
  };

  const startEditingVariant = (index: number) => {
    setEditingVariant({
      index,
      variant: { ...formData.colorVariants[index] }
    });
  };

  const saveEditingVariant = () => {
    if (editingVariant && editingVariant.variant.colorName && editingVariant.variant.colorCode && editingVariant.variant.sku) {
      setFormData(prev => ({
        ...prev,
        colorVariants: prev.colorVariants.map((variant, index) => 
          index === editingVariant.index ? editingVariant.variant : variant
        )
      }));
      setEditingVariant(null);
    }
  };

  const cancelEditingVariant = () => {
    setEditingVariant(null);
  };

  const updateEditingVariant = (field: keyof ColorVariant, value: string | boolean) => {
    if (editingVariant) {
      setEditingVariant(prev => ({
        ...prev!,
        variant: {
          ...prev!.variant,
          [field]: value
        }
      }));
    }
  };

  const addSize = () => {
    if (newSize.trim()) {
      const sizeLabel = newSize.trim();
      setFormData(prev => {
        const nextIndex = prev.measurements.variants.length;
        const variantSku = prev.sku ? `${prev.sku}-${nextIndex}` : `MED-${nextIndex}`;
        return {
          ...prev,
          measurements: {
            ...prev.measurements,
            variants: [...prev.measurements.variants, { size: sizeLabel, sku: variantSku, active: true }]
          }
        };
      });
      setNewSize('');
    }
  };

  const removeSize = (index: number) => {
    if (editingMeasurementVariant?.index === index) setEditingMeasurementVariant(null);
    setFormData(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        variants: prev.measurements.variants.filter((_, i) => i !== index)
      }
    }));
  };

  const startEditingMeasurementVariant = (index: number) => {
    const v = formData.measurements.variants[index];
    setEditingMeasurementVariant({ index, variant: { ...v } });
  };

  const updateMeasurementVariantField = (field: keyof MeasurementVariant, value: string | boolean) => {
    if (!editingMeasurementVariant) return;
    setEditingMeasurementVariant(prev => prev ? { ...prev, variant: { ...prev.variant, [field]: value } } : null);
  };

  const saveEditingMeasurementVariant = () => {
    if (!editingMeasurementVariant) return;
    const { index, variant } = editingMeasurementVariant;
    if (!variant.size.trim() || !variant.sku.trim()) {
      setFormNotice({ type: 'error', message: 'Medida y SKU son obligatorios en cada variante.' });
      return;
    }
    setFormData(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        variants: prev.measurements.variants.map((v, i) => i === index ? variant : v)
      }
    }));
    setEditingMeasurementVariant(null);
  };

  const cancelEditingMeasurementVariant = () => {
    setEditingMeasurementVariant(null);
  };

  // Función para generar abreviaturas de colores
  const getColorAbbreviation = (colorName: string): string => {
    const abbreviations: { [key: string]: string } = {
      'Blanco Cromo': 'BC',
      'Gris Cromo': 'GC',
      'Negro': 'N',
      'Negro Cromo': 'NC',
      'Negro Mate': 'NM',
      'Rojo Cromo': 'RC',
      'Satin Greystone': 'SG',
      'Acero': 'AC',
      'Acero Inoxidable': 'AI',
      'Aluminio': 'AL',
      'Black': 'BL',
      'Blanco': 'B',
      'Bronce': 'BR',
      'Brushed Brass': 'BB',
      'Cromo': 'CR',
      'Negro / Cromo': 'N/C',
      'Niquel': 'NI',
      'Oro': 'O',
      'Peltre / Oro': 'P/O',
      'Platil / Cromo': 'PL/C',
      'Polished Brass': 'PB',
      'Rose Gold': 'RG'
    };
    
    return abbreviations[colorName] || colorName.substring(0, 2).toUpperCase();
  };

  // Función para generar SKU de variante automáticamente
  const generateVariantSku = (baseSku: string, colorName: string): string => {
    if (!baseSku) return '';
    
    const colorAbbr = getColorAbbreviation(colorName);
    return `${baseSku}-${colorAbbr}`;
  };

  const handleColorSelection = (colorName: string, colorCode: string) => {
    const variantSku = generateVariantSku(formData.sku, colorName);
    setNewVariant(prev => ({
      ...prev,
      colorName,
      colorCode,
      sku: variantSku
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormNotice(null);
    
    if (!formData.name.trim()) {
      setFormNotice({ type: 'error', message: 'El nombre del producto es obligatorio.' });
      return;
    }
    
    if (!formData.sku.trim()) {
      setFormNotice({ type: 'error', message: 'El SKU es obligatorio.' });
      return;
    }
    
    if (!formData.category) {
      setFormNotice({ type: 'error', message: 'Seleccioná al menos una categoría.' });
      return;
    }
    
    // Validaciones específicas para SKUs
    if (formData.colorVariants.length > 0) {
      // Si hay variantes de color, verificar que todos tengan SKUs únicos
      const skus = formData.colorVariants.map(v => v.sku);
      const uniqueSkus = new Set(skus);
      
      if (skus.length !== uniqueSkus.size) {
        setFormNotice({ type: 'error', message: 'Todas las variantes de color deben tener SKUs únicos.' });
        return;
      }
      
      // Verificar que los SKUs de variantes sigan el patrón correcto
      const baseSku = formData.sku;
      const invalidVariants = formData.colorVariants.filter(variant => {
        const expectedSku = generateVariantSku(baseSku, variant.colorName);
        return variant.sku !== expectedSku;
      });
      
      if (invalidVariants.length > 0) {
        setFormNotice({
          type: 'error',
          message: `Los SKUs de las variantes no coinciden con el patrón esperado: ${invalidVariants.map(v => generateVariantSku(baseSku, v.colorName)).join(', ')}`
        });
        return;
      }
    }
    
    // Con el modelo unificado, ya no necesitamos construir breadcrumb manualmente
    const finalFormData = formData;
    
    onSave(finalFormData);
  };

  // Función helper para renderizar opciones de categorías (obsoleta - removida)

  return (
    <div className="w-full">
      <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
        {formNotice && (
          <Notice
            type={formNotice.type}
            message={formNotice.message}
            onClose={() => setFormNotice(null)}
          />
        )}
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Información básica */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">
              Información Básica
            </h3>
          </div>
          <div className="space-y-4">
          


          {/* Nombre - PRIMERO */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <span className="text-red-600">*</span> Nombre del Producto
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Tubería PVC 110mm"
              required
            />
          </div>
          
          {/* SKU - SEGUNDO */}
          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <span className="text-red-600">*</span> SKU
            </label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => handleInputChange('sku', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: PROD-001"
              required
            />
          </div>
          
          {/* Marca - TERCERO */}
          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Marca
            </label>
            <select
              value={formData.brandSlug}
              onChange={(e) => handleBrandChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar marca</option>
              {Array.isArray(availableBrands) && availableBrands.map((brand) => (
                <option key={brand._id} value={brand.slug}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          {/* Categoría - Jerárquica Horizontal */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <span className="text-red-600">*</span> Categoría
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {categoryLevels.map((levelCategories, level) => {
                if (!levelCategories?.length) return null;
                const labels = ['Categoría Principal', 'Subcategoría 1', 'Subcategoría 2', 'Subcategoría 3', 'Subcategoría 4'];
                return (
                  <div key={level} className="space-y-1">
                    <label className="block text-xs text-gray-500">
                      {labels[level] || `Subcategoría ${level}`}
                    </label>
                    <select
                      value={selectedPath[level] || ''}
                      onChange={(e) => handleLevelSelection(e.target.value, level)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                      required={level === 0}
                    >
                      <option value="">Seleccionar</option>
                      {levelCategories.map((category: any) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
          </div>
        </div>

        {/* Descripción */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-1 h-6 bg-green-500 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">
              Descripción
            </h3>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Descripción del Producto
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Descripción del producto..."
            />
          </div>
        </div>

        {/* Atributos Estructurados */}
        <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-2 h-6 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full mr-3"></div>
            Atributos del Producto
          </h3>
          
          {/* Atributos existentes */}
          {formData.attributes.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-800 mb-4">Atributos Actuales</h4>
              <div className="space-y-3">
                {formData.attributes.map((attr, index) => (
                  <div key={index} className="p-4 bg-white rounded-xl border border-gray-200">
                    {editingAttribute && editingAttribute.index === index ? (
                      // Modo edición
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={editingAttribute.attribute.name}
                            onChange={(e) => setEditingAttribute(prev => ({
                              ...prev!,
                              attribute: { ...prev!.attribute, name: e.target.value }
                            }))}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nombre del atributo"
                          />
                          <input
                            type="text"
                            value={editingAttribute.attribute.value}
                            onChange={(e) => setEditingAttribute(prev => ({
                              ...prev!,
                              attribute: { ...prev!.attribute, value: e.target.value }
                            }))}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Valor del atributo"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={saveEditingAttribute}
                            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditingAttribute}
                            className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Modo vista
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">{attr.name}:</span>
                          <span className="text-gray-600">{attr.value}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEditingAttribute(index)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-2"
                            title="Editar atributo"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeAttribute(index)}
                            className="text-red-600 hover:text-red-800 transition-colors p-2"
                            title="Eliminar atributo"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agregar nuevo atributo */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="text-md font-semibold text-gray-800 mb-4">Agregar Nuevo Atributo</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Atributo</label>
                <input
                  type="text"
                  value={newAttribute.name}
                  onChange={(e) => setNewAttribute(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Tecnología, Medidas, Velocidad"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor/Descripción</label>
                <input
                  type="text"
                  value={newAttribute.value}
                  onChange={(e) => setNewAttribute(prev => ({ ...prev, value: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Es altamente increíble, 100x10x5, 40m/s"
                />
              </div>
            </div>
            
            <button
              type="button"
              onClick={addAttribute}
              disabled={!newAttribute.name.trim() || !newAttribute.value.trim()}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Agregar Atributo
            </button>
          </div>
        </div>

        {/* Medidas Disponibles */}
        <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Ruler className="mr-2 text-green-600" size={20} />
            Medidas Disponibles
          </h3>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.measurements.enabled}
                onChange={(e) => handleMeasurementChange('enabled', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Este producto tiene medidas disponibles</span>
            </label>
          </div>

          {formData.measurements.enabled && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción de Medidas
                </label>
                <textarea
                  value={formData.measurements.description}
                  onChange={(e) => handleMeasurementChange('description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Disponible en diferentes diámetros y longitudes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medidas / Variantes (talla o medida + SKU)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 110mm x 3m"
                  />
                  <button
                    type="button"
                    onClick={addSize}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.measurements.variants.map((variant, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 bg-white">
                      {editingMeasurementVariant?.index === index ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Medida / Talla</label>
                              <input
                                type="text"
                                value={editingMeasurementVariant.variant.size}
                                onChange={(e) => updateMeasurementVariantField('size', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                placeholder="Ej: 110mm, 1 M"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">SKU variante</label>
                              <input
                                type="text"
                                value={editingMeasurementVariant.variant.sku}
                                onChange={(e) => updateMeasurementVariantField('sku', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                placeholder="SKU único"
                              />
                            </div>
                          </div>
                          <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              checked={editingMeasurementVariant.variant.active}
                              onChange={(e) => updateMeasurementVariantField('active', e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            Activa (visible en tienda)
                          </label>
                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={saveEditingMeasurementVariant}
                              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                            >
                              Guardar
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditingMeasurementVariant}
                              className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-gray-900">{variant.size}</span>
                            <span className="text-xs text-gray-500">({variant.sku})</span>
                            {!variant.active && (
                              <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Inactiva</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => startEditingMeasurementVariant(index)}
                              className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                              title="Editar variante"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSize(index)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Imagen por Defecto */}
        <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full mr-3"></div>
            Imagen por Defecto
          </h3>
          <ImageUploadField
            label="URL de la Imagen por Defecto"
            value={formData.defaultImage}
            onChange={(value) => handleInputChange('defaultImage', value)}
            placeholder="https://ejemplo.com/imagen.jpg"
            description="Pega una URL de imagen y haz clic en 'Subir a Cloudflare' para convertirla y almacenarla en tu CDN. La imagen se mostrará si no hay variantes de color o como respaldo."
          />
        </div>

        {/* Variantes de Color */}
        <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-2 h-6 bg-gradient-to-b from-pink-500 to-pink-600 rounded-full mr-3"></div>
            Variantes de Color
          </h3>
          
          {/* Variantes existentes */}
          {formData.colorVariants.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-800 mb-4">Variantes Actuales</h4>
              <div className="space-y-3">
                {formData.colorVariants.map((variant, index) => (
                  <div key={index} className="p-4 bg-white rounded-xl border border-gray-200">
                    {editingVariant && editingVariant.index === index ? (
                      // Modo edición
                      <div className="space-y-4">
                        {/* Primera fila: Color y SKU */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                            <select
                              value={editingVariant.variant.colorName}
                              onChange={(e) => {
                                const selectedColor = availableColors.find(color => color.name === e.target.value);
                                if (selectedColor) {
                                  updateEditingVariant('colorName', selectedColor.name);
                                  updateEditingVariant('colorCode', selectedColor.code);
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Seleccionar color</option>
                              {availableColors.map((color) => (
                                <option key={color.name} value={color.name}>
                                  {color.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                            <input
                              type="text"
                              value={editingVariant.variant.sku}
                              onChange={(e) => updateEditingVariant('sku', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="SKU de la variante"
                            />
                          </div>
                        </div>
                        
                        {/* Segunda fila: Imagen con ancho completo */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Imagen</label>
                          <ImageUploadField
                            label=""
                            value={editingVariant.variant.image}
                            onChange={(value) => updateEditingVariant('image', value)}
                            placeholder="URL de imagen"
                            showPreview={false}
                            className=""
                          />
                        </div>
                        
                        {editingVariant.variant.colorCode && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div 
                              className="w-6 h-6 rounded-full border-2 border-gray-300"
                              style={{ backgroundColor: editingVariant.variant.colorCode }}
                            ></div>
                            <span className="text-sm font-medium text-gray-700">
                              Color: {editingVariant.variant.colorName}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={saveEditingVariant}
                            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditingVariant}
                            className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Modo vista
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-8 h-8 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: variant.colorCode }}
                            title={variant.colorName}
                          ></div>
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="font-semibold text-gray-800">{variant.colorName}</p>
                              <p className="text-sm text-gray-500">SKU: {variant.sku}</p>
                            </div>
                            {variant.image && (
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                                <img 
                                  src={variant.image} 
                                  alt={`${variant.colorName} variant`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEditingVariant(index)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-2"
                            title="Editar variante"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeColorVariant(index)}
                            className="text-red-600 hover:text-red-800 transition-colors p-2"
                            title="Eliminar variante"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agregar nueva variante */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="text-md font-semibold text-gray-800 mb-4">Agregar Nueva Variante</h4>
            <div className="space-y-4 mb-4">
              {/* Primera fila: Color y SKU */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <select
                    value={newVariant.colorName}
                    onChange={(e) => {
                      const selectedColor = availableColors.find(color => color.name === e.target.value);
                      if (selectedColor) {
                        handleColorSelection(selectedColor.name, selectedColor.code);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Seleccionar color</option>
                    {availableColors.map((color) => (
                      <option key={color.name} value={color.name}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU de la Variante</label>
                  <input
                    type="text"
                    value={newVariant.sku}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, sku: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Ej: PROD-001-ROJO"
                  />
                </div>
              </div>
              
              {/* Segunda fila: Imagen con ancho completo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Color</label>
                <ImageUploadField
                  label=""
                  value={newVariant.image}
                  onChange={(value) => setNewVariant(prev => ({ ...prev, image: value }))}
                  placeholder="URL de la imagen para este color"
                  showPreview={false}
                  className=""
                />
              </div>
            </div>
            
            {/* Vista previa del color seleccionado */}
            {newVariant.colorCode && (
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: newVariant.colorCode }}
                ></div>
                <span className="text-sm font-medium text-gray-700">
                  Color seleccionado: {newVariant.colorName}
                </span>
              </div>
            )}
            
            <button
              type="button"
              onClick={addColorVariant}
              disabled={!newVariant.colorName || !newVariant.colorCode || !newVariant.sku}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Agregar Variante de Color
            </button>
          </div>
        </div>

        {/* Estados */}
        <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-2 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full mr-3"></div>
            Estados del Producto
          </h3>
          <div className="space-y-4">
            <label className="flex items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => handleInputChange('active', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
              />
              <div className="ml-3">
                <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Producto Activo</span>
                <p className="text-xs text-gray-500">El producto será visible en el catálogo</p>
              </div>
            </label>
            <label className="flex items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => handleInputChange('featured', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
              />
              <div className="ml-3">
                <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Producto Destacado</span>
                <p className="text-xs text-gray-500">Aparecerá en la sección destacados</p>
              </div>
            </label>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <Save size={16} className="mr-2" />
            {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Producto')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormHybrid;
