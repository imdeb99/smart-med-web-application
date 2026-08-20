require('dotenv').config();

const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_URL,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
};

const missing = Object.entries(env).filter(
  ([key, value]) => (value === undefined || value === '') && key !== 'clientOrigin',
);

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.map(([k]) => k).join(', ')}. ` +
      'Copy backend/.env.example to backend/.env and fill in the values.',
  );
}

module.exports = env;
