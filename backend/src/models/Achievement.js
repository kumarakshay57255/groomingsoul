const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Founder achievements — awards, milestones and recognition shown on the
 * public site's Founder's Corner. Managed from the super admin.
 */
class Achievement extends Model {}

Achievement.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    /** Free-text year, e.g. "2023" or "2023–24". */
    year: { type: DataTypes.STRING },
    /** Short label, e.g. "Milestone", "Award", "Publication". */
    tag: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    imagePath: { type: DataTypes.STRING },
    position: { type: DataTypes.INTEGER, defaultValue: 0 },
    isPublished: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    modelName: 'Achievement',
    tableName: 'achievements',
    indexes: [{ fields: ['position'] }, { fields: ['is_published'] }],
  }
);

module.exports = Achievement;
