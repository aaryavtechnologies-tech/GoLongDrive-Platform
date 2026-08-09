// src/config/socket.js
// Socket.io initialisation — scaffolded for future ride-event implementation.
// Phase 1: setup only.  No ride events are wired here.

const { Server } = require('socket.io');

let io = null;
const driverSockets = new Map();

/**
 * Attaches Socket.io to the existing HTTP server.
 * @param {import('http').Server} httpServer
 * @returns {import('socket.io').Server}
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Ping every 25 s, disconnect after 60 s of inactivity
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    console.log(`🔌  Socket connected: ${socket.id}`);

    // Register a driver's socket connection
    socket.on('driver:join', ({ driverId }) => {
      if (driverId) {
        driverSockets.set(driverId.toString(), socket.id);
        console.log(`✅  Driver ${driverId} joined with socket ${socket.id}`);
      }
    });

    socket.on('disconnect', (reason) => {
      // Remove from map if it was a driver
      for (const [driverId, sockId] of driverSockets.entries()) {
        if (sockId === socket.id) {
          driverSockets.delete(driverId);
          console.log(`❌  Driver ${driverId} disconnected`);
          break;
        }
      }
      console.log(`❌  Socket disconnected: ${socket.id} — reason: ${reason}`);
    });
  });

  console.log('✅  Socket.io initialised');
  return io;
};

/**
 * Returns the active Socket.io instance.
 * Throws if called before initSocket().
 */
const getIO = () => {
  if (!io) throw new Error('Socket.io not initialised. Call initSocket() first.');
  return io;
};

/**
 * Get the socket ID for a specific driver
 * @param {string} driverId 
 * @returns {string|undefined}
 */
const getDriverSocket = (driverId) => {
  return driverSockets.get(driverId.toString());
};

module.exports = { initSocket, getIO, getDriverSocket };
