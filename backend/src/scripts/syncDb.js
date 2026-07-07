const { sequelize } = require('../models');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('[db] connected');

    const force = process.argv.includes('--force');
    const alter = process.argv.includes('--alter') || !force;

    if (force) {
      console.log('[db] force-syncing (DROP + CREATE all tables) …');
      await sequelize.sync({ force: true });
    } else if (alter) {
      console.log('[db] alter-syncing (ADD/CHANGE columns as needed) …');
      await sequelize.sync({ alter: true });
    } else {
      await sequelize.sync();
    }

    console.log('[db] sync complete ✓');
    process.exit(0);
  } catch (err) {
    console.error('[db] sync failed:', err);
    process.exit(1);
  }
}

run();
