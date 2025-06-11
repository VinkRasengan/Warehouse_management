# Create Dockerfiles for all services
Write-Host "CREATING DOCKERFILES FOR ALL SERVICES" -ForegroundColor Blue
Write-Host "=====================================" -ForegroundColor Blue

# Standard Dockerfile template for .NET services
$dockerfileTemplate = @"
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["*.csproj", "./"]
RUN dotnet restore
COPY . .
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "{SERVICE_NAME}.dll"]
"@

# Services to create Dockerfiles for
$services = @(
    "inventory-service",
    "order-service", 
    "customer-service",
    "payment-service",
    "notification-service",
    "alert-service"
)

foreach ($service in $services) {
    $servicePath = "services/$service"
    
    if (Test-Path $servicePath) {
        Write-Host "Creating Dockerfile for $service..." -ForegroundColor Yellow
        
        # Get the actual project name from .csproj file
        $csprojFiles = Get-ChildItem -Path $servicePath -Filter "*.csproj"
        if ($csprojFiles.Count -gt 0) {
            $projectName = [System.IO.Path]::GetFileNameWithoutExtension($csprojFiles[0].Name)
            $dockerfile = $dockerfileTemplate -replace "{SERVICE_NAME}", $projectName
            
            Set-Content -Path "$servicePath/Dockerfile" -Value $dockerfile -Encoding UTF8
            Write-Host "  [OK] Dockerfile created for $service ($projectName)" -ForegroundColor Green
        } else {
            Write-Host "  [SKIP] No .csproj found for $service" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  [SKIP] Service directory not found: $service" -ForegroundColor Yellow
    }
}

# Create Dockerfile for API Gateway
$apiGatewayPath = "api-gateway-dotnet"
if (Test-Path $apiGatewayPath) {
    Write-Host "Creating Dockerfile for API Gateway..." -ForegroundColor Yellow
    
    $csprojFiles = Get-ChildItem -Path $apiGatewayPath -Filter "*.csproj"
    if ($csprojFiles.Count -gt 0) {
        $projectName = [System.IO.Path]::GetFileNameWithoutExtension($csprojFiles[0].Name)
        $dockerfile = $dockerfileTemplate -replace "{SERVICE_NAME}", $projectName
        
        Set-Content -Path "$apiGatewayPath/Dockerfile" -Value $dockerfile -Encoding UTF8
        Write-Host "  [OK] Dockerfile created for API Gateway ($projectName)" -ForegroundColor Green
    }
}

# Create .dockerignore file
$dockerignore = @"
**/.dockerignore
**/.env
**/.git
**/.gitignore
**/.project
**/.settings
**/.toolstarget
**/.vs
**/.vscode
**/*.*proj.user
**/*.dbmdl
**/*.jfm
**/azds.yaml
**/bin
**/charts
**/docker-compose*
**/Dockerfile*
**/node_modules
**/npm-debug.log
**/obj
**/secrets.dev.yaml
**/values.dev.yaml
LICENSE
README.md
"@

foreach ($service in $services) {
    $servicePath = "services/$service"
    if (Test-Path $servicePath) {
        Set-Content -Path "$servicePath/.dockerignore" -Value $dockerignore -Encoding UTF8
    }
}

if (Test-Path $apiGatewayPath) {
    Set-Content -Path "$apiGatewayPath/.dockerignore" -Value $dockerignore -Encoding UTF8
}

Write-Host "`nDockerfiles creation completed!" -ForegroundColor Green
Write-Host "Created Dockerfiles for:" -ForegroundColor White
foreach ($service in $services) {
    if (Test-Path "services/$service/Dockerfile") {
        Write-Host "  [OK] $service" -ForegroundColor Green
    }
}
if (Test-Path "$apiGatewayPath/Dockerfile") {
    Write-Host "  [OK] api-gateway" -ForegroundColor Green
}
