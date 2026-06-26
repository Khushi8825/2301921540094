import { Log } from '../../../logging-middleware/src/middleware/logger.js';
import { sendError } from '../utils/response.js';

async function errorHandler(err, req, res, next) {
  await Log('backend', 'error', 'handler', `Unhandled error on ${req.method} ${req.path}: ${err.message}`);

  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return sendError(res, 409, 'Resource already exists');
    }
    if (err.code === 'P2025') {
      return sendError(res, 404, 'Resource not found');
    }
  }

  if (err.name === 'PrismaClientValidationError') {
    return sendError(res, 400, 'Invalid database operation');
  }

  const statusCode = err.statusCode || 500;
  const message = err.expose ? err.message : 'Internal server error';

  return sendError(res, statusCode, message);
}

export { errorHandler };