/**
 * Seeds the team_members table + foundation_content row with the existing
 * placeholder data previously hardcoded in the frontend.
 *
 * Idempotent: skips if rows already exist unless --force is passed.
 *
 *   node src/scripts/migrateTeam.js [--force]
 */
const { sequelize, TeamMember, FoundationContent } = require('../models');

const seedTeam = [
  {
    name: 'Arhama Malik',
    role: 'Founder & Director',
    bio: 'Founder, writer, and psychology researcher building Grooming Souls as a stigma-free space for mental health and academic excellence.',
    isFounder: true,
    position: 0,
  },
  {
    name: 'To be onboarded',
    role: 'Managing Director',
    bio: null,
    isFounder: false,
    position: 1,
  },
  {
    name: 'To be onboarded',
    role: 'Head of Therapy',
    bio: null,
    isFounder: false,
    position: 2,
  },
];

const seedContent = {
  founderMessage:
    'My journey into psychology began with a simple realization: human minds are deeply intricate, filled with unseen depths that deserve empathy, understanding, and structural support. Grooming Souls was born out of a vision to bridge the massive gap between academic mental-health knowledge and real-world compassionate care.\n\nWhether you are a student striving for academic excellence or an individual seeking emotional clarity — Grooming Souls is your safe space to evolve, heal, and excel.',
  founderQuote: '— Arhama Malik',
  vision:
    'A stigma-free India where mental-health resources are accessible, professional guidance is transparent, and the next generation of psychology students is empowered with cutting-edge training.',
  mission:
    'Provide zero-cost outreach and standardized psychometric testing, deliver top-tier exam prep with secure tech, and train ethical mental-health professionals under our Advisory Panel.',
};

async function run() {
  const force = process.argv.includes('--force');
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    const existingTeam = await TeamMember.count();
    if (existingTeam > 0 && !force) {
      console.log(
        `[migrate] team_members already has ${existingTeam} row(s) — skipping team seed.`
      );
    } else {
      if (force) {
        console.log('[migrate] --force: wiping team_members');
        await TeamMember.destroy({ where: {}, truncate: { cascade: true } });
      }
      await TeamMember.bulkCreate(seedTeam);
      console.log(`[migrate] inserted ${seedTeam.length} team members`);
    }

    const [content, contentCreated] = await FoundationContent.findOrCreate({
      where: { id: 'singleton' },
      defaults: { id: 'singleton', ...seedContent },
    });
    if (contentCreated) {
      console.log('[migrate] foundation_content created');
    } else if (force) {
      await content.update(seedContent);
      console.log('[migrate] foundation_content reset to defaults');
    } else {
      console.log('[migrate] foundation_content already exists — left as is');
    }

    process.exit(0);
  } catch (err) {
    console.error('[migrate] failed:', err);
    process.exit(1);
  }
}

run();
