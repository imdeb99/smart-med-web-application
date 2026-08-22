import api from "./client";

/**
 * Reviews module —
 *   GET  /api/reviews/doctor/:doctorId (public)
 *   POST /api/reviews                 (PATIENT — after a completed appointment)
 *
 * Backend Review shape: { id, doctorId, patientId, rating (1-5), comment,
 * createdAt, patient: {...}, doctor: {...} }.
 */

/** Public: list a doctor's reviews (+ summary { averageRating, totalReviews }). */
export function getReviewsByDoctor(doctorId, filters = {}) {
  return api.get(`/reviews/doctor/${doctorId}`, { query: filters });
}

/**
 * @param {Object} data
 * @param {string} data.doctorId
 * @param {number} data.rating   1-5
 * @param {string} [data.comment]
 */
export function createReview(data) {
  return api.post("/reviews", data);
}

export default { getReviewsByDoctor, createReview };
