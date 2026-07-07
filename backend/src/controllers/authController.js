const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const env = require('../config/env');
const { User } = require('../models');
const { sign } = require('../utils/jwt');
const { setSession, clearSession } = require('../utils/cookies');
const { normalizeIndianPhone } = require('../utils/phone');

function toSafeUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    emailVerified: u.emailVerified,
    phoneVerified: u.phoneVerified,
    isActive: u.isActive,
    createdAt: u.createdAt,
  };
}

const phoneValidator = body('phone').custom((value) => {
  const normalised = normalizeIndianPhone(value);
  if (!normalised) {
    throw new Error('Enter a valid 10-digit Indian mobile number.');
  }
  return true;
});

/* -------------------- validators -------------------- */

const signupValidators = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters.'),
  body('email').trim().toLowerCase().isEmail().withMessage('Valid email required.'),
  phoneValidator,
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be at least 8 characters.'),
];

const loginValidators = [
  body('email').trim().toLowerCase().isEmail(),
  body('password').isString().notEmpty(),
];

const forgotValidators = [
  body('email').trim().toLowerCase().isEmail(),
];

const resetValidators = [
  body('token').isString().notEmpty(),
  body('password').isLength({ min: 8, max: 128 }),
];

function checkValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ ok: false, errors: errors.array() });
    return false;
  }
  return true;
}

/* -------------------- handlers -------------------- */

async function signup(req, res) {
  if (!checkValidation(req, res)) return;

  const { name, email, password } = req.body;
  const phone = normalizeIndianPhone(req.body.phone);

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res
      .status(409)
      .json({ ok: false, error: 'An account already exists with this email.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    phone,
    passwordHash,
    role: 'student',
  });

  const token = sign({ sub: user.id, role: user.role });
  setSession(res, token);
  res.status(201).json({ ok: true, user: toSafeUser(user) });
}

async function login(req, res) {
  if (!checkValidation(req, res)) return;

  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ ok: false, error: 'Invalid credentials' });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ ok: false, error: 'Invalid credentials' });
  }

  if (user.isActive === false) {
    return res.status(403).json({
      ok: false,
      error:
        'This account has been deactivated. Contact a Grooming Souls administrator.',
    });
  }

  const token = sign({ sub: user.id, role: user.role });
  setSession(res, token);
  res.json({ ok: true, user: toSafeUser(user) });
}

async function logout(_req, res) {
  clearSession(res);
  res.json({ ok: true });
}

async function me(req, res) {
  res.json({ ok: true, user: toSafeUser(req.user) });
}

/**
 * Forgot password — always returns the same generic response to avoid
 * leaking which emails exist in the system. In dev, the reset URL is also
 * printed to the server log AND returned in the JSON body so we can test
 * without an email service (Phase 4 will add Resend).
 */
async function forgotPassword(req, res) {
  if (!checkValidation(req, res)) return;
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  const generic = {
    ok: true,
    message:
      'If an account exists for that email, a reset link has been sent.',
  };

  if (!user) {
    console.log(`[reset] no user for email=${email}`);
    return res.json(generic);
  }

  /* Short-lived JWT, signed with the same secret + a purpose claim. */
  const resetToken = jwt.sign(
    { sub: user.id, purpose: 'password_reset' },
    env.jwt.secret,
    { expiresIn: '30m' }
  );

  const frontend = env.frontendOrigin.replace(/\/$/, '');
  const resetUrl = `${frontend}/reset-password?token=${encodeURIComponent(resetToken)}`;
  console.log(`[reset] ${user.email} → ${resetUrl}`);

  if (env.nodeEnv !== 'production') {
    return res.json({ ...generic, devResetUrl: resetUrl });
  }
  return res.json(generic);
}

/** Reset password — consumes the JWT reset token and updates the hash. */
async function resetPassword(req, res) {
  if (!checkValidation(req, res)) return;
  const { token, password } = req.body;

  let payload;
  try {
    payload = jwt.verify(token, env.jwt.secret);
  } catch {
    return res
      .status(400)
      .json({ ok: false, error: 'Reset link is invalid or has expired.' });
  }
  if (payload.purpose !== 'password_reset') {
    return res.status(400).json({ ok: false, error: 'Invalid reset token.' });
  }

  const user = await User.findByPk(payload.sub);
  if (!user) {
    return res.status(400).json({ ok: false, error: 'Account not found.' });
  }

  user.passwordHash = await bcrypt.hash(password, 10);
  await user.save();

  /* Invalidate the current session if any */
  clearSession(res);
  res.json({ ok: true });
}

module.exports = {
  signup,
  login,
  logout,
  me,
  forgotPassword,
  resetPassword,
  signupValidators,
  loginValidators,
  forgotValidators,
  resetValidators,
};
