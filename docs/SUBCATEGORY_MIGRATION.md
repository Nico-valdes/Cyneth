# 🚀 Migración de Subcategorías a Estructura Jerárquica

## 📋 **Resumen de Cambios**

Este documento describe la migración del sistema de subcategorías de una estructura plana a una estructura jerárquica anidada que permite hasta **5 niveles de profundidad**.

## 🔄 **Cambios en el Modelo de Datos**

### **Antes (Estructura Plana):**
```javascript
{
  _id: ObjectId,
  name: String,
  slug: String,
  category: String,
  categorySlug: String,
  productCount: Number,
  active: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### **Después (Estructura Jerárquica):**
```javascript
{
  _id: ObjectId,
  name: String,
  slug: String,
  category: String,
  categorySlug: String,
  parent: String,           // 🆕 ID de la subcategoría padre
  parentSlug: String,       // 🆕 Slug de la subcategoría padre
  level: Number,            // 🆕 Nivel de profundidad (0-4)
  path: Array,              // 🆕 Array de IDs de la ruta completa
  pathSlugs: Array,         // 🆕 Array de slugs de la ruta completa
  productCount: Number,
  active: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🏗️ **Nueva Estructura de Jerarquía**

### **Niveles de Profundidad:**
- **Nivel 0**: Subcategorías raíz (sin padre)
- **Nivel 1**: Subcategorías hijas de nivel 0
- **Nivel 2**: Subcategorías hijas de nivel 1
- **Nivel 3**: Subcategorías hijas de nivel 2
- **Nivel 4**: Subcategorías hijas de nivel 3

### **Ejemplo de Estructura:**
```
Electrónicos (Categoría)
├── Smartphones (Nivel 0)
│   ├── Android (Nivel 1)
│   │   ├── Samsung (Nivel 2)
│   │   │   ├── Galaxy S (Nivel 3)
│   │   │   │   └── Galaxy S23 (Nivel 4)
│   │   │   └── Galaxy A (Nivel 3)
│   │   └── Xiaomi (Nivel 2)
│   └── iPhone (Nivel 1)
└── Laptops (Nivel 0)
    ├── Gaming (Nivel 1)
    └── Business (Nivel 1)
```

## 📊 **Campos Nuevos Explicados**

### **`parent`**
- **Tipo**: `String` (ObjectId como string)
- **Descripción**: ID de la subcategoría padre
- **Valor**: `null` para nivel raíz, `ObjectId` para subcategorías anidadas

### **`parentSlug`**
- **Tipo**: `String`
- **Descripción**: Slug de la subcategoría padre para consultas rápidas
- **Valor**: `null` para nivel raíz, `slug` del padre para subcategorías anidadas

### **`level`**
- **Tipo**: `Number`
- **Descripción**: Nivel de profundidad en la jerarquía
- **Valores**: 0, 1, 2, 3, 4

### **`path`**
- **Tipo**: `Array[String]`
- **Descripción**: Array de IDs que forman la ruta completa desde la raíz
- **Ejemplo**: `["parent1_id", "parent2_id", "current_id"]`

### **`pathSlugs`**
- **Tipo**: `Array[String]`
- **Descripción**: Array de slugs que forman la ruta completa para URLs
- **Ejemplo**: `["smartphones", "android", "samsung"]`

## 🔧 **Pasos de Migración**

### **1. Preparar el Entorno**
```bash
# Asegurarse de tener MongoDB corriendo
# Verificar variables de entorno
echo $MONGODB_URI
```

### **2. Ejecutar Script de Inicialización de Índices**
```bash
# Crear índices necesarios
node scripts/init-subcategory-indexes.js
```

### **3. Ejecutar Script de Migración**
```bash
# Migrar subcategorías existentes
node scripts/migrate-subcategories.js
```

### **4. Verificar la Migración**
```bash
# Conectar a MongoDB y verificar estructura
mongosh
use cyneth
db.subcategories.findOne()
```

## 📈 **Índices de Base de Datos**

### **Índices Creados:**
1. **`{ category: 1, level: 1 }`** - Consultas por categoría y nivel
2. **`{ parent: 1 }`** - Consultas por padre
3. **`{ path: 1 }`** - Consultas por ruta
4. **`{ slug: 1 }`** - Slug único (único)
5. **`{ categorySlug: 1, slug: 1 }`** - Consultas por categoría y slug

### **Beneficios de Rendimiento:**
- ✅ Consultas jerárquicas rápidas
- ✅ Búsquedas por padre eficientes
- ✅ Navegación por ruta optimizada
- ✅ Validación de unicidad de slug

## 🚨 **Validaciones Implementadas**

### **Validaciones de Creación:**
- ✅ Máximo 5 niveles de profundidad
- ✅ Prevención de ciclos en la jerarquía
- ✅ Validación de existencia del padre
- ✅ Cálculo automático de nivel y path

### **Validaciones de Actualización:**
- ✅ Verificación de límites de nivel al mover
- ✅ Prevención de ciclos al cambiar padre
- ✅ Recalculación automática de paths
- ✅ Actualización de referencias hijas

### **Validaciones de Eliminación:**
- ✅ Prevención de eliminación con hijos
- ✅ Soft delete para mantener integridad
- ✅ Actualización de contadores

## 🔍 **Consultas de Ejemplo**

### **Obtener Subcategorías por Nivel:**
```javascript
// Subcategorías de nivel raíz
db.subcategories.find({ level: 0, category: "electronics" })

// Subcategorías de primer nivel
db.subcategories.find({ level: 1, category: "electronics" })

// Subcategorías de cualquier nivel
db.subcategories.find({ level: { $lt: 3 }, category: "electronics" })
```

### **Obtener Jerarquía Completa:**
```javascript
// Subcategorías con estructura jerárquica
db.subcategories.aggregate([
  { $match: { category: "electronics", active: true } },
  { $sort: { level: 1, name: 1 } }
])
```

### **Obtener Subcategorías por Padre:**
```javascript
// Hijos de una subcategoría específica
db.subcategories.find({ parent: "parent_subcategory_id" })
```

### **Obtener Ruta Completa:**
```javascript
// Subcategoría con su ruta completa
db.subcategories.findOne({ slug: "galaxy-s23" })
// Resultado incluirá: path, pathSlugs, level
```

## 🛠️ **APIs Actualizadas**

### **Nuevos Endpoints:**
- **`GET /api/subcategories?hierarchical=true`** - Estructura jerárquica
- **`GET /api/subcategories?category=electronics&hierarchical=true`** - Por categoría con jerarquía

### **Validaciones en APIs:**
- ✅ Validación de nivel máximo al crear
- ✅ Prevención de ciclos
- ✅ Validación de existencia del padre
- ✅ Manejo de errores específicos

## 🔄 **Compatibilidad con Datos Existentes**

### **Migración Automática:**
- ✅ Todas las subcategorías existentes se convierten a nivel 0
- ✅ Campos nuevos se inicializan con valores por defecto
- ✅ No se pierden datos existentes
- ✅ URLs y slugs se mantienen intactos

### **Estructura de Datos:**
- ✅ **Antes**: `parent: undefined`
- ✅ **Después**: `parent: null, level: 0, path: [], pathSlugs: []`

## 🚀 **Beneficios de la Nueva Estructura**

### **Para Desarrolladores:**
- ✅ API más robusta y validada
- ✅ Consultas jerárquicas eficientes
- ✅ Estructura de datos consistente
- ✅ Fácil navegación por niveles

### **Para Usuarios:**
- ✅ Navegación más intuitiva
- ✅ Categorización más granular
- ✅ Mejor organización de productos
- ✅ URLs más descriptivas

### **Para el Sistema:**
- ✅ Mejor rendimiento en consultas
- ✅ Escalabilidad para grandes volúmenes
- ✅ Integridad de datos garantizada
- ✅ Fácil mantenimiento

## 🔧 **Solución de Problemas**

### **Error: "No se puede crear una subcategoría más allá del nivel 4"**
- **Causa**: Intento de crear subcategoría en nivel 5 o superior
- **Solución**: Usar solo subcategorías de nivel 0-3 como padres

### **Error: "No se puede crear un ciclo en la jerarquía"**
- **Causa**: Intento de asignar un hijo como padre de su propio padre
- **Solución**: Verificar la jerarquía antes de asignar padres

### **Error: "No se puede eliminar una subcategoría que tiene subcategorías hijas"**
- **Causa**: Intento de eliminar subcategoría con hijos
- **Solución**: Eliminar o mover los hijos primero

## 📞 **Soporte**

Si encuentras problemas durante la migración:

1. **Revisar logs** del script de migración
2. **Verificar conexión** a MongoDB
3. **Comprobar permisos** de la base de datos
4. **Revisar estructura** de datos existentes

## 🎯 **Próximos Pasos**

Después de la migración exitosa:

1. **Probar APIs** con la nueva estructura
2. **Verificar frontend** con subcategorías anidadas
3. **Optimizar consultas** según patrones de uso
4. **Monitorear rendimiento** de la base de datos
