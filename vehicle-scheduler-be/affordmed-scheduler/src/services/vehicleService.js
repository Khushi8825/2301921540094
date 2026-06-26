'use strict';

const config = require('../config');
const { createHttpClient } = require('../utils/httpClient');
const logger = require('../utils/logger');

const client = createHttpClient(config.api.vehicle.baseUrl);

/**
 * Fetches all vehicles (with their maintenance tasks) from the AffordMed
 * Vehicle API.
 *
 * Expected response shape (array):
 * [
 *   {
 *     "vehicleId": "V1",
 *     "depotId": "D1",
 *     "maintenanceTasks": [
 *       { "taskId": "T1", "duration": 5, "impact": 10 },
 *       ...
 *     ]
 *   },
 *   ...
 * ]
 *
 * @returns {Promise<Array>}
 */
async function fetchVehicles() {
  try {
    logger.info('Fetching vehicles', { path: config.api.vehicle.path });
    const { data } = await client.get(config.api.vehicle.path);

    const vehicles = Array.isArray(data) ? data : data.vehicles ?? data.data ?? [];
    logger.info('Vehicles fetched successfully', { count: vehicles.length });
    return vehicles;
  } catch (err) {
    logger.error('Failed to fetch vehicles', { error: err.message });
    throw new Error(`Vehicle API error: ${err.message}`);
  }
}

module.exports = { fetchVehicles };
