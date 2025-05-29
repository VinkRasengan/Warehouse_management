#!/bin/bash

# Warehouse Management System Deployment Script
# Usage: ./deploy.sh [environment] [action]
# Example: ./deploy.sh staging deploy

set -e

# Configuration
ENVIRONMENT=${1:-staging}
ACTION=${2:-deploy}
NAMESPACE="warehouse-${ENVIRONMENT}"
HELM_CHART_PATH="./infra/helm/warehouse-management"
VALUES_FILE="./infra/helm/warehouse-management/values-${ENVIRONMENT}.yaml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi
    
    # Check if helm is installed
    if ! command -v helm &> /dev/null; then
        log_error "helm is not installed"
        exit 1
    fi
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "docker is not installed"
        exit 1
    fi
    
    # Check kubectl connection
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Create namespace if it doesn't exist
create_namespace() {
    log_info "Creating namespace ${NAMESPACE}..."
    
    if kubectl get namespace ${NAMESPACE} &> /dev/null; then
        log_warning "Namespace ${NAMESPACE} already exists"
    else
        kubectl create namespace ${NAMESPACE}
        kubectl label namespace ${NAMESPACE} environment=${ENVIRONMENT}
        log_success "Namespace ${NAMESPACE} created"
    fi
}

# Build and push Docker images
build_and_push_images() {
    log_info "Building and pushing Docker images..."
    
    # Services to build
    SERVICES=(
        "api-gateway-dotnet"
        "services/product-service"
        "services/inventory-service"
        "services/order-service"
        "services/customer-service"
        "services/payment-service"
        "services/notification-service"
        "services/reporting-service"
        "services/alert-service"
    )
    
    # Get current git commit hash
    GIT_COMMIT=$(git rev-parse --short HEAD)
    IMAGE_TAG="${ENVIRONMENT}-${GIT_COMMIT}"
    
    for service in "${SERVICES[@]}"; do
        SERVICE_NAME=$(basename ${service})
        IMAGE_NAME="ghcr.io/your-org/warehouse-management/${SERVICE_NAME}:${IMAGE_TAG}"
        
        log_info "Building ${SERVICE_NAME}..."
        docker build -t ${IMAGE_NAME} -f ${service}/Dockerfile .
        
        log_info "Pushing ${SERVICE_NAME}..."
        docker push ${IMAGE_NAME}
        
        log_success "Built and pushed ${SERVICE_NAME}"
    done
    
    # Update values file with new image tags
    if [ -f "${VALUES_FILE}" ]; then
        sed -i "s/tag: .*/tag: \"${IMAGE_TAG}\"/g" ${VALUES_FILE}
    fi
}

# Deploy using Helm
deploy_with_helm() {
    log_info "Deploying with Helm..."
    
    # Add required Helm repositories
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm repo update
    
    # Install or upgrade the release
    if helm list -n ${NAMESPACE} | grep -q warehouse-management; then
        log_info "Upgrading existing release..."
        helm upgrade warehouse-management ${HELM_CHART_PATH} \
            --namespace ${NAMESPACE} \
            --values ${VALUES_FILE} \
            --wait \
            --timeout 10m
    else
        log_info "Installing new release..."
        helm install warehouse-management ${HELM_CHART_PATH} \
            --namespace ${NAMESPACE} \
            --values ${VALUES_FILE} \
            --wait \
            --timeout 10m \
            --create-namespace
    fi
    
    log_success "Deployment completed"
}

# Deploy using kubectl
deploy_with_kubectl() {
    log_info "Deploying with kubectl..."
    
    # Apply Kubernetes manifests
    kubectl apply -f ./infra/k8s/${ENVIRONMENT}/
    
    # Wait for deployments to be ready
    log_info "Waiting for deployments to be ready..."
    kubectl wait --for=condition=available --timeout=600s deployment --all -n ${NAMESPACE}
    
    log_success "Deployment completed"
}

