/**
 * Migrates the existing hardcoded advisory placeholders into the
 * advisory_members table.
 *
 *   node src/scripts/migrateAdvisory.js [--force]
 */
const { sequelize, AdvisoryMember } = require('../models');

const seed = [
  { name: 'Dr. To be onboarded', role: 'Clinical Psychologist · PhD', position: 0 },
  { name: 'Dr. To be onboarded', role: 'Psychiatrist · MD', position: 1 },
  { name: 'Dr. To be onboarded', role: 'Neuropsychologist · MPhil', position: 2 },
  { name: 'Dr. To be onboarded', role: 'Counselling Psychologist · MA', position: 3 },
  { name: 'Dr. To be onboarded', role: 'Child & Adolescent · PhD', position: 4 },
  { name: 'Dr. To be onboarded', role: 'Organisational · PhD', position: 5 },
];

async function run() {
  const force = process.argv.includes('--force');
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    const existing = await AdvisoryMember.count();
    if (existing > 0 && !force) {
      console.log(
        `[migrate] advisory_members already has ${existing} row(s) — skipping. Pass --force to wipe + reinsert.`
      );
      process.exit(0);
    }
    if (force) {
      console.log('[migrate] --force: wiping advisory_members');
      await AdvisoryMember.destroy({ where: {}, truncate: { cascade: true } });
    }
    await AdvisoryMember.bulkCreate(seed);
    console.log(`[migrate] inserted ${seed.length} advisory placeholders`);
    process.exit(0);
  } catch (err) {
    console.error('[migrate] failed:', err);
    process.exit(1);
  }
}

run();
