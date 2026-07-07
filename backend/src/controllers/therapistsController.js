const { Op } = require('sequelize');
const { Therapist } = require('../models');

function publicTherapist(t) {
  return {
    id: t.id,
    name: t.name,
    designation: t.designation,
    yearsExperience: t.yearsExperience,
    languages: t.languages ?? [],
    specializations: t.specializations ?? [],
    bio: t.bio,
    photoPath: t.photoPath,
    acceptingNew: t.acceptingNew,
    position: t.position,
  };
}

/** GET /api/therapists — public list, archived excluded */
async function listPublicTherapists(_req, res) {
  const rows = await Therapist.findAll({
    where: { isArchived: false },
    order: [
      ['position', 'ASC'],
      ['createdAt', 'ASC'],
    ],
  });
  res.json({ ok: true, therapists: rows.map(publicTherapist) });
}

module.exports = { listPublicTherapists, publicTherapist };
