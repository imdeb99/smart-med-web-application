const { Router } = require('express');
const { z } = require('zod');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const requireRole = require('../../middleware/requireRole');
const controller = require('./reviews.controller');

const router = Router();

const createSchema = z.object({
  doctorId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().nullable(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

router.get('/doctor/:doctorId', validate(listQuerySchema, 'query'), controller.listByDoctor);
router.post('/', authenticate, requireRole('PATIENT'), validate(createSchema), controller.createReview);

module.exports = router;
