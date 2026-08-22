import api from "./client";

/**
 * Health Records module —
 *   POST /api/health-records (DOCTOR — one record per appointment)
 *   GET  /api/health-records (PATIENT/DOCTOR, scoped to caller)
 *
 * Backend HealthRecord shape: { id, appointmentId, patientId, doctorId,
 * prescriptionText, notes, createdAt, appointment: {...}, doctor: {...},
 * patient: {...} }.
 */

/**
 * @param {Object} data
 * @param {string} data.appointmentId
 * @param {string} data.prescriptionText
 * @param {string} [data.notes]
 */
export function createHealthRecord(data) {
  return api.post("/health-records", data);
}

/**
 * @param {Object} filters
 * @param {string} [filters.patientId]  doctor-only filter
 * @param {number} [filters.page]
 * @param {number} [filters.limit]
 */
export function getMyHealthRecords(filters = {}) {
  return api.get("/health-records", { query: filters });
}

/**
 * FHIR export — returns the raw FHIR R4 DocumentReference resource
 * ({ resourceType, id, status, subject, author, content, ... }).
 * Roles: PATIENT (own record) / DOCTOR (own patient's record) / ADMIN.
 *
 * @param {string} id  HealthRecord id
 */
export function getHealthRecordFhir(id) {
  return api.get(`/health-records/${id}/fhir`);
}

export default { createHealthRecord, getMyHealthRecords, getHealthRecordFhir };
