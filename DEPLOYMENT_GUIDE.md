# 🚀 Warehouse Management System - Deployment Guide

This guide provides multiple deployment options for the Warehouse Management System, from local development to cloud production deployments.

## 📋 Quick Start Options

### Option 1: Local Development (No Docker) ⚡
**Best for**: Quick testing, development, learning
**Requirements**: .NET 8.0 SDK, Node.js (optional for frontend)

```powershell
# Run all services locally
.\deploy-local-simple.ps1

# Stop all services
.\stop-local-services.ps1
```

### Option 2: Docker Deployment 🐳
**Best for**: Complete local testing, production-like environment
**Requirements**: Docker Desktop

```powershell
# Development environment
.\deploy-docker-simple.ps1 -Environment development -Build

# Production environment
.\deploy-docker-simple.ps1 -Environment production -Build

# Stop all services
.\deploy-docker-simple.ps1 -Stop
```

### Option 3: Cloud Deployment ☁️
**Best for**: Production hosting, scalability
**Options**: Azure, AWS, Google Cloud

## 🔧 Detailed Deployment Instructions

### Local Development Deployment

1. **Prerequisites Check**:
   ```powershell
   # Check .NET version
   dotnet --version  # Should be 8.0+
   
   # Check Node.js (optional)
   node --version    # For frontend
   ```

2. **Deploy Services**:
   ```powershell
   # Full deployment with build
   .\deploy-local-simple.ps1
   
   # Skip build if already built
   .\deploy-local-simple.ps1 -SkipBuild
   
   # Skip database warnings
   .\deploy-local-simple.ps1 -SkipDatabases
   ```

3. **Access Services**:
   - API Gateway: http://localhost:5000
   - Swagger UIs: http://localhost:510X/swagger (X = 1-8)
   - Frontend: http://localhost:3000 (if Node.js available)

### Docker Deployment

1. **Install Docker**:
   - Download Docker Desktop from https://www.docker.com/products/docker-desktop
   - Start Docker Desktop

2. **Deploy with Docker**:
   ```powershell
   # Build and start development environment
   .\deploy-docker-simple.ps1 -Environment development -Build
   
   # Production environment
   .\deploy-docker-simple.ps1 -Environment production -Build
   
   # View logs
   .\deploy-docker-simple.ps1 -Logs
   ```

3. **Access Services**:
   - API Gateway: http://localhost:5000
   - RabbitMQ Management: http://localhost:15672 (admin/password)
   - All microservices: http://localhost:510X/swagger

### Cloud Deployment Options

#### Azure Deployment 🔵

1. **Prerequisites**:
   ```powershell
   # Install Azure CLI
   winget install Microsoft.AzureCLI
   
   # Login to Azure
   az login
   ```

2. **Deploy to Azure**:
   ```powershell
   # Use existing script
   .\deploy-production.ps1 -DeploymentType azure
   
   # Or manual deployment
   az group create --name warehouse-rg --location eastus
   az acr create --resource-group warehouse-rg --name warehouseacr --sku Basic
   ```

#### AWS Deployment 🟠

1. **Prerequisites**:
   - AWS CLI configured
   - ECS cluster setup
   - RDS PostgreSQL instances
   - ElastiCache Redis

2. **Services Needed**:
   - **ECS Fargate**: For containerized services
   - **RDS PostgreSQL**: Multiple databases
   - **ElastiCache Redis**: Caching layer
   - **Amazon MQ**: RabbitMQ alternative
   - **Application Load Balancer**: Traffic routing

#### Google Cloud Deployment 🔴

1. **Prerequisites**:
   - gcloud CLI configured
   - GKE cluster setup
   - Cloud SQL PostgreSQL

2. **Services Needed**:
   - **Google Kubernetes Engine**: Container orchestration
   - **Cloud SQL**: PostgreSQL databases
   - **Cloud Memorystore**: Redis caching
   - **Cloud Pub/Sub**: Message broker
   - **Cloud Load Balancer**: Traffic distribution

