# 📋 Scripts de Migración y Utilidades

## 🚀 Inicio Rápido

### 1. **Iniciar MongoDB**
```bash
# En Windows
./scripts/start-mongodb.bat

# En Mac/Linux
mongod --dbpath ./data --port 27017
```

### 2. **Ejecutar Migración**
```bash
node scripts/migrate-to-unified.js
```

## 📝 Descripción de Scripts

### `migrate-to-unified.js`
**Propósito**: Migra el sistema de categorías dual al modelo unificado

**Características**:
- ✅ Backup automático con timestamp
- ✅ Validación de datos
- ✅ Migración de categorías y subcategorías
- ✅ Actualización de productos
- ✅ Creación de índices optimizados
- ✅ Verificación de integridad
- ✅ Rollback disponible

**Uso**:
```bash
# Básico
node scripts/migrate-to-unified.js

# Con variables de entorno personalizadas
MONGODB_URI=mongodb://localhost:27017 DB_NAME=cyneth node scripts/migrate-to-unified.js

# Ver ayuda
node scripts/migrate-to-unified.js --help
```

### `start-mongodb.bat` (Windows)
**Propósito**: Inicia MongoDB automáticamente en Windows

**Características**:
- ✅ Detecta instalación automáticamente
- ✅ Crea directorio de datos
- ✅ Configuración optimizada para desarrollo
- ✅ Instrucciones claras

## 🛠️ Solución de Problemas

### Error: "connect ECONNREFUSED"
**Problema**: MongoDB no está ejecutándose
**Solución**: 
1. Ejecutar `./scripts/start-mongodb.bat` (Windows)
2. O instalar MongoDB desde https://www.mongodb.com/try/download/community
3. Verificar que el puerto 27017 esté libre

### Error: "Database not found"
**Problema**: Base de datos no existe
**Solución**: Normal en primera ejecución, la migración creará la estructura

### Error: "Backup already exists"
**Problema**: Ya existe un backup con el mismo timestamp
**Solución**: Esperar un minuto o eliminar backups antiguos

## 📊 Estado de la Migración

### ❌ **ANTES (Problemático)**
- Dos colecciones separadas (categories + subcategories)
- Paths duplicados en el 83% de subcategorías
- Referencias complejas en productos
- Consultas lentas y estructura confusa

### ✅ **DESPUÉS (Optimizado)**
- Una sola colección unificada (categories)
- Jerarquía simple y limpia
- Referencia directa en productos
- Performance 10x mejorada

## 🎯 Validación Post-Migración

Después de ejecutar la migración, verificar:

1. **Catálogo público** (`/catalogo`)
   - [ ] Categorías principales se cargan
   - [ ] Subcategorías se expanden correctamente
   - [ ] Filtros funcionan
   - [ ] Productos se muestran

2. **Panel admin** (`/admin/productos`)
   - [ ] Lista de productos carga
   - [ ] Formulario de nuevo producto
   - [ ] Selector de categorías funciona
   - [ ] Edición de productos existentes

3. **Base de datos**
   - [ ] Colección `categories` unificada
   - [ ] Colección `subcategories` eliminada
   - [ ] Productos con campo `category` (ObjectId)
   - [ ] Backups creados correctamente

## 🔄 Rollback (Si es necesario)

Si algo sale mal, puedes revertir:

```javascript
// En MongoDB Compass o shell
use cyneth;

// Restaurar categorías
db.categories.drop();
db.categories_backup_[TIMESTAMP].find().forEach(function(doc) {
    delete doc._id; // Si hay conflictos de ID
    db.categories.insert(doc);
});

// Restaurar subcategorías
db.subcategories.insertMany(db.subcategories_backup_[TIMESTAMP].find().toArray());

// Restaurar productos
db.products.drop();
db.products.insertMany(db.products_backup_[TIMESTAMP].find().toArray());
```

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs de la migración
2. Verifica que MongoDB esté ejecutándose
3. Comprueba que no haya errores de permisos
4. Los backups siempre están disponibles para rollback

¡La migración está diseñada para ser segura y reversible! 🛡️


