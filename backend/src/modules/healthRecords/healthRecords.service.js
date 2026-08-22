const prisma = require('../../config/db');
const { ApiError } = require('../../middleware/errorHandler');
const { mapHealthRecordToFhir } = require('./fhirMapper');

const recordInclude = {
  appointment: { select: { id: true, scheduledAt: true, type: true, status: true } },
  doctor: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
  patient: { select: { id: true, name: true, email: true, avatarUrl: true } },
};

/**
 * Doctor-only: create a health record for one of their own appointments.
 * One record per appointment (enforced by the unique appointmentId).
 */
const createRecord = async ({ appointmentId, doctorId, prescriptionText, notes }) => {
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found.');
  }
  if (appointment.doctorId !== doctorId) {
    throw new ApiError(403, 'You can only write records for your own appointments.');
  }

  const existing = await prisma.healthRecord.findUnique({ where: { appointmentId } });
  if (existing) {
    throw new ApiError(409, 'A health record already exists for this appointment.');
  }

  return prisma.healthRecord.create({
    data: {
      appointmentId,
      doctorId,
      patientId: appointment.patientId,
      prescriptionText,
      notes: notes || null,
    },
    include: recordInclude,
  });
};

const listByPatient = async (patientId, { page = 1, limit = 20 }) => {
  const where = { patientId };
  const [total, records] = await Promise.all([
    prisma.healthRecord.count({ where }),
    prisma.healthRecord.findMany({
      where,
      include: recordInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { records, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

/** Doctor-only: list records they authored (optionally filtered by patient/appointment). */
const listByDoctor = async (doctorId, { patientId, appointmentId, page = 1, limit = 20 }) => {
  const where = { doctorId, ...(patientId ? { patientId } : {}), ...(appointmentId ? { appointmentId } : {}) };
  const [total, records] = await Promise.all([
    prisma.healthRecord.count({ where }),
    prisma.healthRecord.findMany({
      where,
      include: recordInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { records, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

/**
 * FHIR export: fetches one record (with relations) and converts it to a
 * minimal FHIR R4 DocumentReference. Access is enforced here by role:
 *   - PATIENT: only their own records
 *   - DOCTOR:  only records they authored
 *   - ADMIN:   any record
 */
const exportAsFhir = async ({ recordId, user }) => {
  const record = await prisma.healthRecord.findUnique({
    where: { id: recordId },
    include: recordInclude,
  });
  if (!record) {
    throw new ApiError(404, 'Health record not found.');
  }

  if (user.role === 'PATIENT' && record.patientId !== user.id) {
    throw new ApiError(403, 'You can only export your own health records.');
  }
  if (user.role === 'DOCTOR' && record.doctorId !== user.doctorProfile.id) {
    throw new ApiError(403, 'You can only export records you authored.');
  }

  return mapHealthRecordToFhir(record);
};

module.exports = { createRecord, listByPatient, listByDoctor, exportAsFhir };
