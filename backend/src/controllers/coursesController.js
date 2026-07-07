const { Course, CourseModule, Lesson } = require('../models');

const ACADEMY_CATEGORIES = ['11-12', 'cuet-ug', 'cuet-pg', 'net-jrf'];

/**
 * Strip sensitive fields from a course row.
 * The `videoUrl` of each lesson is intentionally omitted from public payloads —
 * those are served only via the authenticated dashboard endpoint once a user
 * has an active purchase.
 */
function publicCourse(course) {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    instructor: course.instructor,
    description: course.description,
    coverColor: course.coverColor,
    category: course.category,
    type: course.type,
    priceInr: course.priceInr,
    validityDays: course.validityDays,
    estimatedHours: course.estimatedHours,
    isPublished: course.isPublished,
  };
}

function publicCourseDetail(course) {
  const modules = (course.modules || []).map((m) => ({
    id: m.id,
    title: m.title,
    position: m.position,
    lessons: (m.lessons || []).map((l) => ({
      id: l.id,
      title: l.title,
      durationSec: l.durationSec,
      position: l.position,
    })),
  }));
  return { ...publicCourse(course), modules };
}

/* GET /api/courses?type=academy[&category=11-12|cuet-ug|cuet-pg|net-jrf] */
async function listCourses(req, res) {
  const type = req.query.type === 'diploma' ? 'diploma' : 'academy';
  const category = typeof req.query.category === 'string' ? req.query.category : null;

  const where = { type, isPublished: true };
  if (category) {
    if (type === 'academy' && !ACADEMY_CATEGORIES.includes(category)) {
      return res.status(400).json({ ok: false, error: 'Invalid category' });
    }
    where.category = category;
  }

  const courses = await Course.findAll({
    where,
    order: [
      ['category', 'ASC'],
      ['priceInr', 'ASC'],
    ],
  });

  res.json({ ok: true, courses: courses.map(publicCourse) });
}

/* GET /api/courses/:slug — public detail (no videoUrls) */
async function getCourse(req, res) {
  const { slug } = req.params;
  const course = await Course.findOne({
    where: { slug, isPublished: true },
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

  if (!course) {
    return res.status(404).json({ ok: false, error: 'Course not found' });
  }

  res.json({ ok: true, course: publicCourseDetail(course) });
}

module.exports = { listCourses, getCourse, ACADEMY_CATEGORIES };
