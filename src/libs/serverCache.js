// Caché en memoria del servidor para datos que cambian poco
// Útil para categorías, marcas, etc.

class ServerCache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutos por defecto
  }

  // Obtener valor del caché
  get(key) {
    const item = this.cache.get(key);
    const timestamp = this.timestamps.get(key);
    
    if (!item || !timestamp) {
      return null;
    }
    
    // Verificar si expiró
    const now = Date.now();
    const ttl = item.ttl || this.defaultTTL;
    
    if (now - timestamp > ttl) {
      // Expiró, eliminar del caché
      this.cache.delete(key);
      this.timestamps.delete(key);
      return null;
    }
    
    return item.value;
  }

  // Guardar valor en el caché
  set(key, value, ttl = null) {
    this.cache.set(key, {
      value,
      ttl: ttl || this.defaultTTL
    });
    this.timestamps.set(key, Date.now());
  }

  // Invalidar una clave específica
  invalidate(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  // Limpiar todo el caché
  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  // Obtener estadísticas del caché
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Instancia singleton para usar en toda la aplicación
const serverCache = new ServerCache();

module.exports = serverCache;

