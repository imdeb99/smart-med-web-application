const prisma = require('../../config/db');
const { ApiError } = require('../../middleware/errorHandler');
const { emitCapacityUpdate } = require('../../config/socket');

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
    include: { user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } } },
  });
};

const doctorInclude = {
  user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
};

const listDoctors = async ({ page = 1, limit = 20 }) => {
  const [total, doctors] = await Promise.all([
    prisma.doctorProfile.count(),
    prisma.doctorProfile.findMany({
      include: doctorInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { doctors, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

/** Admin: create a doctor profile (+ linked user account). */
const createDoctor = async ({ name, email, phone, specialty, bmdcId, bio, consultationFee, qualifications, experienceYears, location, verificationStatus }) => {
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    throw new ApiError(409, 'A user with this email already exists.');
  }
  const existingBmdc = await prisma.doctorProfile.findUnique({ where: { bmdcId } });
  if (existingBmdc) {
    throw new ApiError(409, 'A doctor with this BMDC ID already exists.');
  }

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      // Placeholder password — the doctor should use "Forgot password" (if
      // implemented) or an admin can reset it. Hashed for storage safety.
      passwordHash: '$2a$10$CwTycUXWue0Thq9StjUM0uJ8x9E1vF0mQqZg6L0aKxqF1qQ0uY1yW',
      phone: phone || null,
      role: 'DOCTOR',
      doctorProfile: {
        create: {
          bmdcId,
          specialty,
          bio: bio || null,
          consultationFee,
          qualifications: qualifications || null,
          experienceYears: experienceYears ?? null,
          location: location || null,
          verificationStatus: verificationStatus || 'PENDING',
        },
      },
    },
    include: { doctorProfile: { include: doctorInclude } },
  });
  return user.doctorProfile;
};

/** Admin: update a doctor's professional profile fields. */
const updateDoctor = async (doctorId, data) => {
  const doctor = await prisma.doctorProfile.findUnique({ where: { id: doctorId } });
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found.');
  }

  return prisma.doctorProfile.update({
    where: { id: doctorId },
    data: {
      ...(data.specialty !== undefined ? { specialty: data.specialty } : {}),
      ...(data.bio !== undefined ? { bio: data.bio } : {}),
      ...(data.consultationFee !== undefined ? { consultationFee: data.consultationFee } : {}),
      ...(data.qualifications !== undefined ? { qualifications: data.qualifications } : {}),
      ...(data.experienceYears !== undefined ? { experienceYears: data.experienceYears } : {}),
      ...(data.location !== undefined ? { location: data.location } : {}),
      ...(data.verificationStatus !== undefined ? { verificationStatus: data.verificationStatus } : {}),
    },
    include: doctorInclude,
  });
};

/** Admin: delete a doctor's profile (cascades to the user). */
const deleteDoctor = async (doctorId) => {
  const doctor = await prisma.doctorProfile.findUnique({ where: { id: doctorId } });
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found.');
  }
  await prisma.doctorProfile.delete({ where: { id: doctorId } });
  return { id: doctorId };
};

const patientInclude = {
  patientProfile: true,
};

// Strip sensitive fields (passwordHash) from user rows before sending.
const sanitizeUser = (user) => {
  if (!user) return user;
  const { passwordHash, ...rest } = user;
  return rest;
};

/** Admin: list all patient users (+ their PatientProfile). */
const listPatients = async ({ search, page = 1, limit = 20 }) => {
  const where = {
    role: 'PATIENT',
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
  const [total, patients] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: patientInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return {
    patients: patients.map(sanitizeUser),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

/** Admin: single patient detail. */
const getPatient = async (id) => {
  const patient = await prisma.user.findUnique({
    where: { id },
    include: patientInclude,
  });
  if (!patient || patient.role !== 'PATIENT') {
    throw new ApiError(404, 'Patient not found.');
  }
  return sanitizeUser(patient);
};

/** Admin: update a patient's account + profile fields. */
const updatePatient = async (id, data) => {
  const patient = await prisma.user.findUnique({ where: { id } });
  if (!patient || patient.role !== 'PATIENT') {
    throw new ApiError(404, 'Patient not found.');
  }

  return prisma.user
    .update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.phone !== undefined ? { phone: data.phone || null } : {}),
        patientProfile: {
          update: {
            ...(data.address !== undefined ? { address: data.address } : {}),
            ...(data.dob !== undefined ? { dob: data.dob ? new Date(data.dob) : null } : {}),
            ...(data.gender !== undefined ? { gender: data.gender } : {}),
          },
        },
      },
      include: patientInclude,
    })
    .then(sanitizeUser);
};

