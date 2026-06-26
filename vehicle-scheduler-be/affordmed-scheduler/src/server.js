'use strict';

const app    = require('./app');
const config = require('./config');
const logger = require('./utils/logger');

const { port, env } = config.server;

const server = app.listen(port, () => {
  logger.info('AffordMed Maintenance Scheduler started', {
    port,
    env,
    pid: process.pid,
  });
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
function shutdown(signal) {
  logger.info(`Received ${signal} – shutting down gracefully`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force-quit after 10 s if connections don't drain
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { message: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason: String(reason) });
  process.exit(1);
});

module.exports = server; // export for testing
