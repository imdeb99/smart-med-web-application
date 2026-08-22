// Supabase Storage helper — avatar image upload for the SMART-MED API.
//
// Uses the service_role key (server-side only; never exposed to the client).
// The avatar bucket must already exist in the Supabase project — the backend
// does not auto-create it. If SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not
// configured, the helpers throw a 503 ApiError explaining how to enable them.

const { createClient } = require('@supabase/supabase-js');
const env = require('../config/env');
const { ApiError } = require('../middleware/errorHandler');

const BUCKET = env.supabaseAvatarBucket;

let client = null;

const getClient = () => {
  if (client) return client;
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new ApiError(
      503,
      'Avatar uploads are not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env.',
    );
  }
  client = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
  return client;
};

/**
 * Upload an avatar image for a user and return the public URL.
 * Overwrites any existing avatar for the same user (stable path), so repeated
 * uploads don't accumulate orphaned files.
 *
 * @param {string} userId the user's UUID (used in the storage path)
 * @param {{ buffer: Buffer, mimetype: string, originalname: string }} file multer file
 * @returns {Promise<string>} public URL of the uploaded avatar
 */
const uploadAvatar = async (userId, file) => {
  const sb = getClient();

  const ext = (file.originalname.match(/\.([a-zA-Z0-9]+)$/) || [])[1] || 'jpg';
  const objectPath = `users/${userId}/avatar.${ext}`;

  const { error: uploadError } = await sb.storage.from(BUCKET).upload(objectPath, file.buffer, {
    contentType: file.mimetype,
    upsert: true,
  });
  if (uploadError) {
    throw new ApiError(502, `Failed to upload avatar to storage: ${uploadError.message}`);
  }

  const { data } = sb.storage.from(BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
};

module.exports = { uploadAvatar };
