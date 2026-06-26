import { verifyToken } from '../config/jwt.js';
import { Log } from '../../../logging-middleware/src/middleware/logger.js';
import { sendError } from '../utils/response.js';

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    await Log('backend', 'warn', 'middleware', `Auth failed: missing token on ${req.path}`);
    return sendError(res, 401, 'Authorization token required');
  }

  const token = authHeader.slice(7);

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    await Log('backend', 'warn', 'middleware', `Auth failed: invalid token - ${err.message}`);
    return sendError(res, 401, 'Invalid or expired token');
  }
}

export { authenticate };