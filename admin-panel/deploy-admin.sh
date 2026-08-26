#!/bin/bash
# Admin Panel Deployment Script for VPS
# Usage: ./deploy-admin.sh

set -e

PORT=3001
APP_NAME="golongdrive-admin-panel"

echo "🚀 Starting deployment for $APP_NAME..."

# Check for .env file
if [ ! -f ".env" ]; then
  echo "❌ Error: .env file not found!"
  echo "Please create the .env file in the admin-panel directory before deploying."
  exit 1
fi

echo "📥 Fetching latest code from GitHub..."
git pull origin main || echo "⚠️ Git pull failed or no repository found. Continuing anyway..."

echo "📦 Installing NPM dependencies..."
npm install

echo "🏗️ Building the Next.js application..."
npm run build

# Start/Restart PM2
echo "🔄 Managing PM2 process..."
# Ensure PM2 is running
if pm2 show $APP_NAME > /dev/null 2>&1; then
  echo "Restarting existing PM2 process..."
  pm2 restart $APP_NAME
else
  echo "Starting new PM2 process..."
  pm2 start npm --name "$APP_NAME" -- start -- -p $PORT
fi
pm2 save

echo ""
echo "🎉 Deployment completed successfully!"
