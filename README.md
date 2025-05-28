# Warehouse Management Microservices

A modern microservices-based warehouse management system built with Node.js, TypeScript, and Kubernetes.

## Architecture Overview

This system follows a microservices architecture with the following services:

- **API Gateway** - Entry point, routing, authentication, rate limiting
- **Product Service** - Product CRUD, categorization
- **Inventory Service** - Stock management, quantity updates, minimum thresholds
- **Order Service** - Order processing, payment, invoice generation
- **Customer Service** - Customer management, purchase history, loyalty points
- **Reporting Service** - Revenue aggregation, detailed reports, analytics
- **Alert Service** - Stock alerts, email/SMS notifications

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with NestJS for some services
- **Database**: PostgreSQL (separate DB per service)
- **Message Broker**: RabbitMQ
- **Caching**: Redis
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **API Gateway**: Custom Express.js gateway
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack

## Project Structure

```
warehouse-microservices/
├── api-gateway/              # API Gateway service
├── services/
│   ├── product-service/      # Product management
│   ├── inventory-service/    # Inventory management
│   ├── order-service/        # Order processing
│   ├── customer-service/     # Customer management
│   ├── reporting-service/    # Analytics and reporting
│   └── alert-service/        # Notification system
├── shared/                   # Shared libraries and types
├── infra/
│   ├── terraform/           # Infrastructure as Code
│   ├── k8s/                 # Kubernetes manifests
│   └── helm-charts/         # Helm charts
├── docs/                    # Documentation
└── .github/workflows/       # CI/CD pipelines
```

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Kubernetes cluster (minikube for local development)
- PostgreSQL
- RabbitMQ

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start infrastructure: `docker-compose up -d`
4. Start services: `npm run dev`

### Production Deployment

1. Build Docker images: `npm run build:docker`
2. Deploy to Kubernetes: `kubectl apply -f infra/k8s/`

## Service Communication

- **Synchronous**: REST APIs for direct queries and commands
- **Asynchronous**: RabbitMQ for event-driven communication

## Monitoring & Observability

- Health checks on `/health` endpoint for each service
- Metrics exposed on `/metrics` endpoint
- Distributed tracing with correlation IDs
- Centralized logging with structured JSON format

## Development Guidelines

- Each service is independently deployable
- Database per service pattern
- Event-driven architecture for loose coupling
- API versioning for backward compatibility
- Comprehensive testing (unit, integration, e2e)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License
