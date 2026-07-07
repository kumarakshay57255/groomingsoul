const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class TeamMember extends Model {}

TeamMember.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false },
    /** Team grid filter bucket: leadership | clinical | associate */
    category: { type: DataTypes.STRING, allowNull: false, defaultValue: 'associate' },
    bio: { type: DataTypes.TEXT },
    photoPath: { type: DataTypes.STRING },
    /** The single founder row drives the Founder's Corner block. */
    isFounder: { type: DataTypes.BOOLEAN, defaultValue: false },
    /** Display order in the Core Team grid (lower = earlier). */
    position: { type: DataTypes.INTEGER, defaultValue: 0 },
    isArchived: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    modelName: 'TeamMember',
    tableName: 'team_members',
    indexes: [
      { fields: ['is_founder'] },
      { fields: ['position'] },
      { fields: ['is_archived'] },
    ],
  }
);

module.exports = TeamMember;
