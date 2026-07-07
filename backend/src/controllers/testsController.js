const { body, validationResult } = require('express-validator');
const { TestSubmission } = require('../models');
const { normalizeIndianPhone } = require('../utils/phone');

const submitValidators = [
  body('testSlug').isString().notEmpty(),
  body('testName').isString().notEmpty(),
  body('identity').isObject(),
  body('identity.name').isString().trim().isLength({ min: 1 }),
  body('identity.email').trim().toLowerCase().isEmail(),
  body('identity.phone').custom((v) => {
    if (!normalizeIndianPhone(v)) {
      throw new Error('Enter a valid 10-digit Indian mobile number.');
    }
    return true;
  }),
  body('answers').isArray({ min: 1 }),
];

async function submitTest(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ ok: false, errors: errors.array() });
  }

  const { testSlug, testName, identity, answers } = req.body;
  const normalizedIdentity = {
    ...identity,
    phone: normalizeIndianPhone(identity.phone),
  };

  const submission = await TestSubmission.create({
    testSlug,
    testName,
    identity: normalizedIdentity,
    answers,
    reviewStatus: 'pending',
  });

  res.status(201).json({ ok: true, submissionId: submission.id });
}

module.exports = { submitTest, submitValidators };
