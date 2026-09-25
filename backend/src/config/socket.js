// src/config/socket.js
// Socket.io — handles driver & customer real-time connections.

const { Server } = require('socket.io');
const logger = require('../utils/logger');


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
    logger.info(`🔌  Socket connected: ${socket.id}`);

    // ── Driver registers ─────────────────────────────────────────────────────
    socket.on('driver:join', ({ driverId }) => {
      if (driverId) {
        driverSockets.set(driverId.toString(), socket.id);
        logger.info(`✅  Driver ${driverId} joined — socket: ${socket.id} | Total drivers online: ${driverSockets.size}`);
      }
    });

    // ── Customer registers ───────────────────────────────────────────────────
    socket.on('customer:join', ({ customerId }) => {
      if (customerId) {
        customerSockets.set(customerId.toString(), socket.id);
        logger.info(`✅  Customer ${customerId} joined — socket: ${socket.id}`);
      }
    });

    // ── Cleanup on disconnect ────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      // Remove driver if disconnected
      for (const [driverId, sockId] of driverSockets.entries()) {
        if (sockId === socket.id) {
          driverSockets.delete(driverId);
          logger.info(`❌  Driver ${driverId} disconnected — reason: ${reason}`);
          break;
        }
      }
      // Remove customer if disconnected
      for (const [customerId, sockId] of customerSockets.entries()) {
        if (sockId === socket.id) {
          customerSockets.delete(customerId);
          logger.info(`❌  Customer ${customerId} disconnected — reason: ${reason}`);
          break;
        }
      }
      logger.info(`❌  Socket disconnected: ${socket.id} — reason: ${reason}`);
    });
  });

  logger.info('✅  Socket.io initialised');
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

/**
 * Emit a city:request event to a specific driver socket.
 * Used ONLY for local/city ride bookings — separate from ride:request (long-distance).
 * @param {string} driverSocketId
 * @param {Object} booking
 */
const emitCityRideRequest = (driverSocketId, booking) => {
  try {
    const ioInstance = getIO();
    ioInstance.to(driverSocketId).emit('city:request', { booking });
    logger.info(`📤  [City] city:request → socket ${driverSocketId} | booking: ${booking.bookingId || booking._id}`);
  } catch (error) {
    logger.error(`❌  emitCityRideRequest error: ${error.message}`);
  }
};

module.exports = { initSocket, getIO, getDriverSocket, getCustomerSocket, emitCityRideRequest };
