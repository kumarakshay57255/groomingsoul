const express = require('express');
const { listPublicTherapists } = require('../controllers/therapistsController');

const router = express.Router();

router.get('/', listPublicTherapists);

module.exports = router;
