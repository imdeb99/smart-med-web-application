const { Router } = require('express');
const { z } = require('zod');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const requireRole = require('../../middleware/requireRole');
const controller = require('./dailyCapacity.controller');

const router = Router();

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format');

const upsertSchema = z.object({
  date: dateSchema,
  totalCapacity: z.number().int().positive().max(1000),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'startTime must be HH:MM (24h)'),
  avgDurationMin: z.number().int().positive().max(480).default(10),
});

const querySchema = z.object({
  date: dateSchema,
});

router.post('/', authenticate, requireRole('DOCTOR'), validate(upsertSchema), controller.upsertCapacity);
router.get('/mine', authenticate, requireRole('DOCTOR'), controller.listMyCapacities);
router.get('/doctor/:doctorId', validate(querySchema, 'query'), controller.getCapacityForDate);

module.exports = router;
