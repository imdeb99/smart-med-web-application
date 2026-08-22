const prisma = require('../../config/db');
const { ApiError } = require('../../middleware/errorHandler');

// Attach rating + review count to a list of doctor profiles. The UI expects
// these fields (adapter: rating / reviewsCount); the schema stores reviews
// separately, so aggregate them here.
const attachReviewStats = async (doctors) => {
  if (doctors.length === 0) return doctors;
  const ids = doctors.map((d) => d.id);
  const stats = await prisma.review.groupBy({
    by: ['doctorId'],
    where: { doctorId: { in: ids } },
    _avg: { rating: true },
    _count: { rating: true },
  });
  const byId = new Map(stats.map((s) => [s.doctorId, s]));
  return doctors.map((d) => {
    const stat = byId.get(d.id);
    return {
      ...d,
      rating: stat ? Number(stat._avg.rating).toFixed(1) : 0,
      reviewsCount: stat ? stat._count.rating : 0,
    };
  });
};

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
      include: { user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true, role: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    doctors: await attachReviewStats(doctors),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

const getDoctorProfile = async (id) => {
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true, role: true, createdAt: true } } },
  });
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found.');
  }
  return (await attachReviewStats([doctor]))[0];
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
    include: { user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true, role: true, createdAt: true } } },
  });
};

module.exports = { listDoctors, getDoctorProfile, updateOwnProfile };
