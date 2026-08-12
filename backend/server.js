// backend/server.js
// HTTP server bootstrap — attaches Socket.io and starts listening.

require('dotenv').config();

const http       = require('http');
const app        = require('./app');
const mongoose   = require('mongoose');
const connectDB  = require('./src/config/database');
const { initSocket } = require('./src/config/socket');
const { initializeSystem } = require('./src/helpers/init.helper');
const { setupCronJobs } = require('./src/cron');
const mailConfig = require('./src/config/mail');

const PORT = process.env.PORT || 5000;

// ── Create HTTP server ────────────────────────────────────────────────────────

const httpServer = http.createServer(app);

// ── Attach Socket.io (Phase 1: init only, no ride events) ────────────────────

initSocket(httpServer);

// ── Bootstrap ─────────────────────────────────────────────────────────────────

const start = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // Drop orphaned userId index from drivers collection if it exists
    await mongoose.connection.collection('drivers').dropIndex('userId_1').catch(() => {});

    // Auto-seed RBAC and defaults
    await initializeSystem();

    // Start background cron jobs
    setupCronJobs();

    // 3. Start listening
    httpServer.listen(PORT, () => {
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅  MongoDB connected:', mongoose.connection.host);
      console.log(`🚕  Long Distance Taxi API`);
      console.log(`🌍  Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(`🚀  Server      : http://localhost:${PORT}`);
      console.log(`📋  API Docs    : http://localhost:${PORT}/api-docs`);
      console.log(`❤️   Health      : http://localhost:${PORT}/api/health`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
    });
  } catch (err) {
    console.error('❌  Failed to start server:', err.message);
    process.exit(1);
  }
};

// ── Unhandled rejection & exception guards ────────────────────────────────────

process.on('unhandledRejection', (reason) => {
  console.error('💥  Unhandled Rejection:', reason);
  httpServer.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('💥  Uncaught Exception:', err.message);
  process.exit(1);
});

start();
