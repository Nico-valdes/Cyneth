import { useState, useEffect } from 'react';

/**
 * Hook personalizado para implementar debounce en valores
 * @param value - El valor a hacer debounce
 * @param delay - El retraso en milisegundos
 * @returns El valor con debounce aplicado
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook personalizado para manejar búsqueda con debounce
 * @param initialValue - Valor inicial del término de búsqueda
 * @param delay - Retraso en milisegundos para el debounce
 * @returns Objeto con el término actual, término con debounce y función para actualizar
 */
export function useSearchDebounce(initialValue: string = '', delay: number = 300) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  return {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
  };
}

export default useDebounce;