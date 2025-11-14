# 🤖 Categorización Automática de Productos con IA

Este conjunto de scripts te permite categorizar automáticamente tus productos usando IA, analizando cada producto y asignándole la categoría más apropiada de tu base de datos.

## 📋 Requisitos Previos

1. **API Key de OpenAI**: Necesitas una clave de API de OpenAI
   - Obtén tu clave en: https://platform.openai.com/api-keys
   - Agrega a tu archivo `.env`: `OPENAI_API_KEY=sk-...`

2. **Opcional**: Configurar el modelo de IA (por defecto usa `gpt-4o-mini`)
   - Agrega a tu archivo `.env`: `OPENAI_MODEL=gpt-4o-mini` (o `gpt-4`, `gpt-3.5-turbo`, etc.)

3. **Variables opcionales**:
   - `AI_BATCH_SIZE=10` - Tamaño del lote para procesar (por defecto 10)
   - `AI_DELAY_MS=1000` - Delay entre lotes en milisegundos (por defecto 1000ms)

## 🚀 Proceso en 3 Pasos

### Paso 1: Exportar Datos

Exporta todos tus productos y categorías a archivos JSON:

```bash
node scripts/export-for-categorization.js
```

Esto creará:
- `scripts/exports/products-YYYY-MM-DD.json` - Lista de productos
- `scripts/exports/categories-YYYY-MM-DD.json` - Lista de categorías

### Paso 2: Categorizar con IA

Ejecuta el script que usa IA para analizar y categorizar cada producto:

```bash
node scripts/categorize-with-ai.js
```

Este script:
- ✅ Lee los archivos JSON exportados
- 🤖 Analiza cada producto con IA
- 📊 Genera un mapeo de categorías sugeridas
- 💾 Guarda el resultado en `scripts/exports/category-mapping-YYYY-MM-DD.json`

**Nota**: Este proceso puede tomar tiempo dependiendo de la cantidad de productos. El script procesa en lotes para evitar límites de rate.

### Paso 3: Aplicar Cambios

Una vez que hayas revisado el mapeo generado, aplica los cambios a MongoDB:

```bash
# Primero prueba en modo dry-run (sin cambios reales)
node scripts/apply-category-updates.js category-mapping-2024-01-15.json --dry-run

# Si todo está bien, aplica los cambios reales
node scripts/apply-category-updates.js category-mapping-2024-01-15.json
```

## 📊 Estructura del Mapeo Generado

El archivo `category-mapping-YYYY-MM-DD.json` contiene:

```json
{
  "generatedAt": "2024-01-15T10:30:00.000Z",
  "totalProducts": 1500,
  "categorized": 1485,
  "errors": 15,
  "changes": 750,
  "noChange": 735,
  "updates": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "productName": "Caño PVC 110mm",
      "sku": "CANO-PVC-110",
      "currentCategory": "507f191e810c19729de860ea",
      "suggestedCategory": "507f1f77bcf86cd799439012",
      "changed": true
    }
  ]
}
```

## ⚙️ Configuración Avanzada

### Ajustar Tamaño de Lotes

Si tienes muchos productos y quieres optimizar la velocidad:

```bash
# En .env
AI_BATCH_SIZE=20        # Más productos por lote
AI_DELAY_MS=500         # Menos delay entre lotes
```

**⚠️ Atención**: Aumentar el batch size puede causar rate limits en la API de OpenAI.

### Usar Modelos Diferentes

```bash
# En .env
OPENAI_MODEL=gpt-4              # Más preciso, más caro
OPENAI_MODEL=gpt-4o-mini        # Más rápido, más económico (recomendado)
OPENAI_MODEL=gpt-3.5-turbo      # Alternativa económica
```

## 🔍 Revisar y Validar

Antes de aplicar cambios masivos:

1. **Revisa el mapeo**: Abre `category-mapping-YYYY-MM-DD.json` y verifica algunas categorías sugeridas
2. **Filtra cambios**: Puedes editar el JSON para eliminar actualizaciones que no quieres aplicar
3. **Prueba en dry-run**: Siempre ejecuta primero con `--dry-run` para ver qué se actualizaría

## 📝 Ejemplo Completo

```bash
# 1. Exportar datos
node scripts/export-for-categorization.js

# 2. Categorizar (esto puede tardar)
node scripts/categorize-with-ai.js

# 3. Revisar el mapeo generado
# Abre scripts/exports/category-mapping-YYYY-MM-DD.json

# 4. Probar en modo dry-run
node scripts/apply-category-updates.js category-mapping-2024-01-15.json --dry-run

# 5. Aplicar cambios reales
node scripts/apply-category-updates.js category-mapping-2024-01-15.json
```

## ⚠️ Consideraciones Importantes

1. **Backup**: Siempre haz backup de tu base de datos antes de aplicar cambios masivos
2. **Revisión**: La IA puede cometer errores, revisa el mapeo antes de aplicar
3. **Costo**: El uso de la API de OpenAI tiene costo. `gpt-4o-mini` es más económico
4. **Tiempo**: Procesar muchos productos puede tomar horas
5. **Rate Limits**: El script incluye delays para evitar límites de la API

## 🐛 Solución de Problemas

### Error: "OPENAI_API_KEY no configurada"
- Verifica que tu archivo `.env` tenga `OPENAI_API_KEY=sk-...`
- Reinicia tu terminal después de agregar la variable

### Error: "Rate limit exceeded"
- Aumenta `AI_DELAY_MS` en `.env` (ej: 2000 para 2 segundos)
- Reduce `AI_BATCH_SIZE` (ej: 5 en lugar de 10)

### Error: "No se encontraron archivos de exportación"
- Ejecuta primero `export-for-categorization.js`
- Verifica que existan archivos en `scripts/exports/`

## 💡 Tips

- **Procesa en etapas**: Si tienes miles de productos, considera procesar por categorías
- **Revisa muestras**: Antes de procesar todo, exporta solo 10 productos para probar
- **Modelo económico**: `gpt-4o-mini` es suficiente para categorización y más barato
- **Backup frecuente**: Haz backup antes y después de cada paso importante


