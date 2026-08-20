const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { ApiError } = require('./errorHandler');
const env = require('../config/env');

/**
 * Authenticates the request via a Bearer JWT access token. On success,
 * req.user is set to the full user row (including doctor/patient profiles
 * for role checks downstream).
 */
const authenticate = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new ApiError(401, 'Authentication required. Provide a Bearer token.'));
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    return next(new ApiError(401, 'Invalid or expired token.'));
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { doctorProfile: true, patientProfile: true },
  });

  if (!user) {
    return next(new ApiError(401, 'User no longer exists.'));
  }

  req.user = user;
  next();
};

module.exports = authenticate;
