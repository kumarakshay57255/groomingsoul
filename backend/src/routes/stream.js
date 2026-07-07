const express = require('express');
const { streamLesson } = require('../controllers/streamController');

const router = express.Router();

router.get('/:token', streamLesson);

module.exports = router;
