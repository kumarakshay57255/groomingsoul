const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Books published by the founder — featured on the homepage and listed on
 * the /books page, each linking out to Amazon. Managed from the super admin.
 */
class Book extends Model {}

Book.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    subtitle: { type: DataTypes.STRING },
    author: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    /** Outbound purchase link (Amazon, etc.). */
    amazonUrl: { type: DataTypes.STRING },
    /** e.g. "Paperback & Kindle". */
    format: { type: DataTypes.STRING },
    coverImagePath: { type: DataTypes.STRING },
    position: { type: DataTypes.INTEGER, defaultValue: 0 },
    isPublished: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    modelName: 'Book',
    tableName: 'books',
    indexes: [{ fields: ['position'] }, { fields: ['is_published'] }],
  }
);

module.exports = Book;
