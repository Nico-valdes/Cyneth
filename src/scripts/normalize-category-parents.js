/**
 * Normaliza el campo `parent` de las categorías: convierte de string a ObjectId
 * para que la BD quede consistente y el filtro por categoría (getAllDescendantCategories) funcione igual en todo el árbol.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { connectToDatabase } = require('../libs/mongoConnect');
const { ObjectId } = require('mongodb');

async function normalizeCategoryParents() {
  let client;
  try {
    client = await connectToDatabase();
    const dbName = process.env.MONGODB_DB_NAME || 'cyneth';
    const db = client.db(dbName);
    const coll = db.collection('categories');

    // Traer todas las categorías que tengan parent; en JS filtramos las que vengan como string
    const allWithParent = await coll.find({ parent: { $exists: true, $ne: null } }).toArray();
    const toUpdate = allWithParent.filter(
      (c) => typeof c.parent === 'string' && ObjectId.isValid(c.parent)
    );

    if (toUpdate.length === 0) {
      console.log('OK: No hay categorías con parent en string. Nada que normalizar.');
      return;
    }

    console.log(`Encontradas ${toUpdate.length} categorías con parent como string. Actualizando...`);

    let updated = 0;
    for (const cat of toUpdate) {
      const result = await coll.updateOne(
        { _id: cat._id },
        { $set: { parent: new ObjectId(cat.parent), updatedAt: new Date() } }
      );
      if (result.modifiedCount) updated++;
      console.log(`  ${cat.slug || cat._id}: parent "${cat.parent}" -> ObjectId`);
    }

    console.log(`OK: ${updated} categorías actualizadas. parent quedó como ObjectId.`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    if (client) client.close();
  }
}

normalizeCategoryParents();
