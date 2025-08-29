const { ObjectId } = require('mongodb');

class BrandService {
  constructor(db) {
    this.collection = db.collection('brands');
    this.productCollection = db.collection('products');
  }

  // Generar o actualizar marcas desde productos existentes
  async syncFromProducts() {
    try {
      console.log('🔄 Sincronizando marcas desde productos...');
      
      // Obtener todas las marcas únicas de productos
      const brandGroups = await this.productCollection.aggregate([
        { $match: { active: true, brand: { $exists: true, $ne: null } } },
        { 
          $group: { 
            _id: '$brand',
            count: { $sum: 1 },
            categories: { $addToSet: '$category' }
          } 
        },
        { $sort: { _id: 1 } }
      ]).toArray();

      // Crear o actualizar marcas
      for (const group of brandGroups) {
        const brandData = {
          name: group._id,
          slug: this.generateSlug(group._id),
          productCount: group.count,
          categories: group.categories,
          active: true,
          updatedAt: new Date()
        };

        // Buscar si la marca ya existe
        const existingBrand = await this.collection.findOne({ name: group._id });
        
        if (existingBrand) {
          // Actualizar marca existente
          await this.collection.updateOne(
            { _id: existingBrand._id },
            { $set: brandData }
          );
          console.log(`✅ Marca actualizada: ${group._id}`);
        } else {
          // Crear nueva marca
          brandData.createdAt = new Date();
          await this.collection.insertOne(brandData);
          console.log(`✅ Nueva marca creada: ${group._id}`);
        }
      }
      
      console.log('🎉 Sincronización de marcas completada!');
      return true;
      
    } catch (error) {
      console.error('❌ Error sincronizando marcas:', error);
      throw error;
    }
  }

  // Obtener todas las marcas
  async getAll() {
    try {
      return await this.collection.find({ active: true }).sort({ name: 1 }).toArray();
    } catch (error) {
      console.error('Error obteniendo marcas:', error);
      return [];
    }
  }

  // Obtener marcas por categoría
  async getByCategory(categorySlug) {
    try {
      return await this.collection.find({ 
        categories: { $in: [categorySlug] },
        active: true 
      }).sort({ name: 1 }).toArray();
    } catch (error) {
      console.error('Error obteniendo marcas por categoría:', error);
      return [];
    }
  }

  // Obtener marca por slug
  async getBySlug(slug) {
    try {
      return await this.collection.findOne({ slug, active: true });
    } catch (error) {
      console.error('Error obteniendo marca por slug:', error);
      return null;
    }
  }

  // Crear marca manualmente
  async create(brandData) {
    try {
      const brand = {
        ...brandData,
        slug: this.generateSlug(brandData.name),
        createdAt: new Date(),
        updatedAt: new Date(),
        active: true
      };

      const result = await this.collection.insertOne(brand);
      return { ...brand, _id: result.insertedId };
    } catch (error) {
      console.error('Error creando marca:', error);
      throw error;
    }
  }

  // Actualizar marca
  async update(slug, updateData) {
    try {
      const update = {
        ...updateData,
        updatedAt: new Date()
      };

      if (updateData.name) {
        update.slug = this.generateSlug(updateData.name);
      }

      const result = await this.collection.updateOne(
        { slug },
        { $set: update }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error actualizando marca:', error);
      throw error;
    }
  }

  // Eliminar marca (soft delete)
  async delete(slug) {
    try {
      const result = await this.collection.updateOne(
        { slug },
        { $set: { active: false, updatedAt: new Date() } }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error eliminando marca:', error);
      throw error;
    }
  }

  // Generar slug desde nombre
  generateSlug(name) {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
}

module.exports = BrandService;
