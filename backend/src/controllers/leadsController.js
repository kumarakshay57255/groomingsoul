const { body, validationResult } = require('express-validator');
const { TherapyLead } = require('../models');
const { normalizeIndianPhone } = require('../utils/phone');

const bookingValidators = [
  body('name').trim().isLength({ min: 2, max: 120 }),
  body('age').isInt({ min: 8, max: 120 }),
  body('phone').custom((v) => {
    if (!normalizeIndianPhone(v)) {
      throw new Error('Enter a valid 10-digit Indian mobile number.');
    }
    return true;
  }),
  body('email').trim().toLowerCase().isEmail(),
  body('slot').trim().notEmpty(),
  body('therapistId').optional().isString(),
  body('therapistName').optional().isString(),
];

async function createBooking(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ ok: false, errors: errors.array() });
  }

  const { name, age, email, slot, therapistId, therapistName } = req.body;
  const phone = normalizeIndianPhone(req.body.phone);

  const lead = await TherapyLead.create({
    name,
    age,
    phone,
    email,
    slot,
    therapistId: therapistId || null,
    therapistName: therapistName || null,
    status: 'new',
  });

  res.status(201).json({ ok: true, leadId: lead.id });
}

module.exports = { createBooking, bookingValidators };
