import api from "./client";

/**
 * Users module — avatar uploads.
 *
 *   POST /api/users/me/avatar   (multipart "avatar" file) — any logged-in role
 *
 * Backend responds with { user } (sanitized, includes avatarUrl).
 */

export function uploadMyAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);
  return api.upload("/users/me/avatar", formData);
}

export default { uploadMyAvatar };
