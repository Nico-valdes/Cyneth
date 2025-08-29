# Sistema de Carga Masiva de Productos

## Descripción General

Este sistema permite cargar grandes cantidades de productos en la base de datos mediante archivos Excel (.xlsx o .xls). Está diseñado para manejar eficientemente cargas masivas con validación de datos y procesamiento por lotes.

## Características Principales

- **Carga por lotes**: Procesa productos en grupos de 100 para evitar sobrecargar la base de datos
- **Validación robusta**: Verifica la integridad de los datos antes de la inserción
- **Manejo de errores**: Reporta errores específicos por fila para facilitar la corrección
- **Progreso en tiempo real**: Muestra el avance del proceso de carga
- **Template descargable**: Proporciona una plantilla Excel con ejemplos

## Estructura del Excel

### Columnas Requeridas
- **name** (obligatorio): Nombre del producto
- **category** (obligatorio): Categoría principal del producto

### Columnas Opcionales
- **subcategory**: Subcategoría del producto
- **brand**: Marca del producto
- **description**: Descripción detallada del producto
- **specifications**: Especificaciones técnicas en formato JSON
- **tags**: Etiquetas separadas por comas
- **variations**: Variaciones del producto en formato JSON
- **images**: URLs de imágenes separadas por comas
- **contact_whatsapp**: Número de WhatsApp
- **contact_phone**: Número de teléfono

### Ejemplo de Especificaciones (JSON)
```json
{
  "diameter": "110mm",
  "length": "3m",
  "material": "PVC"
}
```

### Ejemplo de Variaciones (JSON)
```json
[
  {
    "attributes": {
      "diameter": "110mm",
      "length": "3m"
    },
    "stock": 50,
    "sku": "PVC-110-3M"
  }
]
```

## Cómo Usar

### 1. Acceder al Sistema
- Navega a `/admin/bulk-upload` en tu aplicación
- Asegúrate de estar autenticado como administrador

### 2. Descargar Plantilla
- Haz clic en "Descargar Plantilla" para obtener un archivo Excel de ejemplo
- La plantilla incluye ejemplos de datos y la estructura correcta

### 3. Preparar el Archivo
- Completa la plantilla con tus datos de productos
- Asegúrate de que la primera fila contenga los nombres de las columnas
- Verifica que los campos obligatorios estén completos
- Para campos JSON, asegúrate de que el formato sea válido

### 4. Cargar el Archivo
- Arrastra tu archivo Excel al área de drop o haz clic para seleccionarlo
- El sistema validará automáticamente el formato del archivo
- Haz clic en "Cargar [nombre del archivo]" para iniciar el proceso

### 5. Monitorear el Progreso
- El sistema mostrará una barra de progreso durante la carga
- Los productos se procesan en lotes de 100
- Se muestran estadísticas en tiempo real

### 6. Revisar Resultados
- Al finalizar, se muestra un resumen completo
- Productos cargados exitosamente
- Errores encontrados con detalles específicos
- Advertencias sobre posibles problemas

## Validaciones del Sistema

### Validaciones de Campos
- **Nombre**: Obligatorio, máximo 200 caracteres
- **Categoría**: Obligatoria
- **Descripción**: Máximo 1000 caracteres
- **Tags**: Máximo 50 caracteres por tag
- **URLs**: Formato de URL válido

### Validaciones de Formato
- **JSON**: Verifica que las cadenas JSON sean válidas
- **Arrays**: Confirma que las variaciones sean arrays válidos
- **Separadores**: Maneja correctamente separadores por comas

## Manejo de Errores

### Tipos de Errores
1. **Errores de Validación**: Datos que no cumplen con los requisitos
2. **Errores de Base de Datos**: Problemas durante la inserción
3. **Errores de Formato**: Archivos mal formateados

### Estrategia de Recuperación
- El sistema continúa procesando productos válidos
- Se reportan errores específicos por fila
- Se pueden corregir errores y reintentar la carga
- Los productos válidos ya cargados no se duplican

## Mejores Prácticas

### Preparación de Datos
- Usa la plantilla proporcionada como base
- Verifica que los datos estén limpios y consistentes
- Para campos JSON, usa un editor que valide la sintaxis
- Mantén URLs de imágenes accesibles

### Optimización del Proceso
- Carga archivos de tamaño moderado (máximo 10,000 productos por archivo)
- Procesa en horarios de baja actividad
- Monitorea el progreso para detectar problemas temprano
- Mantén respaldos antes de cargas masivas

### Mantenimiento
- Revisa regularmente los logs de errores
- Actualiza las plantillas según cambios en el modelo
- Valida la integridad de los datos después de cargas masivas

## Limitaciones y Consideraciones

### Técnicas
- Tamaño máximo de archivo: 50MB
- Productos por lote: 100
- Pausa entre lotes: 100ms
- Tiempo de procesamiento: ~1 segundo por 100 productos

### Operacionales
- Solo usuarios autenticados pueden acceder
- Se requiere conexión estable a la base de datos
- Los archivos se procesan de forma síncrona
- No hay soporte para carga en segundo plano

## Solución de Problemas

### Problemas Comunes
1. **Archivo no se carga**: Verifica el formato (.xlsx o .xls)
2. **Errores de validación**: Revisa la estructura de datos
3. **Tiempo de espera largo**: Archivos muy grandes pueden tardar
4. **Errores de conexión**: Verifica la conectividad a la base de datos

### Logs y Debugging
- Los errores se registran en la consola del servidor
- Cada error incluye el número de fila y detalles específicos
- Se pueden exportar los errores para análisis posterior

## Soporte y Contacto

Para problemas técnicos o preguntas sobre el sistema:
- Revisa esta documentación
- Consulta los logs del servidor
- Contacta al equipo de desarrollo

---

**Nota**: Este sistema está diseñado para ser robusto y eficiente. Sigue las mejores prácticas para obtener los mejores resultados en tus cargas masivas de productos.


