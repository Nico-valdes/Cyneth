# Revisión profesional del proyecto Cyneth

**Fecha:** Enero 2025  
**Alcance:** Base de datos, APIs, frontend, flujo de compra por WhatsApp, rendimiento y carga masiva.

---

## 1. Resumen ejecutivo

El proyecto es un catálogo de productos (sanitarios, grifería, caños y conexiones) con **compra vía WhatsApp** (sin precios en web). Hay ~1000 productos cargados y faltan ~2000. La stack es Next.js 16, MongoDB, React 19.

**Puntos fuertes:** Flujo de carrito → WhatsApp bien implementado, caché en categorías/marcas, paginación y filtros en catálogo, modelo unificado de categorías.

**Problemas críticos:** Bug en carga masiva (objeto incorrecto a BD), crash en `ProductService` por `subcategoryCache` no inicializado, categoría en bulk sin resolver a ObjectId. Varios puntos de mejora en rendimiento, claridad y UX.

---

## 2. Base de datos y modelos

### 2.1 Modelo Product (`src/models/Product.js`)

- **Correcto:** `category` como ObjectId a `categories`, `slug` único, `colorVariants`, `defaultImage`, sin campo `price` (alineado con “consultar por WhatsApp”).
- **Inconsistencias:**
  - `createIndexes()` crea índices sobre `subcategory` y `categoryPath`, pero el **esquema actual** solo define `category` (ObjectId). Si ya no usas subcategoría/path, esos índices son legacy y pueden confundir; si los usas, deberían estar documentados en el esquema.
  - En `ProductService` las proyecciones incluyen `price` e `image`; el modelo no tiene `price` y la imagen es `defaultImage` + `colorVariants[].image`. Conviene alinear proyecciones con el esquema real.

### 2.2 Modelo Category (unificado)

- Estructura con `parent`, `level`, `type` está bien para jerarquía.
- `CategoryService` usa solo la colección `categories`; no depende de una colección `subcategories` separada.

### 2.3 Conexión MongoDB (`mongoConnect.js`)

- Conexión cacheada y evita múltiples conexiones simultáneas; correcto para serverless/Next.

---

## 3. Bugs críticos

### 3.1 Carga masiva de productos (`productBulkService.ts`)

**Problema:** `transformRow()` devuelve `{ product, errors, warnings }` (tipo `ProcessedProduct`). En la ruta se hace `validProducts.push(product)` y luego `processBatch(validProducts)` pasa cada elemento a `insertProduct(product)`. Así se está insertando y chequeando duplicados sobre el **wrapper** `ProcessedProduct`, no sobre el objeto producto interno.

- En BD se guarda `{ product: {...}, errors: [], warnings: [] }` en lugar del producto plano.
- `checkDuplicate` usa `product.name`, `product.category`, etc.; al recibir el wrapper, `product.name` es `undefined` y la lógica de duplicados no funciona.

**Solución:** En `processBatch`, pasar `item.product` a `insertProduct` (y que `insertProduct`/`checkDuplicate` trabajen con el objeto producto, no con `ProcessedProduct`). Opcional: tipar `insertProduct(product: ProcessedProduct)` y dentro usar `product.product` para insert y duplicate check.

### 3.2 Categoría en carga masiva no es ObjectId

El Excel trae `category` como texto (ej. "Grifería"). El modelo Product exige `category` como **ObjectId** de la colección `categories`. Si se inserta un string, el filtro por categoría en el catálogo (por ID) no encontrará estos productos.

**Solución:** En `transformRow` (o en un paso previo al insert), resolver el nombre o slug de categoría contra la colección `categories` y asignar `product.category = category._id` (ObjectId). Si no se encuentra la categoría, devolver error/warning por fila.

### 3.3 ProductService: `subcategoryCache` no inicializado

En `ProductService.js`, `updateCategoryCache()` usa `this.subcategoryCache` y `this.db.collection('subcategories')`, pero en el **constructor** solo se inicializa `this.categoryCache`. No existe `this.subcategoryCache`, por lo que al llamar a `this.subcategoryCache.clear()` se produce **TypeError** y puede tumbar la consulta de productos cuando se usa `enrichProductsWithCategories` / `findWithCategories`.

