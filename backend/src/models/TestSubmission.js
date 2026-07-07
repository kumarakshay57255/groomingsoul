const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Stores raw psychometric test responses for internal scoring.
 * `identity` and `answers` are saved as JSONB to keep the schema flexible
 * across the five test variants (Likert, MCQ, free-text).
 */
class TestSubmission extends Model {}

TestSubmission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    testSlug: { type: DataTypes.STRING, allowNull: false },
    testName: { type: DataTypes.STRING, allowNull: false },
    identity: { type: DataTypes.JSONB, allowNull: false },
    answers: { type: DataTypes.JSONB, allowNull: false },
    reviewStatus: {
      type: DataTypes.ENUM('pending', 'in_review', 'completed'),
      defaultValue: 'pending',
    },
    summary: { type: DataTypes.TEXT },
  },
  {
    sequelize,
    modelName: 'TestSubmission',
    tableName: 'test_submissions',
  }
);

module.exports = TestSubmission;
