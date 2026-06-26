'use strict';

const axios  = require('axios');
const config = require('../config');
const logger = require('./logger');

/**
 * Creates a pre-configured Axios instance that:
 *  • attaches the Bearer token on every request
 *  • logs outgoing requests and incoming responses
 *  • logs and re-throws errors with enriched context
 *
 * @param {string} baseURL
 * @returns {import('axios').AxiosInstance}
 */
function createHttpClient(baseURL) {
  const client = axios.create({
    baseURL,
    timeout: config.api.timeout,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // ── Request interceptor ──────────────────────────────────────────────────────
  client.interceptors.request.use((req) => {
    // Attach Bearer token from env – never hardcoded
    req.headers['Authorization'] = `Bearer ${config.api.token}`;

    logger.info('Outgoing API request', {
      method: req.method?.toUpperCase(),
      url: `${req.baseURL}${req.url}`,
      params: req.params,
    });

    req.metadata = { startTime: Date.now() };
    return req;
  });

  // ── Response interceptor ─────────────────────────────────────────────────────
  client.interceptors.response.use(
    (res) => {
      const duration = Date.now() - (res.config.metadata?.startTime ?? Date.now());
      logger.info('API response received', {
        method: res.config.method?.toUpperCase(),
        url: res.config.url,
        status: res.status,
        durationMs: duration,
      });
      return res;
    },
    (err) => {
      const duration = Date.now() - (err.config?.metadata?.startTime ?? Date.now());
      logger.error('API request failed', {
        method: err.config?.method?.toUpperCase(),
        url: err.config?.url,
        status: err.response?.status,
        message: err.message,
        durationMs: duration,
      });
      return Promise.reject(err);
    }
  );

  return client;
}

module.exports = { createHttpClient };
