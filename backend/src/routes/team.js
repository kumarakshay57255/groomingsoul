const express = require('express');
const {
  listPublicTeam,
  getFoundationContent,
} = require('../controllers/teamController');

const router = express.Router();

router.get('/team', listPublicTeam);
router.get('/foundation-content', getFoundationContent);

module.exports = router;
