const fs = require('fs');
const path = require('path');
const env = require('../config/env');
const { Book } = require('../models');
const { resolvePosition } = require('../utils/position');

function publicBook(b) {
  return {
    id: b.id,
    title: b.title,
    subtitle: b.subtitle,
    author: b.author,
    description: b.description,
    amazonUrl: b.amazonUrl,
    format: b.format,
    coverImagePath: b.coverImagePath,
    position: b.position,
  };
}

function adminBook(b) {
  return {
    ...publicBook(b),
    isPublished: b.isPublished,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

function deleteCoverIfExists(coverImagePath) {
  if (!coverImagePath || !coverImagePath.startsWith('/uploads/books/')) return;
  const rel = coverImagePath.replace('/uploads/', '');
  const abs = path.resolve(__dirname, '..', '..', env.uploads.dir, rel);
  fs.unlink(abs, () => {});
}

function readBody(req) {
  const published = String(req.body.isPublished ?? 'false').toLowerCase();
  const str = (k) =>
    typeof req.body[k] === 'string' ? req.body[k].trim() || null : null;
  return {
    title: typeof req.body.title === 'string' ? req.body.title.trim() : '',
    subtitle: str('subtitle'),
    author: str('author'),
    description: str('description'),
    amazonUrl: str('amazonUrl'),
    format: str('format'),
    isPublished: published === 'true' || published === '1',
    position: Number.isFinite(Number(req.body.position))
      ? parseInt(req.body.position, 10)
      : 0,
  };
}

/* ---------------- Public ---------------- */

async function listPublicBooks(_req, res) {
  const rows = await Book.findAll({
    where: { isPublished: true },
    order: [
      ['position', 'ASC'],
      ['createdAt', 'ASC'],
    ],
  });
  res.json({ ok: true, books: rows.map(publicBook) });
}

/* ---------------- Admin ---------------- */

async function listBooks(_req, res) {
  const rows = await Book.findAll({
    order: [
      ['position', 'ASC'],
      ['createdAt', 'ASC'],
    ],
  });
  res.json({ ok: true, books: rows.map(adminBook) });
}

async function createBook(req, res) {
  const data = readBody(req);
  if (!data.title) {
    return res.status(400).json({ ok: false, error: 'Title is required.' });
  }
  const coverImagePath = req.file ? `/uploads/books/${req.file.filename}` : null;
  data.position = await resolvePosition(Book, data.position);
  const created = await Book.create({ ...data, coverImagePath });
  res.status(201).json({ ok: true, book: adminBook(created) });
}

async function updateBook(req, res) {
  const b = await Book.findByPk(req.params.id);
  if (!b) return res.status(404).json({ ok: false, error: 'Not found' });
  const data = readBody(req);
  if (!data.title) {
    return res.status(400).json({ ok: false, error: 'Title is required.' });
  }
  let { coverImagePath } = b;
  if (req.file) {
    deleteCoverIfExists(b.coverImagePath);
    coverImagePath = `/uploads/books/${req.file.filename}`;
  } else if (String(req.body.removeCover ?? '').toLowerCase() === '1') {
    deleteCoverIfExists(b.coverImagePath);
    coverImagePath = null;
  }
  data.position = await resolvePosition(Book, data.position, b.id);
  await b.update({ ...data, coverImagePath });
  res.json({ ok: true, book: adminBook(b) });
}

async function deleteBook(req, res) {
  const b = await Book.findByPk(req.params.id);
  if (!b) return res.status(404).json({ ok: false, error: 'Not found' });
  deleteCoverIfExists(b.coverImagePath);
  await b.destroy();
  res.json({ ok: true, id: req.params.id });
}

module.exports = {
  listPublicBooks,
  listBooks,
  createBook,
  updateBook,
  deleteBook,
};
