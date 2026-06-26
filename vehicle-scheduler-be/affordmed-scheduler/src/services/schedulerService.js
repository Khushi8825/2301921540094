'use strict';

const { fetchDepots }   = require('./depotService');
const { fetchVehicles } = require('./vehicleService');
const { knapsack }      = require('../utils/knapsack');
const logger            = require('../utils/logger');

/**
 * Builds a flat list of all maintenance tasks grouped by depotId.
 *
 * @param {Array} vehicles
 * @returns {Map<string, Array<{taskId, duration, impact}>>}
 */
function groupTasksByDepot(vehicles) {
  const map = new Map();

  for (const vehicle of vehicles) {
    const depotId = vehicle.depotId;
    if (!depotId) {
      logger.warn('Vehicle missing depotId – skipping', { vehicleId: vehicle.vehicleId });
      continue;
    }

    const tasks = vehicle.maintenanceTasks ?? vehicle.tasks ?? [];
    if (!map.has(depotId)) map.set(depotId, []);

    for (const task of tasks) {
      // Normalise field names defensively
      map.get(depotId).push({
        taskId:   task.taskId   ?? task.id,
        duration: task.duration ?? task.time ?? 0,
        impact:   task.impact   ?? task.value ?? task.priority ?? 0,
      });
    }
  }

  return map;
}

/**
 * Main orchestration function.
 *
 * 1. Fetches depots and vehicles in parallel.
 * 2. Groups all tasks by depotId.
 * 3. Runs the 0/1 Knapsack DP for every depot.
 * 4. Returns the optimised schedule.
 *
 * @returns {Promise<Array<DepotSchedule>>}
 *
 * @typedef {{ depotId: string, depotName: string, mechanicHours: number,
 *             selectedTaskIds: string[], totalImpact: number, totalDuration: number }} DepotSchedule
 */
async function computeSchedule() {
  logger.info('Starting schedule computation');

  // ── Step 1: Fetch data in parallel ─────────────────────────────────────────
  const [depots, vehicles] = await Promise.all([fetchDepots(), fetchVehicles()]);

  logger.info('Data fetched', { depotCount: depots.length, vehicleCount: vehicles.length });

  // ── Step 2: Group tasks by depot ────────────────────────────────────────────
  const tasksByDepot = groupTasksByDepot(vehicles);

  // ── Step 3: Run knapsack per depot ─────────────────────────────────────────
  const results = [];

  for (const depot of depots) {
    const depotId       = depot.depotId ?? depot.id;
    const depotName     = depot.name    ?? depot.depotName ?? depotId;
    const mechanicHours = depot.mechanicHours ?? depot.capacity ?? 0;

    const tasks = tasksByDepot.get(depotId) ?? [];

    logger.info('Optimising depot', {
      depotId,
      mechanicHours,
      taskCount: tasks.length,
    });

    const { selectedTaskIds, totalImpact, totalDuration } = knapsack(tasks, mechanicHours);

    results.push({
      depotId,
      depotName,
      mechanicHours,
      taskCount:       tasks.length,
      selectedTaskIds,
      totalImpact,
      totalDuration,
    });

    logger.info('Depot optimised', {
      depotId,
      selectedCount: selectedTaskIds.length,
      totalImpact,
      totalDuration,
    });
  }

  logger.info('Schedule computation complete', { depotCount: results.length });
  return results;
}

module.exports = { computeSchedule };
