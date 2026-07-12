const fs = require('fs');
const path = require('path');
const env = require('../config/env');
const { Achievement } = require('../models');
const { resolvePosition } = require('../utils/position');

function publicItem(a) {
  return {
    id: a.id,
    title: a.title,
    year: a.year,
    tag: a.tag,
    description: a.description,
    imagePath: a.imagePath,
    position: a.position,
  };
}

function adminItem(a) {
  return {
    ...publicItem(a),
    isPublished: a.isPublished,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}

function deleteImageIfExists(imagePath) {
  if (!imagePath || !imagePath.startsWith('/uploads/achievements/')) return;
  const rel = imagePath.replace('/uploads/', '');
  const abs = path.resolve(__dirname, '..', '..', env.uploads.dir, rel);
  fs.unlink(abs, () => {});
}

function readBody(req) {
  const published = String(req.body.isPublished ?? 'false').toLowerCase();
  return {
    title: typeof req.body.title === 'string' ? req.body.title.trim() : '',
    year: typeof req.body.year === 'string' ? req.body.year.trim() : null,
    tag: typeof req.body.tag === 'string' ? req.body.tag.trim() : null,
    description:
      typeof req.body.description === 'string'
        ? req.body.description.trim()
        : null,
    isPublished: published === 'true' || published === '1',
    position: Number.isFinite(Number(req.body.position))
      ? parseInt(req.body.position, 10)
      : 0,
  };
}

/* ---------------- Public ---------------- */

async function listPublicAchievements(_req, res) {
  const rows = await Achievement.findAll({
    where: { isPublished: true },
    order: [
      ['position', 'ASC'],
      ['createdAt', 'ASC'],
    ],
  });
  res.json({ ok: true, achievements: rows.map(publicItem) });
}

/* ---------------- Admin ---------------- */

async function listAchievements(_req, res) {
  const rows = await Achievement.findAll({
    order: [
      ['position', 'ASC'],
      ['createdAt', 'ASC'],
    ],
  });
  res.json({ ok: true, achievements: rows.map(adminItem) });
}

async function createAchievement(req, res) {
  const data = readBody(req);
  if (!data.title) {
    return res.status(400).json({ ok: false, error: 'Title is required.' });
  }
  const imagePath = req.file
    ? `/uploads/achievements/${req.file.filename}`
    : null;
  data.position = await resolvePosition(Achievement, data.position);
  const created = await Achievement.create({ ...data, imagePath });
  res.status(201).json({ ok: true, achievement: adminItem(created) });
}

async function updateAchievement(req, res) {
  const a = await Achievement.findByPk(req.params.id);
  if (!a) return res.status(404).json({ ok: false, error: 'Not found' });
  const data = readBody(req);
  if (!data.title) {
    return res.status(400).json({ ok: false, error: 'Title is required.' });
  }
  let { imagePath } = a;
  if (req.file) {
    deleteImageIfExists(a.imagePath);
    imagePath = `/uploads/achievements/${req.file.filename}`;
  } else if (String(req.body.removeImage ?? '').toLowerCase() === '1') {
    deleteImageIfExists(a.imagePath);
    imagePath = null;
  }
  data.position = await resolvePosition(Achievement, data.position, a.id);
  await a.update({ ...data, imagePath });
  res.json({ ok: true, achievement: adminItem(a) });
}

async function deleteAchievement(req, res) {
  const a = await Achievement.findByPk(req.params.id);
  if (!a) return res.status(404).json({ ok: false, error: 'Not found' });
  deleteImageIfExists(a.imagePath);
  await a.destroy();
  res.json({ ok: true, id: req.params.id });
}

module.exports = {
  listPublicAchievements,
  listAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
};
