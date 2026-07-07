const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class AdvisoryMember extends Model {}

AdvisoryMember.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    /** e.g. "Clinical Psychologist · PhD" */
    role: { type: DataTypes.STRING, allowNull: false },
    bio: { type: DataTypes.TEXT },
    photoPath: { type: DataTypes.STRING },
    position: { type: DataTypes.INTEGER, defaultValue: 0 },
    isArchived: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    modelName: 'AdvisoryMember',
    tableName: 'advisory_members',
    indexes: [
      { fields: ['position'] },
      { fields: ['is_archived'] },
    ],
  }
);

module.exports = AdvisoryMember;
