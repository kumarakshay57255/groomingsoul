const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class LessonProgress extends Model {}

LessonProgress.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { type: DataTypes.UUID, allowNull: false },
    lessonId: { type: DataTypes.UUID, allowNull: false },
    completedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'LessonProgress',
    tableName: 'lesson_progress',
    indexes: [{ unique: true, fields: ['user_id', 'lesson_id'] }],
  }
);

module.exports = LessonProgress;
