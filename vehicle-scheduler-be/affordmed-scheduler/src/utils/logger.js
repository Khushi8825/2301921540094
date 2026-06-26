'use strict';

/**
 * Lightweight structured logger.
 * Writes JSON lines to stdout / stderr so log shippers can parse them easily.
 */

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const ACTIVE_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL] ?? LOG_LEVELS.info;

function write(level, message, meta = {}) {
  if (LOG_LEVELS[level] < ACTIVE_LEVEL) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };

  const output = JSON.stringify(entry);
  if (level === 'error') {
    process.stderr.write(output + '\n');
  } else {
    process.stdout.write(output + '\n');
  }
}

const logger = {
  debug: (msg, meta) => write('debug', msg, meta),
  info:  (msg, meta) => write('info',  msg, meta),
  warn:  (msg, meta) => write('warn',  msg, meta),
  error: (msg, meta) => write('error', msg, meta),
};

module.exports = logger;
