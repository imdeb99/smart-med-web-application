const { Router } = require('express');
const { z } = require('zod');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const requireRole = require('../../middleware/requireRole');
const controller = require('./doctors.controller');

const router = Router();

const listQuerySchema = z.object({
  specialty: z.string().optional(),
  search: z.string().optional(),
  verificationStatus: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const updateProfileSchema = z.object({
  specialty: z.string().min(2).optional(),
  bio: z.string().optional().nullable(),
  consultationFee: z.number().positive().optional(),
});

router.get('/', validate(listQuerySchema, 'query'), controller.listDoctors);
router.get('/:id', controller.getDoctorProfile);
router.patch(
  '/me/profile',
  authenticate,
  requireRole('DOCTOR'),
  validate(updateProfileSchema),
  controller.updateOwnProfile,
);

module.exports = router;
