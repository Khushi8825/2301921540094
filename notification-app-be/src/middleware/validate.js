import { Log } from '../../../logging-middleware/src/middleware/logger.js';
import { sendError } from '../utils/response.js';

function validate(schema, source = 'body') {
  return async (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const formatted = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      await Log('backend', 'warn', 'middleware', `Validation failed on ${req.path}: ${JSON.stringify(formatted)}`);

      return sendError(res, 422, 'Validation failed', formatted);
    }

    req[source] = result.data;
    next();
  };
}

export { validate };