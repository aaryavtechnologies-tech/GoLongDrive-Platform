const os = require('os');
const mongoose = require('mongoose');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Helper to format bytes to MB/GB
const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * @desc    Get OS and Server Metrics
 * @route   GET /api/v1/system/metrics
 * @access  Private/Admin
 */
exports.getServerMetrics = async (req, res, next) => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(2);

    const cpus = os.cpus();
    const cpuModel = cpus[0].model;
    const cpuCores = cpus.length;

    const metrics = {
      os: {
        platform: os.platform(),
        release: os.release(),
        uptime: os.uptime(), // in seconds
      },
      memory: {
        total: formatBytes(totalMem),
        free: formatBytes(freeMem),
        used: formatBytes(usedMem),
        usagePercentage: `${memUsagePercent}%`,
      },
      cpu: {
        model: cpuModel,
        cores: cpuCores,
        loadAverage: os.loadavg(), // 1, 5, and 15 minute load averages
      },
      node: {
        version: process.version,
        uptime: process.uptime(), // Node process uptime in seconds
      }
    };

    res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Database Connection Status
 * @route   GET /api/v1/system/database
 * @access  Private/Admin
 */
exports.getDatabaseStatus = async (req, res, next) => {
  try {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
      99: 'uninitialized'
    };
    
    const status = mongoose.connection.readyState;
    const isHealthy = status === 1;

    const dbInfo = {
      status: states[status],
      isHealthy,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      port: mongoose.connection.port,
    };

    res.status(200).json({ success: true, data: dbInfo });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get PM2 Status
 * @route   GET /api/v1/system/pm2
 * @access  Private/Admin
 */
exports.getPm2Status = async (req, res, next) => {
  try {
    // Execute pm2 jlist to get JSON output of all running processes
    const { stdout, stderr } = await execAsync('pm2 jlist');
    
    if (stderr) {
      console.error('PM2 stderr:', stderr);
    }

    const processList = JSON.parse(stdout);
    
    const formattedProcesses = processList.map(proc => ({
      id: proc.pm_id,
      name: proc.name,
      status: proc.pm2_env.status,
      uptime: proc.pm2_env.pm_uptime ? Date.now() - proc.pm2_env.pm_uptime : 0, // in ms
      restarts: proc.pm2_env.restart_time,
      memory: formatBytes(proc.monit.memory),
      cpu: `${proc.monit.cpu}%`,
      mode: proc.pm2_env.exec_mode
    }));

    res.status(200).json({ success: true, data: formattedProcesses });
  } catch (error) {
    // If pm2 is not installed or command fails, return a friendly error
    if (error.message.includes('pm2: command not found') || error.message.includes('not recognized')) {
      return res.status(200).json({ 
        success: true, 
        message: 'PM2 is not installed or not running in this environment.',
        data: []
      });
    }
    next(error);
  }
};

/**
 * @desc    Get Server Logs
 * @route   GET /api/v1/system/logs
 * @access  Private/Admin
 */
exports.getServerLogs = async (req, res, next) => {
  try {
    // PM2 typically logs to ~/.pm2/logs
    // But since we might be in development or PM2 might not be accessible,
    // we will execute PM2 logs command to get the last 100 lines
    
    const { stdout, stderr } = await execAsync('pm2 logs taxi-booking-api --lines 100 --nostream');
    
    // Split by new lines and clean up escape characters if needed
    const logLines = stdout.split('\n').filter(line => line.trim() !== '');

    res.status(200).json({ success: true, data: logLines });
  } catch (error) {
    // Fallback if PM2 logs fails
    res.status(200).json({ 
      success: true, 
      message: 'Could not fetch PM2 logs. Server might not be running via PM2.',
      data: [error.message]
    });
  }
};
