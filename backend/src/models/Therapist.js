const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Therapist extends Model {}

Therapist.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    designation: { type: DataTypes.STRING, allowNull: false },
    yearsExperience: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    languages: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    specializations: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    bio: { type: DataTypes.TEXT },
    photoPath: { type: DataTypes.STRING },
    /** Currently taking new clients vs. waitlist-only */
    acceptingNew: { type: DataTypes.BOOLEAN, defaultValue: true },
    /** Soft-delete flag — archived therapists do not appear on public pages */
    isArchived: { type: DataTypes.BOOLEAN, defaultValue: false },
    /** Display ordering on the public /therapy page (lower = earlier) */
    position: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    sequelize,
    modelName: 'Therapist',
    tableName: 'therapists',
    indexes: [
      { fields: ['is_archived'] },
      { fields: ['position'] },
    ],
  }
);

module.exports = Therapist;
