const { Router } = require('express');
const { z } = require('zod');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const requireRole = require('../../middleware/requireRole');
const controller = require('./admin.controller');

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

const verifySchema = z.object({
  verificationStatus: z.enum(['PENDING', 'VERIFIED', 'REJECTED']),
});

const listUsersQuery = z.object({
  role: z.enum(['PATIENT', 'DOCTOR', 'ADMIN']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const statusQuery = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const paymentQuery = z.object({
  status: z.enum(['PENDING', 'PAID', 'FAILED']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

router.get('/dashboard', controller.getDashboard);
router.get('/users', validate(listUsersQuery, 'query'), controller.listUsers);
router.get('/appointments', validate(statusQuery, 'query'), controller.listAllAppointments);
router.get('/payments', validate(paymentQuery, 'query'), controller.listAllPayments);
router.patch('/doctors/:id/verification', validate(verifySchema), controller.setDoctorVerification);

module.exports = router;
