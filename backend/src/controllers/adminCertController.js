const { CertificateQueue, User, Course } = require('../models');
const { runExpirySweep } = require('../jobs/expirySweeper');

function adminCert(c) {
  return {
    id: c.id,
    status: c.status,
    shippingName: c.shippingName,
    shippingPhone: c.shippingPhone,
    shippingAddress: c.shippingAddress,
    courierTracking: c.courierTracking,
    dispatchedAt: c.dispatchedAt,
    deliveredAt: c.deliveredAt,
    createdAt: c.createdAt,
    user: c.user
      ? {
          id: c.user.id,
          name: c.user.name,
          email: c.user.email,
          phone: c.user.phone,
        }
      : null,
    course: c.course
      ? {
          id: c.course.id,
          slug: c.course.slug,
          title: c.course.title,
          type: c.course.type,
        }
      : null,
  };
}

const ALLOWED_STATUS = ['queued', 'printed', 'dispatched', 'delivered'];

/** GET /api/admin/certificates?status=… */
async function listCertificates(req, res) {
  const status = typeof req.query.status === 'string' ? req.query.status : null;
  const where = {};
  if (status) {
    if (!ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({ ok: false, error: 'Invalid status' });
    }
    where.status = status;
  }

  const rows = await CertificateQueue.findAll({
    where,
    include: [
      { model: User, as: 'user' },
      { model: Course, as: 'course' },
    ],
    order: [['createdAt', 'DESC']],
  });
  res.json({ ok: true, certificates: rows.map(adminCert) });
}

/**
 * POST /api/admin/certificates/:id/mark
 *
 * Body: {
 *   status:  "printed" | "dispatched" | "delivered",
 *   shippingAddress?: string,
 *   courierTracking?: string,
 * }
 */
async function markCertificate(req, res) {
  const { id } = req.params;
  const { status, shippingAddress, courierTracking } = req.body ?? {};

  if (!ALLOWED_STATUS.includes(status)) {
    return res.status(400).json({ ok: false, error: 'Invalid status' });
  }

  const cert = await CertificateQueue.findByPk(id, {
    include: [
      { model: User, as: 'user' },
      { model: Course, as: 'course' },
    ],
  });
  if (!cert) {
    return res.status(404).json({ ok: false, error: 'Certificate not found' });
  }

  const patch = { status };
  if (shippingAddress !== undefined) patch.shippingAddress = shippingAddress;
  if (courierTracking !== undefined) patch.courierTracking = courierTracking;
  if (status === 'dispatched' && !cert.dispatchedAt) patch.dispatchedAt = new Date();
  if (status === 'delivered' && !cert.deliveredAt) patch.deliveredAt = new Date();

  await cert.update(patch);
  res.json({ ok: true, certificate: adminCert(cert) });
}

/** POST /api/admin/cron/expire — manually trigger the expiry sweep (testing). */
async function triggerExpirySweep(_req, res) {
  const count = await runExpirySweep();
  res.json({ ok: true, expired: count });
}

module.exports = { listCertificates, markCertificate, triggerExpirySweep };
