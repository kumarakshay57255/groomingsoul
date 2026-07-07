const fs = require('fs');
const path = require('path');
const env = require('../config/env');
const {
  Course,
  CourseModule,
  Lesson,
  Purchase,
  LessonProgress,
  CertificateQueue,
} = require('../models');
const { resolvePosition } = require('../utils/position');

const ACADEMY_CATEGORIES = ['11-12', 'cuet-ug', 'cuet-pg', 'net-jrf'];
const ALL_CATEGORIES = [...ACADEMY_CATEGORIES, 'diploma'];

/* ---------------------------- helpers ------------------------------ */

function deleteVideoIfExists(videoUrl) {
  if (!videoUrl || !videoUrl.startsWith('local://lessons/')) return;
  const rel = videoUrl.replace('local://', '');
  const abs = path.resolve(__dirname, '..', '..', env.uploads.dir, rel);
  fs.unlink(abs, () => {});
}

function publicCourse(c) {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    instructor: c.instructor,
    description: c.description,
    coverColor: c.coverColor,
    category: c.category,
    type: c.type,
    priceInr: c.priceInr,
    validityDays: c.validityDays,
    estimatedHours: c.estimatedHours,
    isPublished: c.isPublished,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

function adminCourseFull(c) {
  return {
    ...publicCourse(c),
    modules: (c.modules ?? []).map((m) => ({
      id: m.id,
      title: m.title,
      position: m.position,
      lessons: (m.lessons ?? []).map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description,
        durationSec: l.durationSec,
        position: l.position,
        videoUrl: l.videoUrl,
        hasVideo: !!l.videoUrl,
      })),
    })),
  };
}

/* ------------------------- course CRUD ---------------------------- */

/** GET /api/admin/courses?type=academy|diploma&category=… */
async function listCourses(req, res) {
  const where = {};
  if (req.query.type === 'academy' || req.query.type === 'diploma') {
    where.type = req.query.type;
  }
  if (typeof req.query.category === 'string') {
    if (!ALL_CATEGORIES.includes(req.query.category)) {
      return res.status(400).json({ ok: false, error: 'Invalid category' });
    }
    where.category = req.query.category;
  }
  const rows = await Course.findAll({
    where,
    order: [
      ['type', 'ASC'],
      ['category', 'ASC'],
      ['priceInr', 'ASC'],
    ],
  });
  res.json({ ok: true, courses: rows.map(publicCourse) });
}

/** GET /api/admin/courses/:id — includes modules + lessons (with videoUrl) */
async function getCourse(req, res) {
  const c = await Course.findByPk(req.params.id, {
    include: [
      {
        model: CourseModule,
        as: 'modules',
        include: [
          {
            model: Lesson,
            as: 'lessons',
          },
        ],
      },
    ],
    order: [
      [{ model: CourseModule, as: 'modules' }, 'position', 'ASC'],
      [
        { model: CourseModule, as: 'modules' },
        { model: Lesson, as: 'lessons' },
        'position',
        'ASC',
      ],
    ],
  });
  if (!c) return res.status(404).json({ ok: false, error: 'Not found' });
  res.json({ ok: true, course: adminCourseFull(c) });
}

/**
 * Safe integer coercion that distinguishes `0` from missing / null / NaN.
 * Returns `fallback` when the value is null / undefined / "" / non-finite.
 */
function toInt(value, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.trunc(n);
}

