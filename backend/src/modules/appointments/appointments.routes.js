const { Router } = require('express');
const { z } = require('zod');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const requireRole = require('../../middleware/requireRole');
const controller = require('./appointments.controller');

const router = Router();

router.use(authenticate);

const createSchema = z.object({
  doctorId: z.string().uuid('A valid doctor id is required'),
  scheduledAt: z.string().datetime({ offset: true }, 'scheduledAt must be an ISO datetime'),
  type: z.enum(['VIDEO', 'IN_PERSON']),
});

const dailyCapacityBookingSchema = z.object({
  doctorId: z.string().uuid('A valid doctor id is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format'),
});

const listQuerySchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const updateStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'COMPLETED', 'CANCELLED']),
});

router.post('/', requireRole('PATIENT'), validate(createSchema), controller.createAppointment);
router.post('/daily-capacity', requireRole('PATIENT'), validate(dailyCapacityBookingSchema), controller.createDailyCapacityBooking);
router.get('/', requireRole('PATIENT', 'DOCTOR'), validate(listQuerySchema, 'query'), controller.listMyAppointments);
router.patch('/:id/status', requireRole('PATIENT', 'DOCTOR'), validate(updateStatusSchema), controller.updateStatus);
router.get('/:id/pdf', requireRole('PATIENT', 'DOCTOR', 'ADMIN'), controller.downloadTicketPdf);

module.exports = router;
