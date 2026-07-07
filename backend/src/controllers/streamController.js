const path = require('path');
const fs = require('fs');
const { verifyStreamToken } = require('../utils/streamToken');
const env = require('../config/env');

const UPLOAD_ROOT = path.resolve(__dirname, '..', '..', env.uploads.dir);

/**
 * GET /api/stream/:token
 *
 * Proxies the upstream video with Range support so the browser can seek but
 * never sees the real source URL. Two source kinds are supported:
 *   - `local://relative/path` → resolved against backend/uploads (disk stream)
 *   - any http(s)://… URL    → server-side fetch + pipe
 *
 * Token lifetime is 10 minutes; tokens leak less if intercepted.
 * Note: this is NOT true DRM. It hides the source from casual download tools
 * but a determined user can still extract the proxied stream. Phase 4 will
 * swap this for VdoCipher / Widevine.
 */
async function streamLesson(req, res) {
  let payload;
  try {
    payload = verifyStreamToken(req.params.token);
  } catch {
    return res
      .status(403)
      .send('Stream link is invalid or expired. Please reload the lesson.');
  }

  const upstream = payload.src;
  if (!upstream) return res.status(404).send('No source.');

  if (upstream.startsWith('local://')) {
    return streamFromDisk(req, res, upstream.slice('local://'.length));
  }
  return streamFromUpstream(req, res, upstream);
}

/* ----------------- local file streaming with Range support ---------------- */

function streamFromDisk(req, res, relPath) {
  /* Defence-in-depth: make sure the resolved path stays under UPLOAD_ROOT */
  const abs = path.resolve(UPLOAD_ROOT, relPath);
  if (!abs.startsWith(UPLOAD_ROOT + path.sep) && abs !== UPLOAD_ROOT) {
    return res.status(400).send('Bad source path.');
  }

  fs.stat(abs, (err, stat) => {
    if (err || !stat.isFile()) return res.status(404).send('Source missing.');

    const fileSize = stat.size;
    const range = req.headers.range;

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (range) {
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      if (!m) return res.status(416).end();
      const start = m[1] ? parseInt(m[1], 10) : 0;
      const end = m[2] ? parseInt(m[2], 10) : fileSize - 1;
      if (Number.isNaN(start) || Number.isNaN(end) || start > end || end >= fileSize) {
        res.setHeader('Content-Range', `bytes */${fileSize}`);
        return res.status(416).end();
      }
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', end - start + 1);
      fs.createReadStream(abs, { start, end }).pipe(res);
    } else {
      res.setHeader('Content-Length', fileSize);
      fs.createReadStream(abs).pipe(res);
    }
  });
}

/* ----------------- upstream HTTP(S) proxy with Range support ------------- */

async function streamFromUpstream(req, res, upstream) {
  const headers = {};
  if (req.headers.range) headers.range = req.headers.range;
  if (req.headers['if-range']) headers['if-range'] = req.headers['if-range'];

  let upstreamRes;
  try {
    upstreamRes = await fetch(upstream, {
      method: 'GET',
      headers,
      redirect: 'follow',
    });
  } catch (err) {
    console.error('[stream] upstream fetch failed:', err.message);
    return res.status(502).send('Upstream unavailable.');
  }

  res.status(upstreamRes.status);
  const passthrough = [
    'content-type',
    'content-length',
    'accept-ranges',
    'content-range',
    'cache-control',
    'etag',
    'last-modified',
  ];
  for (const h of passthrough) {
    const v = upstreamRes.headers.get(h);
    if (v) res.setHeader(h, v);
  }
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (!upstreamRes.body) return res.end();
  const { Readable } = require('node:stream');
  const nodeStream = Readable.fromWeb(upstreamRes.body);
  nodeStream.pipe(res);
  nodeStream.on('error', (err) => {
    console.error('[stream] pipe error:', err.message);
    res.destroy(err);
  });
}

module.exports = { streamLesson };
