'use strict';

const config = require('../config');
const { createHttpClient } = require('../utils/httpClient');
const logger = require('../utils/logger');

const client = createHttpClient(config.api.depot.baseUrl);

/**
 * Fetches all depots from the AffordMed Depot API.
 *
 * Expected response shape (array):
 * [
 *   {
 *     "depotId": "D1",
 *     "name": "Central Depot",
 *     "mechanicHours": 40,
 *     "vehicles": ["V1", "V2"]   // optional – may be absent
 *   },
 *   ...
 * ]
 *
 * @returns {Promise<Array>}
 */
async function fetchDepots() {
  try {
    logger.info('Fetching depots', { path: config.api.depot.path });
    const { data } = await client.get(config.api.depot.path);

    const depots = Array.isArray(data) ? data : data.depots ?? data.data ?? [];
    logger.info('Depots fetched successfully', { count: depots.length });
    return depots;
  } catch (err) {
    logger.error('Failed to fetch depots', { error: err.message });
    throw new Error(`Depot API error: ${err.message}`);
  }
}

module.exports = { fetchDepots };
