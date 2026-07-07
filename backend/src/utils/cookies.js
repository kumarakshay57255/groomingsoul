const env = require('../config/env');

// Secure cookies require HTTPS. Decoupled from NODE_ENV so the app can run
// over plain HTTP (staging) and flip to secure once TLS is in front.
// Set COOKIE_SECURE=true when serving over HTTPS.
const secure = String(process.env.COOKIE_SECURE).toLowerCase() === 'true';

const SESSION_COOKIE_OPTS = {
  httpOnly: true,
  secure,
  // 'none' needs Secure; use 'lax' for same-origin http, 'none' for cross-site https
  sameSite: secure ? 'none' : 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function setSession(res, token) {
  res.cookie(env.cookieName, token, SESSION_COOKIE_OPTS);
}

function clearSession(res) {
  res.clearCookie(env.cookieName, { ...SESSION_COOKIE_OPTS, maxAge: undefined });
}

module.exports = { setSession, clearSession };
