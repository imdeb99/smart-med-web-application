import api from "./client";

/**
 * Admin module (all ADMIN-only) —
 *   GET   /api/admin/dashboard
 *   GET   /api/admin/users
 *   GET   /api/admin/appointments
 *   GET   /api/admin/payments
 *   PATCH /api/admin/doctors/:id/verification
 */

/** Dashboard aggregates: user/appointment counts + revenue. */
export function getAdminDashboard() {
  return api.get("/admin/dashboard");
}

/**
 * @param {Object} filters
 * @param {string} [filters.role]  PATIENT|DOCTOR|ADMIN
 * @param {number} [filters.page]
 * @param {number} [filters.limit]
 */
export function getAdminUsers(filters = {}) {
  return api.get("/admin/users", { query: filters });
}

/**
 * @param {Object} filters
 * @param {string} [filters.status]  PENDING|CONFIRMED|COMPLETED|CANCELLED
 * @param {number} [filters.page]
 * @param {number} [filters.limit]
 */
export function getAdminAppointments(filters = {}) {
  return api.get("/admin/appointments", { query: filters });
}

/**
 * @param {Object} filters
 * @param {string} [filters.status]  PENDING|PAID|FAILED
 * @param {number} [filters.page]
 * @param {number} [filters.limit]
 */
export function getAdminPayments(filters = {}) {
  return api.get("/admin/payments", { query: filters });
}

/** Admin: verify/reject a doctor's profile. */
export function setDoctorVerification(id, verificationStatus) {
  return api.patch(`/admin/doctors/${id}/verification`, { verificationStatus });
}

/** Admin: list all doctor profiles (includes pending + verified). */
export function getAdminDoctors(filters = {}) {
  return api.get("/admin/doctors", { query: filters });
}

/** Admin: create a doctor profile + linked user account. */
export function createAdminDoctor(data) {
  return api.post("/admin/doctors", data);
}

/** Admin: update a doctor's professional profile fields. */
export function updateAdminDoctor(id, data) {
  return api.patch(`/admin/doctors/${id}`, data);
}

/** Admin: delete a doctor profile. */
export function deleteAdminDoctor(id) {
  return api.delete(`/admin/doctors/${id}`);
}

/** Admin: list all patient users (+ PatientProfile). */
export function getAdminPatients(filters = {}) {
  return api.get("/admin/patients", { query: filters });
}

/** Admin: single patient detail. */
export function getAdminPatientById(id) {
  return api.get(`/admin/patients/${id}`);
}

/** Admin: update a patient's account + profile fields. */
export function updateAdminPatient(id, data) {
  return api.patch(`/admin/patients/${id}`, data);
}

/** Admin: delete a patient account (cascades related records). */
export function deleteAdminPatient(id) {
  return api.delete(`/admin/patients/${id}`);
}

/**
 * Admin: list all daily capacity records across doctors.
 * @param {Object} filters
 * @param {string} [filters.date]   YYYY-MM-DD
 * @param {string} [filters.doctorId]
 * @param {number} [filters.page]
 * @param {number} [filters.limit]
 */
export function getAdminDailyCapacities(filters = {}) {
  return api.get("/admin/daily-capacity", { query: filters });
}

/** Admin: override a daily capacity record (totalCapacity/startTime/avgDurationMin + optional reason). */
export function overrideAdminDailyCapacity(id, data) {
  return api.patch(`/admin/daily-capacity/${id}`, data);
}

/** Admin: set any user's avatar (multipart "avatar" file). Returns { user }. */
export function uploadAdminUserAvatar(userId, file) {
  const formData = new FormData();
  formData.append("avatar", file);
  return api.upload(`/admin/users/${userId}/avatar`, formData);
}

export default {
  getAdminDashboard,
  getAdminUsers,
  getAdminAppointments,
  getAdminPayments,
  setDoctorVerification,
  getAdminDoctors,
  createAdminDoctor,
  updateAdminDoctor,
  deleteAdminDoctor,
  getAdminPatients,
  getAdminPatientById,
  updateAdminPatient,
  deleteAdminPatient,
  getAdminDailyCapacities,
  overrideAdminDailyCapacity,
  uploadAdminUserAvatar,
};
