#!/bin/bash
# Admin Panel Deployment Script for VPS
# Usage: sudo ./deploy-admin.sh

set -e

DOMAIN="admin.golongdrive.online"
PORT=3001
APP_NAME="admin-panel"

echo "🚀 Starting deployment for $DOMAIN on port $PORT..."

# 1. Check if running as root (needed for Nginx/Certbot)
if [ "$EUID" -ne 0 ]; then
  echo "⚠️ Please run this script with sudo or as root (required for Nginx and Certbot)."
  exit 1
fi

# 1.5 Check for .env file
if [ ! -f ".env" ]; then
  echo "❌ Error: .env file not found!"
  echo "Please create the .env file in the admin-panel directory before deploying."
  exit 1
fi

# 2. Build the Next.js app (run as the original user who invoked sudo)
ORIGINAL_USER=${SUDO_USER:-$USER}

echo "📦 Installing NPM dependencies..."
npm install

echo "🏗️ Building the Next.js application..."
npm run build

# 3. Start/Restart PM2
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

# 4. Configure Nginx
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
echo "🌐 Configuring Nginx for $DOMAIN..."

cat > $NGINX_CONF <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        
        # Real IP headers
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Symlink to sites-enabled
if [ ! -f "/etc/nginx/sites-enabled/$DOMAIN" ]; then
  ln -s $NGINX_CONF /etc/nginx/sites-enabled/
fi

# Test and Reload Nginx
echo "🔄 Reloading Nginx..."
nginx -t && systemctl reload nginx

# 5. Run Certbot for SSL
echo "🔒 Requesting SSL certificate from Let's Encrypt..."
if command -v certbot > /dev/null; then
  # The --register-unsafely-without-email bypasses the email prompt if it's the first time running certbot
  certbot --nginx -d $DOMAIN --non-interactive --agree-tos --register-unsafely-without-email
  echo "✅ SSL certificate installed."
else
  echo "⚠️ Certbot not found. Skipping SSL configuration."
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo "🔗 You can now access the admin panel at: https://$DOMAIN"
