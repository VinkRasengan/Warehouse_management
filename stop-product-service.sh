#!/bin/bash

echo "🛑 Stopping Product Service..."

# Stop Product Service
docker-compose stop product-service

echo "🛑 Stopping dependencies..."

# Stop dependencies (optional - comment out if you want to keep them running)
docker-compose stop mongodb postgres-product rabbitmq

echo "✅ Product Service and dependencies stopped!"

# Show status
echo ""
echo "📋 Container status:"
docker-compose ps product-service mongodb postgres-product rabbitmq
