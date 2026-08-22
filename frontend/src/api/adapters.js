// Adapters: convert backend API payloads into the shapes the existing UI
// components expect (the frontend mock shapes). Keeping the mapping here means
// pages/components need minimal (or no) changes when switching to the API.
//
// Backend envelope:  { success, data, error }   — `api` client already unwraps
// `data`, so adapters receive the raw `data` object (e.g. `{ doctors,
// pagination }` or a single record).
//
// Backend enum → UI string conventions:
//   verificationStatus: PENDING|VERIFIED|REJECTED   → verified: boolean
//   appointment type:   VIDEO|IN_PERSON             → "video" | "in-person"
//   appointment status: PENDING|CONFIRMED|COMPLETED|CANCELLED
//                                                    → "upcoming" | "completed" | "cancelled"
//   ambulance type:     BASIC|ICU|FREEZER           → "basic" | "icu" | "freezer"

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

/** "2026-08-20T10:30:00.000Z" -> "2026-08-20" (local timezone date) */
export function toISODate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** "2026-08-20" + "10:30 AM" -> "2026-08-20T04:30:00.000Z" — ISO datetime
 *  the backend accepts for scheduledAt (zod: datetime with offset). */
export function toISODateTime(date, time = "") {
  if (!date) return "";
  const match = String(time).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return new Date(`${date}T00:00:00`).toISOString();
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = (match[3] || "").toUpperCase();
  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  const d = new Date(
    `${date}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`,
  );
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

/** "2026-08-20T10:30:00.000Z" -> "10:30 AM" (UI time format) */
export function toTime12h(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** Real uploaded avatar if present, else a deterministic pravatar placeholder. */
function avatarFromId(id, seed) {
  if (seed) return seed;
  let hash = 0;
  const str = String(id || "");
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return `https://i.pravatar.cc/150?img=${(hash % 70) + 1}`;
}

// ---------------------------------------------------------------------------
// User / auth
// ---------------------------------------------------------------------------

/**
 * Backend User -> frontend user (mockUsers-ish). Never exposes passwordHash
 * (the backend sanitizes it, but be defensive).
 */
export function mapUserFromApi(user = {}) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    avatar: user.avatarUrl || user.avatar || "",
    role: (user.role || "PATIENT").toLowerCase(),
    ...(user.doctorProfile ? { doctorProfile: user.doctorProfile } : {}),
    ...(user.patientProfile ? { patientProfile: user.patientProfile } : {}),
  };
}

/**
 * Backend User (role PATIENT, with nested patientProfile) -> UI patient shape
 * used by ManagePatients. The backend has no bloodGroup/age fields, so those
 * are derived (age from dob) or left blank.
 */
export function mapPatientFromApi(user = {}) {
  if (!user) return null;
  const profile = user.patientProfile || {};
  let age = "";
  if (profile.dob) {
    const dob = new Date(profile.dob);
    if (!Number.isNaN(dob.getTime())) {
      const diff = Date.now() - dob.getTime();
      age = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
    }
  }
  return {
    id: user.id,
    name: user.name || "Unknown Patient",
    email: user.email || "",
    phone: user.phone || "",
    age,
    gender: profile.gender || "",
    bloodGroup: "",
    address: profile.address || "",
    dob: profile.dob || "",
    avatar: user.avatarUrl || user.avatar || avatarFromId(user.id),
  };
}

/** GET /admin/patients -> { patients: [...ui], pagination } */
export function mapPatientsListFromApi(data = {}) {
  return {
    patients: (data.patients || []).map(mapPatientFromApi),
    pagination: data.pagination || null,
  };
}

/** GET /admin/patients/:id -> ui patient */
export function mapPatientDetailFromApi(data = {}) {
  return mapPatientFromApi(data.patient ?? data);
}

// ---------------------------------------------------------------------------
// Doctors
// ---------------------------------------------------------------------------

/**
 * Backend DoctorProfile -> UI doctor (mockDoctors shape).
 *   backend: { id, userId, bmdcId, specialty, bio, consultationFee,
 *              verificationStatus, createdAt, user: { name, phone, ... } }
 *   ui:      { id, name, specialty, qualifications, bmdcId, verified, rating,
 *              reviewsCount, experienceYears, fee, location, avatar,
 *              languages, bio, availableSlots }
 */
