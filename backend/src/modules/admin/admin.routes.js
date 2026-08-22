const { Router } = require('express');
const { z } = require('zod');
const multer = require('multer');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const requireRole = require('../../middleware/requireRole');
const controller = require('./admin.controller');

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

// Admin avatar uploads: in-memory, max 5MB, images only.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      const err = new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed.');
      err.statusCode = 400;
      return cb(err);
    }
    cb(null, true);
  },
});

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

const listDoctorsQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const createDoctorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('A valid email is required'),
  phone: z.string().optional().nullable(),
  specialty: z.string().min(2, 'Specialty is required'),
  bmdcId: z.string().min(2, 'BMDC ID is required'),
  bio: z.string().optional().nullable(),
  consultationFee: z.number().positive('Consultation fee must be positive'),
  qualifications: z.string().optional().nullable(),
  experienceYears: z.number().int().min(0).optional().nullable(),
  location: z.string().optional().nullable(),
  verificationStatus: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).optional(),
});

const updateDoctorSchema = z.object({
  specialty: z.string().min(2).optional(),
  bio: z.string().optional().nullable(),
  consultationFee: z.number().positive().optional(),
  qualifications: z.string().optional().nullable(),
  experienceYears: z.number().int().min(0).optional().nullable(),
  location: z.string().optional().nullable(),
  verificationStatus: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).optional(),
});

const listPatientsQuery = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const updatePatientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  dob: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
});

const listCapacitiesQuery = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format').optional(),
  doctorId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const overrideCapacitySchema = z.object({
  totalCapacity: z.number().int().positive().max(1000).optional(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'startTime must be HH:MM (24h)').optional(),
  avgDurationMin: z.number().int().positive().max(480).optional(),
  reason: z.string().max(500).optional().nullable(),
}).refine((d) => d.totalCapacity !== undefined || d.startTime !== undefined || d.avgDurationMin !== undefined, {
  message: 'At least one of totalCapacity, startTime, or avgDurationMin must be provided',
});

router.get('/dashboard', controller.getDashboard);
router.get('/users', validate(listUsersQuery, 'query'), controller.listUsers);
router.get('/doctors', validate(listDoctorsQuery, 'query'), controller.listDoctors);
router.post('/doctors', validate(createDoctorSchema), controller.createDoctor);
router.patch('/doctors/:id', validate(updateDoctorSchema), controller.updateDoctor);
router.delete('/doctors/:id', controller.deleteDoctor);
router.get('/patients', validate(listPatientsQuery, 'query'), controller.listPatients);
router.get('/patients/:id', controller.getPatient);
router.patch('/patients/:id', validate(updatePatientSchema), controller.updatePatient);
router.delete('/patients/:id', controller.deletePatient);
router.get('/appointments', validate(statusQuery, 'query'), controller.listAllAppointments);
router.get('/payments', validate(paymentQuery, 'query'), controller.listAllPayments);
router.patch('/doctors/:id/verification', validate(verifySchema), controller.setDoctorVerification);
router.get('/daily-capacity', validate(listCapacitiesQuery, 'query'), controller.listDailyCapacities);
router.patch('/daily-capacity/:id', validate(overrideCapacitySchema), controller.overrideDailyCapacity);
router.post('/users/:id/avatar', upload.single('avatar'), controller.uploadUserAvatar);

module.exports = router;
