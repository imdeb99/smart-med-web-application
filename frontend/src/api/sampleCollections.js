import api from "./client";

/**
 * Sample Collection module —
 *   POST  /api/sample-collections            (PATIENT)
 *   GET   /api/sample-collections/mine       (PATIENT)
 *   GET   /api/sample-collections            (ADMIN — all requests)
 *   PATCH /api/sample-collections/:id/assign (ADMIN)
 *
 * Backend SampleCollection shape: { id, patientId, labAssistantId,
 * testName, address, scheduledAt (ISO),
 * status: REQUESTED|ASSIGNED|COMPLETED|CANCELLED, createdAt,
 * patient: {...}, labAssistant: {...} }.
 */

/**
 * @param {Object} data
 * @param {string} data.testName
 * @param {string} data.address      pickup address (min 5 chars)
 * @param {string} data.scheduledAt  ISO datetime string
 */
export function createSampleCollection(data) {
  return api.post("/sample-collections", data);
}

/**
 * @param {Object} filters
 * @param {string} [filters.status]  REQUESTED|ASSIGNED|COMPLETED|CANCELLED
 * @param {number} [filters.page]
 * @param {number} [filters.limit]
 */
export function getMySampleCollections(filters = {}) {
  return api.get("/sample-collections/mine", { query: filters });
}

/** Admin: list all sample collection requests. */
export function getAllSampleCollections(filters = {}) {
  return api.get("/sample-collections", { query: filters });
}

/** Admin: assign a lab assistant (marks the request ASSIGNED). */
export function assignLabAssistant(id, labAssistantId) {
  return api.patch(`/sample-collections/${id}/assign`, { labAssistantId });
}

export default {
  createSampleCollection,
  getMySampleCollections,
  getAllSampleCollections,
  assignLabAssistant,
};
