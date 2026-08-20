const prisma = require('../../config/db');
const { ApiError } = require('../../middleware/errorHandler');

const userInclude = {
  doctorProfile: true,
  patientProfile: true,
};

/** Admin: verify or reject a doctor's profile. */
const setDoctorVerification = async (doctorId, verificationStatus) => {
  const doctor = await prisma.doctorProfile.findUnique({ where: { id: doctorId } });
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found.');
  }

  return prisma.doctorProfile.update({
    where: { id: doctorId },
    data: { verificationStatus },
    include: { user: { select: { id: true, name: true, email: true, phone: true } } },
  });
};

const listUsers = async ({ role, page = 1, limit = 20 }) => {
  const where = { ...(role ? { role } : {}) };
  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: userInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

const listAllAppointments = async ({ status, page = 1, limit = 20 }) => {
  const where = { ...(status ? { status } : {}) };
  const [total, appointments] = await Promise.all([
    prisma.appointment.count({ where }),
    prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true, email: true } },
        doctor: { include: { user: { select: { id: true, name: true } } } },
      },
      orderBy: { scheduledAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { appointments, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

const listAllPayments = async ({ status, page = 1, limit = 20 }) => {
  const where = { ...(status ? { status } : {}) };
  const [total, payments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { payments, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

/** Admin: dashboard aggregate counts + revenue. */
const getDashboard = async () => {
  const [
    totalUsers,
    totalDoctors,
    totalPatients,
    pendingDoctors,
    totalAppointments,
    completedAppointments,
    totalPayments,
    totalSampleCollections,
    totalAmbulanceBookings,
    revenueAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'DOCTOR' } }),
    prisma.user.count({ where: { role: 'PATIENT' } }),
    prisma.doctorProfile.count({ where: { verificationStatus: 'PENDING' } }),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { status: 'COMPLETED' } }),
    prisma.payment.count(),
    prisma.sampleCollection.count(),
    prisma.ambulanceBooking.count(),
    prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
  ]);

  return {
    users: { total: totalUsers, doctors: totalDoctors, patients: totalPatients },
    doctors: { pendingVerification: pendingDoctors },
    appointments: { total: totalAppointments, completed: completedAppointments },
    payments: { total: totalPayments, revenue: revenueAgg._sum.amount || 0 },
    sampleCollections: { total: totalSampleCollections },
    ambulanceBookings: { total: totalAmbulanceBookings },
  };
};

module.exports = {
  setDoctorVerification,
  listUsers,
  listAllAppointments,
  listAllPayments,
  getDashboard,
};
