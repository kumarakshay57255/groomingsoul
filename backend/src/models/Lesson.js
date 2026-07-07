const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Lesson extends Model {}

Lesson.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    moduleId: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    /**
     * Source URL for the lesson video. `null` is allowed because admins can
     * create a lesson row first and upload the MP4 later via PATCH /lessons/:id.
     * The student-side stream endpoint already refuses requests when the URL
     * is missing.
     */
    videoUrl: { type: DataTypes.STRING, allowNull: true },
    /** Duration in seconds */
    durationSec: { type: DataTypes.INTEGER, defaultValue: 0 },
    position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    description: { type: DataTypes.TEXT },
  },
  {
    sequelize,
    modelName: 'Lesson',
    tableName: 'lessons',
  }
);

module.exports = Lesson;
