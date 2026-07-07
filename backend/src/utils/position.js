const { Op } = require('sequelize');

/**
 * Resolve a non-conflicting display position for a Sequelize model that has a
 * `position` column.
 *
 * Rules (matches the product spec "if 6 is taken, default to 7"):
 *   - Look at every other row's `position` (excludes the current row when
 *     updating, via `ignoreId`).
 *   - Starting from the requested integer, return the first position that
 *     isn't already in use.
 *   - Archived rows still occupy positions — so restoring them later won't
 *     clobber another row.
 *
 * Returns a Promise<number>.
 *
 * Usage:
 *   const position = await resolvePosition(Therapist, req.body.position, id);
 */
async function resolvePosition(Model, requested, ignoreId = null) {
  const target = Number.isFinite(Number(requested))
    ? Math.max(0, parseInt(requested, 10))
    : 0;

  const where = ignoreId ? { id: { [Op.ne]: ignoreId } } : {};
  const rows = await Model.findAll({
    where,
    attributes: ['position'],
    raw: true,
  });
  const taken = new Set(
    rows
      .map((r) => Number(r.position))
      .filter((n) => Number.isFinite(n))
  );

  let n = target;
  while (taken.has(n)) n += 1;
  return n;
}

module.exports = { resolvePosition };
