const prisma = require('../../config/db');
const { ApiError } = require('../../middleware/errorHandler');

/** Doctor-only: create or update the capacity for a specific date. */
const upsertCapacity = async ({ doctorId, date, totalCapacity, startTime, avgDurationMin }) => {
  return prisma.dailyCapacity.upsert({
    where: { doctorId_date: { doctorId, date: new Date(date) } },
    create: { doctorId, date: new Date(date), totalCapacity, startTime, avgDurationMin },
    update: { totalCapacity, startTime, avgDurationMin },
  });
};

/** Public: capacity info for one doctor on one date, with booked/available counts. */
const getCapacityForDate = async ({ doctorId, date }) => {
  const capacity = await prisma.dailyCapacity.findUnique({
    where: { doctorId_date: { doctorId, date: new Date(date) } },
  });
  if (!capacity) {
    return null;
  }

  const booked = await prisma.appointment.count({
    where: { dailyCapacityId: capacity.id, status: { not: 'CANCELLED' } },
  });

  return {
    ...capacity,
    booked,
    available: Math.max(0, capacity.totalCapacity - booked),
  };
};

/** Doctor-only: list all capacity records set by the logged-in doctor. */
const listMyCapacities = async (doctorId) => {
  return prisma.dailyCapacity.findMany({
    where: { doctorId },
    orderBy: { date: 'asc' },
  });
};

module.exports = { upsertCapacity, getCapacityForDate, listMyCapacities };
