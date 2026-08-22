require('dotenv').config();

const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_URL,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseAvatarBucket: process.env.SUPABASE_AVATAR_BUCKET || 'avatars',
};

const missing = Object.entries(env).filter(
  ([key, value]) =>
    (value === undefined || value === '') &&
    key !== 'clientOrigin' &&
    key !== 'supabaseUrl' &&
    key !== 'supabaseServiceRoleKey',
);

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.map(([k]) => k).join(', ')}. ` +
      'Copy backend/.env.example to backend/.env and fill in the values.',
  );
}

module.exports = env;
