const prisma = require('../../config/db');
const { ApiError } = require('../../middleware/errorHandler');
const { uploadAvatar } = require('../../lib/supabaseStorage');

/**
 * Upload a new avatar for the given user: store the file in Supabase Storage,
 * then persist the returned public URL on the user row. Returns the sanitized
 * user (with doctor/patient profiles, matching /auth/me).
 */
const uploadAvatarForUser = async (userId, file) => {
  if (!file) {
    throw new ApiError(400, 'No avatar file provided. Send the image as multipart field "avatar".');
  }

  const publicUrl = await uploadAvatar(userId, file);

  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: publicUrl },
    include: { doctorProfile: true, patientProfile: true },
  });

  const { passwordHash, ...rest } = user;
  return rest;
};

module.exports = { uploadAvatarForUser };
