# Warehouse Management System - ASP.NET Core Microservices

A comprehensive microservices-based warehouse management system built with ASP.NET Core and modern technologies.

## Architecture Overview

This system follows a microservices architecture with the following services:

- **API Gateway** - Central entry point using Ocelot for routing and JWT authentication
- **Product Service** - Manages product catalog and information
- **Inventory Service** - Handles stock levels and inventory tracking with Redis caching
- **Order Service** - Processes customer orders and order fulfillment
- **Customer Service** - Manages customer information and profiles
- **Reporting Service** - Generates business reports and analytics
- **Alert Service** - Handles notifications and email alerts

## Tech Stack

- **Backend**: ASP.NET Core 8.0
- **API Gateway**: Ocelot
- **Authentication**: JWT Bearer tokens
- **Database**: PostgreSQL (separate database per service)
- **ORM**: Entity Framework Core
- **Message Broker**: RabbitMQ for async communication
- **Cache**: Redis (for Inventory Service)
- **Email**: MailKit (for Alert Service)
- **Containerization**: Docker & Docker Compose
- **Logging**: Serilog
- **Mapping**: AutoMapper

## Project Structure

```text
warehouse-management/
├── api-gateway-dotnet/       # API Gateway with Ocelot
├── services/
│   ├── product-service/      # Product management (ASP.NET Core)
│   ├── inventory-service/    # Inventory management (ASP.NET Core)
│   ├── order-service/        # Order processing (ASP.NET Core)
│   ├── customer-service/     # Customer management (ASP.NET Core)
│   ├── reporting-service/    # Analytics and reporting (ASP.NET Core)
│   └── alert-service/        # Notification system (ASP.NET Core)
├── shared/                   # Shared libraries and types
├── infra/
│   └── k8s/                 # Kubernetes manifests
├── docs/                    # Documentation
└── docker-compose.yml       # Docker Compose configuration
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- .NET 8.0 SDK (for local development)
- PostgreSQL (if running locally)

### Quick Start

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd warehouse-management
   ```

2. Start all services with Docker Compose:

   ```bash
   docker-compose up -d --build
   ```

3. Access the services:

   - **API Gateway**: <http://localhost:5000> (HTTP) / <https://localhost:5001> (HTTPS)
   - **Product Service**: <http://localhost:5101>
   - **Inventory Service**: <http://localhost:5102>
   - **Order Service**: <http://localhost:5103>
   - **Customer Service**: <http://localhost:5104>
   - **Reporting Service**: <http://localhost:5105>
   - **Alert Service**: <http://localhost:5106>

### Authentication

To access protected endpoints, you need to authenticate:

1. **Login** to get JWT token:

   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "password"}'
   ```

2. **Use the token** in subsequent requests:

   ```bash
   curl -X GET http://localhost:5000/api/products \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

### API Documentation

Each service provides Swagger documentation:

- API Gateway: <http://localhost:5000/swagger>
- Product Service: <http://localhost:5101/swagger>
- Inventory Service: <http://localhost:5102/swagger>
- Order Service: <http://localhost:5103/swagger>
- Customer Service: <http://localhost:5104/swagger>
- Reporting Service: <http://localhost:5105/swagger>
- Alert Service: <http://localhost:5106/swagger>

## Development

### Local Development Setup

1. **Install .NET 8.0 SDK**

2. **Restore packages** for each service:

   ```bash
   # For each service directory
   dotnet restore
   ```

3. **Set up environment variables** (update appsettings.Development.json in each service)

4. **Run services individually**:

   ```bash
   # In each service directory
   dotnet run
   ```

### Database Migrations

Each service manages its own database schema using Entity Framework Core:

```bash
# In each service directory
dotnet ef database update
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License
