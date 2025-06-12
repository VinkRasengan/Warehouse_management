# 🏭 Warehouse Management System

A modern, scalable warehouse management system built with microservices architecture using .NET 8 and React.

[![.NET](https://img.shields.io/badge/.NET-8.0-blue.svg)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5.0-blue.svg)](https://mui.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-blue.svg)](https://kubernetes.io/)

## ✨ Features

### 📦 **Inventory Management**
- Real-time stock tracking and management
- Product catalog with categories and variants
- Low stock alerts and automated reordering
- Barcode scanning and QR code support
- Inventory movement history and audit trails

### 📋 **Order Processing**
- Complete order lifecycle management
- Multi-channel order integration
- Automated fulfillment workflows
- Shipping and tracking integration
- Return and refund processing

### 👥 **Customer Management**
- Comprehensive customer profiles
- Order history and analytics
- Loyalty programs and rewards
- Customer segmentation and targeting
- Communication preferences

### 💳 **Payment Processing**
- Multiple payment gateway support
- Secure transaction processing
- Automated reconciliation
- Refund and chargeback handling
- Financial reporting and analytics

### 🔔 **Smart Notifications**
- Real-time email and SMS alerts
- Push notifications for mobile
- Customizable notification rules
- Multi-channel communication
- Notification history and tracking

### ⚠️ **System Alerts**
- Proactive system monitoring
- Performance and health alerts
- Custom alert rules and thresholds
- Escalation workflows
- Alert dashboard and reporting

## 🏗️ Architecture

### **Microservices Backend**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React SPA     │    │   API Gateway    │    │   Load Balancer │
│   (Port 3000)   │◄──►│   (Port 5001)    │◄──►│                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
        │ Inventory    │ │   Orders    │ │ Customers  │
        │ Service      │ │  Service    │ │  Service   │
        │ (Port 5000)  │ │ (Port 5002) │ │(Port 5003) │
        └──────────────┘ └─────────────┘ └────────────┘
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
        │  Payments    │ │Notifications│ │   Alerts   │
        │  Service     │ │  Service    │ │  Service   │
        │ (Port 5004)  │ │ (Port 5005) │ │(Port 5006) │
        └──────────────┘ └─────────────┘ └────────────┘
                │               │               │
                └───────────────┼───────────────┘
                                │
                    ┌───────────▼───────────┐
                    │     PostgreSQL        │
                    │     Database          │
                    │                       │
                    └───────────────────────┘
```

### **Technology Stack**

#### **Backend**
- **.NET 8** - Modern, high-performance runtime
- **ASP.NET Core** - Web API framework
- **Entity Framework Core** - ORM for database operations
- **PostgreSQL** - Primary database
- **Redis** - Caching and session management
- **Swagger/OpenAPI** - API documentation
- **JWT Authentication** - Secure token-based auth

#### **Frontend**
- **React 18** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Material-UI (MUI)** - Professional component library
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **React Router** - Client-side routing

#### **Infrastructure**
- **Docker** - Containerization
- **Kubernetes** - Container orchestration
- **Helm** - Kubernetes package manager
- **NGINX** - Reverse proxy and load balancing

## 🚀 Quick Start

### **Prerequisites**
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/) and npm
- [PostgreSQL 15+](https://www.postgresql.org/)
- [Git](https://git-scm.com/)

### **Option 1: Local Development (Recommended)**

```powershell
# Clone the repository
git clone https://github.com/your-username/warehouse-management.git
cd warehouse-management

# Setup and start all services
.\deploy-warehouse-system.ps1 -Target local -Setup

# Access the application
# Frontend: http://localhost:3000
# API Gateway: http://localhost:5001
# Swagger UIs: http://localhost:500X/swagger
```

### **Option 2: Docker Deployment**

```powershell
# Build and deploy with Docker
.\deploy-warehouse-system.ps1 -Target docker -Setup -Build

# Access via Docker
# Frontend: http://localhost:3000
# All services available through API Gateway
```

### **Option 3: Kubernetes Deployment**

```powershell
# Deploy to Kubernetes cluster
.\deploy-warehouse-system.ps1 -Target k8s -Setup -Build

# Check deployment status
kubectl get pods -n warehouse-system
```

## 📁 Project Structure

```
warehouse-management/
├── 🎯 api-gateway-dotnet/           # API Gateway (Ocelot)
├── 🔧 services/                     # Microservices
│   ├── 📦 inventory-service/        # Product & stock management
│   ├── 📋 order-service/           # Order processing
│   ├── 👥 customer-service/        # Customer management
│   ├── 💳 payment-service/         # Payment processing
│   ├── 🔔 notification-service/    # Notifications
│   └── ⚠️ alert-service/           # System alerts
├── 🎨 warehouse-frontend/          # React TypeScript SPA
├── 🗄️ database/                    # DB initialization scripts
├── 🏗️ infra/                       # Infrastructure as Code
│   ├── k8s/                       # Kubernetes manifests
│   ├── helm/                      # Helm charts
│   └── monitoring/                # Monitoring configs
├── 📜 scripts/                     # Deployment scripts
├── 📚 docs/                        # Documentation
├── 🐳 docker-compose.yml           # Docker Compose config
├── 🚀 deploy-warehouse-system.ps1  # Master deployment script
└── 📖 README.md                    # This file
```

## 🔧 Development Guide

### **Running Individual Services**

```bash
# Start a specific service
cd services/inventory-service
dotnet run --urls "http://localhost:5000"

# View API documentation
# Open: http://localhost:5000/swagger
```

### **Frontend Development**

```bash
cd warehouse-frontend
npm install
npm start

# Development server: http://localhost:3000
# Hot reload enabled for rapid development
```

### **Database Management**

```powershell
# Setup all databases
.\setup-all-services.ps1

# Create migrations for a service
cd services/inventory-service
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## 🧪 Testing & Quality

### **API Testing**
```powershell
# Test all service APIs
.\test-all-apis.ps1

# Individual service testing via Swagger UI
# Inventory: http://localhost:5000/swagger
# Orders: http://localhost:5002/swagger
# Customers: http://localhost:5003/swagger
```

### **Frontend Testing**
```bash
cd warehouse-frontend
npm test                    # Run unit tests
npm run test:coverage      # Generate coverage report
npm run lint               # Code quality checks
```

### **Load Testing**
```bash
# Performance testing with k6 (if available)
k6 run scripts/load-test.js
```

## 📊 Monitoring & Observability

### **Health Checks**
- All services expose `/health` endpoints
- Kubernetes readiness and liveness probes
- Centralized health dashboard

### **Logging**
- Structured logging with Serilog
- Centralized log aggregation
- Request/response correlation IDs

### **Metrics**
- Application performance monitoring
- Business metrics tracking
- Custom dashboards and alerts

## 🔒 Security Features

- **🔐 JWT Authentication** - Secure token-based authentication
- **🛡️ Role-Based Access Control** - Granular permissions
- **🚦 Rate Limiting** - API protection against abuse
- **🔍 Input Validation** - Comprehensive data validation
- **🔒 HTTPS Enforcement** - Secure communication
- **🌐 CORS Configuration** - Cross-origin request security

## 🚢 Deployment Options

| Environment | Use Case | Command |
|-------------|----------|---------|
| **Local** | Development & Testing | `.\deploy-warehouse-system.ps1 -Target local -Setup` |
| **Docker** | Production-like Local | `.\deploy-warehouse-system.ps1 -Target docker -Setup -Build` |
| **Kubernetes** | Production Deployment | `.\deploy-warehouse-system.ps1 -Target k8s -Setup -Build` |

## 📚 API Documentation

### **Service Endpoints**

| Service | Port | Swagger UI | Description |
|---------|------|------------|-------------|
| **API Gateway** | 5001 | `/swagger` | Central API routing |
| **Inventory** | 5000 | `/swagger` | Product & stock management |
| **Orders** | 5002 | `/swagger` | Order processing |
| **Customers** | 5003 | `/swagger` | Customer management |
| **Payments** | 5004 | `/swagger` | Payment processing |
| **Notifications** | 5005 | `/swagger` | Notification services |
| **Alerts** | 5006 | `/swagger` | System alerts |

### **Key API Features**
- **RESTful Design** - Standard HTTP methods and status codes
- **OpenAPI 3.0** - Comprehensive API documentation
- **Request/Response Models** - Strongly typed data contracts
- **Error Handling** - Consistent error responses
- **Pagination** - Efficient data retrieval
- **Filtering & Sorting** - Flexible data queries

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **Development Guidelines**
- Follow C# and TypeScript coding standards
- Write unit tests for new features
- Update documentation for API changes
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Community

- **📧 Issues**: [GitHub Issues](https://github.com/your-username/warehouse-management/issues)
- **📖 Documentation**: Check the `docs/` folder
- **🔧 API Docs**: Available via Swagger UI on each service
- **💬 Discussions**: [GitHub Discussions](https://github.com/your-username/warehouse-management/discussions)

## 🔄 Changelog

### **v1.3.0** (Latest)
- ✅ Complete TypeScript frontend with Material-UI
- ✅ Enhanced API Gateway with Ocelot
- ✅ Comprehensive monitoring and alerting
- ✅ Docker and Kubernetes deployment ready
- ✅ Production-grade security features

### **v1.2.0**
- ✅ Added React frontend with TypeScript
- ✅ Implemented JWT authentication
- ✅ Enhanced API documentation

### **v1.1.0**
- ✅ Docker containerization support
- ✅ Kubernetes manifests
- ✅ Health checks and monitoring

### **v1.0.0**
- ✅ Initial microservices architecture
- ✅ Core business services
- ✅ PostgreSQL database integration

---

<div align="center">

**🏭 Built with ❤️ for modern warehouse management**

[⭐ Star this repo](https://github.com/your-username/warehouse-management) | [🐛 Report Bug](https://github.com/your-username/warehouse-management/issues) | [💡 Request Feature](https://github.com/your-username/warehouse-management/issues)

</div>
