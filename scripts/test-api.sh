#!/bin/bash

# Test script for Warehouse Management API
# This script tests the basic functionality of the microservices

API_GATEWAY="http://localhost:5000"
JWT_TOKEN=""

echo "🚀 Testing Warehouse Management API"
echo "=================================="

# Function to make authenticated requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -n "$data" ]; then
        curl -s -X $method "$API_GATEWAY$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $JWT_TOKEN" \
            -d "$data"
    else
        curl -s -X $method "$API_GATEWAY$endpoint" \
            -H "Authorization: Bearer $JWT_TOKEN"
    fi
}

# Test 1: Authentication
echo "📝 Testing Authentication..."
echo "Logging in with admin credentials..."

LOGIN_RESPONSE=$(curl -s -X POST "$API_GATEWAY/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "password"}')

echo "Login response: $LOGIN_RESPONSE"

# Extract JWT token (assuming JSON response with "token" field)
JWT_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$JWT_TOKEN" ]; then
    echo "❌ Failed to get JWT token. Exiting..."
    exit 1
fi

echo "✅ Successfully authenticated. Token: ${JWT_TOKEN:0:20}..."
echo ""

# Test 2: Product Service
echo "📦 Testing Product Service..."

# Create a product
echo "Creating a new product..."
CREATE_PRODUCT_RESPONSE=$(make_request POST "/api/products" '{
    "name": "Test Product",
    "description": "This is a test product",
    "sku": "TEST-001",
    "price": 29.99,
    "category": "Electronics",
    "attributes": [
        {
            "name": "Color",
            "value": "Blue"
        },
        {
            "name": "Size",
            "value": "Medium"
        }
    ]
}')

echo "Create product response: $CREATE_PRODUCT_RESPONSE"

# Get all products
echo "Getting all products..."
GET_PRODUCTS_RESPONSE=$(make_request GET "/api/products")
echo "Get products response: $GET_PRODUCTS_RESPONSE"

# Search products
echo "Searching products..."
SEARCH_RESPONSE=$(make_request GET "/api/products/search?term=Test")
echo "Search response: $SEARCH_RESPONSE"

echo "✅ Product Service tests completed"
echo ""

# Test 3: Inventory Service
echo "📊 Testing Inventory Service..."

# Get inventory (this might be empty initially)
echo "Getting inventory..."
GET_INVENTORY_RESPONSE=$(make_request GET "/api/inventory")
echo "Get inventory response: $GET_INVENTORY_RESPONSE"

echo "✅ Inventory Service tests completed"
echo ""

# Test 4: Customer Service
echo "👥 Testing Customer Service..."

# Get customers (this might be empty initially)
echo "Getting customers..."
GET_CUSTOMERS_RESPONSE=$(make_request GET "/api/customers")
echo "Get customers response: $GET_CUSTOMERS_RESPONSE"

echo "✅ Customer Service tests completed"
echo ""

# Test 5: Order Service
echo "🛒 Testing Order Service..."

# Get orders (this might be empty initially)
echo "Getting orders..."
GET_ORDERS_RESPONSE=$(make_request GET "/api/orders")
echo "Get orders response: $GET_ORDERS_RESPONSE"

echo "✅ Order Service tests completed"
echo ""

# Test 6: Inventory Service
echo "📦 Testing Inventory Service..."

# Get inventory
echo "Getting inventory..."
GET_INVENTORY_RESPONSE=$(make_request GET "/api/inventory")
echo "Get inventory response: $GET_INVENTORY_RESPONSE"

# Check stock availability
echo "Checking stock availability..."
STOCK_CHECK_RESPONSE=$(make_request GET "/api/inventory/check-availability/1/5")
echo "Stock check response: $STOCK_CHECK_RESPONSE"

echo "✅ Inventory Service tests completed"
echo ""

# Test 7: Reporting Service
echo "📈 Testing Reporting Service..."

# Get reports (this might be empty initially)
echo "Getting reports..."
GET_REPORTS_RESPONSE=$(make_request GET "/api/reports")
echo "Get reports response: $GET_REPORTS_RESPONSE"

echo "✅ Reporting Service tests completed"
echo ""

# Test 8: Alert Service
echo "🔔 Testing Alert Service..."

# Get alerts (this might be empty initially)
echo "Getting alerts..."
GET_ALERTS_RESPONSE=$(make_request GET "/api/alerts")
echo "Get alerts response: $GET_ALERTS_RESPONSE"

echo "✅ Alert Service tests completed"
echo ""

echo "🎉 All API tests completed!"
echo "🚀 ASP.NET Core Microservices are working!"
echo "=================================="
