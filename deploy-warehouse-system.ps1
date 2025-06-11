# Master Deployment Script for Warehouse Management System
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("local", "docker", "k8s")]
    [string]$Target,
    
    [switch]$Build,
    [switch]$Setup
)

Write-Host "WAREHOUSE MANAGEMENT SYSTEM DEPLOYMENT" -ForegroundColor Blue
Write-Host "=======================================" -ForegroundColor Blue
Write-Host "Target: $Target" -ForegroundColor White

switch ($Target) {
    "local" {
        Write-Host "`nDeploying to LOCAL environment..." -ForegroundColor Yellow
        
        if ($Setup) {
            Write-Host "Setting up local services..." -ForegroundColor Cyan
            .\setup-all-services.ps1
        }
        
        Write-Host "Starting local services..." -ForegroundColor Cyan
        .\start-all-services.ps1
        
        Write-Host "`n[SUCCESS] Local deployment completed!" -ForegroundColor Green
        Write-Host "Access points:" -ForegroundColor White
        Write-Host "  Inventory: http://localhost:5000/swagger" -ForegroundColor Gray
        Write-Host "  Orders: http://localhost:5002/swagger" -ForegroundColor Gray
        Write-Host "  Customers: http://localhost:5003/swagger" -ForegroundColor Gray
    }
    
    "docker" {
        Write-Host "`nDeploying to DOCKER environment..." -ForegroundColor Yellow
        
        if ($Setup) {
            Write-Host "Setting up Docker environment..." -ForegroundColor Cyan
            .\docker-setup.ps1
            .\create-dockerfiles.ps1
            .\create-database-init.ps1
        }
        
        if ($Build) {
            Write-Host "Building Docker images..." -ForegroundColor Cyan
            .\build-docker-images.ps1
        }
        
        Write-Host "Deploying with Docker Compose..." -ForegroundColor Cyan
        .\deploy-docker.ps1
        
        Write-Host "`n[SUCCESS] Docker deployment completed!" -ForegroundColor Green
        Write-Host "Access points:" -ForegroundColor White
        Write-Host "  Inventory: http://localhost:5000/swagger" -ForegroundColor Gray
        Write-Host "  Orders: http://localhost:5002/swagger" -ForegroundColor Gray
        Write-Host "  Customers: http://localhost:5003/swagger" -ForegroundColor Gray
        Write-Host "  API Gateway: http://localhost:5001" -ForegroundColor Gray
        Write-Host "  RabbitMQ: http://localhost:15672" -ForegroundColor Gray
    }
    
    "k8s" {
        Write-Host "`nDeploying to KUBERNETES environment..." -ForegroundColor Yellow
        
        if ($Setup) {
            Write-Host "Setting up Kubernetes manifests..." -ForegroundColor Cyan
            .\create-k8s-manifests.ps1
        }
        
        if ($Build) {
            Write-Host "Building Docker images..." -ForegroundColor Cyan
            .\build-docker-images.ps1
        }
        
        Write-Host "Deploying to Kubernetes..." -ForegroundColor Cyan
        .\deploy-k8s.ps1
        
        Write-Host "`n[SUCCESS] Kubernetes deployment completed!" -ForegroundColor Green
        Write-Host "Use kubectl commands to access services:" -ForegroundColor White
        Write-Host "  kubectl get services -n warehouse-system" -ForegroundColor Gray
        Write-Host "  kubectl port-forward service/inventory-service-service 8080:80 -n warehouse-system" -ForegroundColor Gray
    }
}

Write-Host "`nDeployment completed for $Target environment!" -ForegroundColor Green

# Show deployment summary
Write-Host "`nDEPLOYMENT SUMMARY" -ForegroundColor Blue
Write-Host "==================" -ForegroundColor Blue
Write-Host "  Target Environment: $Target" -ForegroundColor White
Write-Host "  Setup Run: $Setup" -ForegroundColor White
Write-Host "  Build Run: $Build" -ForegroundColor White
Write-Host "  Timestamp: $(Get-Date)" -ForegroundColor White

Write-Host "`nNext Steps:" -ForegroundColor Cyan
switch ($Target) {
    "local" {
        Write-Host "  1. Test APIs using Swagger UI" -ForegroundColor White
        Write-Host "  2. Run: .\test-all-apis.ps1" -ForegroundColor White
        Write-Host "  3. Run: .\demo-simple.ps1" -ForegroundColor White
    }
    "docker" {
        Write-Host "  1. Check container status: docker-compose ps" -ForegroundColor White
        Write-Host "  2. View logs: docker-compose logs -f [service]" -ForegroundColor White
        Write-Host "  3. Test APIs using Swagger UI" -ForegroundColor White
    }
    "k8s" {
        Write-Host "  1. Check pods: kubectl get pods -n warehouse-system" -ForegroundColor White
        Write-Host "  2. Port forward services for testing" -ForegroundColor White
        Write-Host "  3. Monitor with: kubectl logs -f deployment/[service] -n warehouse-system" -ForegroundColor White
    }
}

Write-Host "`nManagement Commands:" -ForegroundColor Cyan
switch ($Target) {
    "local" {
        Write-Host "  Stop: Get-Process dotnet | Stop-Process" -ForegroundColor White
    }
    "docker" {
        Write-Host "  Stop: docker-compose down" -ForegroundColor White
        Write-Host "  Restart: docker-compose restart [service]" -ForegroundColor White
        Write-Host "  Logs: docker-compose logs -f [service]" -ForegroundColor White
    }
    "k8s" {
        Write-Host "  Delete: kubectl delete namespace warehouse-system" -ForegroundColor White
        Write-Host "  Scale: kubectl scale deployment [service] --replicas=3 -n warehouse-system" -ForegroundColor White
        Write-Host "  Logs: kubectl logs -f deployment/[service] -n warehouse-system" -ForegroundColor White
    }
}
