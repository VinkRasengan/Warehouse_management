#!/bin/bash

BASE_URL="http://localhost:5101"

echo "🧪 Testing Product Service API..."

# Function to test API endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    
    echo "📡 Testing $method $endpoint"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "%{http_code}" -X "$method" "$BASE_URL$endpoint")
    fi
    
    status_code="${response: -3}"
    body="${response%???}"
    
    if [ "$status_code" = "$expected_status" ]; then
        echo "✅ $method $endpoint - Status: $status_code"
        if [ -n "$body" ] && [ "$body" != "null" ]; then
            echo "   Response: ${body:0:100}..."
        fi
    else
        echo "❌ $method $endpoint - Expected: $expected_status, Got: $status_code"
        echo "   Response: $body"
    fi
    echo ""
}

# Wait for service to be ready
echo "⏳ Waiting for Product Service to be ready..."
for i in {1..30}; do
    if curl -s "$BASE_URL/health" > /dev/null 2>&1; then
        echo "✅ Product Service is ready!"
        break
    fi
    echo "⏳ Waiting... ($i/30)"
    sleep 2
done

echo ""
echo "🧪 Running API Tests..."
echo "========================"

# Test Health Check
test_endpoint "GET" "/health" "" "200"

# Test Get All Products (should be empty initially)
test_endpoint "GET" "/api/products" "" "200"

# Test Create Product
product_data='{
  "name": "Test iPhone 15",
  "description": "Test product for API testing",
  "price": 999.99,
  "category": "Electronics",
  "sku": "TEST001",
  "stockQuantity": 10,
  "attributes": {
    "color": "Blue",
    "storage": "128GB",
    "brand": "Apple"
  }
}'

test_endpoint "POST" "/api/products" "$product_data" "201"

# Test Get All Products (should have 1 product now)
test_endpoint "GET" "/api/products" "" "200"

# Test Get Product by ID
test_endpoint "GET" "/api/products/1" "" "200"

# Test Update Product
update_data='{
  "id": 1,
  "name": "Updated Test iPhone 15",
  "description": "Updated test product",
  "price": 1099.99,
  "category": "Electronics",
  "sku": "TEST001",
  "stockQuantity": 5,
  "attributes": {
    "color": "Red",
    "storage": "256GB",
    "brand": "Apple"
  }
}'

test_endpoint "PUT" "/api/products/1" "$update_data" "200"

# Test Search by Category
test_endpoint "GET" "/api/products?category=Electronics" "" "200"

# Test Delete Product
test_endpoint "DELETE" "/api/products/1" "" "204"

# Test Get Deleted Product (should return 404)
test_endpoint "GET" "/api/products/1" "" "404"

echo "🎉 API Testing completed!"
echo ""
echo "📋 Manual testing URLs:"
echo "   • Swagger UI: $BASE_URL/swagger"
echo "   • Health Check: $BASE_URL/health"
echo "   • Products API: $BASE_URL/api/products"