Además, el proyecto migró a un **modelo unificado de categorías** (solo colección `categories` con `parent`/`level`). No hay colección `subcategories` en el diseño actual.

**Solución (recomendada):** Eliminar toda referencia a `subcategoryCache` y a la colección `subcategories` en `ProductService`: no llamar a `subcategories`, no usar `subcategoryCache` en `enrichProductsWithCategories`. Si algún producto legacy tiene `subcategory` (ObjectId), el `$lookup` actual a `subcategories` puede dejar de usarse o reemplazarse por lógica que use solo `categories` (por ejemplo, categoría hija por `parent`).

---

## 4. Funcionalidad y claridad

### 4.1 Flujo de compra por WhatsApp

- **CartContext** y **Cart.tsx** están bien: arman el mensaje con nombre, SKU, variante (color/SKU) y cantidad, y abren WhatsApp con el número configurado.
- **Número de WhatsApp fijo:** Está hardcodeado en `Cart.tsx` (`541123168857`). Debería salir de variable de entorno (ej. `NEXT_PUBLIC_WHATSAPP_NUMBER`) para poder cambiar por entorno sin tocar código.

### 4.2 Precios

- No se muestran precios; el mensaje de WhatsApp pide “más información y precios”. Coherente con el modelo y los textos actuales.

### 4.3 Catálogo

- **Total de productos:** En `catalogo/page.tsx` el estado inicial es `const [totalProducts, setTotalProducts] = useState(1081)`. Ese 1081 está hardcodeado; debería ser `0` (o el total que devuelva la primera respuesta de la API) para no mostrar un número falso antes de cargar.

- **Filtros y URL:** Sincronización con `searchParams` y uso de `category` como ID está bien. La API de productos espera `category` como ObjectId (string); correcto si el front envía el `_id` de la categoría.

### 4.4 Página de detalle de producto

- **Breadcrumb:** Si el producto trae `categoryBreadcrumb` desde la API, se evita una segunda petición; está bien. El fallback a `/api/categories` y construcción de jerarquía por `parent` es correcto para el modelo unificado.

- **Productos recomendados:** Se pide `/api/products?active=true&limit=8` y se muestran 4; no está filtrado por categoría del producto actual. Para “relacionados” sería mejor filtrar por `category` (o categoría padre) del producto actual.

### 4.5 Home

- **Categorías destacadas:** Hay `categoryId` hardcodeados (ej. `68cda5f5ff392fb2b5d73dac`). Si cambian los IDs en BD (otro entorno, restore, migración), los enlaces dejan de apuntar bien. Mejor: usar `slug` de categoría y que el backend/catálogo resuelva slug → filtro, o cargar una lista “destacados” desde API/BD.
- **Productos populares:** Tienen `link: "/productos/1"`, `/productos/6`, etc. Los IDs reales son ObjectIds de MongoDB (ej. `507f1f77bcf86cd799439011`). Esos enlaces llevan a 404 salvo que existan productos con ese `_id`. Conviene que “populares” vengan de la API (ej. `featured=true` o un endpoint específico) y que los links sean `/productos/${product._id}`.

### 4.6 ProductCard: agregar al carrito en vista grid

- En vista **list** hay botón/acción para agregar al carrito; en vista **grid** la tarjeta es solo un `Link` al detalle. Para mejorar conversión, en grid podría añadirse un botón “Agregar al carrito” (o icono) que llame a `addItem` sin ir a la ficha, manteniendo la misma lógica de variante seleccionada.

---

## 5. Rendimiento

### 5.1 APIs

- **Productos:** `findWithCategories` hace un solo aggregation con `$lookup` a `categories` y `subcategories`. Cuando elimines el uso de `subcategories`, quitar ese `$lookup` reducirá trabajo. Proyección limita campos; bien.
- **Categorías:** Uso de `serverCache` (5 min) en `api/categories/route.js` está bien para datos poco variables.
- **Logs en producción:** En `ProductService.find()` y `findWithCategories` hay `console.log` de queries y cantidad de productos. En producción conviene quitarlos o usar un logger condicional para no llenar logs.

### 5.2 Frontend

