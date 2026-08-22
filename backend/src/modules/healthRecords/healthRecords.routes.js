const { Router } = require('express');
const { z } = require('zod');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const requireRole = require('../../middleware/requireRole');
const controller = require('./healthRecords.controller');

const router = Router();

router.use(authenticate);

const createSchema = z.object({
  appointmentId: z.string().uuid(),
  prescriptionText: z.string().min(1, 'prescriptionText is required'),
  notes: z.string().optional().nullable(),
});

const listQuerySchema = z.object({
  patientId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

router.post('/', requireRole('DOCTOR'), validate(createSchema), controller.createRecord);
router.get('/', requireRole('PATIENT', 'DOCTOR'), validate(listQuerySchema, 'query'), controller.listMyRecords);
router.get('/:id/fhir', requireRole('PATIENT', 'DOCTOR', 'ADMIN'), controller.exportAsFhir);

module.exports = router;
