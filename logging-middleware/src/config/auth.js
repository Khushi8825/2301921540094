import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

const authConfig = {
  tokenType: 'Bearer',
  accessToken: process.env.ACCESS_TOKEN,
};

if (!authConfig.accessToken) {
  throw new Error('ACCESS_TOKEN is missing from environment variables');
}

export default authConfig;