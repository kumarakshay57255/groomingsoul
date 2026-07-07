const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User } = require('../models');
const { normalizeIndianPhone } = require('../utils/phone');
const env = require('../config/env');

const STAFF_ROLES = ['admin', 'intern'];

function adminStaff(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    isActive: u.isActive,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

/** GET /api/admin/staff?role=…&q=… */
async function listStaff(req, res) {
  const where = { role: { [Op.in]: STAFF_ROLES } };
  if (typeof req.query.role === 'string') {
    if (!STAFF_ROLES.includes(req.query.role)) {
      return res.status(400).json({ ok: false, error: 'Invalid role' });
    }
    where.role = req.query.role;
  }
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (q) {
    where[Op.and] = [
      where[Op.and] ?? {},
      {
        [Op.or]: [
          { name: { [Op.iLike]: `%${q}%` } },
          { email: { [Op.iLike]: `%${q}%` } },
          { phone: { [Op.iLike]: `%${q}%` } },
        ],
      },
    ];
  }
  const rows = await User.findAll({
    where,
    order: [
      ['isActive', 'DESC'],
      ['role', 'ASC'],
      ['createdAt', 'ASC'],
    ],
  });
  res.json({ ok: true, staff: rows.map(adminStaff) });
}

/**
 * POST /api/admin/staff
 *
 * Body: { name, email, phone, role }
 *
 * Creates a new staff account with a randomly generated temporary password.
 * In Phase 4 the temp password is returned in the JSON response so the admin
 * can share it manually; Phase 5 will mail it instead.
 */
async function inviteStaff(req, res) {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const role = typeof req.body.role === 'string' ? req.body.role : 'intern';
  const phone = normalizeIndianPhone(req.body.phone);

  if (!name || !email) {
    return res.status(400).json({ ok: false, error: 'Name and email are required.' });
  }
  if (!STAFF_ROLES.includes(role)) {
    return res.status(400).json({ ok: false, error: 'Invalid role.' });
  }
  if (!phone) {
    return res
      .status(400)
      .json({ ok: false, error: 'Enter a valid 10-digit Indian mobile number.' });
  }

  const exists = await User.findOne({ where: { email } });
  if (exists) {
    return res
      .status(409)
      .json({ ok: false, error: 'A user with this email already exists.' });
  }

  const tempPassword = crypto.randomBytes(6).toString('base64url');
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const user = await User.create({
    name,
    email,
    phone,
    passwordHash,
    role,
    isActive: true,
    emailVerified: false,
  });

  console.log(
    `[staff] invited ${role} ${email} — TEMP PASSWORD: ${tempPassword}`
  );

  const body = { ok: true, staff: adminStaff(user) };
  if (env.nodeEnv !== 'production') body.devTempPassword = tempPassword;
  res.status(201).json(body);
}

/** PATCH /api/admin/staff/:id  body { role?, isActive? } */
async function updateStaff(req, res) {
  const target = await User.findByPk(req.params.id);
  if (!target) return res.status(404).json({ ok: false, error: 'Not found' });
  if (!STAFF_ROLES.includes(target.role)) {
    return res
      .status(400)
      .json({ ok: false, error: 'Only staff users can be updated here.' });
  }

  const patch = {};
  if (typeof req.body.role === 'string') {
    if (!STAFF_ROLES.includes(req.body.role)) {
      return res.status(400).json({ ok: false, error: 'Invalid role.' });
    }
    if (target.id === req.user.id && req.body.role !== target.role) {
      return res.status(400).json({
        ok: false,
        error: 'You cannot change your own role.',
      });
    }
    patch.role = req.body.role;
  }
  if (req.body.isActive !== undefined) {
    const next = !!req.body.isActive;
    if (target.id === req.user.id && next === false) {
      return res.status(400).json({
        ok: false,
        error: 'You cannot deactivate your own account.',
      });
    }
    patch.isActive = next;
  }
  if (typeof req.body.name === 'string' && req.body.name.trim()) {
    patch.name = req.body.name.trim();
  }
  if (req.body.phone !== undefined) {
    const normalized = normalizeIndianPhone(req.body.phone);
    if (!normalized) {
      return res
        .status(400)
        .json({ ok: false, error: 'Enter a valid 10-digit Indian mobile number.' });
    }
    patch.phone = normalized;
  }

  await target.update(patch);
  res.json({ ok: true, staff: adminStaff(target) });
}

/** DELETE /api/admin/staff/:id — refuses self-delete + last-admin delete */
async function deleteStaff(req, res) {
  const target = await User.findByPk(req.params.id);
  if (!target) return res.status(404).json({ ok: false, error: 'Not found' });
  if (!STAFF_ROLES.includes(target.role)) {
    return res
      .status(400)
      .json({ ok: false, error: 'Only staff users can be deleted here.' });
  }
  if (target.id === req.user.id) {
    return res
      .status(400)
      .json({ ok: false, error: 'You cannot delete your own account.' });
  }
  if (target.role === 'admin') {
    const otherAdmins = await User.count({
      where: {
        role: 'admin',
        isActive: true,
        id: { [Op.ne]: target.id },
      },
    });
    if (otherAdmins === 0) {
      return res.status(400).json({
        ok: false,
        error:
          'Cannot delete the last active admin. Promote another user first.',
      });
    }
  }
  await target.destroy();
  res.json({ ok: true, id: req.params.id });
}

module.exports = { listStaff, inviteStaff, updateStaff, deleteStaff, STAFF_ROLES };
