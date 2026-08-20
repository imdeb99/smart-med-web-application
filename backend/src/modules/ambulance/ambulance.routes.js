const { Router } = require('express');
const { z } = require('zod');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const requireRole = require('../../middleware/requireRole');
const controller = require('./ambulance.controller');

const router = Router();

router.use(authenticate);

const createSchema = z.object({
  pickupLocation: z.string().min(3, 'pickupLocation is required'),
  dropLocation: z.string().min(3, 'dropLocation is required'),
  type: z.enum(['BASIC', 'ICU', 'FREEZER']),
});

const listQuerySchema = z.object({
  status: z.enum(['REQUESTED', 'ASSIGNED', 'COMPLETED', 'CANCELLED']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const assignSchema = z.object({
  ambulanceId: z.string().uuid(),
});

router.post('/', requireRole('PATIENT'), validate(createSchema), controller.createBooking);
router.get('/mine', requireRole('PATIENT'), validate(listQuerySchema, 'query'), controller.listMyBookings);
router.get('/', requireRole('ADMIN'), validate(listQuerySchema, 'query'), controller.listAll);
router.patch('/:id/assign', requireRole('ADMIN'), validate(assignSchema), controller.assignAmbulance);

module.exports = router;
