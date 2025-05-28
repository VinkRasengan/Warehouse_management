# Deployment Guide

## Prerequisites

### Local Development
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (optional, can use Docker)
- RabbitMQ (optional, can use Docker)

### Production
- Kubernetes cluster
- Docker registry access
- PostgreSQL databases
- RabbitMQ cluster
- Redis cluster

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd warehouse-management
npm install
npm run install:all
```

### 2. Environment Configuration

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Infrastructure Services

```bash
# Start databases and message broker
docker-compose up -d postgres-product postgres-inventory postgres-order postgres-customer postgres-reporting postgres-alert rabbitmq redis
```

### 4. Build Shared Libraries

```bash
cd shared/types && npm run build
cd ../utils && npm run build
```

### 5. Start Services

```bash
# Start all services in development mode
npm run dev

# Or start individual services
npm run dev:gateway
npm run dev:product
npm run dev:inventory
# ... etc
```

### 6. Verify Setup

```bash
# Check API Gateway
curl http://localhost:3000/health

# Check individual services
curl http://localhost:3001/health  # Product Service
curl http://localhost:3002/health  # Inventory Service
# ... etc
```

## Docker Deployment

### 1. Build All Images

```bash
npm run build:docker
```

### 2. Start Complete Stack

```bash
docker-compose up -d
```

### 3. Check Services

```bash
docker-compose ps
docker-compose logs api-gateway
```

## Kubernetes Deployment

### 1. Prerequisites

- Kubernetes cluster (minikube, EKS, GKE, AKS)
- kubectl configured
- Docker images pushed to registry

### 2. Build and Push Images

```bash
# Build images
docker build -t your-registry/warehouse/api-gateway:latest -f api-gateway/Dockerfile .
docker build -t your-registry/warehouse/product-service:latest -f services/product-service/Dockerfile .
# ... build other services

# Push to registry
docker push your-registry/warehouse/api-gateway:latest
docker push your-registry/warehouse/product-service:latest
# ... push other services
```

### 3. Update Kubernetes Manifests

Edit `infra/k8s/*.yaml` files to use your registry URLs:

```yaml
image: your-registry/warehouse/api-gateway:latest
```

### 4. Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f infra/k8s/namespace.yaml

# Deploy configuration
kubectl apply -f infra/k8s/configmap.yaml

# Deploy databases and infrastructure
kubectl apply -f infra/k8s/databases.yaml

# Deploy services
kubectl apply -f infra/k8s/api-gateway.yaml
# ... apply other service manifests
```

### 5. Verify Deployment

```bash
# Check pods
kubectl get pods -n warehouse-management

# Check services
kubectl get services -n warehouse-management

# Check ingress
kubectl get ingress -n warehouse-management

# View logs
kubectl logs -f deployment/api-gateway -n warehouse-management
```

### 6. Access Application

```bash
# Port forward for testing
kubectl port-forward service/api-gateway 3000:3000 -n warehouse-management

# Or configure ingress with your domain
# Add to /etc/hosts: <ingress-ip> warehouse-api.local
```

## Production Considerations

### Security

1. **Secrets Management**
   - Use Kubernetes secrets or external secret managers
   - Rotate JWT secrets regularly
   - Use TLS for all communications

2. **Network Security**
   - Configure network policies
   - Use service mesh (Istio/Linkerd) for mTLS
   - Implement proper firewall rules

3. **Authentication & Authorization**
   - Integrate with OAuth2/OIDC providers
   - Implement proper RBAC
   - Use API keys for service-to-service communication

### Monitoring & Observability

1. **Metrics**
   ```bash
   # Deploy Prometheus and Grafana
   kubectl apply -f infra/monitoring/prometheus.yaml
   kubectl apply -f infra/monitoring/grafana.yaml
   ```

2. **Logging**
   ```bash
   # Deploy ELK stack
   kubectl apply -f infra/logging/elasticsearch.yaml
   kubectl apply -f infra/logging/logstash.yaml
   kubectl apply -f infra/logging/kibana.yaml
   ```

3. **Tracing**
   ```bash
   # Deploy Jaeger
   kubectl apply -f infra/tracing/jaeger.yaml
   ```

### High Availability

1. **Database**
   - Use managed database services (RDS, Cloud SQL)
   - Configure read replicas
   - Implement backup strategies

2. **Message Broker**
   - Use managed RabbitMQ or Kafka services
   - Configure clustering
   - Implement message persistence

3. **Services**
   - Run multiple replicas
   - Configure horizontal pod autoscaling
   - Implement circuit breakers

### Performance Optimization

1. **Caching**
   - Use Redis for session storage
   - Implement application-level caching
   - Configure CDN for static assets

2. **Database Optimization**
   - Implement connection pooling
   - Optimize queries and indexes
   - Use read replicas for reporting

3. **Load Balancing**
   - Configure ingress load balancing
   - Use service mesh for advanced routing
   - Implement rate limiting

## Troubleshooting

### Common Issues

1. **Service Discovery**
   ```bash
   # Check DNS resolution
   kubectl exec -it <pod> -- nslookup product-service
   ```

2. **Database Connections**
   ```bash
   # Check database connectivity
   kubectl exec -it <pod> -- pg_isready -h postgres-product -p 5432
   ```

3. **Message Queue**
   ```bash
   # Check RabbitMQ status
   kubectl exec -it rabbitmq-0 -- rabbitmqctl status
   ```

### Debugging

1. **View Logs**
   ```bash
   kubectl logs -f deployment/api-gateway -n warehouse-management
   kubectl logs -f deployment/product-service -n warehouse-management
   ```

2. **Check Events**
   ```bash
   kubectl get events -n warehouse-management --sort-by='.lastTimestamp'
   ```

3. **Describe Resources**
   ```bash
   kubectl describe pod <pod-name> -n warehouse-management
   kubectl describe service <service-name> -n warehouse-management
   ```

## Backup and Recovery

### Database Backups

```bash
# PostgreSQL backup
kubectl exec postgres-product-0 -- pg_dump -U postgres product_db > backup.sql

# Restore
kubectl exec -i postgres-product-0 -- psql -U postgres product_db < backup.sql
```

### Configuration Backups

```bash
# Backup Kubernetes resources
kubectl get all -n warehouse-management -o yaml > backup.yaml
```

## Scaling

### Horizontal Scaling

```bash
# Scale API Gateway
kubectl scale deployment api-gateway --replicas=5 -n warehouse-management

# Scale Product Service
kubectl scale deployment product-service --replicas=3 -n warehouse-management
```

### Auto Scaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
  namespace: warehouse-management
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```
