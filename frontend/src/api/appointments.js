import api, { getToken, ApiError } from "./client";

/**
 * Appointments module —
 *   POST  /api/appointments            (PATIENT)
 *   GET   /api/appointments            (PATIENT/DOCTOR, scoped to caller)
 *   PATCH /api/appointments/:id/status (PATIENT cancel / DOCTOR confirm-complete-cancel)
 *   GET   /api/appointments/:id/pdf    (PATIENT own / DOCTOR / ADMIN)
 *
 * Backend Appointment shape: { id, patientId, doctorId, scheduledAt (ISO),
 * type: VIDEO|IN_PERSON, status: PENDING|CONFIRMED|COMPLETED|CANCELLED,
 * createdAt, patient: {...}, doctor: {...} }.
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/+$/, "");

/**
 * @param {Object} data
 * @param {string} data.doctorId      DoctorProfile id (UUID)
 * @param {string} data.scheduledAt   ISO datetime string
 * @param {"VIDEO"|"IN_PERSON"} data.type
 */
export function createAppointment(data) {
  return api.post("/appointments", data);
}

/**
 * @param {Object} filters
 * @param {string} [filters.status]  PENDING|CONFIRMED|COMPLETED|CANCELLED
 * @param {number} [filters.page]
 * @param {number} [filters.limit]
 */
export function getMyAppointments(filters = {}) {
  return api.get("/appointments", { query: filters });
}

/**
 * @param {string} id
 * @param {"CONFIRMED"|"COMPLETED"|"CANCELLED"} status
 */
export function updateAppointmentStatus(id, status) {
  return api.patch(`/appointments/${id}/status`, { status });
}

/**
 * Download the appointment ticket PDF and trigger a browser download.
 * Uses raw fetch (the JSON client can't handle a PDF body).
 * @param {string} id
 */
export async function downloadAppointmentPdf(id) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/appointments/${id}/pdf`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    let message = `Download failed (${response.status}).`;
    try {
      const payload = await response.json();
      message = payload?.error?.message || message;
    } catch {
      // non-JSON error body — keep the generic message
    }
    throw new ApiError(message, response.status);
  }

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="?([^";]+)"?/);
  const filename = match ? match[1] : "SmartMed-Appointment.pdf";

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default { createAppointment, getMyAppointments, updateAppointmentStatus, downloadAppointmentPdf };
