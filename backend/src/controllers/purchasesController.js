const { Course, Purchase } = require('../models');
const { normalizeIndianPhone } = require('../utils/phone');

function deriveStatus(p) {
  if (p.status === 'active' && p.expiresAt && new Date(p.expiresAt) <= new Date()) {
    return 'expired';
  }
  return p.status;
}

function daysRemaining(p) {
  if (!p.expiresAt) return null;
  const ms = new Date(p.expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function publicPurchase(p) {
  const status = deriveStatus(p);
  return {
    id: p.id,
    courseId: p.courseId,
    status,
    isUnlocked: status === 'active',
    pricePaidInr: p.pricePaidInr,
    receiptImagePath: p.receiptImagePath,
    payerName: p.payerName,
    payerPhone: p.payerPhone,
    payerEmail: p.payerEmail,
    activatedAt: p.activatedAt,
    expiresAt: p.expiresAt,
    daysRemaining: daysRemaining(p),
    adminNote: p.adminNote,
    createdAt: p.createdAt,
    course: p.course
      ? {
          id: p.course.id,
          slug: p.course.slug,
          title: p.course.title,
          coverColor: p.course.coverColor,
          category: p.course.category,
          type: p.course.type,
          validityDays: p.course.validityDays,
          priceInr: p.course.priceInr,
        }
      : null,
  };
}

/**
 * POST /api/purchases  (auth, multipart/form-data)
 *
 * Fields: courseId, payerName, payerPhone, payerEmail
 * File:   receipt   (image)
 *
 * Creates a purchase row with status `pending_verification`.
 */
async function createPurchase(req, res) {
  const userId = req.user.id;
  const { courseId, payerName, payerEmail } = req.body;
  const payerPhone = normalizeIndianPhone(req.body.payerPhone);
  const receipt = req.file;

  if (!courseId || !payerName || !payerEmail) {
    return res
      .status(400)
      .json({ ok: false, error: 'All fields are required.' });
  }
  if (!payerPhone) {
    return res.status(400).json({
      ok: false,
      error: 'Enter a valid 10-digit Indian mobile number.',
    });
  }
  if (!receipt) {
    return res
      .status(400)
      .json({ ok: false, error: 'Payment receipt screenshot is required.' });
  }

  const course = await Course.findByPk(courseId);
  if (!course || !course.isPublished) {
    return res.status(404).json({ ok: false, error: 'Course not found.' });
  }

  /* Prevent stacking duplicate pending purchases for the same course */
  const existingPending = await Purchase.findOne({
    where: { userId, courseId, status: 'pending_verification' },
  });
  if (existingPending) {
    return res.status(409).json({
      ok: false,
      error: 'You already have a pending purchase for this course.',
      purchaseId: existingPending.id,
    });
  }

  const purchase = await Purchase.create({
    userId,
    courseId,
    status: 'pending_verification',
    pricePaidInr: course.priceInr,
    receiptImagePath: `/uploads/receipts/${receipt.filename}`,
    payerName,
    payerPhone,
    payerEmail,
  });

  res.status(201).json({ ok: true, purchase: publicPurchase(purchase) });
}

/** GET /api/purchases/me  (auth) — list this user's purchases */
async function listMyPurchases(req, res) {
  const userId = req.user.id;
  const purchases = await Purchase.findAll({
    where: { userId },
    include: [{ model: Course, as: 'course' }],
    order: [['createdAt', 'DESC']],
  });
  res.json({ ok: true, purchases: purchases.map(publicPurchase) });
}

module.exports = { createPurchase, listMyPurchases };
