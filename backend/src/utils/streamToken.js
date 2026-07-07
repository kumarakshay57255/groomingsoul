const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Short-lived JWT used in the masked `/api/stream/:token` URL.
 * Encodes the user + lesson + source URL so the proxy doesn't need a DB
 * round-trip on every Range request — and the underlying CDN URL is never
 * exposed to the browser.
 *
 * Token lifetime is intentionally short so a leaked URL becomes useless fast.
 */
const STREAM_TTL_SECONDS = 10 * 60; // 10 minutes

function signStreamToken({ userId, lessonId, purchaseId, sourceUrl }) {
  return jwt.sign(
    { sub: userId, lid: lessonId, pid: purchaseId, src: sourceUrl, purpose: 'stream' },
    env.jwt.secret,
    { expiresIn: STREAM_TTL_SECONDS }
  );
}

function verifyStreamToken(token) {
  const payload = jwt.verify(token, env.jwt.secret);
  if (payload.purpose !== 'stream') throw new Error('Wrong token purpose');
  return payload;
}

module.exports = { signStreamToken, verifyStreamToken, STREAM_TTL_SECONDS };
