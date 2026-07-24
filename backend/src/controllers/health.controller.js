// src/controllers/health.controller.js

const mongoose = require('mongoose');
const os = require('os');
const { sendSuccess, sendError } = require('../helpers/response.helper');

/**
 * @route   GET /api/v1/health
 * @access  Public
 */
const getSystemHealth = (req, res) => {
  const uptime = process.uptime();
  return sendSuccess(res, 200, 'System is healthy', {
    uptime: `${Math.floor(uptime / 60)} minutes`,
    timestamp: new Date(),
    status: 'OK'
  });
};

/**
 * @route   GET /api/v1/health/database
 * @access  Public
 */
const getDatabaseHealth = (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  if (!isConnected) {
    return sendError(res, 503, 'Database is disconnected or unavailable');
  }
  return sendSuccess(res, 200, 'Database is healthy', {
    status: 'Connected',
    dbName: mongoose.connection.name
  });
};

/**
 * @route   GET /api/v1/health/server
 * @access  Public
 */
const getServerHealth = (req, res) => {
  const memUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  
  return sendSuccess(res, 200, 'Server metrics retrieved', {
    cpu: os.cpus()[0].model,
    loadAverage: os.loadavg(),
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
      systemTotal: `${Math.round(totalMem / 1024 / 1024)} MB`,
      systemFree: `${Math.round(freeMem / 1024 / 1024)} MB`
    },
    uptime: os.uptime()
  });
};

module.exports = {
  getSystemHealth,
  getDatabaseHealth,
  getServerHealth
};
