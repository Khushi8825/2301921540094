'use strict';

/**
 * GET /health
 * Simple liveness probe used by load balancers and orchestrators.
 */
function healthCheck(req, res) {
  res.status(200).json({
    status:    'ok',
    service:   'affordmed-vehicle-maintenance-scheduler',
    timestamp: new Date().toISOString(),
    uptime:    process.uptime(),
    memory:    process.memoryUsage(),
  });
}

module.exports = { healthCheck };
