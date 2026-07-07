const fs = require('fs');
const path = require('path');
const env = require('../config/env');
const { Therapist } = require('../models');
const { publicTherapist } = require('./therapistsController');
const { resolvePosition } = require('../utils/position');

function adminTherapist(t) {
  return {
    ...publicTherapist(t),
    isArchived: t.isArchived,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

function parseCsvField(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value !== 'string') return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function readBody(req) {
  return {
    name: typeof req.body.name === 'string' ? req.body.name.trim() : '',
    designation:
      typeof req.body.designation === 'string'
        ? req.body.designation.trim()
        : '',
    yearsExperience: Number.isFinite(Number(req.body.yearsExperience))
      ? parseInt(req.body.yearsExperience, 10)
      : 0,
    languages: parseCsvField(req.body.languages),
    specializations: parseCsvField(req.body.specializations),
    bio: typeof req.body.bio === 'string' ? req.body.bio.trim() : '',
    acceptingNew:
      String(req.body.acceptingNew ?? 'true').toLowerCase() !== 'false',
    position: Number.isFinite(Number(req.body.position))
      ? parseInt(req.body.position, 10)
      : 0,
  };
}

function deletePhotoIfExists(photoPath) {
  if (!photoPath || !photoPath.startsWith('/uploads/therapists/')) return;
  const rel = photoPath.replace('/uploads/', '');
  const abs = path.resolve(__dirname, '..', '..', env.uploads.dir, rel);
  fs.unlink(abs, () => {});
}

/* GET /api/admin/therapists?archived=… */
async function listTherapists(req, res) {
  const includeArchived = req.query.archived === '1';
  const where = includeArchived ? {} : { isArchived: false };
  const rows = await Therapist.findAll({
    where,
    order: [
      ['position', 'ASC'],
      ['createdAt', 'ASC'],
    ],
  });
  res.json({ ok: true, therapists: rows.map(adminTherapist) });
}

/* POST /api/admin/therapists (multipart) */
async function createTherapist(req, res) {
  const data = readBody(req);
  if (!data.name || !data.designation) {
    return res.status(400).json({
      ok: false,
      error: 'Name and designation are required.',
    });
  }
  const photoPath = req.file
    ? `/uploads/therapists/${req.file.filename}`
    : null;

  data.position = await resolvePosition(Therapist, data.position);
  const created = await Therapist.create({ ...data, photoPath });
  res.status(201).json({ ok: true, therapist: adminTherapist(created) });
}

/* PATCH /api/admin/therapists/:id (multipart) */
async function updateTherapist(req, res) {
  const t = await Therapist.findByPk(req.params.id);
  if (!t) return res.status(404).json({ ok: false, error: 'Not found' });
  const data = readBody(req);
  if (!data.name || !data.designation) {
    return res.status(400).json({
      ok: false,
      error: 'Name and designation are required.',
    });
  }

  /* Photo handling: new upload replaces old; explicit "removePhoto=1" wipes. */
  let { photoPath } = t;
  if (req.file) {
    deletePhotoIfExists(t.photoPath);
    photoPath = `/uploads/therapists/${req.file.filename}`;
  } else if (String(req.body.removePhoto ?? '').toLowerCase() === '1') {
    deletePhotoIfExists(t.photoPath);
    photoPath = null;
  }

  data.position = await resolvePosition(Therapist, data.position, t.id);
  await t.update({ ...data, photoPath });
  res.json({ ok: true, therapist: adminTherapist(t) });
}

/* POST /api/admin/therapists/:id/archive  body { archived: true|false } */
async function setArchiveTherapist(req, res) {
  const t = await Therapist.findByPk(req.params.id);
  if (!t) return res.status(404).json({ ok: false, error: 'Not found' });
  const archived = !!req.body?.archived;
  await t.update({ isArchived: archived });
  res.json({ ok: true, therapist: adminTherapist(t) });
}

module.exports = {
  listTherapists,
  createTherapist,
  updateTherapist,
  setArchiveTherapist,
};
