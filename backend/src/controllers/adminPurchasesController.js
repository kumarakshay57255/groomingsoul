const { Course, Purchase, User } = require('../models');

function adminPurchase(p) {
  return {
    id: p.id,
    status: p.status,
    pricePaidInr: p.pricePaidInr,
    receiptImagePath: p.receiptImagePath,
    payerName: p.payerName,
    payerPhone: p.payerPhone,
    payerEmail: p.payerEmail,
    activatedAt: p.activatedAt,
    expiresAt: p.expiresAt,
    adminNote: p.adminNote,
    createdAt: p.createdAt,
    user: p.user
      ? {
          id: p.user.id,
          name: p.user.name,
          email: p.user.email,
          phone: p.user.phone,
        }
      : null,
    course: p.course
      ? {
          id: p.course.id,
          slug: p.course.slug,
          title: p.course.title,
          validityDays: p.course.validityDays,
          priceInr: p.course.priceInr,
          type: p.course.type,
        }
      : null,
  };
}

/** GET /api/admin/purchases?status=… */
async function listPurchases(req, res) {
  const status = typeof req.query.status === 'string' ? req.query.status : null;
  const where = {};
  if (status) where.status = status;

  const purchases = await Purchase.findAll({
    where,
    include: [
      { model: User, as: 'user' },
      { model: Course, as: 'course' },
    ],
    order: [['createdAt', 'DESC']],
  });

  res.json({ ok: true, purchases: purchases.map(adminPurchase) });
}

/** POST /api/admin/purchases/:id/approve */
async function approvePurchase(req, res) {
  const { id } = req.params;
  const purchase = await Purchase.findByPk(id, {
    include: [{ model: Course, as: 'course' }],
  });
  if (!purchase) {
    return res.status(404).json({ ok: false, error: 'Purchase not found' });
  }
  if (purchase.status === 'active') {
    return res.json({ ok: true, purchase: adminPurchase(purchase) });
  }

  const validityDays = purchase.course?.validityDays ?? 30;
  const activatedAt = new Date();
  const expiresAt = new Date(
    activatedAt.getTime() + validityDays * 24 * 60 * 60 * 1000
  );

  await purchase.update({
    status: 'active',
    activatedAt,
    expiresAt,
    adminNote: req.body?.note ?? purchase.adminNote,
  });

  res.json({ ok: true, purchase: adminPurchase(purchase) });
}

/** POST /api/admin/purchases/:id/reject */
async function rejectPurchase(req, res) {
  const { id } = req.params;
  const purchase = await Purchase.findByPk(id, {
    include: [
      { model: User, as: 'user' },
      { model: Course, as: 'course' },
    ],
  });
  if (!purchase) {
    return res.status(404).json({ ok: false, error: 'Purchase not found' });
  }

  await purchase.update({
    status: 'rejected',
    adminNote: req.body?.note ?? null,
  });

  res.json({ ok: true, purchase: adminPurchase(purchase) });
}

module.exports = { listPurchases, approvePurchase, rejectPurchase };
