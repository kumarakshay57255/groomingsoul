const { Op } = require('sequelize');
const { TestSubmission } = require('../models');

const REVIEW_STATUSES = ['pending', 'in_review', 'completed'];

function adminSubmission(s) {
  return {
    id: s.id,
    testSlug: s.testSlug,
    testName: s.testName,
    identity: s.identity,
    answers: s.answers,
    reviewStatus: s.reviewStatus,
    summary: s.summary,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

/** GET /api/admin/test-submissions?testSlug=…&status=…&q=… */
async function listSubmissions(req, res) {
  const where = {};
  if (typeof req.query.testSlug === 'string' && req.query.testSlug) {
    where.testSlug = req.query.testSlug;
  }
  if (typeof req.query.status === 'string') {
    if (!REVIEW_STATUSES.includes(req.query.status)) {
      return res.status(400).json({ ok: false, error: 'Invalid status' });
    }
    where.reviewStatus = req.query.status;
  }
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (q) {
    /* JSONB ->> text search on identity name/email/phone */
    where[Op.and] = [
      {
        [Op.or]: [
          require('sequelize').literal(
            `LOWER(identity->>'name') LIKE '%${q.toLowerCase().replace(/'/g, "''")}%'`
          ),
          require('sequelize').literal(
            `LOWER(identity->>'email') LIKE '%${q.toLowerCase().replace(/'/g, "''")}%'`
          ),
          require('sequelize').literal(
            `LOWER(identity->>'phone') LIKE '%${q.toLowerCase().replace(/'/g, "''")}%'`
          ),
        ],
      },
    ];
  }

  /* Don't ship the full `answers` JSONB in the list — too noisy. */
  const rows = await TestSubmission.findAll({
    where,
    attributes: {
      include: [
        [
          require('sequelize').literal('jsonb_array_length(answers)'),
          'answerCount',
        ],
      ],
      exclude: ['answers'],
    },
    order: [['createdAt', 'DESC']],
  });

  res.json({
    ok: true,
    submissions: rows.map((s) => ({
      id: s.id,
      testSlug: s.testSlug,
      testName: s.testName,
      identity: s.identity,
      reviewStatus: s.reviewStatus,
      summary: s.summary,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      answerCount: Number(s.get('answerCount') ?? 0),
    })),
  });
}

/** GET /api/admin/test-submissions/:id */
async function getSubmission(req, res) {
  const s = await TestSubmission.findByPk(req.params.id);
  if (!s) return res.status(404).json({ ok: false, error: 'Not found' });
  res.json({ ok: true, submission: adminSubmission(s) });
}

/** PATCH /api/admin/test-submissions/:id  body { reviewStatus?, summary? } */
async function updateSubmission(req, res) {
  const s = await TestSubmission.findByPk(req.params.id);
  if (!s) return res.status(404).json({ ok: false, error: 'Not found' });

  const patch = {};
  if (typeof req.body.reviewStatus === 'string') {
    if (!REVIEW_STATUSES.includes(req.body.reviewStatus)) {
      return res.status(400).json({ ok: false, error: 'Invalid review status' });
    }
    patch.reviewStatus = req.body.reviewStatus;
  }
  if (req.body.summary !== undefined) {
    patch.summary =
      typeof req.body.summary === 'string' ? req.body.summary : null;
  }
  await s.update(patch);
  res.json({ ok: true, submission: adminSubmission(s) });
}

/** DELETE /api/admin/test-submissions/:id */
async function deleteSubmission(req, res) {
  const s = await TestSubmission.findByPk(req.params.id);
  if (!s) return res.status(404).json({ ok: false, error: 'Not found' });
  await s.destroy();
  res.json({ ok: true, id: req.params.id });
}

module.exports = {
  listSubmissions,
  getSubmission,
  updateSubmission,
  deleteSubmission,
  REVIEW_STATUSES,
};
