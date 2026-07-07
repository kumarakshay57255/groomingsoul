const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Course extends Model {}

Course.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    title: { type: DataTypes.STRING, allowNull: false },
    instructor: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    coverColor: { type: DataTypes.STRING, defaultValue: '#3F5F8A' },
    /**
     * Academy categories: 11-12 | cuet-ug | cuet-pg | net-jrf
     * Diploma category: diploma
     */
    category: {
      type: DataTypes.ENUM('11-12', 'cuet-ug', 'cuet-pg', 'net-jrf', 'diploma'),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('academy', 'diploma'),
      allowNull: false,
      defaultValue: 'academy',
    },
    /** Price in INR rupees (whole units) */
    priceInr: { type: DataTypes.INTEGER, allowNull: false },
    /** Access window in days from purchase */
    validityDays: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 30 },
    estimatedHours: { type: DataTypes.INTEGER },
    /** Visibility toggle for admin */
    isPublished: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize,
    modelName: 'Course',
    tableName: 'courses',
  }
);

module.exports = Course;
