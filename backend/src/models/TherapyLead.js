const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class TherapyLead extends Model {}

TherapyLead.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    therapistId: { type: DataTypes.STRING },
    therapistName: { type: DataTypes.STRING },
    name: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    slot: { type: DataTypes.STRING, allowNull: false },
    status: {
      type: DataTypes.ENUM('new', 'contacted', 'scheduled', 'closed'),
      defaultValue: 'new',
    },
    notes: { type: DataTypes.TEXT },
  },
  {
    sequelize,
    modelName: 'TherapyLead',
    tableName: 'therapy_leads',
  }
);

module.exports = TherapyLead;
