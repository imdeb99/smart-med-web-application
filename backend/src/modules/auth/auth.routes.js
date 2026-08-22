const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const controller = require('./auth.controller');

const router = Router();

// Brute-force protection for login: 10 attempts per 15 minutes per IP.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: { message: 'Too many login attempts. Please try again in 15 minutes.' },
  },
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('A valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional().nullable(),
  role: z.enum(['PATIENT', 'DOCTOR']).default('PATIENT'),
  // Doctor-only fields
  bmdcId: z.string().optional(),
  specialty: z.string().optional(),
  bio: z.string().optional().nullable(),
  consultationFee: z.number().positive().optional(),
  // Patient-only fields
  address: z.string().optional().nullable(),
  dob: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.role === 'DOCTOR') {
    if (!data.bmdcId) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['bmdcId'], message: 'bmdcId is required for doctors' });
    if (!data.specialty) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['specialty'], message: 'specialty is required for doctors' });
    if (data.consultationFee === undefined) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['consultationFee'], message: 'consultationFee is required for doctors' });
  }
});

const loginSchema = z.object({
  email: z.string().email('A valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().optional().nullable(),
});

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', loginLimiter, validate(loginSchema), controller.login);
router.get('/me', authenticate, controller.me);
router.patch('/me', authenticate, validate(updateProfileSchema), controller.updateProfile);

module.exports = router;