# Run health checks
health_check() {
    log_info "Running health checks..."
    
    # Get ingress URL
    INGRESS_URL=$(kubectl get ingress warehouse-ingress -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "localhost")
    
    if [ "${INGRESS_URL}" = "localhost" ]; then
        # Use port-forward for local testing
        log_info "Using port-forward for health checks..."
        kubectl port-forward service/api-gateway-service 8080:80 -n ${NAMESPACE} &
        PORT_FORWARD_PID=$!
        sleep 5
        HEALTH_URL="http://localhost:8080"
    else
        HEALTH_URL="http://${INGRESS_URL}"
    fi
    
    # Health check endpoints
    ENDPOINTS=(
        "/health"
        "/api/products/health"
        "/api/inventory/health"
        "/api/orders/health"
        "/api/customers/health"
        "/api/payments/health"
        "/api/notifications/health"
        "/api/reports/health"
        "/api/alerts/health"
    )
    
    for endpoint in "${ENDPOINTS[@]}"; do
        log_info "Checking ${endpoint}..."
        if curl -f -s "${HEALTH_URL}${endpoint}" > /dev/null; then
            log_success "${endpoint} is healthy"
        else
            log_error "${endpoint} is not healthy"
        fi
    done
    
    # Clean up port-forward if used
    if [ ! -z "${PORT_FORWARD_PID}" ]; then
        kill ${PORT_FORWARD_PID} 2>/dev/null || true
    fi
}

# Rollback deployment
rollback() {
    log_info "Rolling back deployment..."
    
    if helm list -n ${NAMESPACE} | grep -q warehouse-management; then
        helm rollback warehouse-management -n ${NAMESPACE}
        log_success "Rollback completed"
    else
        log_error "No Helm release found to rollback"
        exit 1
    fi
}

# Clean up deployment
cleanup() {
    log_info "Cleaning up deployment..."
    
    if helm list -n ${NAMESPACE} | grep -q warehouse-management; then
        helm uninstall warehouse-management -n ${NAMESPACE}
    fi
    
    kubectl delete namespace ${NAMESPACE} --ignore-not-found=true
    
    log_success "Cleanup completed"
}

# Show deployment status
status() {
    log_info "Deployment status for ${ENVIRONMENT}:"
    
    echo ""
    echo "Namespace:"
    kubectl get namespace ${NAMESPACE} 2>/dev/null || echo "Namespace not found"
    
    echo ""
    echo "Pods:"
    kubectl get pods -n ${NAMESPACE} 2>/dev/null || echo "No pods found"
    
    echo ""
    echo "Services:"
    kubectl get services -n ${NAMESPACE} 2>/dev/null || echo "No services found"
    
    echo ""
    echo "Ingress:"
    kubectl get ingress -n ${NAMESPACE} 2>/dev/null || echo "No ingress found"
    
    echo ""
    echo "Helm releases:"
    helm list -n ${NAMESPACE} 2>/dev/null || echo "No Helm releases found"
}

# Main execution
main() {
    log_info "Starting deployment script for ${ENVIRONMENT} environment"
    log_info "Action: ${ACTION}"
    
    case ${ACTION} in
        "deploy")
            check_prerequisites
            create_namespace
            if [ -f "${HELM_CHART_PATH}/Chart.yaml" ]; then
                deploy_with_helm
            else
                deploy_with_kubectl
            fi
            health_check
            ;;
        "build")
            check_prerequisites
            build_and_push_images
            ;;
        "health")
            health_check
            ;;
        "rollback")
            rollback
            ;;
        "cleanup")
            cleanup
            ;;
        "status")
            status
            ;;
        *)
            log_error "Unknown action: ${ACTION}"
            echo "Available actions: deploy, build, health, rollback, cleanup, status"
            exit 1
            ;;
    esac
    
    log_success "Script completed successfully"
}

# Run main function
main "$@"
