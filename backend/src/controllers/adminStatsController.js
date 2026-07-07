const { Op } = require('sequelize');
const {
  User,
  Course,
  Purchase,
  TherapyLead,
  TestSubmission,
  CertificateQueue,
} = require('../models');

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * GET /api/admin/stats
 *
 * Aggregates KPIs for the admin dashboard. Single endpoint to keep the
 * dashboard render fast (one round-trip) and consistent.
 */
async function getAdminStats(_req, res) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sevenDaysAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const todayStart = startOfDay(now);

  const [
    pendingPurchases,
    activePurchases,
    expiringSoon,
    leads7d,
    leadsToday,
    testSubs7d,
    testSubsPendingReview,
    certificateQueueOpen,
    totalStudents,
    activeCourses,
    diplomaCourses,
    revenue30d,
    recentLeads,
    recentPurchases,
  ] = await Promise.all([
    Purchase.count({ where: { status: 'pending_verification' } }),
    Purchase.count({ where: { status: 'active' } }),
    Purchase.count({
      where: {
        status: 'active',
        expiresAt: { [Op.gt]: now, [Op.lt]: sevenDaysAhead },
      },
    }),
    TherapyLead.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo } } }),
    TherapyLead.count({ where: { createdAt: { [Op.gte]: todayStart } } }),
    TestSubmission.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo } } }),
    TestSubmission.count({ where: { reviewStatus: 'pending' } }),
    CertificateQueue.count({
      where: { status: { [Op.in]: ['queued', 'printed'] } },
    }),
    User.count({ where: { role: 'student' } }),
    Course.count({ where: { isPublished: true } }),
    Course.count({ where: { isPublished: true, type: 'diploma' } }),
    Purchase.sum('pricePaidInr', {
      where: {
        status: { [Op.in]: ['active', 'expired'] },
        createdAt: { [Op.gte]: thirtyDaysAgo },
      },
    }),
    TherapyLead.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name', 'email', 'phone', 'status', 'createdAt'],
    }),
    Purchase.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      attributes: [
        'id',
        'status',
        'pricePaidInr',
        'payerName',
        'createdAt',
        'courseId',
      ],
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['title', 'slug'],
        },
      ],
    }),
  ]);

  res.json({
    ok: true,
    stats: {
      pendingPurchases,
      activePurchases,
      expiringSoon,
      leads7d,
      leadsToday,
      testSubs7d,
      testSubsPendingReview,
      certificateQueueOpen,
      totalStudents,
      activeCourses,
      diplomaCourses,
      revenue30d: revenue30d ?? 0,
    },
    recent: {
      leads: recentLeads.map((l) => ({
        id: l.id,
        name: l.name,
        email: l.email,
        phone: l.phone,
        status: l.status,
        createdAt: l.createdAt,
      })),
      purchases: recentPurchases.map((p) => ({
        id: p.id,
        status: p.status,
        pricePaidInr: p.pricePaidInr,
        payerName: p.payerName,
        createdAt: p.createdAt,
        courseTitle: p.course?.title ?? null,
      })),
    },
  });
}

module.exports = { getAdminStats };
