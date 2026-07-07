const express = require('express');
const { createBooking, bookingValidators } = require('../controllers/leadsController');

const router = express.Router();

router.post('/booking', bookingValidators, createBooking);

module.exports = router;
