import { Log } from '../../../logging-middleware/src/middleware/logger.js';

async function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', async () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    await Log('backend', level, 'middleware', `${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });

  next();
}

export { requestLogger };