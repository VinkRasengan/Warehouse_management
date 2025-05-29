# Warehouse Management System - ASP.NET Core Microservices

A comprehensive microservices-based warehouse management system built with ASP.NET Core and modern technologies.

## Architecture Overview

This system follows a microservices architecture with the following services:

### Core Services
- **API Gateway** - Central entry point using Ocelot for routing and JWT authentication
- **Product Service** - Manages product catalog, information, and attributes (name, description, price, size, color)
- **Inventory Service** - Tracks stock levels, inventory movements, and low-stock alerts with Redis caching
- **Order Service** - Handles order processing, status management (Pending, Confirmed, Shipped, Completed)
- **Customer Service** - Manages customer information, profiles, purchase history, and loyalty points

### Business Services
- **Payment Service** - Processes payments (cash, card, e-wallets), integrates with third-party providers (MoMo, bank APIs)
- **Reporting Service** - Generates business reports (revenue, profit, inventory reports) by date range
- **Notification Service** - Sends email/SMS/push notifications for orders, low inventory, etc.
- **Alert Service** - Handles system alerts and notifications

## Tech Stack

- **Backend**: ASP.NET Core 8.0
- **API Gateway**: Ocelot
- **Authentication**: JWT Bearer tokens
- **Database**: PostgreSQL (separate database per service)
- **ORM**: Entity Framework Core
- **Message Broker**: RabbitMQ for async communication
- **Cache**: Redis (for Inventory Service)
- **Email**: MailKit/MimeKit (for Notification Service)
- **SMS**: Twilio (for Notification Service)
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
│   ├── payment-service/      # Payment processing (ASP.NET Core)
│   ├── notification-service/ # Multi-channel notifications (ASP.NET Core)
│   ├── reporting-service/    # Analytics and reporting (ASP.NET Core)
│   └── alert-service/        # System alerts (ASP.NET Core)
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
   - **Payment Service**: <http://localhost:5107>
   - **Notification Service**: <http://localhost:5108>

### Infrastructure Services

- **RabbitMQ Management**: <http://localhost:15672> (admin/password)
- **PostgreSQL Databases**:
  - Product DB: localhost:5432
  - Inventory DB: localhost:5433
  - Order DB: localhost:5434
  - Customer DB: localhost:5435
  - Reporting DB: localhost:5436
  - Alert DB: localhost:5437
  - Payment DB: localhost:5438
  - Notification DB: localhost:5439
- **Redis Cache**: localhost:6379

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
- Payment Service: <http://localhost:5107/swagger>
- Notification Service: <http://localhost:5108/swagger>

## API Gateway Routes

All services are accessible through the API Gateway with the following routes:

- `/api/products/*` → Product Service
- `/api/inventory/*` → Inventory Service
- `/api/orders/*` → Order Service
- `/api/customers/*` → Customer Service
- `/api/reports/*` → Reporting Service
- `/api/alerts/*` → Alert Service
- `/api/payments/*` → Payment Service
- `/api/notifications/*` → Notification Service

## Service Details

### Payment Service Features
- **Multiple Payment Methods**: Cash, Credit/Debit Cards, MoMo, ZaloPay, VNPay, Bank Transfer
- **Third-party Integration**: Seamless integration with payment providers
- **Transaction Management**: Complete transaction lifecycle tracking
- **Refund Processing**: Support for full and partial refunds
- **Payment Status Tracking**: Real-time payment status updates

### Notification Service Features
- **Multi-channel Support**: Email, SMS, Push notifications
- **Template System**: Reusable notification templates
- **Event-driven**: Automatic notifications based on system events
- **Scheduling**: Support for scheduled notifications
- **Delivery Tracking**: Monitor notification delivery status
- **Retry Logic**: Automatic retry for failed notifications

## Message Broker Integration

Services communicate asynchronously via RabbitMQ:

### Event Types
- **Order Events**: order.created, order.confirmed, order.shipped, order.completed
- **Payment Events**: payment.completed, payment.failed, payment.refunded
- **Inventory Events**: inventory.low_stock, inventory.updated
- **Notification Events**: notification.sent, notification.failed

### Event Flow Examples
1. **Order Processing**: Order Service → Payment Service → Notification Service
2. **Low Inventory**: Inventory Service → Notification Service → Alert Service
3. **Payment Completion**: Payment Service → Order Service → Notification Service

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

### Configuration

Services use environment variables for configuration:

```bash
# Database
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=service_db;Username=postgres;Password=password

# JWT
JWT__Key=your-super-secret-key-that-is-at-least-32-characters-long
JWT__Issuer=WarehouseManagement
JWT__Audience=WarehouseManagement

# RabbitMQ
RabbitMQ__HostName=localhost
RabbitMQ__Port=5672
RabbitMQ__UserName=guest
RabbitMQ__Password=guest

# Email (Notification Service)
Email__SmtpHost=smtp.gmail.com
Email__SmtpPort=587
Email__Username=your-email@gmail.com
Email__Password=your-app-password

# SMS (Notification Service)
Twilio__AccountSid=your-twilio-account-sid
Twilio__AuthToken=your-twilio-auth-token
Twilio__FromNumber=+1234567890
```

### Database Migrations

Each service manages its own database schema using Entity Framework Core:

```bash
# In each service directory
dotnet ef database update
```

### Testing

Run tests for all services:

```bash
dotnet test
```

## Security

- JWT-based authentication across all services
- API Gateway handles centralized authentication
- Each service validates JWT tokens
- HTTPS support in production
- CORS configuration for web clients

## Monitoring and Logging

- Structured logging with Serilog
- Health checks for all services (`/health` endpoint)
- Centralized logging to files and console
- RabbitMQ message tracking

## Deployment

### Docker Compose (Development)
```bash
docker-compose up -d
```

### Kubernetes (Production)
Kubernetes manifests are available in the `/infra/k8s` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License
