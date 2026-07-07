const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class CourseModule extends Model {}

CourseModule.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    courseId: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  {
    sequelize,
    modelName: 'CourseModule',
    tableName: 'course_modules',
  }
);

module.exports = CourseModule;
