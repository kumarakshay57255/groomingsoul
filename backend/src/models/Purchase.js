const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Purchase extends Model {}

Purchase.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { type: DataTypes.UUID, allowNull: false },
    courseId: { type: DataTypes.UUID, allowNull: false },
    /**
     * Lifecycle:
     *   pending_verification → admin uploaded receipt → marks `active`
     *   active               → within validity window
     *   expired              → cron flip after expires_at
     *   rejected             → admin rejected the receipt
     */
    status: {
      type: DataTypes.ENUM('pending_verification', 'active', 'expired', 'rejected'),
      defaultValue: 'pending_verification',
      allowNull: false,
    },
    pricePaidInr: { type: DataTypes.INTEGER },
    receiptImagePath: { type: DataTypes.STRING },
    /** Captured at moment of submission */
    payerName: { type: DataTypes.STRING },
    payerPhone: { type: DataTypes.STRING },
    payerEmail: { type: DataTypes.STRING },
    /** Set when admin approves */
    activatedAt: { type: DataTypes.DATE },
    expiresAt: { type: DataTypes.DATE },
    adminNote: { type: DataTypes.TEXT },
  },
  {
    sequelize,
    modelName: 'Purchase',
    tableName: 'purchases',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['course_id'] },
      { fields: ['status'] },
    ],
  }
);

module.exports = Purchase;
