import api from "./client";

/**
 * Payments module —
 *   POST /api/payments (PATIENT — mock gateway, no real money)
 *   GET  /api/payments (PATIENT — own payments)
 *
 * Backend Payment shape: { id, userId, relatedType:
 * APPOINTMENT|SAMPLE_COLLECTION|AMBULANCE, relatedId, amount, method,
 * status: PENDING|PAID|FAILED, transactionId, createdAt, user: {...} }.
 */

/**
 * @param {Object} data
 * @param {"APPOINTMENT"|"SAMPLE_COLLECTION"|"AMBULANCE"} data.relatedType
 * @param {string} data.relatedId   UUID of the related resource
 * @param {number} data.amount
 * @param {string} data.method
 * @param {"PAID"|"FAILED"} [data.status]  defaults to PAID
 */
export function createPayment(data) {
  return api.post("/payments", data);
}

/**
 * @param {Object} filters
 * @param {string} [filters.status]  PENDING|PAID|FAILED
 * @param {number} [filters.page]
 * @param {number} [filters.limit]
 */
export function getMyPayments(filters = {}) {
  return api.get("/payments", { query: filters });
}

export default { createPayment, getMyPayments };
