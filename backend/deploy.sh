#!/bin/bash
# VPS Deployment script for Node.js backend using PM2

echo "Starting Deployment..."

# 1. Pull latest code
echo "Pulling latest changes from git..."
git pull origin main

# 2. Install dependencies (skip dev dependencies)
echo "Installing production dependencies..."
npm install --production

# 3. Restart PM2
echo "Restarting application with PM2..."
pm2 restart ecosystem.config.js --env production

echo "Deployment complete! Application is running in production mode."
pm2 status
