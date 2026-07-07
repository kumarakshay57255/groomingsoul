const {
  Purchase,
  Course,
  CourseModule,
  Lesson,
  LessonProgress,
  CertificateQueue,
} = require('../models');
const { signStreamToken } = require('../utils/streamToken');

/**
 * Derive effective access state from the DB row + current time.
 * The DB status is updated lazily by the cron in 3.11, so we always cross-
 * check `expiresAt` here for instant truth.
 */
function deriveAccess(purchase) {
  const now = Date.now();
  if (purchase.status === 'active' && purchase.expiresAt) {
    if (new Date(purchase.expiresAt).getTime() <= now) {
      return { status: 'expired', isUnlocked: false };
    }
    return { status: 'active', isUnlocked: true };
  }
  return { status: purchase.status, isUnlocked: false };
}

function daysBetween(a, b) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/**
 * GET /api/dashboard/courses/:purchaseId
 *
 * Returns the curriculum tree for an owned purchase. Lessons include title
 * and duration, plus the user's completion status — but no video URL.
 * (The signed video URL endpoint lands in 3.10.)
 */
async function getPurchaseCurriculum(req, res) {
  const userId = req.user.id;
  const { purchaseId } = req.params;

  const purchase = await Purchase.findOne({
    where: { id: purchaseId, userId },
    include: [
      {
        model: Course,
        as: 'course',
        include: [
          {
            model: CourseModule,
            as: 'modules',
            include: [
              {
                model: Lesson,
                as: 'lessons',
                attributes: ['id', 'title', 'durationSec', 'position'],
              },
            ],
          },
        ],
      },
    ],
    order: [
      [{ model: Course, as: 'course' }, { model: CourseModule, as: 'modules' }, 'position', 'ASC'],
      [
        { model: Course, as: 'course' },
        { model: CourseModule, as: 'modules' },
        { model: Lesson, as: 'lessons' },
        'position',
        'ASC',
      ],
    ],
  });

  if (!purchase) {
    return res.status(404).json({ ok: false, error: 'Purchase not found.' });
  }

  const access = deriveAccess(purchase);

  /* Lesson completion map for this user */
  const lessonIds = [];
  purchase.course.modules.forEach((m) => m.lessons.forEach((l) => lessonIds.push(l.id)));

  const progress = lessonIds.length
    ? await LessonProgress.findAll({
        where: { userId, lessonId: lessonIds },
        attributes: ['lessonId', 'completedAt'],
      })
    : [];
  const completedById = new Map(progress.map((p) => [p.lessonId, p.completedAt]));

  const modules = purchase.course.modules.map((m) => ({
    id: m.id,
    title: m.title,
    position: m.position,
    lessons: m.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      durationSec: l.durationSec,
      position: l.position,
      completedAt: completedById.get(l.id) ?? null,
    })),
  }));

  const totalLessons = modules.reduce((n, m) => n + m.lessons.length, 0);
  const completedLessons = progress.length;

  res.json({
    ok: true,
    purchase: {
      id: purchase.id,
      status: access.status,
      isUnlocked: access.isUnlocked,
      activatedAt: purchase.activatedAt,
      expiresAt: purchase.expiresAt,
      daysRemaining: purchase.expiresAt
        ? daysBetween(new Date(), purchase.expiresAt)
        : null,
      adminNote: purchase.adminNote,
      receiptImagePath: purchase.receiptImagePath,
      course: {
        id: purchase.course.id,
        slug: purchase.course.slug,
        title: purchase.course.title,
        category: purchase.course.category,
        type: purchase.course.type,
        coverColor: purchase.course.coverColor,
        instructor: purchase.course.instructor,
        description: purchase.course.description,
        validityDays: purchase.course.validityDays,
        priceInr: purchase.course.priceInr,
      },
      modules,
      progress: {
        totalLessons,
        completedLessons,
        percent: totalLessons
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0,
      },
    },
  });
}

/**
 * Helper — looks up a lesson the caller is allowed to access. Verifies an
 * active purchase exists for the course this lesson belongs to.
 *
 * Returns `{ lesson, purchase, module, course }` or `null` if no access.
 */
async function loadAccessibleLesson(userId, lessonId) {
  const lesson = await Lesson.findByPk(lessonId, {
    include: [
      {
        model: CourseModule,
        as: 'module',
        include: [{ model: Course, as: 'course' }],
      },
    ],
  });
  if (!lesson) return null;

  const courseId = lesson.module.course.id;
  const purchase = await Purchase.findOne({
    where: { userId, courseId, status: 'active' },
    include: [{ model: Course, as: 'course' }],
  });
  if (!purchase) return null;
  if (purchase.expiresAt && new Date(purchase.expiresAt) <= new Date()) {
    return null;
  }

  return {
    lesson,
    purchase,
    module: lesson.module,
    course: lesson.module.course,
  };
}

