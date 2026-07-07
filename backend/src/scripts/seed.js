/**
 * Seed script — wipes courses/modules/lessons and re-creates sample content,
 * plus ensures an admin user exists. Re-running is safe (idempotent for admin,
 * fresh for course content).
 *
 *   node src/scripts/seed.js
 */
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const {
  sequelize,
  User,
  Course,
  CourseModule,
  Lesson,
} = require('../models');

const ADMIN_EMAIL = 'grooming@admin.com';

/**
 * Placeholder video source — stored in DB as `local://samples/sample.mp4` and
 * resolved server-side by the stream controller against `backend/uploads/`.
 * One real MP4 file is bundled in `backend/uploads/samples/sample.mp4`.
 *
 * Phase 4 (admin CMS + DRM) will let admins upload real lesson MP4s and we'll
 * swap in VdoCipher / Mux signed URLs.
 */
const PLACEHOLDER_VIDEO = 'local://samples/sample.mp4';

function pickVideo() {
  return PLACEHOLDER_VIDEO;
}

const sampleCourses = [
  /* ---------------------- 11th & 12th Psychology ---------------------- */
  {
    slug: '11-12-foundations-of-psychology',
    title: 'Foundations of Psychology — Class 11',
    category: '11-12',
    type: 'academy',
    instructor: 'Faculty Panel',
    description:
      'A complete CBSE Class 11 psychology walkthrough — from the methods of psychology to social behaviour, paced for first-year clarity.',
    coverColor: '#3F5F8A',
    priceInr: 1499,
    validityDays: 90,
    estimatedHours: 32,
    modules: [
      {
        title: 'What is Psychology?',
        lessons: [
          { title: 'Domains and disciplines', durationSec: 1280 },
          { title: 'Themes of research', durationSec: 1620 },
        ],
      },
      {
        title: 'Methods of Enquiry',
        lessons: [
          { title: 'Observation, survey, experiment', durationSec: 1480 },
          { title: 'Case studies & correlational design', durationSec: 1200 },
        ],
      },
    ],
  },
  {
    slug: '11-12-class-12-applied',
    title: 'Applied Psychology — Class 12',
    category: '11-12',
    type: 'academy',
    instructor: 'Faculty Panel',
    description:
      'Class 12 CBSE psychology with a heavy focus on personality, self, stress, disorders, and therapeutic approaches.',
    coverColor: '#7A8B5A',
    priceInr: 1799,
    validityDays: 90,
    estimatedHours: 40,
    modules: [
      {
        title: 'Variations in Psychological Attributes',
        lessons: [
          { title: 'Intelligence — definitions & theories', durationSec: 1600 },
          { title: 'Personality assessment', durationSec: 1400 },
        ],
      },
      {
        title: 'Self & Personality',
        lessons: [
          { title: 'Self-concept and self-esteem', durationSec: 1100 },
          { title: 'Trait, type, and psychodynamic models', durationSec: 1750 },
        ],
      },
    ],
  },
  {
    slug: '11-12-board-rapid-revision',
    title: 'Board-Ready Rapid Revision',
    category: '11-12',
    type: 'academy',
    instructor: 'Faculty Panel',
    description:
      'A 4-week revision sprint with previous-year solved papers, mnemonics, and high-yield concept maps.',
    coverColor: '#E8946A',
    priceInr: 999,
    validityDays: 30,
    estimatedHours: 14,
    modules: [
      {
        title: 'High-Yield Concept Sprints',
        lessons: [
          { title: 'Memory, learning & motivation in 60 mins', durationSec: 3600 },
          { title: 'PYQ solve-along — 2022 & 2023', durationSec: 2700 },
        ],
      },
    ],
  },

  /* --------------------------- CUET-UG -------------------------------- */
  {
    slug: 'cuet-ug-psychology-master',
    title: 'CUET-UG Psychology — Master Course',
    category: 'cuet-ug',
    type: 'academy',
    instructor: 'Faculty Panel',
    description:
      'The CUET-UG psychology domain decoded — MCQ patterns, weightage analysis, and the official NTA syllabus done line-by-line.',
    coverColor: '#3F5F8A',
    priceInr: 2499,
    validityDays: 90,
    estimatedHours: 48,
    modules: [
      {
        title: 'Syllabus Walkthrough',
        lessons: [
          { title: 'Unit-wise weightage & strategy', durationSec: 1500 },
          { title: 'Common pitfalls in MCQ phrasing', durationSec: 1100 },
        ],
      },
      {
        title: 'Mock Series',
        lessons: [
          { title: 'Mock 1 — full solve-along', durationSec: 4200 },
          { title: 'Mock 2 — full solve-along', durationSec: 4200 },
        ],
      },
    ],
  },
  {
    slug: 'cuet-ug-crash-30-day',
    title: 'CUET-UG 30-Day Crash Plan',
    category: 'cuet-ug',
    type: 'academy',
    instructor: 'Faculty Panel',
    description:
      'A focused, daily-target plan covering the entire CUET-UG psychology syllabus in 30 days with daily quizzes.',
    coverColor: '#F5C44C',
    priceInr: 1299,
    validityDays: 30,
    estimatedHours: 24,
    modules: [
      {
        title: 'Week 1 — Foundations',
        lessons: [
          { title: 'Day 1–7 video bundle', durationSec: 4800 },
        ],
      },
      {
        title: 'Week 4 — Mock Marathon',
        lessons: [
          { title: 'Marathon Day 28', durationSec: 3600 },
          { title: 'Marathon Day 29', durationSec: 3600 },
        ],
      },
    ],
  },

  /* --------------------------- CUET-PG -------------------------------- */
  {
    slug: 'cuet-pg-psychology-bundle',
    title: 'CUET-PG Psychology — Master Bundle',
    category: 'cuet-pg',
    type: 'academy',
    instructor: 'Faculty Panel',
    description:
      'Postgrad-level CUET prep — research methods, statistics, organisational psych, and theory comparisons taught in detail.',
    coverColor: '#7A8B5A',
    priceInr: 3499,
    validityDays: 90,
    estimatedHours: 60,
    modules: [
      {
        title: 'Statistics for Psychology',
        lessons: [
          { title: 'Descriptive vs. inferential statistics', durationSec: 1900 },
          { title: 'ANOVA, t-tests, and effect sizes', durationSec: 2400 },
        ],
      },
      {
        title: 'Research Methodology',
        lessons: [
          { title: 'Design choices, sampling, validity', durationSec: 2100 },
        ],
      },
    ],
  },
  {
    slug: 'cuet-pg-research-stats-only',
    title: 'CUET-PG Stats & Research Methods',
    category: 'cuet-pg',
    type: 'academy',
    instructor: 'Faculty Panel',
    description:
      'A dedicated deep-dive into statistics and research design for psychology PG aspirants. The trickiest part — solved.',
    coverColor: '#3F5F8A',
    priceInr: 1799,
    validityDays: 90,
    estimatedHours: 22,
    modules: [
      {
        title: 'Probability & Distributions',
        lessons: [
          { title: 'Normal distribution intuition', durationSec: 1300 },
          { title: 'Central limit theorem in plain words', durationSec: 1450 },
        ],
      },
    ],
  },

  /* --------------------------- NET-JRF -------------------------------- */
  {
    slug: 'net-jrf-psychology-elite',
    title: 'UGC NET-JRF Psychology Elite Track',
    category: 'net-jrf',
    type: 'academy',
    instructor: 'Faculty Panel',
    description:
      'A complete NET-JRF psychology programme — Paper 1 + Paper 2, with previous-year analysis and active-recall flashcards.',
    coverColor: '#5C3A2E',
    priceInr: 4999,
    validityDays: 90,
    estimatedHours: 80,
    modules: [
      {
        title: 'Paper 1 — Teaching & Research Aptitude',
        lessons: [
          { title: 'Research aptitude in 90 minutes', durationSec: 5400 },
          { title: 'Teaching aptitude — exam framing', durationSec: 3600 },
        ],
      },
      {
        title: 'Paper 2 — Core Psychology',
        lessons: [
          { title: 'Psychometrics & assessment', durationSec: 4200 },
          { title: 'Clinical foundations', durationSec: 4800 },
        ],
      },
    ],
  },
  {
    slug: 'net-jrf-pyq-marathon',
    title: 'NET-JRF PYQ Marathon (2015–2024)',
    category: 'net-jrf',
    type: 'academy',
    instructor: 'Faculty Panel',
    description:
      'Every previous-year NET psychology paper solved on video with strategy commentary. Pure pattern recognition.',
    coverColor: '#E8946A',
    priceInr: 1999,
    validityDays: 90,
    estimatedHours: 28,
    modules: [
      {
        title: '2020–2024',
        lessons: [
          { title: 'Dec 2024 paper solve-along', durationSec: 3600 },
          { title: 'June 2023 paper solve-along', durationSec: 3600 },
        ],
      },
    ],
  },

  /* --------------------------- Diplomas -------------------------------- */
  {
    slug: 'diploma-cbt-foundations',
    title: 'Diploma in CBT Foundations',
    category: 'diploma',
    type: 'diploma',
    instructor: 'Advisory Panel',
    description:
      'A 60-hour certified diploma covering CBT theory, case formulation, and protocol-based intervention for anxiety and depression.',
    coverColor: '#3F5F8A',
    priceInr: 7999,
    validityDays: 180,
    estimatedHours: 60,
    modules: [
      {
        title: 'CBT Theory Foundations',
        lessons: [
          { title: 'Cognitive triangle & ABC model', durationSec: 2400 },
          { title: 'Beckian schema theory', durationSec: 2100 },
        ],
      },
      {
        title: 'Clinical Practice Tracks',
        lessons: [
          { title: 'Anxiety protocol — session 1 to 4', durationSec: 3600 },
          { title: 'Depression protocol — session 1 to 4', durationSec: 3600 },
        ],
      },
    ],
  },
  {
    slug: 'diploma-child-adolescent',
    title: 'Diploma in Child & Adolescent Psychology',
    category: 'diploma',
    type: 'diploma',
    instructor: 'Advisory Panel',
    description:
      'A specialised diploma in working with ages 6–19 — developmental stages, parenting, school refusal, ADHD, and exam anxiety.',
    coverColor: '#7A8B5A',
    priceInr: 8499,
    validityDays: 180,
    estimatedHours: 70,
    modules: [
      {
        title: 'Developmental Stages',
        lessons: [
          { title: 'Erikson revisited for practitioners', durationSec: 1800 },
        ],
      },
      {
        title: 'Common Presenting Issues',
        lessons: [
          { title: 'School refusal & separation anxiety', durationSec: 2400 },
          { title: 'Adolescent depression vs. moodiness', durationSec: 2100 },
        ],
      },
    ],
  },
  {
    slug: 'diploma-trauma-informed-care',
    title: 'Diploma in Trauma-Informed Care',
    category: 'diploma',
    type: 'diploma',
    instructor: 'Advisory Panel',
    description:
      'A 50-hour trauma-informed care diploma — polyvagal theory, somatic basics, ethical consent, and stabilisation tooling.',
    coverColor: '#E8946A',
    priceInr: 8999,
    validityDays: 180,
    estimatedHours: 50,
    modules: [
      {
        title: 'Trauma Theory',
        lessons: [
          { title: 'Big-T vs. little-t trauma', durationSec: 1500 },
        ],
      },
      {
        title: 'Stabilisation Toolkit',
        lessons: [
          { title: 'Grounding & resourcing exercises', durationSec: 2100 },
          { title: 'Working with dissociation', durationSec: 2400 },
        ],
      },
    ],
  },
];

