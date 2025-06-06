#!/bin/bash

echo "🚀 Deploying Warehouse Management System for public access..."

# Get local IP
LOCAL_IP=$(ipconfig | grep "IPv4 Address" | head -1 | awk '{print $NF}' | tr -d '\r')
echo "📍 Local IP: $LOCAL_IP"

# Update frontend configuration
echo "⚙️ Updating frontend configuration..."
cat > frontend/.env << EOF
HOST=0.0.0.0
REACT_APP_API_URL=http://$LOCAL_IP:5100/api
REACT_APP_ENVIRONMENT=development
REACT_APP_NAME=Warehouse Management System
REACT_APP_VERSION=1.0.0
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_NOTIFICATIONS=true
EOF

# Start services
echo "🐳 Starting backend services..."
docker-compose up -d

echo "⚛️ Starting frontend..."
cd frontend && npm start &

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📋 Access URLs:"
echo "   • Frontend: http://$LOCAL_IP:3000"
echo "   • Backend APIs: http://$LOCAL_IP:5100-5108"
echo ""
echo "🔐 Demo Login:"
echo "   • Email: admin@warehouse.com"
echo "   • Password: admin123"
echo ""
echo "📱 Share these URLs with others on the same network!"
