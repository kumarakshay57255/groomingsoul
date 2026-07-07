const env = require('../config/env');
const { verify } = require('../utils/jwt');
const { User } = require('../models');

/**
 * requireAuth — reads the session cookie, verifies the JWT, looks up the user,
 * and attaches `req.user`. Returns 401 if missing/invalid.
 */
async function requireAuth(req, res, next) {
  const token = req.cookies?.[env.cookieName];
  if (!token) {
    return res.status(401).json({ ok: false, error: 'Not authenticated' });
  }

  try {
    const decoded = verify(token);
    const user = await User.findByPk(decoded.sub);
    if (!user) {
      return res.status(401).json({ ok: false, error: 'User no longer exists' });
    }
    if (user.isActive === false) {
      return res
        .status(403)
        .json({ ok: false, error: 'This account has been deactivated.' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ ok: false, error: 'Invalid session' });
  }
}

/**
 * requireRole — must run AFTER requireAuth. Restricts access to a list of roles.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ ok: false, error: 'Forbidden' });
    }
    next();
  };
}

/**
 * Optional — attaches req.user when a valid session exists, but does not reject.
 */
async function optionalAuth(req, _res, next) {
  const token = req.cookies?.[env.cookieName];
  if (!token) return next();
  try {
    const decoded = verify(token);
    const user = await User.findByPk(decoded.sub);
    if (user) req.user = user;
  } catch {
    /* ignore — treat as anonymous */
  }
  next();
}

module.exports = { requireAuth, requireRole, optionalAuth };
