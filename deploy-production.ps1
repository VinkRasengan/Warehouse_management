# Production Deployment Script for Warehouse Management System
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("local", "docker", "azure", "aws", "gcp")]
    [string]$DeploymentType,
    
    [string]$Domain = "localhost",
    [string]$Environment = "Production"
)

Write-Host "🚀 Starting Production Deployment..." -ForegroundColor Green
Write-Host "📋 Deployment Type: $DeploymentType" -ForegroundColor Cyan
Write-Host "🌐 Domain: $Domain" -ForegroundColor Cyan
Write-Host "🏷️  Environment: $Environment" -ForegroundColor Cyan

function Deploy-Local {
    Write-Host "`n🏠 Deploying to Local Environment..." -ForegroundColor Blue
    
    # Build all services
    Write-Host "🔨 Building all services..." -ForegroundColor Yellow
    $services = @("product-service", "inventory-service", "order-service", "customer-service", "payment-service", "notification-service", "reporting-service", "alert-service")
    
    foreach ($service in $services) {
        Write-Host "  Building $service..." -ForegroundColor Gray
        Set-Location "services/$service"
        dotnet publish -c Release -o "../../publish/$service"
        Set-Location "../.."
    }
    
    # Start services with production configuration
    Write-Host "🚀 Starting services..." -ForegroundColor Yellow
    .\host-network.ps1
}

function Deploy-Docker {
    Write-Host "`n🐳 Deploying with Docker..." -ForegroundColor Blue
    
    # Build Docker images
    Write-Host "🔨 Building Docker images..." -ForegroundColor Yellow
    docker-compose -f docker-compose.production.yml build
    
    # Start services
    Write-Host "🚀 Starting Docker services..." -ForegroundColor Yellow
    docker-compose -f docker-compose.production.yml up -d
    
    # Wait for services to be ready
    Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    # Health check
    Write-Host "🏥 Performing health checks..." -ForegroundColor Yellow
    $services = @(5001, 5002, 5003, 5004)
    foreach ($port in $services) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$port/health" -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Host "  ✅ Service on port $port is healthy" -ForegroundColor Green
            }
        } catch {
            Write-Host "  ❌ Service on port $port is not responding" -ForegroundColor Red
        }
    }
}

function Deploy-Azure {
    Write-Host "`n☁️ Deploying to Azure..." -ForegroundColor Blue
    
    # Check Azure CLI
    try {
        az --version | Out-Null
    } catch {
        Write-Host "❌ Azure CLI not found. Please install Azure CLI first." -ForegroundColor Red
        return
    }
    
    # Login to Azure
    Write-Host "🔐 Logging in to Azure..." -ForegroundColor Yellow
    az login
    
    # Create resource group
    $resourceGroup = "warehouse-management-rg"
    $location = "eastus"
    
    Write-Host "📦 Creating resource group..." -ForegroundColor Yellow
    az group create --name $resourceGroup --location $location
    
    # Create container registry
    $registryName = "warehousemanagementacr"
    Write-Host "📋 Creating container registry..." -ForegroundColor Yellow
    az acr create --resource-group $resourceGroup --name $registryName --sku Basic --admin-enabled true
    
    # Build and push images
    Write-Host "🔨 Building and pushing images..." -ForegroundColor Yellow
    $services = @("product-service", "inventory-service", "order-service", "customer-service")
    
    foreach ($service in $services) {
        Write-Host "  Building $service..." -ForegroundColor Gray
        az acr build --registry $registryName --image "warehouse-management/$service`:latest" "services/$service"
    }
    
    # Deploy to Azure Container Instances
    Write-Host "🚀 Deploying to Azure Container Instances..." -ForegroundColor Yellow
    az deployment group create --resource-group $resourceGroup --template-file "deployment/azure-deployment.yml"
    
    # Get public IP
    $publicIP = az container show --resource-group $resourceGroup --name warehouse-management --query ipAddress.ip --output tsv
    Write-Host "🌐 Application deployed at: http://$publicIP" -ForegroundColor Green
}

function Deploy-AWS {
    Write-Host "`n☁️ Deploying to AWS..." -ForegroundColor Blue
    Write-Host "📝 AWS deployment requires:" -ForegroundColor Yellow
    Write-Host "  1. AWS CLI configured" -ForegroundColor White
    Write-Host "  2. ECS cluster setup" -ForegroundColor White
    Write-Host "  3. ECR repositories created" -ForegroundColor White
    Write-Host "  4. RDS PostgreSQL instances" -ForegroundColor White
    Write-Host "  5. ElastiCache Redis cluster" -ForegroundColor White
    Write-Host "  6. Application Load Balancer" -ForegroundColor White
    Write-Host "`n🔗 Use AWS CDK or CloudFormation templates for full deployment" -ForegroundColor Cyan
}

function Deploy-GCP {
    Write-Host "`n☁️ Deploying to Google Cloud Platform..." -ForegroundColor Blue
    Write-Host "📝 GCP deployment requires:" -ForegroundColor Yellow
    Write-Host "  1. gcloud CLI configured" -ForegroundColor White
    Write-Host "  2. GKE cluster setup" -ForegroundColor White
    Write-Host "  3. Container Registry repositories" -ForegroundColor White
    Write-Host "  4. Cloud SQL PostgreSQL instances" -ForegroundColor White
    Write-Host "  5. Cloud Memorystore Redis" -ForegroundColor White
    Write-Host "  6. Cloud Load Balancer" -ForegroundColor White
    Write-Host "`n🔗 Use Terraform or Deployment Manager for full deployment" -ForegroundColor Cyan
}

function Show-PostDeployment {
    Write-Host "`n🎉 Deployment completed!" -ForegroundColor Green
    
    Write-Host "`n📊 Service URLs:" -ForegroundColor Blue
    if ($DeploymentType -eq "local") {
        $baseUrl = "http://localhost"
    } elseif ($DeploymentType -eq "docker") {
        $baseUrl = "http://localhost"
    } else {
        $baseUrl = "http://$Domain"
    }
    
    Write-Host "  Product Service: $baseUrl`:5001/swagger" -ForegroundColor White
    Write-Host "  Inventory Service: $baseUrl`:5002/swagger" -ForegroundColor White
    Write-Host "  Order Service: $baseUrl`:5003/swagger" -ForegroundColor White
    Write-Host "  Customer Service: $baseUrl`:5004/swagger" -ForegroundColor White
    
    Write-Host "`n🔧 Management URLs:" -ForegroundColor Magenta
    Write-Host "  RabbitMQ: $baseUrl`:15672 (admin/password)" -ForegroundColor White
    
    Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Configure SSL certificates for HTTPS" -ForegroundColor White
    Write-Host "  2. Set up monitoring and logging" -ForegroundColor White
    Write-Host "  3. Configure backup strategies" -ForegroundColor White
    Write-Host "  4. Set up CI/CD pipelines" -ForegroundColor White
    Write-Host "  5. Configure domain name and DNS" -ForegroundColor White
}

# Main deployment logic
switch ($DeploymentType) {
    "local" { Deploy-Local }
    "docker" { Deploy-Docker }
    "azure" { Deploy-Azure }
    "aws" { Deploy-AWS }
    "gcp" { Deploy-GCP }
}

Show-PostDeployment
