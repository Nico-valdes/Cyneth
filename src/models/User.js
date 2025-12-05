const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

// Esquema de usuario
const userSchema = {
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }, // Solo se asigna manualmente desde MongoDB
  role: { type: String, default: 'user' }, // user, admin, etc.
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

class User {
  constructor(db) {
    this.db = db;
    this.collection = db.collection('users');
  }

  // Crear usuario con hash de contraseña
  async create(userData) {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.collection.findOne({
        $or: [
          { username: userData.username },
          { email: userData.email }
        ]
      });

      if (existingUser) {
        throw new Error('El usuario o email ya existe');
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const newUser = {
        ...userSchema,
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        isAdmin: false, // Por defecto false, se asigna manualmente desde MongoDB
        role: 'user', // Por defecto 'user', se cambia a 'admin' manualmente si isAdmin es true
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await this.collection.insertOne(newUser);
      return { ...newUser, _id: result.insertedId, password: undefined };
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  }

  // Buscar usuario por username
  async findByUsername(username) {
    try {
      return await this.collection.findOne({ username, active: true });
    } catch (error) {
      console.error('Error buscando usuario:', error);
      throw error;
    }
  }

  // Buscar usuario por email
  async findByEmail(email) {
    try {
      return await this.collection.findOne({ email, active: true });
    } catch (error) {
      console.error('Error buscando usuario:', error);
      throw error;
    }
  }

  // Buscar usuario por ID
  async findById(id) {
    try {
      return await this.collection.findOne({ _id: new ObjectId(id), active: true });
    } catch (error) {
      console.error('Error buscando usuario:', error);
      throw error;
    }
  }

  // Verificar contraseña
  async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error verificando contraseña:', error);
      return false;
    }
  }

  // Actualizar usuario
  async update(id, updateData) {
    try {
      // Si se actualiza la contraseña, hashearla
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      updateData.updatedAt = new Date();

      const result = await this.collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  }
}

module.exports = User;

