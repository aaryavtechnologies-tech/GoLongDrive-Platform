// src/config/database.js
// Mongoose connection with retry logic and graceful shutdown support.

const mongoose = require('mongoose');

const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 5000;

let retryCount = 0;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Mongoose 7+ no longer needs these flags but we keep them explicit
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    retryCount = 0;
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    retryCount += 1;
    console.error(`❌  MongoDB connection error (attempt ${retryCount}/${MAX_RETRIES}): ${error.message}`);

    if (retryCount < MAX_RETRIES) {
      console.log(`⏳  Retrying in ${RETRY_INTERVAL_MS / 1000}s…`);
      setTimeout(connectDB, RETRY_INTERVAL_MS);
    } else {
      console.error('💀  Max retries reached. Shutting down.');
      process.exit(1);
    }
  }
};

// ── Mongoose event listeners ──────────────────────────────────────────────────

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️   MongoDB disconnected. Attempting reconnect…');
});

mongoose.connection.on('reconnected', () => {
  console.log('♻️   MongoDB reconnected.');
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n🔻  ${signal} received. Closing MongoDB connection…`);
  await mongoose.connection.close();
  console.log('👋  MongoDB connection closed. Exiting.');
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = connectDB;
