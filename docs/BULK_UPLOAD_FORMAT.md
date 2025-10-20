# Formato de Carga Masiva de Productos

## Descripción
Este documento describe el formato requerido para el archivo Excel utilizado en la carga masiva de productos.

## Formato de Archivo
- **Tipo:** Excel (.xlsx o .xls)
- **Tamaño máximo:** 10MB
- **Estructura:** Primera fila debe contener los headers (nombres de columnas)

## Columnas Requeridas

### Obligatorias
| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| `name` | Texto | Nombre del producto | "Grifo Monocomando Cocina" |
| `category` | Texto | Categoría del producto | "Grifería" |

### Opcionales
| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| `brand` | Texto | Marca del producto | "Marca Ejemplo" |
| `sku` | Texto | Código SKU único | "GRF-MONO-001" |
| `images` | URLs | URLs de imágenes separadas por comas | "https://example.com/img1.jpg,https://example.com/img2.jpg" |
| `attributes` | JSON | Atributos del producto en formato JSON | `{"material":"Acero","instalacion":"Mural"}` |
| `measurements` | JSON | Medidas del producto | `{"enabled":true,"unit":"cm","description":"Alto: 25cm"}` |
| `colorVariants` | JSON | Variantes de color | `[{"colorName":"Cromado","colorCode":"#C0C0C0","sku":"GRF-001-CROM","active":true}]` |
| `specifications` | JSON | Especificaciones técnicas | `{"presion":"16bar","conexion":"pegable"}` |
| `tags` | Texto | Etiquetas separadas por comas | "grifería,cocina,monocomando" |

## Procesamiento de Imágenes

### Características
- **Descarga automática:** Las URLs se descargan automáticamente
- **Subida a Cloudflare:** Se suben a Cloudflare R2 automáticamente
- **Formatos soportados:** JPG, PNG, WebP, GIF
- **Tamaño máximo por imagen:** 10MB
- **Timeout:** 30 segundos por imagen
- **Concurrencia:** 3 imágenes simultáneas por producto

### Ejemplo de URL de imágenes
```
https://example.com/product1.jpg,https://example.com/product2.png,https://example.com/product3.webp
```

### Procesamiento
1. Se descargan las imágenes desde las URLs externas
2. Se valida el formato y tamaño
3. Se suben a Cloudflare R2
4. Se genera una URL propia de Cloudflare
5. Se guarda el producto con las URLs de Cloudflare

## Campos JSON

### Attributes (Atributos)
```json
{
  "material": "Acero Inoxidable",
  "instalacion": "Mural",
  "garantia": "2 años"
}
```

### Measurements (Medidas)
```json
{
  "enabled": true,
  "unit": "cm",
  "description": "Alto: 25cm, Caño: 20cm",
  "availableSizes": ["Estándar", "Compacto"]
}
```

### Color Variants (Variantes de Color)
```json
[
  {
    "colorName": "Cromado",
    "colorCode": "#C0C0C0",
    "sku": "GRF-MONO-001-CROM",
    "active": true
  },
  {
    "colorName": "Negro Mate",
    "colorCode": "#000000",
    "sku": "GRF-MONO-001-NEG",
    "active": true
  }
]
```

## Validaciones

### Durante la Carga
- **Campos requeridos:** name y category deben estar presentes
- **Duplicados:** Se detectan por nombre exacto
- **Formato JSON:** Se valida sintaxis de campos JSON
- **URLs de imágenes:** Se valida formato de URL

### Errores Comunes
1. **Campos vacíos:** Filas con name o category vacíos
2. **JSON inválido:** Sintaxis incorrecta en campos JSON
3. **URLs incorrectas:** URLs que no responden o formato inválido
4. **Duplicados:** Productos con el mismo nombre
5. **Imágenes grandes:** Imágenes que exceden 10MB

## Ejemplo Completo

```csv
name,category,brand,sku,images,attributes,measurements,colorVariants
"Grifo Monocomando Cocina","Grifería","Marca Premium","GRF-MONO-001","https://example.com/img1.jpg,https://example.com/img2.jpg","{""material"":""Acero Inoxidable"",""instalacion"":""Mural""}","{""enabled"":true,""unit"":""cm"",""description"":""Alto: 25cm, Caño: 20cm"",""availableSizes"":[""Estándar""]}","[{""colorName"":""Cromado"",""colorCode"":""#C0C0C0"",""sku"":""GRF-MONO-001-CROM"",""active"":true}]"
```

## Resultados del Procesamiento

### Métricas Mostradas
- **Productos nuevos:** Cantidad de productos creados exitosamente
- **Duplicados:** Productos que ya existían
- **Errores:** Productos que no se pudieron procesar
- **Total procesadas:** Filas válidas procesadas

### Detalles de Errores
- **Tipo de error:** Validación, duplicado o inserción
- **Fila:** Número de fila en Excel (si aplica)
- **Descripción:** Detalle específico del error
- **Datos:** Información del producto con error

## Recomendaciones

1. **Preparar imágenes:** Asegúrate de que las URLs sean accesibles
2. **Validar JSON:** Usa un validador JSON para campos complejos
3. **Nombres únicos:** Evita productos con nombres idénticos
4. **Tamaño de archivo:** Mantén el Excel bajo 10MB
5. **Prueba pequeña:** Haz una prueba con pocos productos primero

## Soporte

Si encuentras problemas durante la carga:
1. Revisa los errores detallados en la interfaz
2. Verifica el formato de las columnas
3. Asegúrate de que las URLs de imágenes sean válidas
4. Contacta al administrador del sistema para problemas técnicos

