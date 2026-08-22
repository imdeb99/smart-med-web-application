import api from "./client";

/**
 * Doctors module —
 *   GET  /api/doctors             (public, verified only)
 *   GET  /api/doctors/:id         (public)
 *   PATCH /api/doctors/me/profile (DOCTOR)
 *
 * Backend DoctorProfile shape: { id, userId, bmdcId, specialty, bio,
 * consultationFee, verificationStatus, createdAt, user: {...} }.
 */

/**
 * @param {Object} filters
 * @param {string} [filters.specialty]
 * @param {string} [filters.search]
 * @param {string} [filters.verificationStatus]  admin-only; ignored for normal users
 * @param {number} [filters.page]
 * @param {number} [filters.limit]
 */
export function getDoctors(filters = {}) {
  return api.get("/doctors", { query: filters });
}

export function getDoctorById(id) {
  return api.get(`/doctors/${id}`);
}

export function updateOwnProfile(payload) {
  return api.patch("/doctors/me/profile", payload);
}

export default { getDoctors, getDoctorById, updateOwnProfile };
