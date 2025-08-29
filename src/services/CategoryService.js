const { ObjectId } = require('mongodb');

class CategoryService {
  constructor(db) {
    this.collection = db.collection('categories');
    this.productCollection = db.collection('products');
  }

  // Generar o actualizar categorías desde productos existentes
  async syncFromProducts() {
    try {
      console.log('🔄 Sincronizando categorías desde productos...');
      
      // Obtener todas las categorías únicas de productos
      const categoryGroups = await this.productCollection.aggregate([
        { $match: { active: true } },
        { 
          $group: { 
            _id: '$category',
            count: { $sum: 1 },
            subcategories: { $addToSet: '$subcategory' }
          } 
        },
        { $sort: { _id: 1 } }
      ]).toArray();

      // Crear o actualizar categorías
      for (const group of categoryGroups) {
        const categoryData = {
          name: group._id,
          slug: this.generateSlug(group._id),
          productCount: group.count,
          subcategories: group.subcategories.filter(Boolean).map(sub => ({
            name: sub,
            slug: this.generateSlug(sub),
            productCount: 0 // Se calculará después
          })),
          active: true,
          updatedAt: new Date()
        };

        // Buscar si la categoría ya existe
        const existingCategory = await this.collection.findOne({ name: group._id });
        
        if (existingCategory) {
          // Actualizar categoría existente
          await this.collection.updateOne(
            { _id: existingCategory._id },
            { $set: categoryData }
          );
          console.log(`✅ Categoría actualizada: ${group._id}`);
        } else {
          // Crear nueva categoría
          categoryData.createdAt = new Date();
          await this.collection.insertOne(categoryData);
          console.log(`✅ Nueva categoría creada: ${group._id}`);
        }
      }

      // Calcular conteo de productos por subcategoría
      await this.updateSubcategoryCounts();
      
      console.log('🎉 Sincronización de categorías completada!');
      return true;
      
    } catch (error) {
      console.error('❌ Error sincronizando categorías:', error);
      throw error;
    }
  }

  // Actualizar conteos de productos por subcategoría
  async updateSubcategoryCounts() {
    try {
      const subcategoryGroups = await this.productCollection.aggregate([
        { $match: { active: true, subcategory: { $exists: true, $ne: null } } },
        { 
          $group: { 
            _id: { category: '$category', subcategory: '$subcategory' },
            count: { $sum: 1 }
          } 
        }
      ]).toArray();

      // Actualizar cada categoría con los conteos correctos
      for (const group of subcategoryGroups) {
        await this.collection.updateOne(
          { 
            name: group._id.category,
            'subcategories.name': group._id.subcategory 
          },
          { 
            $set: { 
              'subcategories.$.productCount': group.count,
              updatedAt: new Date()
            } 
          }
        );
      }
    } catch (error) {
      console.error('Error actualizando conteos de subcategorías:', error);
    }
  }

  // Obtener todas las categorías
  async getAll() {
    try {
      return await this.collection.find({ active: true }).sort({ name: 1 }).toArray();
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      return [];
    }
  }

  // Obtener categoría por slug
  async getBySlug(slug) {
    try {
      return await this.collection.findOne({ slug, active: true });
    } catch (error) {
      console.error('Error obteniendo categoría por slug:', error);
      return null;
    }
  }

  // Obtener subcategorías de una categoría
  async getSubcategories(categorySlug) {
    try {
      const category = await this.getBySlug(categorySlug);
      return category ? category.subcategories : [];
    } catch (error) {
      console.error('Error obteniendo subcategorías:', error);
      return [];
    }
  }

  // Crear categoría manualmente
  async create(categoryData) {
    try {
      const category = {
        ...categoryData,
        slug: this.generateSlug(categoryData.name),
        createdAt: new Date(),
        updatedAt: new Date(),
        active: true
      };

      const result = await this.collection.insertOne(category);
      return { ...category, _id: result.insertedId };
    } catch (error) {
      console.error('Error creando categoría:', error);
      throw error;
    }
  }

  // Actualizar categoría
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
      console.error('Error actualizando categoría:', error);
      throw error;
    }
  }

  // Eliminar categoría (soft delete)
  async delete(slug) {
    try {
      const result = await this.collection.updateOne(
        { slug },
        { $set: { active: false, updatedAt: new Date() } }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error eliminando categoría:', error);
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

module.exports = CategoryService;
