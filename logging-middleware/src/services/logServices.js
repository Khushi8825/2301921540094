import authConfig from '../config/auth.js';

const LOG_API_URL = 'http://4.224.186.213/evaluation-service/logs';

async function sendLog(stack, level, pkg, message) {
  const payload = {
    stack,
    level,
    package: pkg,
    message,
  };

  const response = await fetch(LOG_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${authConfig.tokenType} ${authConfig.accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Log API responded with ${response.status}: ${JSON.stringify(data)}`
    );
  }

  return data;
}

export { sendLog };