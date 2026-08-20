const prisma = require('../../config/db');
const { ApiError } = require('../../middleware/errorHandler');

const appointmentInclude = {
  patient: { select: { id: true, name: true, email: true, phone: true } },
  doctor: {
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  },
};

const getAppointment = async (id) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: appointmentInclude,
  });
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found.');
  }
  return appointment;
};

/** Patient-only: book an appointment with a verified doctor. */
const createAppointment = async ({ patientId, doctorId, scheduledAt, type }) => {
  const doctor = await prisma.doctorProfile.findUnique({ where: { id: doctorId } });
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found.');
  }
  if (doctor.verificationStatus !== 'VERIFIED') {
    throw new ApiError(403, 'You can only book with a verified doctor.');
  }

  const appointment = await prisma.appointment.create({
    data: { patientId, doctorId, scheduledAt: new Date(scheduledAt), type },
    include: appointmentInclude,
  });

  return appointment;
};

const listPatientAppointments = async (patientId, { status, page = 1, limit = 20 }) => {
  const where = { patientId, ...(status ? { status } : {}) };
  const [total, appointments] = await Promise.all([
    prisma.appointment.count({ where }),
    prisma.appointment.findMany({
      where,
      include: appointmentInclude,
      orderBy: { scheduledAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { appointments, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

const listDoctorAppointments = async (doctorId, { status, page = 1, limit = 20 }) => {
  const where = { doctorId, ...(status ? { status } : {}) };
  const [total, appointments] = await Promise.all([
    prisma.appointment.count({ where }),
    prisma.appointment.findMany({
      where,
      include: appointmentInclude,
      orderBy: { scheduledAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { appointments, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

const updateStatus = async ({ id, userId, role, status }) => {
  const appointment = await getAppointment(id);

  if (role === 'DOCTOR') {
    if (appointment.doctorId !== userId) {
      throw new ApiError(403, 'You can only update your own appointments.');
    }
    if (status === 'CANCELLED' || status === 'COMPLETED') {
      const next = await prisma.appointment.update({ where: { id }, data: { status }, include: appointmentInclude });
      return next;
    }
    // Doctors may also confirm pending appointments
    if (status === 'CONFIRMED' && appointment.status === 'PENDING') {
      const next = await prisma.appointment.update({ where: { id }, data: { status }, include: appointmentInclude });
      return next;
    }
    throw new ApiError(400, `Doctor cannot set status to ${status} from ${appointment.status}.`);
  }

  if (role === 'PATIENT') {
    if (appointment.patientId !== userId) {
      throw new ApiError(403, 'You can only cancel your own appointments.');
    }
    if (status !== 'CANCELLED') {
      throw new ApiError(400, 'Patients may only cancel appointments.');
    }
    if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') {
      throw new ApiError(400, `Cannot cancel an appointment that is already ${appointment.status.toLowerCase()}.`);
    }
    const next = await prisma.appointment.update({ where: { id }, data: { status }, include: appointmentInclude });
    return next;
  }

  throw new ApiError(403, 'Forbidden.');
};

module.exports = {
  getAppointment,
  createAppointment,
  listPatientAppointments,
  listDoctorAppointments,
  updateStatus,
};
