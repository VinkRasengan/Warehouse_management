# Deploy Warehouse Management System to Kubernetes
Write-Host "DEPLOYING WAREHOUSE MANAGEMENT SYSTEM - KUBERNETES" -ForegroundColor Blue
Write-Host "==================================================" -ForegroundColor Blue

# Check if kubectl is available
try {
    kubectl version --client | Out-Null
    Write-Host "[OK] kubectl is available" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] kubectl not found. Please install kubectl." -ForegroundColor Red
    exit 1
}

# Check if k8s manifests exist
if (-not (Test-Path "k8s")) {
    Write-Host "[ERROR] k8s directory not found. Run create-k8s-manifests.ps1 first." -ForegroundColor Red
    exit 1
}

Write-Host "`nApplying Kubernetes manifests..." -ForegroundColor Yellow

# Apply manifests in order
$manifests = @(
    "00-namespace.yaml",
    "01-configmap.yaml", 
    "02-secrets.yaml",
    "03-postgres.yaml",
    "04-redis.yaml",
    "05-inventory-service.yaml",
    "05-order-service.yaml",
    "05-customer-service.yaml",
    "05-payment-service.yaml",
    "05-notification-service.yaml",
    "05-alert-service.yaml"
)

foreach ($manifest in $manifests) {
    $manifestPath = "k8s/$manifest"
    if (Test-Path $manifestPath) {
        Write-Host "  Applying $manifest..." -ForegroundColor White
        kubectl apply -f $manifestPath
    } else {
        Write-Host "  [SKIP] $manifest not found" -ForegroundColor Yellow
    }
}

Write-Host "`nWaiting for deployments to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=available --timeout=300s deployment --all -n warehouse-system

Write-Host "`nChecking pod status..." -ForegroundColor Cyan
kubectl get pods -n warehouse-system

Write-Host "`nChecking service status..." -ForegroundColor Cyan
kubectl get services -n warehouse-system

Write-Host "`nGetting service URLs..." -ForegroundColor Cyan
$services = @(
    "inventory-service-service",
    "order-service-service",
    "customer-service-service"
)

foreach ($service in $services) {
    try {
        $nodePort = kubectl get service $service -n warehouse-system -o jsonpath='{.spec.ports[0].nodePort}'
        $nodeIP = kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}'
        Write-Host "  $service`: http://$nodeIP`:$nodePort" -ForegroundColor Gray
    } catch {
        Write-Host "  $service`: Unable to get URL" -ForegroundColor Yellow
    }
}

Write-Host "`nKubernetes deployment completed!" -ForegroundColor Green
Write-Host "Useful commands:" -ForegroundColor White
Write-Host "  View pods: kubectl get pods -n warehouse-system" -ForegroundColor Gray
Write-Host "  View logs: kubectl logs -f deployment/[service-name] -n warehouse-system" -ForegroundColor Gray
Write-Host "  Port forward: kubectl port-forward service/[service-name] 8080:80 -n warehouse-system" -ForegroundColor Gray
Write-Host "  Delete all: kubectl delete namespace warehouse-system" -ForegroundColor Gray
