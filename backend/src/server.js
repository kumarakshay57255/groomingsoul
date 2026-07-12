const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const env = require('./config/env');
const sequelize = require('./config/db');

const app = express();

/* -------------------------------- Middleware ------------------------------- */
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: env.frontendOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

/* Static — uploaded receipts served read-only (admin will view later) */
app.use(
  '/uploads',
  express.static(path.resolve(__dirname, '..', env.uploads.dir), {
    fallthrough: true,
  })
);

/* --------------------------------- Routes --------------------------------- */
app.get('/', (_req, res) => {
  res.json({
    name: 'Grooming Souls API',
    status: 'ok',
    time: new Date().toISOString(),
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/tests', require('./routes/tests'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/therapists', require('./routes/therapists'));
app.use('/api/advisory', require('./routes/advisory'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api', require('./routes/team'));
app.use('/api/purchases', require('./routes/purchases'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/stream', require('./routes/stream'));

/* -------------------------------- 404 + Error ------------------------------ */
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Not found', path: req.path });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  /* Sequelize validation + unique-constraint errors → 400 with helpful fields */
  if (err?.name === 'SequelizeValidationError' || err?.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      ok: false,
      error: err.message,
      fields: (err.errors ?? []).map((e) => ({
        path: e.path,
        message: e.message,
      })),
    });
  }
  /* Multer file-size or filter errors → 400 */
  if (err?.name === 'MulterError') {
    return res.status(400).json({ ok: false, error: err.message });
  }
  console.error('[error]', err);
  const status = err.status || 500;
  res.status(status).json({
    ok: false,
    error: err.message || 'Internal server error',
  });
});

/* --------------------------------- Boot ----------------------------------- */
const { startExpirySweeper } = require('./jobs/expirySweeper');

async function start() {
  try {
    await sequelize.authenticate();
    console.log(`[db] connected → ${env.db.host}:${env.db.port}/${env.db.database}`);
  } catch (err) {
    console.error('[db] connection failed:', err.message);
    process.exit(1);
  }

  startExpirySweeper();

  app.listen(env.port, () => {
    console.log(`[api] listening on http://localhost:${env.port}`);
    console.log(`[api] CORS origin: ${env.frontendOrigin}`);
  });
}

start();
