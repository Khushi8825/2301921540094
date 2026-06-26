import env from '../config/Env.js';
import { Log } from '../../../logging-middleware/src/middleware/logger.js';
import { AppError } from '../utils/appError.js';

async function fetchExternalNotifications() {
  await Log('backend', 'info', 'service', 'Fetching notifications from AffordMed API');

  const response = await fetch(env.AFFORDMED_NOTIFICATION_API, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${env.AFFORDMED_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    await Log('backend', 'error', 'service', `AffordMed API error ${response.status}: ${text}`);
    throw new AppError(`AffordMed Notification API responded with ${response.status}`, 502);
  }

  const data = await response.json();
  await Log('backend', 'info', 'service', `Fetched ${data?.length || 0} notifications from AffordMed API`);

  return Array.isArray(data) ? data : (data.notifications || data.data || []);
}

export { fetchExternalNotifications };