## 🏗️ Infrastructure Requirements

### Minimum System Requirements

**Local Development**:
- RAM: 8GB minimum, 16GB recommended
- CPU: 4 cores minimum
- Storage: 10GB free space
- OS: Windows 10/11, macOS, Linux

**Production**:
- RAM: 16GB minimum, 32GB recommended
- CPU: 8 cores minimum
- Storage: 100GB+ SSD
- Network: High-speed internet connection

### Database Requirements

The system uses multiple databases:
- **PostgreSQL**: 8 separate databases for microservices
- **MongoDB**: User service data
- **Redis**: Caching and session storage

### External Services

**Required for full functionality**:
- **SMTP Server**: Email notifications (Gmail, SendGrid, etc.)
- **SMS Service**: Twilio for SMS notifications
- **Payment Gateways**: MoMo, VNPay, ZaloPay integrations

## 🔐 Security Configuration

### Environment Variables

Create `.env` files for each environment:

```bash
# Database connections
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=service_db;Username=postgres;Password=your_password

# JWT Configuration
JWT__Key=your-super-secret-key-that-is-at-least-32-characters-long
JWT__Issuer=WarehouseManagement
JWT__Audience=WarehouseManagement

# External Services
Email__SmtpHost=smtp.gmail.com
Email__SmtpPort=587
Email__Username=your-email@gmail.com
Email__Password=your-app-password

Twilio__AccountSid=your-twilio-account-sid
Twilio__AuthToken=your-twilio-auth-token
```

### SSL/TLS Configuration

**For production deployments**:
1. Obtain SSL certificates (Let's Encrypt, commercial CA)
2. Configure reverse proxy (Nginx, Apache)
3. Update environment variables for HTTPS URLs

## 📊 Monitoring and Logging

### Health Checks

All services provide health check endpoints:
- `/health` - Basic health status
- `/health/ready` - Readiness probe
- `/health/live` - Liveness probe

### Logging

Services use structured logging with Serilog:
- Console output for development
- File logging for production
- Centralized logging with ELK stack (optional)

## 🚨 Troubleshooting

### Common Issues

1. **Port Conflicts**:
   ```powershell
   # Check what's using a port
   netstat -ano | findstr :5000
   
   # Kill process by PID
   taskkill /PID <process_id> /F
   ```

2. **Database Connection Issues**:
   - Verify PostgreSQL/MongoDB is running
   - Check connection strings
   - Ensure databases exist

3. **Docker Issues**:
   ```powershell
   # Restart Docker Desktop
   # Clear Docker cache
   docker system prune -a
   
   # Rebuild images
   docker-compose build --no-cache
   ```

### Getting Help

1. Check service logs for error details
2. Verify all prerequisites are installed
3. Ensure all required ports are available
4. Check firewall settings for cloud deployments

## 📈 Scaling Considerations

### Horizontal Scaling

- Use container orchestration (Kubernetes, Docker Swarm)
- Implement load balancers
- Scale databases with read replicas
- Use message queue clustering

### Performance Optimization

- Enable Redis caching
- Optimize database queries
- Use CDN for static assets
- Implement API rate limiting

## 🔄 CI/CD Pipeline

### Recommended Pipeline

1. **Source Control**: Git with feature branches
2. **Build**: Automated builds on commit
3. **Testing**: Unit tests, integration tests
4. **Deployment**: Automated deployment to staging/production
5. **Monitoring**: Health checks and alerting

### Tools

- **Azure DevOps**: Complete CI/CD solution
- **GitHub Actions**: Git-integrated workflows
- **Jenkins**: Self-hosted automation
- **GitLab CI**: Integrated DevOps platform

---

## 🎯 Next Steps

1. Choose your deployment option
2. Run the appropriate deployment script
3. Access the services and test functionality
4. Configure external integrations (email, SMS, payments)
5. Set up monitoring and backups
6. Plan for production scaling

**Happy Deploying! 🚀**
