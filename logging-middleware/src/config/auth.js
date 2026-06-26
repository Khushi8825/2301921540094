import 'dotenv/config';

const authConfig = {
  tokenType: 'Bearer',
  accessToken: process.env.ACCESS_TOKEN,
};

if (!authConfig.accessToken) {
  throw new Error('ACCESS_TOKEN is missing from environment variables');
}

export default authConfig;