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
  const [filtersLoaded, setFiltersLoaded] = useState(false);

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

  // Cargar filtros de categoría guardados (para que se mantengan al volver del editor)
  // Solo cargar cuando las categorías estén disponibles para validar que existan
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Si aún no hay categorías cargadas, esperar
    if (allCategories.length === 0) {
      // Si el loading terminó y no hay categorías, marcar como cargado (no hay nada que cargar)
      if (!loading) {
        setFiltersLoaded(true);
      }
      return;
    }
    
    // Si ya se cargaron los filtros, no volver a cargar
    if (filtersLoaded) return;
    
    try {
      const stored = window.localStorage.getItem('adminCategoryFilters');
      if (stored) {
        const parsed = JSON.parse(stored) as CategoryFilter[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Validar que las categorías guardadas aún existan
          const validFilters = parsed.filter(filter => 
            allCategories.some(cat => cat._id === filter.categoryId)
          );
          if (validFilters.length > 0) {
            setSelectedFilters(validFilters);
          } else {
            // Si ninguna categoría es válida, limpiar localStorage
            window.localStorage.removeItem('adminCategoryFilters');
          }
        }
      }
      // Marcar como cargado independientemente de si había filtros o no
      setFiltersLoaded(true);
    } catch (err) {
      console.error('Error leyendo filtros de categorías desde localStorage:', err);
      setFiltersLoaded(true);
    }
  }, [allCategories, loading, filtersLoaded]);

  // Guardar filtros de categoría cada vez que cambian
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('adminCategoryFilters', JSON.stringify(selectedFilters));
    } catch (err) {
      console.error('Error guardando filtros de categorías en localStorage:', err);
    }
  }, [selectedFilters]);

  return {
    allCategories,
    hierarchicalCategories,
    selectedFilters,
    loading,
    filtersLoaded,
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