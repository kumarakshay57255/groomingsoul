const express = require('express');
const {
  listPublicAdvisory,
} = require('../controllers/advisoryController');

const router = express.Router();
router.get('/', listPublicAdvisory);

module.exports = router;
