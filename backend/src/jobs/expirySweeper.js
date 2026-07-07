const { Op } = require('sequelize');
const cron = require('node-cron');
const { Purchase } = require('../models');

/**
 * Flips active purchases whose `expiresAt` has passed to `status='expired'`.
 * Returns the count flipped.
 *
 * Called by:
 *   - hourly cron (production-ish behaviour, see startExpirySweeper)
 *   - admin POST /api/admin/cron/expire (manual trigger for testing)
 *   - server boot (one-shot sweep so we never serve a stale "active" row)
 */
async function runExpirySweep() {
  const [count] = await Purchase.update(
    { status: 'expired' },
    {
      where: {
        status: 'active',
        expiresAt: { [Op.lte]: new Date() },
      },
    }
  );
  if (count > 0) {
    console.log(`[cron] expired ${count} purchase${count === 1 ? '' : 's'}`);
  }
  return count;
}

function startExpirySweeper() {
  /* One sweep at boot to catch anything that expired while the server was off */
  runExpirySweep().catch((err) =>
    console.error('[cron] boot sweep failed:', err.message)
  );

  /* Hourly thereafter */
  cron.schedule('0 * * * *', () => {
    runExpirySweep().catch((err) =>
      console.error('[cron] hourly sweep failed:', err.message)
    );
  });

  console.log('[cron] expiry sweeper scheduled · hourly');
}

module.exports = { runExpirySweep, startExpirySweeper };
