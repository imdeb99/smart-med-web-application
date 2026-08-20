/**
 * Central error handler. All errors (thrown values, Zod failures mapped by
 * validate.js, Prisma unique violations) land here and are returned in the
 * consistent { success, data, error } response shape.
 */

class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Prisma unique constraint violation (P2002)
  if (err.code === 'P2002') {
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
    return res.status(409).json({
      success: false,
      data: null,
      error: { message: `A record with that ${target} already exists.` },
    });
  }

  // Prisma record not found (P2025)
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      data: null,
      error: { message: 'Record not found.' },
    });
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      message,
      ...(err.details ? { details: err.details } : {}),
    },
  });
};

module.exports = { ApiError, notFoundHandler, errorHandler };
