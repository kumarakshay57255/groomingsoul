const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Per spec: when a student hits 100% on a diploma course, admin manually
 * verifies, prints, and dispatches a hardcopy certificate. This table is the
 * queue surface — no auto PDF.
 */
class CertificateQueue extends Model {}

CertificateQueue.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { type: DataTypes.UUID, allowNull: false },
    courseId: { type: DataTypes.UUID, allowNull: false },
    status: {
      type: DataTypes.ENUM('queued', 'printed', 'dispatched', 'delivered'),
      defaultValue: 'queued',
      allowNull: false,
    },
    shippingName: { type: DataTypes.STRING },
    shippingPhone: { type: DataTypes.STRING },
    shippingAddress: { type: DataTypes.TEXT },
    courierTracking: { type: DataTypes.STRING },
    dispatchedAt: { type: DataTypes.DATE },
    deliveredAt: { type: DataTypes.DATE },
  },
  {
    sequelize,
    modelName: 'CertificateQueue',
    tableName: 'certificate_queue',
    indexes: [
      { unique: true, fields: ['user_id', 'course_id'] },
      { fields: ['status'] },
    ],
  }
);

module.exports = CertificateQueue;
