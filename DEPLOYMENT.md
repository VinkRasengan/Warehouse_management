# Warehouse Management System - Deployment Guide

## 🚀 Deployment Options

This system supports three deployment environments:
- **Local**: Direct .NET development environment
- **Docker**: Containerized deployment with Docker Compose
- **Kubernetes**: Orchestrated deployment on K8s cluster

## 📋 Prerequisites

### For All Deployments
- .NET 8.0 SDK
- PostgreSQL (for local) or Docker (for containerized)
- PowerShell 5.1+ or PowerShell Core

### For Docker Deployment
- Docker Desktop
- Docker Compose

### For Kubernetes Deployment
- kubectl
- Kubernetes cluster (local or cloud)
- Docker (for building images)

## 🎯 Quick Start

### Option 1: Local Development
```powershell
# Setup and start all services locally
.\deploy-warehouse-system.ps1 -Target local -Setup

# Or step by step:
.\setup-all-services.ps1
.\start-all-services.ps1
```

### Option 2: Docker Deployment
```powershell
# Full Docker deployment with setup and build
.\deploy-warehouse-system.ps1 -Target docker -Setup -Build

# Or step by step:
.\docker-setup.ps1
.\create-dockerfiles.ps1
.\build-docker-images.ps1
.\deploy-docker.ps1
```

### Option 3: Kubernetes Deployment
```powershell
# Full K8s deployment with setup and build
.\deploy-warehouse-system.ps1 -Target k8s -Setup -Build

# Or step by step:
.\create-k8s-manifests.ps1
.\build-docker-images.ps1
.\deploy-k8s.ps1
```

## 🔧 Detailed Instructions

### Local Development Setup

1. **Database Setup**
   ```powershell
   # PostgreSQL should be running on localhost:5432
   # Run database setup scripts
   .\setup-databases.ps1
   ```

2. **Service Configuration**
   ```powershell
   # Setup all services (removes auth, simplifies dependencies)
   .\setup-all-services.ps1
   ```

3. **Start Services**
   ```powershell
   # Start all services on different ports
   .\start-all-services.ps1
   ```

4. **Access Points**
   - Inventory Service: http://localhost:5000/swagger
   - Order Service: http://localhost:5002/swagger
   - Customer Service: http://localhost:5003/swagger

### Docker Deployment

1. **Setup Docker Environment**
   ```powershell
   .\docker-setup.ps1          # Creates docker-compose.yml
   .\create-dockerfiles.ps1    # Creates Dockerfiles for all services
   .\create-database-init.ps1  # Creates DB initialization scripts
   ```

2. **Build Images**
   ```powershell
   .\build-docker-images.ps1   # Builds all service images
   ```

3. **Deploy**
   ```powershell
   .\deploy-docker.ps1         # Starts all containers
   ```

4. **Access Points**
   - All services available on same ports as local
   - RabbitMQ Management: http://localhost:15672
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

### Kubernetes Deployment

1. **Setup K8s Manifests**
   ```powershell
   .\create-k8s-manifests.ps1  # Creates all K8s YAML files
   ```

2. **Build and Push Images**
   ```powershell
   .\build-docker-images.ps1   # Build images locally
   # Push to your registry if using remote cluster
   ```

3. **Deploy to Cluster**
   ```powershell
   .\deploy-k8s.ps1           # Applies all manifests
   ```

4. **Access Services**
   ```powershell
   # Get service URLs
   kubectl get services -n warehouse-system
   
   # Port forward for testing
   kubectl port-forward service/inventory-service-service 8080:80 -n warehouse-system
   ```

## 📊 Service Architecture

### Services and Ports

| Service | Local Port | Docker Port | K8s NodePort |
|---------|------------|-------------|--------------|
| Inventory | 5000 | 5000 | 30000 |
| Order | 5002 | 5002 | 30002 |
| Customer | 5003 | 5003 | 30003 |
| Payment | 5004 | 5004 | 30004 |
| Notification | 5005 | 5005 | 30005 |
| Alert | 5006 | 5006 | 30006 |
| API Gateway | 5001 | 5001 | 30001 |

### Infrastructure Components

| Component | Local | Docker | Kubernetes |
|-----------|-------|--------|------------|
| PostgreSQL | localhost:5432 | postgres:5432 | postgres-service:5432 |
| MongoDB | localhost:27017 | mongodb:27017 | mongo-service:27017 |
| Redis | - | redis:6379 | redis-service:6379 |
| RabbitMQ | - | rabbitmq:5672 | rabbitmq-service:5672 |

## 🔍 Testing and Monitoring

### Health Checks
```powershell
# Test all APIs
.\test-all-apis.ps1

# Run demo scenarios
.\demo-simple.ps1

# Check individual service health
curl http://localhost:5000/health
```

### Docker Monitoring
```powershell
# View all containers
docker-compose ps

# View logs
docker-compose logs -f inventory-service

# Restart service
docker-compose restart inventory-service
```

### Kubernetes Monitoring
```powershell
# View pods
kubectl get pods -n warehouse-system

# View logs
kubectl logs -f deployment/inventory-service -n warehouse-system

# Scale service
kubectl scale deployment inventory-service --replicas=3 -n warehouse-system
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Stop existing services: `Get-Process dotnet | Stop-Process`
   - Check port usage: `netstat -an | findstr :5000`

2. **Docker Build Failures**
   - Clean Docker cache: `docker system prune -a`
   - Check Dockerfile syntax
   - Verify .dockerignore files

3. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check connection strings in appsettings.json
   - Ensure databases are created

4. **Kubernetes Deployment Issues**
   - Check pod status: `kubectl describe pod [pod-name] -n warehouse-system`
   - View events: `kubectl get events -n warehouse-system`
   - Check resource limits

### Cleanup Commands

```powershell
# Local cleanup
Get-Process dotnet | Stop-Process

# Docker cleanup
docker-compose down -v
docker system prune -a

# Kubernetes cleanup
kubectl delete namespace warehouse-system
```

## 📈 Scaling and Production

### Docker Scaling
```yaml
# In docker-compose.yml, add:
deploy:
  replicas: 3
```

### Kubernetes Scaling
```powershell
# Scale deployment
kubectl scale deployment inventory-service --replicas=5 -n warehouse-system

# Auto-scaling
kubectl autoscale deployment inventory-service --cpu-percent=50 --min=1 --max=10 -n warehouse-system
```

### Production Considerations
- Use external databases (managed PostgreSQL, MongoDB)
- Implement proper secrets management
- Add monitoring and logging (Prometheus, Grafana, ELK)
- Configure ingress controllers for external access
- Set up CI/CD pipelines
- Implement backup strategies

## 🎉 Success Criteria

After successful deployment, you should have:
- ✅ All services running and healthy
- ✅ Swagger UI accessible for each service
- ✅ Database connections working
- ✅ Sample data loaded and queryable
- ✅ Health checks returning 200 OK
- ✅ Inter-service communication working (if messaging enabled)

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review service logs
3. Verify prerequisites are met
4. Check network connectivity and port availability