/** Admin: delete a patient account. Related records (appointments, health
 *  records, reviews, payments, etc.) cascade-delete per the Prisma relations. */
const deletePatient = async (id) => {
  const patient = await prisma.user.findUnique({ where: { id } });
  if (!patient || patient.role !== 'PATIENT') {
    throw new ApiError(404, 'Patient not found.');
  }
  await prisma.user.delete({ where: { id } });
  return { id };
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
  return {
    users: users.map(sanitizeUser),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

const listAllAppointments = async ({ status, page = 1, limit = 20 }) => {
  const where = { ...(status ? { status } : {}) };
  const [total, appointments] = await Promise.all([
    prisma.appointment.count({ where }),
    prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true, email: true, avatarUrl: true } },
        doctor: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
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
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
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

/** Admin: list all daily capacity records, optionally filtered by date/doctor. */
const listDailyCapacities = async ({ date, doctorId, page = 1, limit = 20 }) => {
  const where = {
    ...(date ? { date: new Date(`${date}T00:00:00.000Z`) } : {}),
    ...(doctorId ? { doctorId } : {}),
  };
  const [total, capacities] = await Promise.all([
    prisma.dailyCapacity.count({ where }),
    prisma.dailyCapacity.findMany({
      where,
      include: {
        doctor: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
        _count: { select: { appointments: { where: { status: { not: 'CANCELLED' } } } } },
      },
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return {
    capacities: capacities.map((c) => ({
      ...c,
      booked: c._count.appointments,
      available: Math.max(0, c.totalCapacity - c._count.appointments),
      _count: undefined,
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

/**
 * Admin: override a daily capacity record (totalCapacity / startTime /
 * avgDurationMin). Rejects lowering totalCapacity below the current booked
 * count, and records the change in CapacityOverrideLog.
 */
const overrideDailyCapacity = async ({ capacityId, adminId, totalCapacity, startTime, avgDurationMin, reason }) => {
  const capacity = await prisma.dailyCapacity.findUnique({ where: { id: capacityId } });
  if (!capacity) {
    throw new ApiError(404, 'Daily capacity record not found.');
  }

  const bookedCount = await prisma.appointment.count({
    where: { dailyCapacityId: capacity.id, status: { not: 'CANCELLED' } },
  });
  if (totalCapacity !== undefined && totalCapacity < bookedCount) {
    throw new ApiError(
      400,
      `Cannot set capacity below already booked count (${bookedCount} patients booked).`,
    );
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.dailyCapacity.update({
      where: { id: capacityId },
      data: {
        ...(totalCapacity !== undefined ? { totalCapacity } : {}),
        ...(startTime !== undefined ? { startTime } : {}),
        ...(avgDurationMin !== undefined ? { avgDurationMin } : {}),
      },
    });

    // Audit: record who changed what, and the old -> new values.
    if (totalCapacity !== undefined && totalCapacity !== capacity.totalCapacity) {
      await tx.capacityOverrideLog.create({
        data: {
          dailyCapacityId: capacityId,
          adminId,
          previousCapacity: capacity.totalCapacity,
          newCapacity: totalCapacity,
          reason: reason || null,
        },
      });
    }

    return updated;
  }).then((updated) => {
    // Broadcast AFTER the transaction commits.
    const date = capacity.date.toISOString().slice(0, 10);
    const booked = bookedCount;
    emitCapacityUpdate({
      doctorId: capacity.doctorId,
      date,
      capacity: {
        booked,
        totalCapacity: updated.totalCapacity,
        available: Math.max(0, updated.totalCapacity - booked),
      },
    });
    return updated;
  });
};

module.exports = {
  setDoctorVerification,
  listDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  listPatients,
  getPatient,
  updatePatient,
  deletePatient,
  listUsers,
  listAllAppointments,
  listAllPayments,
  listDailyCapacities,
  overrideDailyCapacity,
  getDashboard,
};
