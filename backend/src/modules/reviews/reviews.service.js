const prisma = require('../../config/db');
const { ApiError } = require('../../middleware/errorHandler');

const reviewInclude = {
  patient: { select: { id: true, name: true } },
  doctor: { include: { user: { select: { id: true, name: true } } } },
};

/**
 * Patient-only: review a doctor after a COMPLETED appointment. One review
 * per (patient, doctor) pair — the patient can update it afterwards.
 */
const createReview = async ({ doctorId, patientId, rating, comment }) => {
  const doctor = await prisma.doctorProfile.findUnique({ where: { id: doctorId } });
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found.');
  }

  const completed = await prisma.appointment.findFirst({
    where: { patientId, doctorId, status: 'COMPLETED' },
  });
  if (!completed) {
    throw new ApiError(403, 'You can only review a doctor after a completed appointment.');
  }

  const existing = await prisma.review.findUnique({
    where: { doctorId_patientId: { doctorId, patientId } },
  });
  if (existing) {
    throw new ApiError(409, 'You have already reviewed this doctor.');
  }

  return prisma.review.create({
    data: { doctorId, patientId, rating, comment: comment || null },
    include: reviewInclude,
  });
};

const listByDoctor = async (doctorId, { page = 1, limit = 20 }) => {
  const where = { doctorId };
  const [total, reviews] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      include: reviewInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const agg = await prisma.review.aggregate({
    where,
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    reviews,
    summary: { averageRating: Number(agg._avg.rating || 0).toFixed(1), totalReviews: agg._count.rating },
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

module.exports = { createReview, listByDoctor };