export function mapDoctorFromApi(doctor = {}) {
  if (!doctor) return null;
  return {
    id: doctor.id,
    name: doctor.user?.name || doctor.name || "Unknown Doctor",
    specialty: doctor.specialty || "",
    qualifications: doctor.qualifications || "",
    bmdcId: doctor.bmdcId || "",
    verified: doctor.verificationStatus === "VERIFIED",
    verificationStatus: doctor.verificationStatus || "PENDING",
    rating: doctor.rating ?? 0,
    reviewsCount: doctor.reviewsCount ?? 0,
    experienceYears: doctor.experienceYears ?? 0,
    fee: doctor.consultationFee ?? doctor.fee ?? 0,
    location: doctor.location || "",
    avatar: doctor.user?.avatarUrl || doctor.avatar || avatarFromId(doctor.id, doctor.avatar),
    languages: doctor.languages || [],
    bio: doctor.bio || "",
    availableSlots: doctor.availableSlots || [],
    phone: doctor.user?.phone || doctor.phone || "",
    email: doctor.user?.email || doctor.email || "",
    userId: doctor.userId,
    createdAt: doctor.createdAt,
  };
}

/**
 * Backend User row (as returned by /auth/me or /auth/login with a nested
 * doctorProfile) -> UI doctor shape. Needed because the auth user object has
 * the doctor profile nested on the user, not as a standalone doctor.
 */
export function mapDoctorFromAuthUser(user = {}) {
  const profile = user.doctorProfile || {};
  return mapDoctorFromApi({
    ...profile,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  });
}

/** GET /doctors -> { doctors: [...ui], pagination } */
export function mapDoctorsListFromApi(data = {}) {
  return {
    doctors: (data.doctors || []).map(mapDoctorFromApi),
    pagination: data.pagination || null,
  };
}

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

/**
 * Backend Appointment -> UI appointment (mockAppointments shape).
 *   backend: { id, patientId, doctorId, scheduledAt (ISO), type, status,
 *              patient: {...}, doctor: { ..., consultationFee, user: {...} } }
 *   ui:      { id, patientId, doctorId, date, time, type: "video"|"in-person",
 *              status: "upcoming"|"completed"|"cancelled", fee, notes }
 */
export function mapAppointmentFromApi(appointment = {}) {
  if (!appointment) return null;
  const type =
    appointment.type === "IN_PERSON" ? "in-person" : appointment.type?.toLowerCase() || "video";
  const status =
    appointment.status === "COMPLETED"
      ? "completed"
      : appointment.status === "CANCELLED"
        ? "cancelled"
        : "upcoming"; // PENDING / CONFIRMED both read as upcoming in the UI
  return {
    id: appointment.id,
    patientId: appointment.patientId,
    doctorId: appointment.doctorId,
    date: toISODate(appointment.scheduledAt),
    time: toTime12h(appointment.scheduledAt),
    type,
    status,
    // Daily Capacity Booking ticket fields (absent for legacy slot bookings).
    tokenNumber: appointment.tokenNumber ?? null,
    estimatedTime: appointment.estimatedTime ?? null,
    dailyCapacityId: appointment.dailyCapacityId ?? null,
    fee: appointment.doctor?.consultationFee ?? appointment.fee ?? 0,
    notes: appointment.notes || "",
    scheduledAt: appointment.scheduledAt,
    doctor: appointment.doctor ? mapDoctorFromApi(appointment.doctor) : undefined,
    patient: appointment.patient
      ? {
          id: appointment.patient.id,
          name: appointment.patient.name,
          email: appointment.patient.email,
          phone: appointment.patient.phone,
          avatar: appointment.patient.avatar || avatarFromId(appointment.patient.id),
          age: appointment.patient.age ?? "",
          gender: appointment.patient.gender ?? "",
        }
      : undefined,
  };
}

/** GET /appointments -> { appointments: [...ui], pagination } */
export function mapAppointmentsListFromApi(data = {}) {
  return {
    appointments: (data.appointments || []).map(mapAppointmentFromApi),
    pagination: data.pagination || null,
  };
}

