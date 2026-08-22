import api from "./client";

/**
 * Public: get a doctor's daily capacity info for a specific date.
 * Returns { capacity } where capacity is null if not configured,
 * or { totalCapacity, booked, available, startTime, avgDurationMin, ... }.
 */
export function getDoctorDailyCapacity(doctorId, date) {
  return api.get(`/daily-capacity/doctor/${doctorId}`, { query: { date } });
}

export default { getDoctorDailyCapacity };
