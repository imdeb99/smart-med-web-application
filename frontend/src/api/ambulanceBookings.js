import api from "./client";

/**
 * Ambulance Bookings module —
 *   POST  /api/ambulance-bookings            (PATIENT)
 *   GET   /api/ambulance-bookings/mine       (PATIENT)
 *   GET   /api/ambulance-bookings            (ADMIN — all bookings)
 *   PATCH /api/ambulance-bookings/:id/assign (ADMIN)
 *
 * Backend AmbulanceBooking shape: { id, patientId, ambulanceId,
 * pickupLocation, dropLocation, type: BASIC|ICU|FREEZER,
 * status: REQUESTED|ASSIGNED|COMPLETED|CANCELLED, requestedAt (ISO),
 * patient: {...}, ambulance: {...} }.
 */

/**
 * @param {Object} data
 * @param {string} data.pickupLocation
 * @param {string} data.dropLocation
 * @param {"BASIC"|"ICU"|"FREEZER"} data.type
 */
export function createAmbulanceBooking(data) {
  return api.post("/ambulance-bookings", data);
}

/**
 * @param {Object} filters
 * @param {string} [filters.status]  REQUESTED|ASSIGNED|COMPLETED|CANCELLED
 * @param {number} [filters.page]
 * @param {number} [filters.limit]
 */
export function getMyAmbulanceBookings(filters = {}) {
  return api.get("/ambulance-bookings/mine", { query: filters });
}

/** Admin: list all ambulance bookings. */
export function getAllAmbulanceBookings(filters = {}) {
  return api.get("/ambulance-bookings", { query: filters });
}

/** Admin: assign an ambulance (marks it BUSY in a transaction). */
export function assignAmbulance(id, ambulanceId) {
  return api.patch(`/ambulance-bookings/${id}/assign`, { ambulanceId });
}

export default {
  createAmbulanceBooking,
  getMyAmbulanceBookings,
  getAllAmbulanceBookings,
  assignAmbulance,
};
