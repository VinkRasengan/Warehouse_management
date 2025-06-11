# Create Kubernetes Manifests
Write-Host "CREATING KUBERNETES MANIFESTS" -ForegroundColor Blue
Write-Host "=============================" -ForegroundColor Blue

# Create k8s directory
$k8sDir = "k8s"
if (-not (Test-Path $k8sDir)) {
    New-Item -ItemType Directory -Path $k8sDir -Force | Out-Null
    Write-Host "Created k8s directory" -ForegroundColor Green
}

# Create namespace
$namespace = @"
apiVersion: v1
kind: Namespace
metadata:
  name: warehouse-system
  labels:
    name: warehouse-system
"@

Set-Content -Path "$k8sDir/00-namespace.yaml" -Value $namespace -Encoding UTF8
Write-Host "Created namespace manifest" -ForegroundColor Green

# Create ConfigMap for database connections
$configMap = @"
apiVersion: v1
kind: ConfigMap
metadata:
  name: warehouse-config
  namespace: warehouse-system
data:
  POSTGRES_HOST: "postgres-service"
  POSTGRES_DB: "warehouse_main"
  POSTGRES_USER: "warehouse_user"
  REDIS_HOST: "redis-service"
  RABBITMQ_HOST: "rabbitmq-service"
  RABBITMQ_USER: "warehouse_user"
  ASPNETCORE_ENVIRONMENT: "Production"
"@

Set-Content -Path "$k8sDir/01-configmap.yaml" -Value $configMap -Encoding UTF8
Write-Host "Created ConfigMap manifest" -ForegroundColor Green

# Create Secret for passwords
$secret = @"
apiVersion: v1
kind: Secret
metadata:
  name: warehouse-secrets
  namespace: warehouse-system
type: Opaque
data:
  POSTGRES_PASSWORD: d2FyZWhvdXNlX3Bhc3M=  # warehouse_pass
  RABBITMQ_PASSWORD: d2FyZWhvdXNlX3Bhc3M=  # warehouse_pass
"@

Set-Content -Path "$k8sDir/02-secrets.yaml" -Value $secret -Encoding UTF8
Write-Host "Created Secrets manifest" -ForegroundColor Green

# Create PostgreSQL deployment
$postgres = @"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: warehouse-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          valueFrom:
            configMapKeyRef:
              name: warehouse-config
              key: POSTGRES_DB
        - name: POSTGRES_USER
          valueFrom:
            configMapKeyRef:
              name: warehouse-config
              key: POSTGRES_USER
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: warehouse-secrets
              key: POSTGRES_PASSWORD
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: warehouse-system
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
  type: ClusterIP
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: warehouse-system
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
"@

Set-Content -Path "$k8sDir/03-postgres.yaml" -Value $postgres -Encoding UTF8
Write-Host "Created PostgreSQL manifest" -ForegroundColor Green

# Create Redis deployment
$redis = @"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: warehouse-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        volumeMounts:
        - name: redis-storage
          mountPath: /data
      volumes:
      - name: redis-storage
        persistentVolumeClaim:
          claimName: redis-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: redis-service
  namespace: warehouse-system
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
  type: ClusterIP
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: redis-pvc
  namespace: warehouse-system
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
"@

Set-Content -Path "$k8sDir/04-redis.yaml" -Value $redis -Encoding UTF8
Write-Host "Created Redis manifest" -ForegroundColor Green

# Create microservice template
function Create-ServiceManifest {
    param($serviceName, $port, $dbName)

    $manifest = @"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: $serviceName
  namespace: warehouse-system
spec:
  replicas: 2
  selector:
    matchLabels:
      app: $serviceName
  template:
    metadata:
      labels:
        app: $serviceName
    spec:
      containers:
      - name: $serviceName
        image: warehouse/$serviceName`:latest
        ports:
        - containerPort: 80
        env:
        - name: ASPNETCORE_ENVIRONMENT
          valueFrom:
            configMapKeyRef:
              name: warehouse-config
              key: ASPNETCORE_ENVIRONMENT
        - name: ConnectionStrings__DefaultConnection
          value: "Host=postgres-service;Database=$dbName;Username=warehouse_user;Password=warehouse_pass"
        - name: Redis__ConnectionString
          value: "redis-service:6379"
        - name: RabbitMQ__Host
          value: "rabbitmq-service"
        - name: RabbitMQ__Username
          value: "warehouse_user"
        - name: RabbitMQ__Password
          valueFrom:
            secretKeyRef:
              name: warehouse-secrets
              key: RABBITMQ_PASSWORD
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: $serviceName-service
  namespace: warehouse-system
spec:
  selector:
    app: $serviceName
  ports:
  - port: 80
    targetPort: 80
    nodePort: $port
  type: NodePort
"@

    Set-Content -Path "$k8sDir/05-$serviceName.yaml" -Value $manifest -Encoding UTF8
    Write-Host "Created $serviceName manifest" -ForegroundColor Green
}

# Create manifests for all services
Create-ServiceManifest "inventory-service" 30000 "inventory_db"
Create-ServiceManifest "order-service" 30002 "order_db"
Create-ServiceManifest "customer-service" 30003 "customer_db"
Create-ServiceManifest "payment-service" 30004 "payment_db"
Create-ServiceManifest "notification-service" 30005 "notification_db"
Create-ServiceManifest "alert-service" 30006 "alert_db"

Write-Host "`nKubernetes manifests created!" -ForegroundColor Green
Write-Host "Files created:" -ForegroundColor White
Write-Host "  k8s/00-namespace.yaml" -ForegroundColor Gray
Write-Host "  k8s/01-configmap.yaml" -ForegroundColor Gray
Write-Host "  k8s/02-secrets.yaml" -ForegroundColor Gray
Write-Host "  k8s/03-postgres.yaml" -ForegroundColor Gray
Write-Host "  k8s/04-redis.yaml" -ForegroundColor Gray
Write-Host "  k8s/05-inventory-service.yaml" -ForegroundColor Gray
Write-Host "  k8s/05-order-service.yaml" -ForegroundColor Gray
Write-Host "  k8s/05-customer-service.yaml" -ForegroundColor Gray
Write-Host "  k8s/05-payment-service.yaml" -ForegroundColor Gray
Write-Host "  k8s/05-notification-service.yaml" -ForegroundColor Gray
Write-Host "  k8s/05-alert-service.yaml" -ForegroundColor Gray
