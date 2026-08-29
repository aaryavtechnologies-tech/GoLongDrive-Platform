// src/config/socket.js
// Socket.io — handles driver & customer real-time connections.

const { Server } = require('socket.io');

let io = null;
// Maps driverId (string) → socket.id
const driverSockets = new Map();
// Maps customerId (string) → socket.id
const customerSockets = new Map();

/**
 * Attaches Socket.io to the existing HTTP server.
 * @param {import('http').Server} httpServer
 * @returns {import('socket.io').Server}
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // mobile apps don't have a fixed origin
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Ping every 25 s, disconnect after 60 s of inactivity
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    console.log(`🔌  Socket connected: ${socket.id}`);

    // ── Driver registers ─────────────────────────────────────────────────────
    socket.on('driver:join', ({ driverId }) => {
      if (driverId) {
        driverSockets.set(driverId.toString(), socket.id);
        console.log(`✅  Driver ${driverId} joined with socket ${socket.id}`);
      }
    });

    // ── Customer registers ───────────────────────────────────────────────────
    socket.on('customer:join', ({ customerId }) => {
      if (customerId) {
        customerSockets.set(customerId.toString(), socket.id);
        console.log(`✅  Customer ${customerId} joined with socket ${socket.id}`);
      }
    });

    // ── Cleanup on disconnect ────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      // Remove driver if disconnected
      for (const [driverId, sockId] of driverSockets.entries()) {
        if (sockId === socket.id) {
          driverSockets.delete(driverId);
          console.log(`❌  Driver ${driverId} disconnected`);
          break;
        }
      }
      // Remove customer if disconnected
      for (const [customerId, sockId] of customerSockets.entries()) {
        if (sockId === socket.id) {
          customerSockets.delete(customerId);
          console.log(`❌  Customer ${customerId} disconnected`);
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
 * @param {string|ObjectId} driverId
 * @returns {string|undefined}
 */
const getDriverSocket = (driverId) => {
  return driverSockets.get(driverId.toString());
};

/**
 * Get the socket ID for a specific customer
 * @param {string|ObjectId} customerId
 * @returns {string|undefined}
 */
const getCustomerSocket = (customerId) => {
  return customerSockets.get(customerId.toString());
};

module.exports = { initSocket, getIO, getDriverSocket, getCustomerSocket };
