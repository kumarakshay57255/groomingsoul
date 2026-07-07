const fs = require('fs');
const path = require('path');
const env = require('../config/env');
const { TeamMember, FoundationContent } = require('../models');
const { resolvePosition } = require('../utils/position');

const TEAM_CATEGORIES = ['leadership', 'clinical', 'associate'];

function publicMember(m) {
  return {
    id: m.id,
    name: m.name,
    role: m.role,
    category: m.category,
    bio: m.bio,
    photoPath: m.photoPath,
    isFounder: m.isFounder,
    position: m.position,
  };
}

function adminMember(m) {
  return {
    ...publicMember(m),
    isArchived: m.isArchived,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}

function deletePhotoIfExists(photoPath) {
  if (!photoPath || !photoPath.startsWith('/uploads/team/')) return;
  const rel = photoPath.replace('/uploads/', '');
  const abs = path.resolve(__dirname, '..', '..', env.uploads.dir, rel);
  fs.unlink(abs, () => {});
}

function readBody(req) {
  const isFounder = String(req.body.isFounder ?? 'false').toLowerCase() === 'true';
  const rawCategory =
    typeof req.body.category === 'string' ? req.body.category.trim().toLowerCase() : '';
  const category = TEAM_CATEGORIES.includes(rawCategory) ? rawCategory : 'associate';
  return {
    name: typeof req.body.name === 'string' ? req.body.name.trim() : '',
    role: typeof req.body.role === 'string' ? req.body.role.trim() : '',
    category,
    bio: typeof req.body.bio === 'string' ? req.body.bio.trim() : null,
    isFounder,
    position: Number.isFinite(Number(req.body.position))
      ? parseInt(req.body.position, 10)
      : 0,
  };
}

/* ----------------------------- Public ----------------------------- */

/** GET /api/team — non-archived team members in display order */
async function listPublicTeam(_req, res) {
  const rows = await TeamMember.findAll({
    where: { isArchived: false },
    order: [
      ['isFounder', 'DESC'],
      ['position', 'ASC'],
      ['createdAt', 'ASC'],
    ],
  });
  res.json({ ok: true, team: rows.map(publicMember) });
}

/** GET /api/foundation-content — editable founder message / vision / mission */
async function getFoundationContent(_req, res) {
  let row = await FoundationContent.findByPk('singleton');
  if (!row) row = await FoundationContent.create({ id: 'singleton' });
  res.json({
    ok: true,
    content: {
      founderMessage: row.founderMessage,
      founderQuote: row.founderQuote,
      vision: row.vision,
      mission: row.mission,
    },
  });
}

/* ----------------------------- Admin ----------------------------- */

/* GET /api/admin/team?archived=1 */
async function listTeam(req, res) {
  const where = req.query.archived === '1' ? {} : { isArchived: false };
  const rows = await TeamMember.findAll({
    where,
    order: [
      ['isFounder', 'DESC'],
      ['position', 'ASC'],
      ['createdAt', 'ASC'],
    ],
  });
  res.json({ ok: true, team: rows.map(adminMember) });
}

/* POST /api/admin/team (multipart) */
async function createMember(req, res) {
  const data = readBody(req);
  if (!data.name || !data.role) {
    return res
      .status(400)
      .json({ ok: false, error: 'Name and role are required.' });
  }

  /* Enforce single founder by demoting any prior founder */
  if (data.isFounder) {
    await TeamMember.update({ isFounder: false }, { where: { isFounder: true } });
  }

  const photoPath = req.file ? `/uploads/team/${req.file.filename}` : null;
  data.position = await resolvePosition(TeamMember, data.position);
  const created = await TeamMember.create({ ...data, photoPath });
  res.status(201).json({ ok: true, member: adminMember(created) });
}

/* PATCH /api/admin/team/:id (multipart) */
async function updateMember(req, res) {
  const m = await TeamMember.findByPk(req.params.id);
  if (!m) return res.status(404).json({ ok: false, error: 'Not found' });
  const data = readBody(req);
  if (!data.name || !data.role) {
    return res
      .status(400)
      .json({ ok: false, error: 'Name and role are required.' });
  }

  if (data.isFounder && !m.isFounder) {
    await TeamMember.update(
      { isFounder: false },
      { where: { isFounder: true } }
    );
  }

  let { photoPath } = m;
  if (req.file) {
    deletePhotoIfExists(m.photoPath);
    photoPath = `/uploads/team/${req.file.filename}`;
  } else if (String(req.body.removePhoto ?? '').toLowerCase() === '1') {
    deletePhotoIfExists(m.photoPath);
    photoPath = null;
  }

  data.position = await resolvePosition(TeamMember, data.position, m.id);
  await m.update({ ...data, photoPath });
  res.json({ ok: true, member: adminMember(m) });
}

/* POST /api/admin/team/:id/archive */
async function setArchiveMember(req, res) {
  const m = await TeamMember.findByPk(req.params.id);
  if (!m) return res.status(404).json({ ok: false, error: 'Not found' });
  await m.update({ isArchived: !!req.body?.archived });
  res.json({ ok: true, member: adminMember(m) });
}

/* DELETE /api/admin/team/:id — hard delete + remove photo from disk
 *
 * The Founder & Director row is protected: it powers the homepage Founder's
 * Corner block and shouldn't be removed accidentally. To remove the founder,
 * first edit that row and uncheck "Mark as Founder", THEN delete.
 */
async function deleteMember(req, res) {
  const m = await TeamMember.findByPk(req.params.id);
  if (!m) return res.status(404).json({ ok: false, error: 'Not found' });
  if (m.isFounder) {
    return res.status(400).json({
      ok: false,
      error:
        'The Founder & Director cannot be deleted. Edit the row to uncheck "Mark as Founder" first, or assign a new founder, then delete.',
    });
  }
  deletePhotoIfExists(m.photoPath);
  await m.destroy();
  res.json({ ok: true, id: req.params.id });
}

/* PATCH /api/admin/foundation-content */
async function updateFoundationContent(req, res) {
  let row = await FoundationContent.findByPk('singleton');
  if (!row) row = await FoundationContent.create({ id: 'singleton' });
  const patch = {};
  for (const key of ['founderMessage', 'founderQuote', 'vision', 'mission']) {
    if (typeof req.body?.[key] === 'string') patch[key] = req.body[key];
  }
  await row.update(patch);
  res.json({
    ok: true,
    content: {
      founderMessage: row.founderMessage,
      founderQuote: row.founderQuote,
      vision: row.vision,
      mission: row.mission,
    },
  });
}

module.exports = {
  listPublicTeam,
  getFoundationContent,
  listTeam,
  createMember,
  updateMember,
  setArchiveMember,
  deleteMember,
  updateFoundationContent,
};
