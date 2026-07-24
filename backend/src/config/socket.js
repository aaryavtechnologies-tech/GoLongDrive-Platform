// src/config/socket.js
// Socket.io initialisation — scaffolded for future ride-event implementation.
// Phase 1: setup only.  No ride events are wired here.

const { Server } = require('socket.io');

let io = null;

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

    // ── Placeholder namespaces (to be implemented in later phases) ──────────
    // socket.on('join:room', handler)
    // socket.on('ride:request', handler)
    // socket.on('ride:accept', handler)
    // socket.on('location:update', handler)

    socket.on('disconnect', (reason) => {
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

module.exports = { initSocket, getIO };
