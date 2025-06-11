# Docker Setup for Warehouse Management System
Write-Host "DOCKER SETUP - WAREHOUSE MANAGEMENT SYSTEM" -ForegroundColor Blue
Write-Host "===========================================" -ForegroundColor Blue

# Create docker-compose.yml for the entire system
$dockerCompose = @"
version: '3.8'

services:
  # Database Services
  postgres:
    image: postgres:15
    container_name: warehouse-postgres
    environment:
      POSTGRES_DB: warehouse_main
      POSTGRES_USER: warehouse_user
      POSTGRES_PASSWORD: warehouse_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    networks:
      - warehouse-network

  mongodb:
    image: mongo:7
    container_name: warehouse-mongo
    environment:
      MONGO_INITDB_ROOT_USERNAME: warehouse_user
      MONGO_INITDB_ROOT_PASSWORD: warehouse_pass
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    networks:
      - warehouse-network

  redis:
    image: redis:7-alpine
    container_name: warehouse-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - warehouse-network

  rabbitmq:
    image: rabbitmq:3-management
    container_name: warehouse-rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: warehouse_user
      RABBITMQ_DEFAULT_PASS: warehouse_pass
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - warehouse-network

  # Microservices
  inventory-service:
    build:
      context: ./services/inventory-service
      dockerfile: Dockerfile
    container_name: inventory-service
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Host=postgres;Database=inventory_db;Username=warehouse_user;Password=warehouse_pass
      - Redis__ConnectionString=warehouse-redis:6379
      - RabbitMQ__Host=warehouse-rabbitmq
      - RabbitMQ__Username=warehouse_user
      - RabbitMQ__Password=warehouse_pass
    ports:
      - "5000:80"
    depends_on:
      - postgres
      - redis
      - rabbitmq
    networks:
      - warehouse-network

  order-service:
    build:
      context: ./services/order-service
      dockerfile: Dockerfile
    container_name: order-service
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Host=postgres;Database=order_db;Username=warehouse_user;Password=warehouse_pass
      - Redis__ConnectionString=warehouse-redis:6379
      - RabbitMQ__Host=warehouse-rabbitmq
      - RabbitMQ__Username=warehouse_user
      - RabbitMQ__Password=warehouse_pass
    ports:
      - "5002:80"
    depends_on:
      - postgres
      - redis
      - rabbitmq
    networks:
      - warehouse-network

  customer-service:
    build:
      context: ./services/customer-service
      dockerfile: Dockerfile
    container_name: customer-service
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Host=postgres;Database=customer_db;Username=warehouse_user;Password=warehouse_pass
      - Redis__ConnectionString=warehouse-redis:6379
      - RabbitMQ__Host=warehouse-rabbitmq
      - RabbitMQ__Username=warehouse_user
      - RabbitMQ__Password=warehouse_pass
    ports:
      - "5003:80"
    depends_on:
      - postgres
      - redis
      - rabbitmq
    networks:
      - warehouse-network

  payment-service:
    build:
      context: ./services/payment-service
      dockerfile: Dockerfile
    container_name: payment-service
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Host=postgres;Database=payment_db;Username=warehouse_user;Password=warehouse_pass
      - Redis__ConnectionString=warehouse-redis:6379
      - RabbitMQ__Host=warehouse-rabbitmq
      - RabbitMQ__Username=warehouse_user
      - RabbitMQ__Password=warehouse_pass
    ports:
      - "5004:80"
    depends_on:
      - postgres
      - redis
      - rabbitmq
    networks:
      - warehouse-network

  notification-service:
    build:
      context: ./services/notification-service
      dockerfile: Dockerfile
    container_name: notification-service
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Host=postgres;Database=notification_db;Username=warehouse_user;Password=warehouse_pass
      - Redis__ConnectionString=warehouse-redis:6379
      - RabbitMQ__Host=warehouse-rabbitmq
      - RabbitMQ__Username=warehouse_user
      - RabbitMQ__Password=warehouse_pass
    ports:
      - "5005:80"
    depends_on:
      - postgres
      - redis
      - rabbitmq
    networks:
      - warehouse-network

  alert-service:
    build:
      context: ./services/alert-service
      dockerfile: Dockerfile
    container_name: alert-service
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Host=postgres;Database=alert_db;Username=warehouse_user;Password=warehouse_pass
      - Redis__ConnectionString=warehouse-redis:6379
      - RabbitMQ__Host=warehouse-rabbitmq
      - RabbitMQ__Username=warehouse_user
      - RabbitMQ__Password=warehouse_pass
    ports:
      - "5006:80"
    depends_on:
      - postgres
      - redis
      - rabbitmq
    networks:
      - warehouse-network

  api-gateway:
    build:
      context: ./api-gateway-dotnet
      dockerfile: Dockerfile
    container_name: api-gateway
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
    ports:
      - "5001:80"
    depends_on:
      - inventory-service
      - order-service
      - customer-service
      - payment-service
      - notification-service
      - alert-service
    networks:
      - warehouse-network

volumes:
  postgres_data:
  mongo_data:
  redis_data:
  rabbitmq_data:

networks:
  warehouse-network:
    driver: bridge
"@

Write-Host "Creating docker-compose.yml..." -ForegroundColor Yellow
Set-Content -Path "docker-compose.yml" -Value $dockerCompose -Encoding UTF8
Write-Host "  [OK] docker-compose.yml created" -ForegroundColor Green

Write-Host "`nDocker setup completed!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Run: docker-compose up --build" -ForegroundColor Gray
Write-Host "  2. Wait for all services to start" -ForegroundColor Gray
Write-Host "  3. Access services on localhost ports" -ForegroundColor Gray
