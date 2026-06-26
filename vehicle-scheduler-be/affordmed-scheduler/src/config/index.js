'use strict';

require('dotenv').config();

/**
 * Centralised configuration.  All values come from environment variables so
 * no secrets or URLs are ever hardcoded.
 */
const config = {
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
    env: process.env.NODE_ENV || 'development',
  },

  api: {
    token: process.env.AFFORDMED_API_TOKEN || '',
    timeout: parseInt(process.env.API_TIMEOUT, 10) || 10_000,

    depot: {
      baseUrl: process.env.DEPOT_API_BASE_URL || '',
      path: process.env.DEPOT_API_PATH || '/depots',
    },

    vehicle: {
      baseUrl: process.env.VEHICLE_API_BASE_URL || '',
      path: process.env.VEHICLE_API_PATH || '/vehicles',
    },
  },
};

// ── Startup guard ─────────────────────────────────────────────────────────────
(function validateConfig() {
  const required = [
    ['AFFORDMED_API_TOKEN', config.api.token],
    ['DEPOT_API_BASE_URL', config.api.depot.baseUrl],
    ['VEHICLE_API_BASE_URL', config.api.vehicle.baseUrl],
  ];

  const missing = required
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    console.error(
      `[config] Missing required environment variable(s): ${missing.join(', ')}\n` +
      'Copy .env.example to .env and fill in the values.'
    );
    process.exit(1);
  }
})();

module.exports = config;
