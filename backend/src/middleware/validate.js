const { ApiError } = require('./errorHandler');

/**
 * Zod validation middleware factory. `schema` is a Zod object (or any ZodType).
 * Parsed data is placed on req.body (or req.params / req.query via `source`).
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    return next(
      new ApiError(400, 'Validation failed', result.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }))),
    );
  }
  req[source] = result.data;
  next();
};

module.exports = validate;