/** Same as toInt, but returns `null` (not 0) when missing — for nullable columns. */
function toOptionalInt(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

function readCourseBody(req) {
  return {
    slug: typeof req.body.slug === 'string' ? req.body.slug.trim() : '',
    title: typeof req.body.title === 'string' ? req.body.title.trim() : '',
    instructor: typeof req.body.instructor === 'string'
      ? req.body.instructor.trim() || null
      : null,
    description: typeof req.body.description === 'string'
      ? req.body.description.trim() || null
      : null,
    coverColor: typeof req.body.coverColor === 'string'
      ? req.body.coverColor.trim() || '#3F5F8A'
      : '#3F5F8A',
    category: typeof req.body.category === 'string' ? req.body.category : '',
    type: req.body.type === 'diploma' ? 'diploma' : 'academy',
    priceInr: Math.max(0, toInt(req.body.priceInr, 0)),
    validityDays: Math.max(1, toInt(req.body.validityDays, 30)),
    estimatedHours: toOptionalInt(req.body.estimatedHours),
    isPublished: String(req.body.isPublished ?? 'true').toLowerCase() !== 'false',
  };
}

async function createCourse(req, res) {
  const data = readCourseBody(req);
  if (!data.slug || !data.title) {
    return res.status(400).json({
      ok: false,
      error: 'Slug and title are required.',
    });
  }
  if (!ALL_CATEGORIES.includes(data.category)) {
    return res
      .status(400)
      .json({ ok: false, error: 'Invalid category for course.' });
  }
  /* Diploma category must pair with type=diploma and vice versa for clarity */
  if (data.type === 'diploma') data.category = 'diploma';
  else if (data.category === 'diploma') data.type = 'diploma';

  if (await Course.findOne({ where: { slug: data.slug } })) {
    return res
      .status(409)
      .json({ ok: false, error: 'A course with this slug already exists.' });
  }

  const created = await Course.create(data);
  res.status(201).json({ ok: true, course: publicCourse(created) });
}

async function updateCourse(req, res) {
  const c = await Course.findByPk(req.params.id);
  if (!c) return res.status(404).json({ ok: false, error: 'Not found' });
  const data = readCourseBody(req);
  if (!data.slug || !data.title) {
    return res
      .status(400)
      .json({ ok: false, error: 'Slug and title are required.' });
  }
  if (!ALL_CATEGORIES.includes(data.category)) {
    return res
      .status(400)
      .json({ ok: false, error: 'Invalid category for course.' });
  }
  if (data.type === 'diploma') data.category = 'diploma';
  else if (data.category === 'diploma') data.type = 'diploma';

  if (data.slug !== c.slug) {
    const dup = await Course.findOne({ where: { slug: data.slug } });
    if (dup && dup.id !== c.id) {
      return res
        .status(409)
        .json({ ok: false, error: 'A course with this slug already exists.' });
    }
  }

  await c.update(data);
  res.json({ ok: true, course: publicCourse(c) });
}

async function deleteCourse(req, res) {
  const c = await Course.findByPk(req.params.id, {
    include: [
      { model: CourseModule, as: 'modules', include: [{ model: Lesson, as: 'lessons' }] },
      { model: Purchase, as: 'purchases' },
    ],
  });
  if (!c) return res.status(404).json({ ok: false, error: 'Not found' });

  const hasActivePurchases = (c.purchases ?? []).some(
    (p) => p.status === 'active' || p.status === 'pending_verification'
  );
  if (hasActivePurchases && req.query.force !== '1') {
    return res.status(409).json({
      ok: false,
      error:
        'This course has active or pending purchases. Add ?force=1 to delete anyway (you should usually unpublish instead).',
    });
  }

  /* Unlink every lesson video file from disk before cascading delete */
  for (const m of c.modules ?? []) {
    for (const l of m.lessons ?? []) deleteVideoIfExists(l.videoUrl);
  }

  await c.destroy();
  res.json({ ok: true, id: req.params.id });
}

/* --------------------------- modules ------------------------------- */

async function createModule(req, res) {
  const courseId = req.params.id;
  const c = await Course.findByPk(courseId);
  if (!c) return res.status(404).json({ ok: false, error: 'Course not found' });

  const title =
    typeof req.body.title === 'string' ? req.body.title.trim() : '';
  if (!title) {
    return res.status(400).json({ ok: false, error: 'Title is required.' });
  }

  const requested = Math.max(0, toInt(req.body.position, 0));

  /* Resolve a non-conflicting position within this course's modules. */
  const siblings = await CourseModule.findAll({
    where: { courseId },
    attributes: ['position'],
    raw: true,
  });
  const taken = new Set(siblings.map((s) => Number(s.position)));
  let position = Math.max(0, requested);
  while (taken.has(position)) position += 1;

  const created = await CourseModule.create({ courseId, title, position });
  res.status(201).json({
    ok: true,
    module: { id: created.id, title: created.title, position: created.position, lessons: [] },
  });
}

async function updateModule(req, res) {
  const m = await CourseModule.findByPk(req.params.moduleId);
  if (!m) return res.status(404).json({ ok: false, error: 'Not found' });

  const title =
    typeof req.body.title === 'string' ? req.body.title.trim() : m.title;
  if (!title) {
    return res.status(400).json({ ok: false, error: 'Title cannot be empty.' });
  }

  let position = m.position;
  if (req.body.position !== undefined) {
    const requested = Math.max(0, toInt(req.body.position, 0));
    const siblings = await CourseModule.findAll({
      where: { courseId: m.courseId },
      attributes: ['id', 'position'],
      raw: true,
    });
    const taken = new Set(
      siblings.filter((s) => s.id !== m.id).map((s) => Number(s.position))
    );
    position = Math.max(0, requested);
    while (taken.has(position)) position += 1;
  }

  await m.update({ title, position });
  res.json({
    ok: true,
    module: { id: m.id, title: m.title, position: m.position },
  });
}

async function deleteModule(req, res) {
  const m = await CourseModule.findByPk(req.params.moduleId, {
    include: [{ model: Lesson, as: 'lessons' }],
  });
  if (!m) return res.status(404).json({ ok: false, error: 'Not found' });
  for (const l of m.lessons ?? []) deleteVideoIfExists(l.videoUrl);
  await m.destroy();
  res.json({ ok: true, id: req.params.moduleId });
}

/* --------------------------- lessons ------------------------------- */

function readLessonBody(req) {
  return {
    title: typeof req.body.title === 'string' ? req.body.title.trim() : '',
    description:
      typeof req.body.description === 'string'
        ? req.body.description.trim() || null
        : null,
    durationSec: Math.max(0, toInt(req.body.durationSec, 0)),
    requestedPosition: Math.max(0, toInt(req.body.position, 0)),
  };
}

async function resolveLessonPosition(moduleId, requested, ignoreId = null) {
  const siblings = await Lesson.findAll({
    where: { moduleId },
    attributes: ['id', 'position'],
    raw: true,
  });
  const taken = new Set(
    siblings
      .filter((s) => s.id !== ignoreId)
      .map((s) => Number(s.position))
  );
  let position = Math.max(0, requested);
  while (taken.has(position)) position += 1;
  return position;
}

async function createLesson(req, res) {
  const moduleId = req.params.moduleId;
  const m = await CourseModule.findByPk(moduleId);
  if (!m) return res.status(404).json({ ok: false, error: 'Module not found' });

  const data = readLessonBody(req);
  if (!data.title) {
    return res.status(400).json({ ok: false, error: 'Title is required.' });
  }

  let videoUrl = null;
  if (req.file) {
    videoUrl = `local://lessons/${req.file.filename}`;
  }

  const position = await resolveLessonPosition(moduleId, data.requestedPosition);

  const created = await Lesson.create({
    moduleId,
    title: data.title,
    description: data.description,
    durationSec: data.durationSec,
    position,
    videoUrl,
  });
  res.status(201).json({
    ok: true,
    lesson: {
      id: created.id,
      title: created.title,
      description: created.description,
      durationSec: created.durationSec,
      position: created.position,
      videoUrl: created.videoUrl,
      hasVideo: !!created.videoUrl,
    },
  });
}

async function updateLesson(req, res) {
  const l = await Lesson.findByPk(req.params.lessonId);
  if (!l) return res.status(404).json({ ok: false, error: 'Not found' });

  const data = readLessonBody(req);
  if (!data.title) {
    return res.status(400).json({ ok: false, error: 'Title cannot be empty.' });
  }

  let videoUrl = l.videoUrl;
  if (req.file) {
    deleteVideoIfExists(l.videoUrl);
    videoUrl = `local://lessons/${req.file.filename}`;
  } else if (String(req.body.removeVideo ?? '').toLowerCase() === '1') {
    deleteVideoIfExists(l.videoUrl);
    videoUrl = null;
  }

  const position = await resolveLessonPosition(
    l.moduleId,
    data.requestedPosition,
    l.id
  );

  await l.update({
    title: data.title,
    description: data.description,
    durationSec: data.durationSec,
    position,
    videoUrl,
  });

  res.json({
    ok: true,
    lesson: {
      id: l.id,
      title: l.title,
      description: l.description,
      durationSec: l.durationSec,
      position: l.position,
      videoUrl: l.videoUrl,
      hasVideo: !!l.videoUrl,
    },
  });
}

async function deleteLesson(req, res) {
  const l = await Lesson.findByPk(req.params.lessonId);
  if (!l) return res.status(404).json({ ok: false, error: 'Not found' });

  /* Also clean lesson_progress + (any) cert queue rows would orphan,
     but Postgres cascades both via the FK. */
  deleteVideoIfExists(l.videoUrl);
  await l.destroy();
  res.json({ ok: true, id: req.params.lessonId });
}

module.exports = {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
  ALL_CATEGORIES,
};
