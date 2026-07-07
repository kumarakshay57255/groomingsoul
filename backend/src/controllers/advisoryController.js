const fs = require('fs');
const path = require('path');
const env = require('../config/env');
const { AdvisoryMember } = require('../models');
const { resolvePosition } = require('../utils/position');

function publicMember(m) {
  return {
    id: m.id,
    name: m.name,
    role: m.role,
    bio: m.bio,
    photoPath: m.photoPath,
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
  if (!photoPath || !photoPath.startsWith('/uploads/advisory/')) return;
  const rel = photoPath.replace('/uploads/', '');
  const abs = path.resolve(__dirname, '..', '..', env.uploads.dir, rel);
  fs.unlink(abs, () => {});
}

function readBody(req) {
  return {
    name: typeof req.body.name === 'string' ? req.body.name.trim() : '',
    role: typeof req.body.role === 'string' ? req.body.role.trim() : '',
    bio: typeof req.body.bio === 'string' ? req.body.bio.trim() : null,
    position: Number.isFinite(Number(req.body.position))
      ? parseInt(req.body.position, 10)
      : 0,
  };
}

/* ---------------- Public ---------------- */

async function listPublicAdvisory(_req, res) {
  const rows = await AdvisoryMember.findAll({
    where: { isArchived: false },
    order: [
      ['position', 'ASC'],
      ['createdAt', 'ASC'],
    ],
  });
  res.json({ ok: true, advisory: rows.map(publicMember) });
}

/* ---------------- Admin ---------------- */

async function listAdvisory(req, res) {
  const where = req.query.archived === '1' ? {} : { isArchived: false };
  const rows = await AdvisoryMember.findAll({
    where,
    order: [
      ['position', 'ASC'],
      ['createdAt', 'ASC'],
    ],
  });
  res.json({ ok: true, advisory: rows.map(adminMember) });
}

async function createAdvisory(req, res) {
  const data = readBody(req);
  if (!data.name || !data.role) {
    return res
      .status(400)
      .json({ ok: false, error: 'Name and role are required.' });
  }
  const photoPath = req.file
    ? `/uploads/advisory/${req.file.filename}`
    : null;
  data.position = await resolvePosition(AdvisoryMember, data.position);
  const created = await AdvisoryMember.create({ ...data, photoPath });
  res.status(201).json({ ok: true, member: adminMember(created) });
}

async function updateAdvisory(req, res) {
  const m = await AdvisoryMember.findByPk(req.params.id);
  if (!m) return res.status(404).json({ ok: false, error: 'Not found' });
  const data = readBody(req);
  if (!data.name || !data.role) {
    return res
      .status(400)
      .json({ ok: false, error: 'Name and role are required.' });
  }
  let { photoPath } = m;
  if (req.file) {
    deletePhotoIfExists(m.photoPath);
    photoPath = `/uploads/advisory/${req.file.filename}`;
  } else if (String(req.body.removePhoto ?? '').toLowerCase() === '1') {
    deletePhotoIfExists(m.photoPath);
    photoPath = null;
  }
  data.position = await resolvePosition(AdvisoryMember, data.position, m.id);
  await m.update({ ...data, photoPath });
  res.json({ ok: true, member: adminMember(m) });
}

async function setArchiveAdvisory(req, res) {
  const m = await AdvisoryMember.findByPk(req.params.id);
  if (!m) return res.status(404).json({ ok: false, error: 'Not found' });
  await m.update({ isArchived: !!req.body?.archived });
  res.json({ ok: true, member: adminMember(m) });
}

async function deleteAdvisory(req, res) {
  const m = await AdvisoryMember.findByPk(req.params.id);
  if (!m) return res.status(404).json({ ok: false, error: 'Not found' });
  deletePhotoIfExists(m.photoPath);
  await m.destroy();
  res.json({ ok: true, id: req.params.id });
}

module.exports = {
  listPublicAdvisory,
  listAdvisory,
  createAdvisory,
  updateAdvisory,
  setArchiveAdvisory,
  deleteAdvisory,
};
