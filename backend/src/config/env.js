const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function required(key) {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env: ${key}`);
  return v;
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5040', 10),

  db: {
    host: required('DB_HOST'),
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: required('DB_USERNAME'),
    password: process.env.DB_PASSWORD ?? '',
    database: required('DB_NAME'),
  },

  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  cookieName: process.env.COOKIE_NAME || 'gs_session',

  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:4321',

  uploads: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxMb: parseInt(process.env.MAX_UPLOAD_MB || '5', 10),
  },
};
