const express = require('express');
const { submitTest, submitValidators } = require('../controllers/testsController');

const router = express.Router();

router.post('/submit', submitValidators, submitTest);

module.exports = router;
