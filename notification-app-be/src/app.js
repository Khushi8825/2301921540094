import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import env from './config/Env.js';
// import redis from './config/redis.js';
import { requestLogger } from './middleware/requestlogger.js';
import { errorHandler } from './middleware/errorhandler.js';
import authRoutes from './routes/authroutes.js';
import notificationRoutes from './routes/notificationroutes.js';
import { initializeSocket } from './socket/socketmanager.js';
import { Log } from '../../logging-middleware/src/middleware/logger.js';

const app = express();
const httpServer = http.createServer(app);

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', service: 'notification-app-be' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);

initializeSocket(httpServer);

async function start() {
  try {
    // await redis.connect();
    await Log('backend', 'info', 'config', `Redis connected for notification-app-be`);

    httpServer.listen(env.PORT, async () => {
      await Log('backend', 'info', 'handler', `notification-app-be listening on port ${env.PORT}`);
      console.log(`notification-app-be running on port ${env.PORT}`);
    });
  } catch (err) {
    await Log('backend', 'error', 'handler', `Failed to start notification-app-be: ${err.message}`);
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();

export default app;
