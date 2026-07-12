const express = require('express');
const {
  listPublicAchievements,
} = require('../controllers/achievementsController');

const router = express.Router();
router.get('/', listPublicAchievements);

module.exports = router;
