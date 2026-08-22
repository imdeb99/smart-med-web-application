const prisma = require('../../config/db');
const { ApiError } = require('../../middleware/errorHandler');

const paymentInclude = { user: { select: { id: true, name: true, email: true, avatarUrl: true } } };

/**
 * Creates a payment record and simulates the gateway flow: the mock gateway
 * marks most payments PAID immediately, unless the caller explicitly passes
 * status: "FAILED". No real money moves.
 */
const createPayment = async ({ userId, relatedType, relatedId, amount, method, status = 'PAID' }) => {
  // Validate that the related resource exists and belongs to the user.
  if (relatedType === 'APPOINTMENT') {
    const appointment = await prisma.appointment.findUnique({ where: { id: relatedId } });
    if (!appointment) throw new ApiError(404, 'Appointment not found.');
    if (appointment.patientId !== userId) throw new ApiError(403, 'You can only pay for your own appointments.');
  } else if (relatedType === 'SAMPLE_COLLECTION') {
    const collection = await prisma.sampleCollection.findUnique({ where: { id: relatedId } });
    if (!collection) throw new ApiError(404, 'Sample collection request not found.');
    if (collection.patientId !== userId) throw new ApiError(403, 'You can only pay for your own sample collections.');
  } else if (relatedType === 'AMBULANCE') {
    const booking = await prisma.ambulanceBooking.findUnique({ where: { id: relatedId } });
    if (!booking) throw new ApiError(404, 'Ambulance booking not found.');
    if (booking.patientId !== userId) throw new ApiError(403, 'You can only pay for your own ambulance bookings.');
  } else {
    throw new ApiError(400, 'relatedType must be APPOINTMENT, SAMPLE_COLLECTION or AMBULANCE.');
  }

  const existing = await prisma.payment.findFirst({ where: { relatedType, relatedId } });
  if (existing) {
    throw new ApiError(409, 'A payment already exists for this item.');
  }

  const transactionId =
    status === 'PAID' ? `SIM-${Date.now()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}` : null;

  return prisma.payment.create({
    data: { userId, relatedType, relatedId, amount, method, status, transactionId },
    include: paymentInclude,
  });
};

const listByUser = async (userId, { status, page = 1, limit = 20 }) => {
  const where = { userId, ...(status ? { status } : {}) };
  const [total, payments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      include: paymentInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { payments, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

module.exports = { createPayment, listByUser };
