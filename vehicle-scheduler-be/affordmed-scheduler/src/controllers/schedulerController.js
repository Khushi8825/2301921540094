'use strict';

const { computeSchedule } = require('../services/schedulerService');
const logger              = require('../utils/logger');

/**
 * GET /api/schedule
 *
 * Fetches depots & vehicles, runs the Knapsack optimisation per depot, and
 * returns the maintenance schedule.
 */
async function getSchedule(req, res, next) {
  try {
    logger.info('Schedule endpoint invoked', {
      method: req.method,
      path:   req.originalUrl,
      ip:     req.ip,
    });

    const schedule = await computeSchedule();

    return res.status(200).json({
      success:   true,
      timestamp: new Date().toISOString(),
      count:     schedule.length,
      schedule,
    });
  } catch (err) {
    logger.error('Schedule computation failed in controller', { error: err.message });
    return next(err);
  }
}

module.exports = { getSchedule };
