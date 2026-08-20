const { ApiError } = require('./errorHandler');

/**
 * Factory that returns a middleware enforcing that req.user has one of the
 * given roles. Must run after `authenticate`.
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required.'));
  }
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, `Forbidden. Requires role: ${roles.join(' or ')}.`));
  }
  next();
};

module.exports = requireRole;
