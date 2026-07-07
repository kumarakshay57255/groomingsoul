/**
 * One-shot migration of the placeholder therapist roster (previously hard-
 * coded in src/lib/therapists.ts) into the new Postgres `therapists` table.
 *
 * Idempotent: if rows already exist they're left alone unless --force is passed.
 *
 *   node src/scripts/migrateTherapists.js [--force]
 */
const { sequelize, Therapist } = require('../models');

const seed = [
  {
    name: 'To be onboarded',
    designation: 'Clinical Psychologist · M.Phil',
    yearsExperience: 9,
    languages: ['English', 'Hindi'],
    specializations: ['Anxiety', 'Depression', 'Trauma'],
    bio: 'Cognitive-Behavioural Therapy practitioner working primarily with adults navigating chronic anxiety and panic.',
    acceptingNew: true,
    position: 0,
  },
  {
    name: 'To be onboarded',
    designation: 'Counselling Psychologist · MA',
    yearsExperience: 6,
    languages: ['English', 'Hindi', 'Urdu'],
    specializations: ['Relationships', 'Self-esteem', 'Family'],
    bio: 'Integrative therapist using person-centred and Gestalt approaches for relationship and family-system work.',
    acceptingNew: true,
    position: 1,
  },
  {
    name: 'To be onboarded',
    designation: 'Child & Adolescent Psychologist · PhD',
    yearsExperience: 11,
    languages: ['English', 'Hindi'],
    specializations: ['Adolescents', 'Family', 'Self-esteem'],
    bio: 'Works with teens (12–19) and parents through art-based and narrative therapy modalities.',
    acceptingNew: true,
    position: 2,
  },
  {
    name: 'To be onboarded',
    designation: 'Organisational Psychologist · MA',
    yearsExperience: 7,
    languages: ['English'],
    specializations: ['Career & Work', 'Stress & Burnout'],
    bio: 'Specialises in burnout recovery, career transitions, and high-pressure workplace dynamics.',
    acceptingNew: true,
    position: 3,
  },
  {
    name: 'To be onboarded',
    designation: 'Trauma Therapist · M.Phil',
    yearsExperience: 8,
    languages: ['English', 'Hindi'],
    specializations: ['Trauma', 'Grief', 'Anxiety'],
    bio: 'EMDR-certified trauma practitioner. Slow, somatic-aware sessions with a strong consent framework.',
    acceptingNew: false,
    position: 4,
  },
  {
    name: 'To be onboarded',
    designation: 'Clinical Psychologist · M.Phil',
    yearsExperience: 5,
    languages: ['English', 'Hindi'],
    specializations: ['Depression', 'Stress & Burnout', 'Self-esteem'],
    bio: 'ACT and mindfulness-based therapist focused on values work and depressive rumination.',
    acceptingNew: true,
    position: 5,
  },
];

async function run() {
  const force = process.argv.includes('--force');
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    const existing = await Therapist.count();
    if (existing > 0 && !force) {
      console.log(
        `[migrate] therapists table already has ${existing} row(s) — skipping. Use --force to wipe + reinsert.`
      );
      process.exit(0);
    }

    if (force) {
      console.log('[migrate] --force: wiping existing therapists');
      await Therapist.destroy({ where: {}, truncate: { cascade: true } });
    }

    await Therapist.bulkCreate(seed);
    console.log(`[migrate] inserted ${seed.length} therapist placeholders`);
    process.exit(0);
  } catch (err) {
    console.error('[migrate] failed:', err);
    process.exit(1);
  }
}

run();
