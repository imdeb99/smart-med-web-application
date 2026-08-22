const prisma = require('../../config/db');
const { ApiError } = require('../../middleware/errorHandler');

const bookingInclude = {
  patient: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
  ambulance: true,
};

/** Patient-only: request an ambulance. */
const createBooking = async ({ patientId, pickupLocation, dropLocation, type }) =>
  prisma.ambulanceBooking.create({
    data: { patientId, pickupLocation, dropLocation, type },
    include: bookingInclude,
  });

const listByPatient = async (patientId, { status, page = 1, limit = 20 }) => {
  const where = { patientId, ...(status ? { status } : {}) };
  const [total, bookings] = await Promise.all([
    prisma.ambulanceBooking.count({ where }),
    prisma.ambulanceBooking.findMany({
      where,
      include: bookingInclude,
      orderBy: { requestedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { bookings, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

const listAll = async ({ status, page = 1, limit = 20 }) => {
  const where = { ...(status ? { status } : {}) };
  const [total, bookings] = await Promise.all([
    prisma.ambulanceBooking.count({ where }),
    prisma.ambulanceBooking.findMany({
      where,
      include: bookingInclude,
      orderBy: { requestedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { bookings, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

/** Admin-only: assign an available ambulance to a booking. */
const assignAmbulance = async ({ id, ambulanceId }) => {
  const booking = await prisma.ambulanceBooking.findUnique({ where: { id } });
  if (!booking) {
    throw new ApiError(404, 'Ambulance booking not found.');
  }

  const ambulance = await prisma.ambulance.findUnique({ where: { id: ambulanceId } });
  if (!ambulance) {
    throw new ApiError(404, 'Ambulance not found.');
  }
  if (ambulance.status !== 'AVAILABLE') {
    throw new ApiError(400, 'That ambulance is not available.');
  }

  const [updatedBooking] = await prisma.$transaction([
    prisma.ambulanceBooking.update({
      where: { id },
      data: { ambulanceId, status: 'ASSIGNED' },
      include: bookingInclude,
    }),
    prisma.ambulance.update({ where: { id: ambulanceId }, data: { status: 'BUSY' } }),
  ]);

  return updatedBooking;
};

module.exports = { createBooking, listByPatient, listAll, assignAmbulance };
