const prisma = require('../../config/db');
const { ApiError } = require('../../middleware/errorHandler');
const { emitCapacityUpdate } = require('../../config/socket');

/** Parse "HH:MM" (24h) into minutes since midnight. */
const timeToMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Patient-only: book against a doctor's daily capacity for a given date.
 * Runs in a transaction so concurrent bookings can't oversell the capacity.
 */
const createDailyCapacityBooking = async ({ patientId, doctorId, date }) => {
  const targetDate = new Date(`${date}T00:00:00.000Z`);

  return prisma.$transaction(async (tx) => {
    const capacity = await tx.dailyCapacity.findUnique({
      where: { doctorId_date: { doctorId, date: targetDate } },
    });
    if (!capacity) {
      throw new ApiError(404, 'No capacity configured for this doctor on the selected date.');
    }

    // Count only non-cancelled bookings so a cancellation frees a token.
    const bookedCount = await tx.appointment.count({
      where: { dailyCapacityId: capacity.id, status: { not: 'CANCELLED' } },
    });
    if (bookedCount >= capacity.totalCapacity) {
      throw new ApiError(409, 'Fully booked. No capacity left for this date.');
    }

    // One active (non-cancelled) booking per patient per doctor per date.
    const existing = await tx.appointment.findFirst({
      where: {
        patientId,
        doctorId,
        dailyCapacityId: capacity.id,
        status: { not: 'CANCELLED' },
      },
    });
    if (existing) {
      throw new ApiError(409, 'You already have a booking with this doctor on this date.');
    }

    const tokenNumber = bookedCount + 1;
    const estimatedTime = new Date(
      targetDate.getTime() + (timeToMinutes(capacity.startTime) + (tokenNumber - 1) * capacity.avgDurationMin) * 60000,
    );

    const appointment = await tx.appointment.create({
      data: {
        patientId,
        doctorId,
        scheduledAt: targetDate,
        type: 'VIDEO',
        tokenNumber,
        estimatedTime,
        dailyCapacityId: capacity.id,
      },
      include: appointmentInclude,
    });

    return { appointment, bookedCount: bookedCount + 1, totalCapacity: capacity.totalCapacity };
  }).then(({ appointment, bookedCount, totalCapacity }) => {
    // Broadcast AFTER the transaction commits so listeners never see a
    // half-applied state.
    emitCapacityUpdate({
      doctorId,
      date,
      capacity: {
        booked: bookedCount,
        totalCapacity,
        available: Math.max(0, totalCapacity - bookedCount),
      },
    });
    return appointment;
  });
};

const appointmentInclude = {
  patient: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
  doctor: {
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
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
      await broadcastAfterCancel(appointment, status);
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
    await broadcastAfterCancel(appointment, status);
    return next;
  }

  throw new ApiError(403, 'Forbidden.');
};

/** After an appointment is cancelled, broadcast the freed slot to the room. */
const broadcastAfterCancel = async (appointment, status) => {
  if (status !== 'CANCELLED' || !appointment.dailyCapacityId) return;

  const capacity = await prisma.dailyCapacity.findUnique({
    where: { id: appointment.dailyCapacityId },
  });
  if (!capacity) return;

  const booked = await prisma.appointment.count({
    where: { dailyCapacityId: capacity.id, status: { not: 'CANCELLED' } },
  });
  const date = capacity.date.toISOString().slice(0, 10);

  emitCapacityUpdate({
    doctorId: capacity.doctorId,
    date,
    capacity: {
      booked,
      totalCapacity: capacity.totalCapacity,
      available: Math.max(0, capacity.totalCapacity - booked),
    },
  });
};

module.exports = {
  getAppointment,
  createAppointment,
  createDailyCapacityBooking,
  listPatientAppointments,
  listDoctorAppointments,
  updateStatus,
};
