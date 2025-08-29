// Esquema de Marca (solo estructura)
const brandSchema = {
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  productCount: { type: Number, default: 0 },
  categories: [{ type: String }], // Categorías donde se usa esta marca
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// Clase básica del modelo (solo estructura)
class Brand {
  constructor(db) {
    this.collection = db.collection('brands');
  }

  // Método para obtener la colección (para servicios)
  getCollection() {
    return this.collection;
  }
}

module.exports = Brand;
