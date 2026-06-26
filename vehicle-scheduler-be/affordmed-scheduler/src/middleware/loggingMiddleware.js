'use strict';

const logger = require('../utils/logger');

/**
 * AffordMed Request Logger Middleware
 * ─────────────────────────────────────
 * Logs every incoming HTTP request with a unique request ID, then attaches a
 * finish listener to log the outgoing response status and duration.
 *
 * This is the existing AffordMed logging middleware integrated as required.
 */
function requestLogger(req, res, next) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  req.requestId   = requestId;

  const startTime = process.hrtime.bigint();

  logger.info('Incoming request', {
    requestId,
    method:    req.method,
    url:       req.originalUrl,
    ip:        req.ip ?? req.socket?.remoteAddress,
    userAgent: req.get('user-agent'),
  });

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startTime) / 1e6;
    const level = res.statusCode >= 500 ? 'error'
                : res.statusCode >= 400 ? 'warn'
                : 'info';

    logger[level]('Response sent', {
      requestId,
      method:     req.method,
      url:        req.originalUrl,
      statusCode: res.statusCode,
      durationMs: durationMs.toFixed(2),
    });
  });

  next();
}

/**
 * AffordMed Centralised Error Handler Middleware
 * ─────────────────────────────────────────────────
 * Must be registered LAST (after all routes) in app.js.
 * Catches errors forwarded via next(err) and returns a structured JSON response.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode ?? err.status ?? 500;

  logger.error('Unhandled error', {
    requestId:  req.requestId,
    method:     req.method,
    url:        req.originalUrl,
    statusCode,
    message:    err.message,
    stack:      process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success:   false,
    timestamp: new Date().toISOString(),
    error: {
      message: err.message || 'An unexpected error occurred',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
}

/**
 * 404 handler – catches any route not matched above.
 */
function notFoundHandler(req, res) {
  logger.warn('Route not found', {
    method: req.method,
    url:    req.originalUrl,
  });

  res.status(404).json({
    success:   false,
    timestamp: new Date().toISOString(),
    error: {
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
}

module.exports = { requestLogger, errorHandler, notFoundHandler };