async function ensureAdmin() {
  const tempPassword =
    process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(6).toString('hex');
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const [admin, created] = await User.findOrCreate({
    where: { email: ADMIN_EMAIL },
    defaults: {
      name: 'Grooming Souls Admin',
      email: ADMIN_EMAIL,
      phone: '+919389872523',
      passwordHash,
      role: 'admin',
      emailVerified: true,
    },
  });

  if (created) {
    console.log(`[seed] admin user created → ${ADMIN_EMAIL}`);
    console.log(`[seed] TEMP PASSWORD: ${tempPassword}  (save this now)`);
  } else {
    console.log(`[seed] admin user already exists → ${ADMIN_EMAIL}`);
  }
  return admin;
}

async function reseedCourses() {
  console.log('[seed] wiping existing courses, modules, lessons …');
  await Lesson.destroy({ where: {}, truncate: { cascade: true } });
  await CourseModule.destroy({ where: {}, truncate: { cascade: true } });
  await Course.destroy({ where: {}, truncate: { cascade: true } });

  for (const c of sampleCourses) {
    const course = await Course.create({
      slug: c.slug,
      title: c.title,
      category: c.category,
      type: c.type,
      instructor: c.instructor,
      description: c.description,
      coverColor: c.coverColor,
      priceInr: c.priceInr,
      validityDays: c.validityDays,
      estimatedHours: c.estimatedHours,
      isPublished: true,
    });

    let mIdx = 0;
    for (const m of c.modules) {
      const courseModule = await CourseModule.create({
        courseId: course.id,
        title: m.title,
        position: mIdx++,
      });

      let lIdx = 0;
      for (const l of m.lessons) {
        await Lesson.create({
          moduleId: courseModule.id,
          title: l.title,
          videoUrl: pickVideo(),
          durationSec: l.durationSec,
          position: lIdx++,
        });
      }
    }
  }
  console.log(`[seed] ${sampleCourses.length} courses created`);
}

async function run() {
  try {
    await sequelize.authenticate();
    console.log('[db] connected');

    await ensureAdmin();
    await reseedCourses();

    console.log('[seed] done ✓');
    process.exit(0);
  } catch (err) {
    console.error('[seed] failed:', err);
    process.exit(1);
  }
}

run();
