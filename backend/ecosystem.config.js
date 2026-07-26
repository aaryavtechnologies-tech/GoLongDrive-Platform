module.exports = {
  apps: [
    {
      name: 'taxi-booking-api',
      script: './server.js',
      instances: 1, // Changed from max to 1 at user request
      exec_mode: 'cluster',
      autorestart: true,
      watch: false, // Do not watch in production
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5051,
      },
    },
  ],
};
