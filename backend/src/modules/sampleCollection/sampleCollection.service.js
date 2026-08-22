const prisma = require('../../config/db');
const { ApiError } = require('../../middleware/errorHandler');

const collectionInclude = {
  patient: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
  labAssistant: true,
};

/** Patient-only: request a home sample collection. */
const createRequest = async ({ patientId, testName, address, scheduledAt }) =>
  prisma.sampleCollection.create({
    data: { patientId, testName, address, scheduledAt: new Date(scheduledAt) },
    include: collectionInclude,
  });

const listByPatient = async (patientId, { status, page = 1, limit = 20 }) => {
  const where = { patientId, ...(status ? { status } : {}) };
  const [total, collections] = await Promise.all([
    prisma.sampleCollection.count({ where }),
    prisma.sampleCollection.findMany({
      where,
      include: collectionInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { collections, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

const listAll = async ({ status, page = 1, limit = 20 }) => {
  const where = { ...(status ? { status } : {}) };
  const [total, collections] = await Promise.all([
    prisma.sampleCollection.count({ where }),
    prisma.sampleCollection.findMany({
      where,
      include: collectionInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { collections, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

/** Admin-only: assign a lab assistant to a request. */
const assignLabAssistant = async ({ id, labAssistantId }) => {
  const collection = await prisma.sampleCollection.findUnique({ where: { id } });
  if (!collection) {
    throw new ApiError(404, 'Sample collection request not found.');
  }
  const assistant = await prisma.labAssistant.findUnique({ where: { id: labAssistantId } });
  if (!assistant) {
    throw new ApiError(404, 'Lab assistant not found.');
  }

  return prisma.sampleCollection.update({
    where: { id },
    data: { labAssistantId, status: 'ASSIGNED' },
    include: collectionInclude,
  });
};

module.exports = { createRequest, listByPatient, listAll, assignLabAssistant };