// ---------------------------------------------------------------------------
// Health records
// ---------------------------------------------------------------------------

/**
 * Backend HealthRecord -> UI record (the HealthRecords page builds records
 * from completed appointments, so we mirror that shape).
 */
export function mapHealthRecordFromApi(record = {}) {
  if (!record) return null;
  return {
    id: record.id,
    appointmentId: record.appointmentId,
    patientId: record.patientId,
    doctorId: record.doctorId,
    date: toISODate(record.appointment?.scheduledAt || record.createdAt),
    time: toTime12h(record.appointment?.scheduledAt),
    doctor: {
      id: record.doctor?.id,
      name: record.doctor?.user?.name || record.doctor?.name || "Unknown Doctor",
      specialty: record.doctor?.specialty || "",
      avatar: avatarFromId(record.doctorId, record.doctor?.avatar),
    },
    notes: record.notes || "",
    prescriptionText: record.prescriptionText || "",
    createdAt: record.createdAt,
  };
}

/** GET /health-records -> { records: [...ui], pagination } */
export function mapHealthRecordsListFromApi(data = {}) {
  return {
    records: (data.records || []).map(mapHealthRecordFromApi),
    pagination: data.pagination || null,
  };
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

/**
 * Backend Review -> UI review (mockReviews shape).
 *   ui: { id, doctorId, patientId, rating, comment, date, patientName }
 */
export function mapReviewFromApi(review = {}) {
  if (!review) return null;
  return {
    id: review.id,
    doctorId: review.doctorId,
    patientId: review.patientId,
    rating: review.rating,
    comment: review.comment || "",
    date: toISODate(review.createdAt),
    patientName: review.patient?.name || review.patientName || "Anonymous",
    createdAt: review.createdAt,
  };
}

/** GET /reviews/doctor/:doctorId -> { reviews: [...ui], summary, pagination } */
export function mapReviewsListFromApi(data = {}) {
  return {
    reviews: (data.reviews || []).map(mapReviewFromApi),
    summary: data.summary || null,
    pagination: data.pagination || null,
  };
}

// ---------------------------------------------------------------------------
// Sample collections
// ---------------------------------------------------------------------------

/** Backend SampleCollection -> UI-friendly shape (status/date normalized). */
export function mapSampleCollectionFromApi(collection = {}) {
  if (!collection) return null;
  return {
    id: collection.id,
    patientId: collection.patientId,
    labAssistantId: collection.labAssistantId,
    testName: collection.testName,
    address: collection.address,
    date: toISODate(collection.scheduledAt),
    time: toTime12h(collection.scheduledAt),
    scheduledAt: collection.scheduledAt,
    status: (collection.status || "REQUESTED").toLowerCase(),
    createdAt: collection.createdAt,
    patient: collection.patient
      ? {
          id: collection.patient.id,
          name: collection.patient.name,
          email: collection.patient.email,
          phone: collection.patient.phone,
          avatar: collection.patient.avatar || avatarFromId(collection.patient.id),
        }
      : undefined,
    labAssistant: collection.labAssistant || null,
  };
}

/** GET /sample-collections[/mine] -> { collections: [...ui], pagination } */
export function mapSampleCollectionsListFromApi(data = {}) {
  return {
    collections: (data.collections || []).map(mapSampleCollectionFromApi),
    pagination: data.pagination || null,
  };
}

// ---------------------------------------------------------------------------
// Ambulance bookings
// ---------------------------------------------------------------------------

/** Backend AmbulanceBooking -> UI-friendly shape (type/status normalized). */
export function mapAmbulanceBookingFromApi(booking = {}) {
  if (!booking) return null;
  return {
    id: booking.id,
    patientId: booking.patientId,
    ambulanceId: booking.ambulanceId,
    pickupLocation: booking.pickupLocation,
    dropLocation: booking.dropLocation,
    type: (booking.type || "BASIC").toLowerCase(),
    status: (booking.status || "REQUESTED").toLowerCase(),
    requestedAt: booking.requestedAt,
    patient: booking.patient
      ? {
          id: booking.patient.id,
          name: booking.patient.name,
          email: booking.patient.email,
          phone: booking.patient.phone,
          avatar: booking.patient.avatar || avatarFromId(booking.patient.id),
        }
      : undefined,
    ambulance: booking.ambulance || null,
  };
}

/** GET /ambulance-bookings[/mine] -> { bookings: [...ui], pagination } */
export function mapAmbulanceBookingsListFromApi(data = {}) {
  return {
    bookings: (data.bookings || []).map(mapAmbulanceBookingFromApi),
    pagination: data.pagination || null,
  };
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

/**
 * Backend Payment -> UI payment (mockTransactions shape).
 *   ui: { id, patientName, service, method, amount, status, date }
 */
export function mapPaymentFromApi(payment = {}) {
  if (!payment) return null;
  const serviceLabel = {
    APPOINTMENT: "Consultation",
    SAMPLE_COLLECTION: "Sample Collection",
    AMBULANCE: "Ambulance",
  }[payment.relatedType] || payment.relatedType || "Payment";
  return {
    id: payment.id,
    transactionId: payment.transactionId || "",
    patientName: payment.user?.name || payment.patientName || "Unknown",
    service: serviceLabel,
    method: payment.method || "",
    amount: payment.amount ?? 0,
    status: (payment.status || "PENDING").toLowerCase(),
    date: toISODate(payment.createdAt),
    relatedType: payment.relatedType,
    relatedId: payment.relatedId,
    createdAt: payment.createdAt,
  };
}

/** GET /payments -> { payments: [...ui], pagination } */
export function mapPaymentsListFromApi(data = {}) {
  return {
    payments: (data.payments || []).map(mapPaymentFromApi),
    pagination: data.pagination || null,
  };
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

/**
 * GET /admin/dashboard -> UI-friendly stats object. Backend:
 *   { users: { total, doctors, patients }, doctors: { pendingVerification },
 *     appointments: { total, completed }, payments: { total, revenue },
 *     sampleCollections: { total }, ambulanceBookings: { total } }
 */
export function mapAdminDashboardFromApi(data = {}) {
  return {
    totalDoctors: data.users?.doctors ?? 0,
    totalPatients: data.users?.patients ?? 0,
    totalUsers: data.users?.total ?? 0,
    pendingVerifications: data.doctors?.pendingVerification ?? 0,
    totalAppointments: data.appointments?.total ?? 0,
    completedAppointments: data.appointments?.completed ?? 0,
    totalRevenue: data.payments?.revenue ?? 0,
    totalPayments: data.payments?.total ?? 0,
    totalSampleCollections: data.sampleCollections?.total ?? 0,
    totalAmbulanceBookings: data.ambulanceBookings?.total ?? 0,
    raw: data,
  };
}

/** Admin user row -> UI user (same mapping as mapUserFromApi). */
export function mapAdminUserFromApi(user = {}) {
  return mapUserFromApi(user);
}

/** GET /admin/users -> { users: [...ui], pagination } */
export function mapAdminUsersListFromApi(data = {}) {
  return {
    users: (data.users || []).map(mapAdminUserFromApi),
    pagination: data.pagination || null,
  };
}

export default {
  toISODate,
  toISODateTime,
  toTime12h,
  mapUserFromApi,
  mapPatientFromApi,
  mapPatientsListFromApi,
  mapPatientDetailFromApi,
  mapDoctorFromApi,
  mapDoctorFromAuthUser,
  mapDoctorsListFromApi,
  mapAppointmentFromApi,
  mapAppointmentsListFromApi,
  mapHealthRecordFromApi,
  mapHealthRecordsListFromApi,
  mapReviewFromApi,
  mapReviewsListFromApi,
  mapSampleCollectionFromApi,
  mapSampleCollectionsListFromApi,
  mapAmbulanceBookingFromApi,
  mapAmbulanceBookingsListFromApi,
  mapPaymentFromApi,
  mapPaymentsListFromApi,
  mapAdminDashboardFromApi,
  mapAdminUserFromApi,
  mapAdminUsersListFromApi,
};
