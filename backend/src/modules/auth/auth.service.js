const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/db');
const env = require('../../config/env');
const { ApiError } = require('../../middleware/errorHandler');

const SALT_ROUNDS = 10;

const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: '7d' });

/**
 * Creates a user account. For DOCTOR registrations an unverified
 * DoctorProfile is created immediately (admin must verify it).
 * For PATIENT registrations a PatientProfile is created.
 */
const register = async ({ name, email, password, phone, role, specialty, bmdcId, bio, consultationFee, address, dob, gender }) => {
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      phone: phone || null,
      role,
      doctorProfile:
        role === 'DOCTOR'
          ? { create: { bmdcId, specialty, bio: bio || null, consultationFee } }
          : undefined,
      patientProfile:
        role === 'PATIENT'
          ? { create: { address: address || null, dob: dob ? new Date(dob) : null, gender: gender || null } }
          : undefined,
    },
    include: { doctorProfile: true, patientProfile: true },
  });

  return { user: sanitize(user), token: signToken(user) };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { doctorProfile: true, patientProfile: true },
  });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  return { user: sanitize(user), token: signToken(user) };
};

/** Update the logged-in user's own account fields (name/phone; email is the
 *  unique login identifier and is intentionally not changeable here). */
const updateProfile = async (userId, data) => {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.phone !== undefined ? { phone: data.phone || null } : {}),
    },
    include: { doctorProfile: true, patientProfile: true },
  });
  return sanitize(updated);
};

const sanitize = (user) => {
  const { passwordHash, ...rest } = user;
  return rest;
};

module.exports = { register, login, updateProfile, signToken, sanitize };
