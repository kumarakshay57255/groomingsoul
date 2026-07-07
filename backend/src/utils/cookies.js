const env = require('../config/env');

const isProd = env.nodeEnv === 'production';

const SESSION_COOKIE_OPTS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
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
