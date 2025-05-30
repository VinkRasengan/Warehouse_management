# Infrastructure Setup Script
# This script sets up all required infrastructure services using Docker

param(
    [switch]$Stop,
    [switch]$Reset
)

Write-Host "Infrastructure Setup for Warehouse Management System" -ForegroundColor Blue

# Function to check Docker
function Test-Docker {
    try {
        docker --version | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Stop services if requested
if ($Stop) {
    Write-Host "Stopping all infrastructure services..." -ForegroundColor Red
    docker-compose -f docker-compose.infrastructure.yml down -v
    Write-Host "All infrastructure services stopped" -ForegroundColor Green
    exit 0
}

# Reset services if requested
if ($Reset) {
    Write-Host "Resetting all infrastructure services..." -ForegroundColor Yellow
    docker-compose -f docker-compose.infrastructure.yml down -v
    docker volume prune -f
    Write-Host "All infrastructure services reset" -ForegroundColor Green
}

# Check Docker
if (-not (Test-Docker)) {
    Write-Host "Docker not found! Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

Write-Host "Docker is available" -ForegroundColor Green

# Check if infrastructure compose file exists
if (-not (Test-Path "docker-compose.infrastructure.yml")) {
    Write-Host "Creating infrastructure compose file..." -ForegroundColor Yellow
    
    $composeContent = @"
version: '3.8'

services:
  # PostgreSQL for most services
  postgres-main:
    image: postgres:15
    container_name: warehouse-postgres-main
    environment:
      POSTGRES_DB: warehouse_main
      POSTGRES_USER: warehouse_user
      POSTGRES_PASSWORD: warehouse_pass123
    ports:
      - "5432:5432"
    volumes:
      - postgres_main_data:/var/lib/postgresql/data
    networks:
      - warehouse-network

  # MongoDB for User Service
  mongodb:
    image: mongo:7
    container_name: warehouse-mongodb
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin123
      MONGO_INITDB_DATABASE: warehouse_users
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - warehouse-network

  # Redis for caching
  redis:
    image: redis:7-alpine
    container_name: warehouse-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - warehouse-network

  # RabbitMQ for messaging
  rabbitmq:
    image: rabbitmq:3-management
    container_name: warehouse-rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: password
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - warehouse-network

  # pgAdmin for PostgreSQL management
  pgadmin:
    image: dpage/pgadmin4
    container_name: warehouse-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@warehouse.com
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "8080:80"
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    networks:
      - warehouse-network
    depends_on:
      - postgres-main

volumes:
  postgres_main_data:
  mongodb_data:
  redis_data:
  rabbitmq_data:
  pgadmin_data:

networks:
  warehouse-network:
    driver: bridge
"@
    
    $composeContent | Out-File -FilePath "docker-compose.infrastructure.yml" -Encoding UTF8
    Write-Host "Infrastructure compose file created" -ForegroundColor Green
}

# Start infrastructure services
Write-Host "Starting infrastructure services..." -ForegroundColor Blue
docker-compose -f docker-compose.infrastructure.yml up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start infrastructure services" -ForegroundColor Red
    exit 1
}

# Wait for services to be ready
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Display service information
Write-Host "`nInfrastructure Services Started:" -ForegroundColor Green
Write-Host "  PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host "    Database: warehouse_main" -ForegroundColor Gray
Write-Host "    User: warehouse_user" -ForegroundColor Gray
Write-Host "    Password: warehouse_pass123" -ForegroundColor Gray
Write-Host ""
Write-Host "  MongoDB: localhost:27017" -ForegroundColor White
Write-Host "    User: admin" -ForegroundColor Gray
Write-Host "    Password: admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "  Redis: localhost:6379" -ForegroundColor White
Write-Host ""
Write-Host "  RabbitMQ: localhost:5672" -ForegroundColor White
Write-Host "    Management UI: http://localhost:15672" -ForegroundColor Gray
Write-Host "    User: admin" -ForegroundColor Gray
Write-Host "    Password: password" -ForegroundColor Gray
Write-Host ""
Write-Host "  pgAdmin: http://localhost:8080" -ForegroundColor White
Write-Host "    Email: admin@warehouse.com" -ForegroundColor Gray
Write-Host "    Password: admin123" -ForegroundColor Gray

Write-Host "`nInfrastructure setup completed!" -ForegroundColor Green
Write-Host "You can now run the application services with full database support." -ForegroundColor Cyan
