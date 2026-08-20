const prisma = require('../../config/db');
const { ApiError } = require('../../middleware/errorHandler');

/**
 * Public: list doctors, optionally filtered by specialty and/or verification
 * status (verification filter is admin-only, enforced in the route).
 */
const listDoctors = async ({ specialty, verificationStatus, search, page = 1, limit = 20 }) => {
  const where = {
    user: { role: 'DOCTOR' },
    ...(specialty ? { specialty } : {}),
    ...(verificationStatus ? { verificationStatus } : { verificationStatus: 'VERIFIED' }),
  };

  if (search) {
    where.OR = [
      { specialty: { contains: search, mode: 'insensitive' } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [total, doctors] = await Promise.all([
    prisma.doctorProfile.count({ where }),
    prisma.doctorProfile.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    doctors,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

const getDoctorProfile = async (id) => {
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true } } },
  });
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found.');
  }
  return doctor;
};

/** Doctor-only: update own profile fields. */
const updateOwnProfile = async (userId, data) => {
  const profile = await prisma.doctorProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new ApiError(404, 'Doctor profile not found. Contact an admin to be verified.');
  }

  return prisma.doctorProfile.update({
    where: { userId },
    data: {
      ...(data.specialty !== undefined ? { specialty: data.specialty } : {}),
      ...(data.bio !== undefined ? { bio: data.bio } : {}),
      ...(data.consultationFee !== undefined ? { consultationFee: data.consultationFee } : {}),
    },
    include: { user: { select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true } } },
  });
};

module.exports = { listDoctors, getDoctorProfile, updateOwnProfile };
