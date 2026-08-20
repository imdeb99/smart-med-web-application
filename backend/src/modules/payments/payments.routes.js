const { Router } = require('express');
const { z } = require('zod');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const requireRole = require('../../middleware/requireRole');
const controller = require('./payments.controller');

const router = Router();

router.use(authenticate, requireRole('PATIENT'));

const createSchema = z.object({
  relatedType: z.enum(['APPOINTMENT', 'SAMPLE_COLLECTION', 'AMBULANCE']),
  relatedId: z.string().uuid(),
  amount: z.number().positive(),
  method: z.string().min(1, 'method is required'),
  status: z.enum(['PAID', 'FAILED']).default('PAID'),
});

const listQuerySchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'FAILED']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

router.post('/', validate(createSchema), controller.createPayment);
router.get('/', validate(listQuerySchema, 'query'), controller.listMyPayments);

module.exports = router;
