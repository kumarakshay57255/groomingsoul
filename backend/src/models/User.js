const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    phone: { type: DataTypes.STRING, allowNull: false },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM('student', 'admin', 'intern'),
      allowNull: false,
      defaultValue: 'student',
    },
    phoneVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    emailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    /** Soft-deactivation. Inactive accounts cannot sign in or hold a session. */
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true, allowNull: false },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
  }
);

module.exports = User;
