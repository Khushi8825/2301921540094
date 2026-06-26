import { Server } from 'socket.io';
import { verifyToken } from '../config/jwt.js';
import { Log } from '../../../logging-middleware/src/middleware/logger.js';

let io;

function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling'],
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.slice(7);

    if (!token) {
      await Log('backend', 'warn', 'middleware', `Socket auth failed: no token from ${socket.id}`);
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = verifyToken(token);
      socket.userId = decoded.userId;
      socket.join(`user:${decoded.userId}`);
      await Log('backend', 'info', 'middleware', `Socket connected: user=${decoded.userId} id=${socket.id}`);
      next();
    } catch (err) {
      await Log('backend', 'warn', 'middleware', `Socket auth failed: invalid token ${err.message}`);
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('disconnect', async () => {
      await Log('backend', 'info', 'middleware', `Socket disconnected: id=${socket.id}`);
    });
  });

  return io;
}

async function emitToUser(userId, event, data) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
  await Log('backend', 'debug', 'service', `Socket emit: ${event} to user=${userId}`);
}

async function emitNewNotification(userId, notification) {
  return emitToUser(userId, 'notification:new', notification);
}

export { initializeSocket, emitToUser, emitNewNotification };