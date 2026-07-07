const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Editable strings that drive the foundation-level homepage blocks
 * (Founder's Message + Vision + Mission). Stored as a single keyed row.
 */
class FoundationContent extends Model {}

FoundationContent.init(
  {
    /** Always 'singleton' — there is only one row. */
    id: { type: DataTypes.STRING, primaryKey: true, defaultValue: 'singleton' },
    founderMessage: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
    founderQuote: { type: DataTypes.STRING },
    vision: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
    mission: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
  },
  {
    sequelize,
    modelName: 'FoundationContent',
    tableName: 'foundation_content',
  }
);

module.exports = FoundationContent;