- **Catálogo:** `sessionStorage` para categorías y marcas (5 min) evita repetir requests; correcto.
- **Paginación:** “Mostrar más” con `limit=50` y append está bien; con 2000–3000 productos, seguir con 50 por página es razonable.
- **Imágenes:** Uso de `getOptimizedImageUrl` y Cloudinary/proxy está bien; `getMainImage` contempla `defaultImage`, `colorVariants` y legacy `images`/`image`.

### 5.3 Base de datos

- Índices en Product: `sku`, `slug`, `category`, `active`, `featured`, texto en name/description/tags; adecuados para listados y búsqueda.
- Si se deja de filtrar por `subcategory` y `categoryPath`, se pueden dejar de crear índices sobre esos campos en nuevos despliegues (o eliminarlos si ya no se usan).

---

## 6. Carga masiva y +2000 productos

### 6.1 Estado actual

- Bulk upload acepta Excel (xlsx/xls), valida filas, transforma con `productBulkService` y procesa en lotes de 100.
- **Crítico:** Los bugs de 3.1 y 3.2 deben corregirse antes de cargar muchos productos: si no, se guardan documentos incorrectos y la categoría no sirve para filtrar.

### 6.2 Recomendaciones para escalar

1. **Resolución de categoría:** Por cada fila, resolver `category` (nombre o slug) a ObjectId de `categories`; si no existe, rechazar fila o usar una categoría “Sin categoría” y reportarlo.
2. **Slug único:** El modelo exige `slug` único. `generateSlug(name)` puede colisionir con productos ya existentes. Usar `productModel.generateUniqueSlug(name)` (o equivalente) antes de insertar.
3. **SKU único:** El modelo tiene `sku` único; la generación automática en bulk debe asegurar unicidad (por ejemplo, incluir sufijo o verificar contra BD).
4. **Lotes y timeouts:** Con 2000 filas, procesar en lotes (ej. 50–100) está bien; vigilar timeout de la función (Vercel/Next). Si hace falta, dividir en varios requests (por ejemplo, “cargar siguiente lote”) o un job en background.
5. **Documentación:** En `BULK_UPLOAD_FORMAT.md` aclarar que la columna `category` debe coincidir con **nombre o slug** de una categoría existente en `categories`, y que se guarda como ObjectId.

---

## 7. Checklist de acciones recomendadas

| Prioridad | Acción |
|-----------|--------|
| Alta | Corregir bulk: insertar y comprobar duplicados usando el objeto producto interno (`item.product`), no el wrapper `ProcessedProduct`. |
| Alta | En bulk, resolver `category` (nombre/slug) a ObjectId de `categories` antes de insertar. |
| Alta | En ProductService, eliminar uso de `subcategoryCache` y de la colección `subcategories` (inicializar cache solo si se usa, o quitar toda la lógica de subcategorías). |
| Media | Número de WhatsApp en variable de entorno (`NEXT_PUBLIC_WHATSAPP_NUMBER`). |
| Media | Catálogo: inicializar `totalProducts` en 0 (o con el total de la primera respuesta). |
| Media | Home: categorías destacadas por slug o API; productos populares desde API con links reales (`/productos/${_id}`). |
| Media | Producto recomendados en detalle: filtrar por categoría del producto actual. |
| Baja | ProductCard vista grid: opción de “Agregar al carrito” sin ir al detalle. |
| Baja | Reducir o condicionar `console.log` en ProductService en producción. |
| Baja | Revisar índices de Product: alinear con esquema (quitar o documentar subcategory/categoryPath). |

---

## 8. Conclusión

El proyecto está bien encaminado para un catálogo con cierre por WhatsApp: modelo sin precios, carrito y mensaje preparados, categorías unificadas y caché. Los **tres bugs críticos** (bulk insertando wrapper, categoría sin resolver a ObjectId, y crash por `subcategoryCache`) deben corregirse antes de seguir cargando productos. El resto son mejoras de configuración (WhatsApp), consistencia de datos (totales, destacados, populares) y UX (agregar al carrito en grid, recomendados por categoría), que harán el sistema más estable y claro para los usuarios y para vos al cargar los ~2000 productos restantes.
