const { Op } = require('sequelize');
const { TherapyLead } = require('../models');

const STATUSES = ['new', 'contacted', 'scheduled', 'closed'];

function adminLead(l) {
  return {
    id: l.id,
    therapistId: l.therapistId,
    therapistName: l.therapistName,
    name: l.name,
    age: l.age,
    phone: l.phone,
    email: l.email,
    slot: l.slot,
    status: l.status,
    notes: l.notes,
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
  };
}

/** GET /api/admin/leads?status=…&q=… */
async function listLeads(req, res) {
  const where = {};
  if (typeof req.query.status === 'string') {
    if (!STATUSES.includes(req.query.status)) {
      return res.status(400).json({ ok: false, error: 'Invalid status' });
    }
    where.status = req.query.status;
  }
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (q) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${q}%` } },
      { email: { [Op.iLike]: `%${q}%` } },
      { phone: { [Op.iLike]: `%${q}%` } },
      { therapistName: { [Op.iLike]: `%${q}%` } },
    ];
  }
  const rows = await TherapyLead.findAll({
    where,
    order: [['createdAt', 'DESC']],
  });
  res.json({ ok: true, leads: rows.map(adminLead) });
}

/** GET /api/admin/leads/:id */
async function getLead(req, res) {
  const l = await TherapyLead.findByPk(req.params.id);
  if (!l) return res.status(404).json({ ok: false, error: 'Not found' });
  res.json({ ok: true, lead: adminLead(l) });
}

/** PATCH /api/admin/leads/:id  body { status?, notes? } */
async function updateLead(req, res) {
  const l = await TherapyLead.findByPk(req.params.id);
  if (!l) return res.status(404).json({ ok: false, error: 'Not found' });

  const patch = {};
  if (typeof req.body.status === 'string') {
    if (!STATUSES.includes(req.body.status)) {
      return res.status(400).json({ ok: false, error: 'Invalid status' });
    }
    patch.status = req.body.status;
  }
  if (req.body.notes !== undefined) {
    patch.notes =
      typeof req.body.notes === 'string' ? req.body.notes : null;
  }

  await l.update(patch);
  res.json({ ok: true, lead: adminLead(l) });
}

/** DELETE /api/admin/leads/:id */
async function deleteLead(req, res) {
  const l = await TherapyLead.findByPk(req.params.id);
  if (!l) return res.status(404).json({ ok: false, error: 'Not found' });
  await l.destroy();
  res.json({ ok: true, id: req.params.id });
}

module.exports = { listLeads, getLead, updateLead, deleteLead, STATUSES };
