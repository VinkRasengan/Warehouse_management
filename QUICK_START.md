# 🚀 Quick Start Guide - ASP.NET Core Microservices

## Prerequisites

- Docker & Docker Compose
- .NET 8.0 SDK (optional, for local development)

## 🏃‍♂️ Quick Start (5 minutes)

### 1. Clone and Start
```bash
git clone <repository-url>
cd warehouse-management

# Start all services
docker-compose up -d --build
```

### 2. Wait for Services to Start
```bash
# Check if all services are running
docker-compose ps

# Check logs if needed
docker-compose logs -f
```

### 3. Test the System
```bash
# Make the test script executable
chmod +x scripts/test-api.sh

# Run the test script
./scripts/test-api.sh
```

## 🌐 Service URLs

| Service | URL | Swagger |
|---------|-----|---------|
| **API Gateway** | http://localhost:5000 | http://localhost:5000/swagger |
| **Product Service** | http://localhost:5101 | http://localhost:5101/swagger |
| **Inventory Service** | http://localhost:5102 | http://localhost:5102/swagger |
| **Order Service** | http://localhost:5103 | http://localhost:5103/swagger |
| **Customer Service** | http://localhost:5104 | http://localhost:5104/swagger |
| **Reporting Service** | http://localhost:5105 | http://localhost:5105/swagger |
| **Alert Service** | http://localhost:5106 | http://localhost:5106/swagger |

## 🔐 Authentication

### Get JWT Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'
```

### Use Token in Requests
```bash
# Replace YOUR_JWT_TOKEN with the actual token
curl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📝 Basic API Examples

### 1. Create a Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Test Product",
    "description": "This is a test product",
    "sku": "TEST-001",
    "price": 29.99,
    "category": "Electronics"
  }'
```

### 2. Get All Products
```bash
curl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Create a Customer
```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "postalCode": "10001",
    "country": "USA"
  }'
```

### 4. Create an Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "customerId": 1,
    "shippingAddress": "123 Main St",
    "shippingCity": "New York",
    "shippingPostalCode": "10001",
    "shippingCountry": "USA",
    "billingAddress": "123 Main St",
    "billingCity": "New York",
    "billingPostalCode": "10001",
    "billingCountry": "USA",
    "orderItems": [
      {
        "productId": 1,
        "quantity": 2
      }
    ]
  }'
```

## 🔍 Health Checks

Check if all services are healthy:
```bash
curl http://localhost:5000/health  # API Gateway
curl http://localhost:5101/health  # Product Service
curl http://localhost:5102/health  # Inventory Service
curl http://localhost:5103/health  # Order Service
curl http://localhost:5104/health  # Customer Service
curl http://localhost:5105/health  # Reporting Service
curl http://localhost:5106/health  # Alert Service
```

## 🛠️ Development

### Run Individual Services Locally
```bash
# Start infrastructure first
docker-compose up -d postgres-product postgres-inventory postgres-order postgres-customer postgres-reporting postgres-alert rabbitmq redis

# Run API Gateway
cd api-gateway-dotnet && dotnet run

# Run Product Service (in another terminal)
cd services/product-service && dotnet run

# Run other services as needed...
```

### Database Migrations
```bash
# For each service with Entity Framework
cd services/product-service && dotnet ef database update
cd services/inventory-service && dotnet ef database update
cd services/order-service && dotnet ef database update
cd services/customer-service && dotnet ef database update
cd services/reporting-service && dotnet ef database update
cd services/alert-service && dotnet ef database update
```

## 🐛 Troubleshooting

### Check Service Logs
```bash
# View logs for all services
docker-compose logs

# View logs for specific service
docker-compose logs api-gateway
docker-compose logs product-service
```

### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart api-gateway
```

### Clean Start
```bash
# Stop and remove all containers
docker-compose down

# Remove volumes (this will delete all data)
docker-compose down -v

# Start fresh
docker-compose up -d --build
```

## 📊 Monitoring

### RabbitMQ Management
- URL: http://localhost:15672
- Username: admin
- Password: password

### Database Connections
- PostgreSQL services run on ports 5432-5437
- Default credentials: postgres/password

## 🎯 Next Steps

1. **Customize Business Logic**: Modify services according to your requirements
2. **Add More Tests**: Implement unit and integration tests
3. **Configure Production**: Set up proper secrets and environment variables
4. **Deploy**: Use Kubernetes manifests for production deployment
5. **Monitor**: Set up Prometheus and Grafana for monitoring

## 🆘 Support

If you encounter any issues:
1. Check the logs: `docker-compose logs`
2. Verify all services are running: `docker-compose ps`
3. Test individual endpoints with the provided curl commands
4. Check the Swagger documentation for API details

**🎉 Congratulations! Your ASP.NET Core Microservices are now running!** 🚀
