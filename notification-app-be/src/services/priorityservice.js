import { Log } from '../../../logging-middleware/src/middleware/logger.js';

const TYPE_PRIORITY = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function computeScore(notification) {
  const typePriority = TYPE_PRIORITY[notification.type?.name] ?? 0;

  const createdAt = new Date(notification.createdAt || notification.created_at || 0).getTime();
  const now = Date.now();
  const ageMs = now - createdAt;

  const maxAgeMs = 30 * 24 * 60 * 60 * 1000;
  const recencyScore = Math.max(0, 1 - ageMs / maxAgeMs);

  return typePriority * 10 + recencyScore;
}

async function applyPriorityAlgorithm(notifications, topN = 10) {
  await Log('backend', 'info', 'service', `Applying priority algorithm to ${notifications.length} notifications`);

  const scored = notifications.map((n) => ({
    ...n,
    _score: computeScore(n),
  }));

  scored.sort((a, b) => b._score - a._score);

  const top = scored.slice(0, topN).map(({ _score, ...rest }) => rest);

  await Log('backend', 'info', 'service', `Priority algorithm returned top ${top.length} notifications`);

  return top;
}

export { applyPriorityAlgorithm, computeScore };