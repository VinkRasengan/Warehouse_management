#!/bin/bash

echo "🚀 Starting Product Service..."

# Function to check if service is running
check_service() {
    local url=$1
    local service_name=$2
    
    echo "⏳ Checking $service_name..."
    for i in {1..30}; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo "✅ $service_name is ready!"
            return 0
        fi
        echo "⏳ Waiting for $service_name... ($i/30)"
        sleep 2
    done
    echo "❌ $service_name failed to start"
    return 1
}

# Start dependencies
echo "📦 Starting dependencies..."
docker-compose up -d mongodb postgres-product rabbitmq

# Wait for dependencies
echo "⏳ Waiting for dependencies to be ready..."
check_service "http://localhost:27017" "MongoDB"
check_service "http://localhost:5432" "PostgreSQL"
check_service "http://localhost:15672" "RabbitMQ"

# Start Product Service
echo "🏗️ Starting Product Service..."
docker-compose up -d product-service

# Wait for Product Service
check_service "http://localhost:5101/health" "Product Service"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Product Service is running successfully!"
    echo ""
    echo "📋 Service URLs:"
    echo "   • API: http://localhost:5101"
    echo "   • Swagger: http://localhost:5101/swagger"
    echo "   • Health: http://localhost:5101/health"
    echo ""
    echo "📋 Dependencies:"
    echo "   • MongoDB: mongodb://admin:admin123@localhost:27017"
    echo "   • PostgreSQL: postgresql://postgres:password@localhost:5432/product_db"
    echo "   • RabbitMQ: http://localhost:15672 (admin/password)"
    echo ""
    echo "🧪 Test the API:"
    echo "   curl http://localhost:5101/health"
    echo "   curl http://localhost:5101/api/products"
    echo ""
else
    echo "❌ Failed to start Product Service"
    echo "📋 Check logs:"
    echo "   docker-compose logs product-service"
    exit 1
fi