/**
 * GET /api/dashboard/lessons/:lessonId
 * Returns lesson metadata + a short-lived signed stream URL.
 */
async function getLesson(req, res) {
  const userId = req.user.id;
  const { lessonId } = req.params;

  const ctx = await loadAccessibleLesson(userId, lessonId);
  if (!ctx) {
    return res.status(403).json({
      ok: false,
      error: 'You do not have active access to this lesson.',
    });
  }

  const { lesson, purchase, course, module: courseModule } = ctx;

  /* Build sibling list for prev/next navigation (within the same course) */
  const siblings = await Lesson.findAll({
    where: {},
    include: [
      {
        model: CourseModule,
        as: 'module',
        required: true,
        where: { courseId: course.id },
      },
    ],
    attributes: ['id', 'title', 'position', 'moduleId'],
    order: [
      [{ model: CourseModule, as: 'module' }, 'position', 'ASC'],
      ['position', 'ASC'],
    ],
  });
  const siblingIds = siblings.map((s) => s.id);
  const idx = siblingIds.indexOf(lesson.id);
  const prevId = idx > 0 ? siblingIds[idx - 1] : null;
  const nextId = idx >= 0 && idx < siblingIds.length - 1 ? siblingIds[idx + 1] : null;

  const completed = await LessonProgress.findOne({
    where: { userId, lessonId: lesson.id },
  });

  const token = signStreamToken({
    userId,
    lessonId: lesson.id,
    purchaseId: purchase.id,
    sourceUrl: lesson.videoUrl,
  });

  res.json({
    ok: true,
    lesson: {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      durationSec: lesson.durationSec,
      streamUrl: `/api/stream/${encodeURIComponent(token)}`,
      completedAt: completed?.completedAt ?? null,
    },
    module: { id: courseModule.id, title: courseModule.title },
    course: {
      id: course.id,
      slug: course.slug,
      title: course.title,
      type: course.type,
      coverColor: course.coverColor,
    },
    purchase: {
      id: purchase.id,
      expiresAt: purchase.expiresAt,
      daysRemaining: purchase.expiresAt
        ? daysBetween(new Date(), purchase.expiresAt)
        : null,
    },
    navigation: {
      prevLessonId: prevId,
      nextLessonId: nextId,
      lessonIndex: idx + 1,
      lessonTotal: siblingIds.length,
    },
  });
}

/**
 * POST /api/dashboard/lessons/:lessonId/complete
 * Marks the lesson complete for the calling user. If completing this lesson
 * brings the course to 100% AND the course is a diploma, queue a certificate.
 */
async function markLessonComplete(req, res) {
  const userId = req.user.id;
  const { lessonId } = req.params;

  const ctx = await loadAccessibleLesson(userId, lessonId);
  if (!ctx) {
    return res
      .status(403)
      .json({ ok: false, error: 'No active access for this lesson.' });
  }
  const { course } = ctx;

  await LessonProgress.findOrCreate({
    where: { userId, lessonId },
    defaults: { userId, lessonId, completedAt: new Date() },
  });

  /* Count total lessons in this course + how many this user has completed */
  const allLessons = await Lesson.findAll({
    where: {},
    include: [
      {
        model: CourseModule,
        as: 'module',
        required: true,
        where: { courseId: course.id },
        attributes: [],
      },
    ],
    attributes: ['id'],
  });
  const lessonIds = allLessons.map((l) => l.id);
  const completedCount = await LessonProgress.count({
    where: { userId, lessonId: lessonIds },
  });

  const totalCount = lessonIds.length;
  const fullyComplete = totalCount > 0 && completedCount === totalCount;

  /* Queue certificate dispatch for completed diplomas (no auto-PDF, per spec) */
  let certificateQueued = false;
  if (fullyComplete && course.type === 'diploma') {
    const [, created] = await CertificateQueue.findOrCreate({
      where: { userId, courseId: course.id },
      defaults: {
        userId,
        courseId: course.id,
        status: 'queued',
        shippingName: req.user.name,
        shippingPhone: req.user.phone,
      },
    });
    certificateQueued = created;
  }

  res.json({
    ok: true,
    progress: {
      completedLessons: completedCount,
      totalLessons: totalCount,
      percent: totalCount ? Math.round((completedCount / totalCount) * 100) : 0,
    },
    certificateQueued,
  });
}

module.exports = {
  getPurchaseCurriculum,
  getLesson,
  markLessonComplete,
};
