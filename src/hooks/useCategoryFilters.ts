import { useState, useEffect, useCallback } from 'react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  parent: string | null;
  level: number;
  children?: Category[];
  productCount?: number;
  totalProductCount?: number;
}

interface CategoryFilter {
  level: number;
  categoryId: string;
  categoryName: string;
}

/**
 * Hook personalizado para manejar filtros jerárquicos de categorías
 */
export function useCategoryFilters() {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [hierarchicalCategories, setHierarchicalCategories] = useState<Category[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<CategoryFilter[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar todas las categorías
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      
      // Obtener todas las categorías
      const allResponse = await fetch('/api/categories');
      if (allResponse.ok) {
        const allData = await allResponse.json();
        setAllCategories(allData.data?.categories || []);
      }

      // Obtener categorías principales con jerarquía
      const mainResponse = await fetch('/api/categories?type=main&hierarchical=true');
      if (mainResponse.ok) {
        const mainData = await mainResponse.json();
        setHierarchicalCategories(mainData.data?.categories || []);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener categorías disponibles para un nivel específico
  const getAvailableCategories = useCallback((level: number): Category[] => {
    if (level === 0) {
      // Nivel 0: categorías principales
      return hierarchicalCategories;
    }

    // Para niveles superiores, buscar hijos de la categoría seleccionada en el nivel anterior
    const parentFilter = selectedFilters.find(filter => filter.level === level - 1);
    if (!parentFilter) return [];

    const parentCategory = allCategories.find(cat => cat._id === parentFilter.categoryId);
    if (!parentCategory) return [];

    return allCategories.filter(cat => cat.parent === parentCategory._id);
  }, [hierarchicalCategories, allCategories, selectedFilters]);

  // Seleccionar una categoría en un nivel específico
  const selectCategory = useCallback((level: number, categoryId: string, categoryName: string) => {
    setSelectedFilters(prev => {
      // Remover filtros de niveles superiores al seleccionado
      const newFilters = prev.filter(filter => filter.level < level);
      
      // Agregar o actualizar el filtro del nivel actual
      newFilters.push({ level, categoryId, categoryName });
      
      return newFilters;
    });
  }, []);

  // Limpiar filtro de un nivel específico y todos los superiores
  const clearFilterFromLevel = useCallback((level: number) => {
    setSelectedFilters(prev => prev.filter(filter => filter.level < level));
  }, []);

  // Limpiar todos los filtros
  const clearAllFilters = useCallback(() => {
    setSelectedFilters([]);
  }, []);

  // Obtener el ID de la categoría más específica seleccionada
  const getSelectedCategoryId = useCallback((): string | null => {
    if (selectedFilters.length === 0) return null;
    
    // Retornar la categoría del nivel más alto seleccionado
    const highestLevelFilter = selectedFilters.reduce((prev, current) => 
      current.level > prev.level ? current : prev
    );
    
    return highestLevelFilter.categoryId;
  }, [selectedFilters]);

  // Obtener la ruta completa de categorías seleccionadas
  const getCategoryPath = useCallback((): string => {
    return selectedFilters
      .sort((a, b) => a.level - b.level)
      .map(filter => filter.categoryName)
      .join(' > ');
  }, [selectedFilters]);

  // Verificar si hay filtros activos
  const hasActiveFilters = selectedFilters.length > 0;

  // Cargar categorías al montar el componente
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    allCategories,
    hierarchicalCategories,
    selectedFilters,
    loading,
    getAvailableCategories,
    selectCategory,
    clearFilterFromLevel,
    clearAllFilters,
    getSelectedCategoryId,
    getCategoryPath,
    hasActiveFilters,
    refetch: fetchCategories
  };
}

export default useCategoryFilters;