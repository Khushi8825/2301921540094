'use strict';

/**
 * 0 / 1 Knapsack – Dynamic Programming
 * ─────────────────────────────────────
 * Maximises total `impact` of selected tasks while keeping total `duration`
 * within the depot's `mechanicHours` budget.
 *
 * Complexity: O(n × W) time, O(W) space  (single-row rolling DP).
 *
 * @param {Array<{taskId: string, duration: number, impact: number}>} tasks
 * @param {number} capacity   – MechanicHours available at the depot (integer minutes / hours)
 * @returns {{ selectedTaskIds: string[], totalImpact: number, totalDuration: number }}
 */
function knapsack(tasks, capacity) {
  // Guard: nothing to do
  if (!tasks || tasks.length === 0 || capacity <= 0) {
    return { selectedTaskIds: [], totalImpact: 0, totalDuration: 0 };
  }

  const n = tasks.length;

  // Work with integers to avoid floating-point edge cases.
  // Scale durations to centis (×100) if they contain decimals.
  const needsScaling = tasks.some(t => !Number.isInteger(t.duration));
  const SCALE = needsScaling ? 100 : 1;
  const W = Math.floor(capacity * SCALE);

  // Sanitise & scale items
  const items = tasks.map((t) => ({
    taskId: t.taskId,
    w: Math.floor(t.duration * SCALE),   // weight = duration
    v: t.impact,                          // value  = impact
  }));

  // ── Rolling 1-D DP table ────────────────────────────────────────────────────
  // dp[w] = maximum impact achievable with exactly capacity w
  const dp = new Float64Array(W + 1);  // Float64Array → faster than plain Array for numerics

  // Keep a parent trace so we can reconstruct which items were chosen.
  // chosen[i][w] = true if item i is included when capacity is w.
  // We use Uint8Array (1 byte/cell) for memory efficiency.
  const chosen = new Array(n);
  for (let i = 0; i < n; i++) {
    chosen[i] = new Uint8Array(W + 1);
  }

  for (let i = 0; i < n; i++) {
    const { w, v } = items[i];
    if (w > W) continue; // item doesn't fit at all – skip

    // Traverse right-to-left to enforce 0/1 constraint
    for (let cap = W; cap >= w; cap--) {
      const withItem = dp[cap - w] + v;
      if (withItem > dp[cap]) {
        dp[cap] = withItem;
        chosen[i][cap] = 1;
      }
    }
  }

  // ── Backtrack to find selected items ────────────────────────────────────────
  const selectedTaskIds = [];
  let remainingCap = W;

  for (let i = n - 1; i >= 0; i--) {
    if (chosen[i][remainingCap]) {
      selectedTaskIds.push(items[i].taskId);
      remainingCap -= items[i].w;
    }
  }

  const totalDuration = (W - remainingCap) / SCALE;
  const totalImpact   = dp[W];

  return {
    selectedTaskIds: selectedTaskIds.reverse(), // restore original order
    totalImpact,
    totalDuration,
  };
}

module.exports = { knapsack };
