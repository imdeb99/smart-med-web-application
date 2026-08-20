const { Router } = require('express');
const { z } = require('zod');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const requireRole = require('../../middleware/requireRole');
const controller = require('./sampleCollection.controller');

const router = Router();

router.use(authenticate);

const createSchema = z.object({
  testName: z.string().min(1, 'testName is required'),
  address: z.string().min(5, 'A pickup address is required'),
  scheduledAt: z.string().datetime({ offset: true }, 'scheduledAt must be an ISO datetime'),
});

const listQuerySchema = z.object({
  status: z.enum(['REQUESTED', 'ASSIGNED', 'COMPLETED', 'CANCELLED']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const assignSchema = z.object({
  labAssistantId: z.string().uuid(),
});

router.post('/', requireRole('PATIENT'), validate(createSchema), controller.createRequest);
router.get('/mine', requireRole('PATIENT'), validate(listQuerySchema, 'query'), controller.listMyRequests);
router.get('/', requireRole('ADMIN'), validate(listQuerySchema, 'query'), controller.listAll);
router.patch('/:id/assign', requireRole('ADMIN'), validate(assignSchema), controller.assignLabAssistant);

module.exports = router;
