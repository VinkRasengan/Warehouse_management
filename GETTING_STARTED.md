# Getting Started - Warehouse Management Microservices

## 🚀 Quick Start

Chào mừng bạn đến với hệ thống quản lý kho dựa trên kiến trúc microservices! Hướng dẫn này sẽ giúp bạn khởi chạy hệ thống trong vài phút.

## 📋 Yêu cầu hệ thống

- **Node.js** 18+ 
- **Docker** & **Docker Compose**
- **Git**
- **8GB RAM** (khuyến nghị)
- **10GB** dung lượng trống

## ⚡ Khởi chạy nhanh (5 phút)

### 1. Clone và cài đặt

```bash
# Clone repository
git clone <your-repo-url>
cd warehouse-management

# Cài đặt dependencies
npm install
npm run install:all
```

### 2. Cấu hình môi trường

```bash
# Copy file cấu hình mẫu
cp .env.example .env

# Chỉnh sửa .env nếu cần (có thể bỏ qua cho demo)
```

### 3. Khởi động hệ thống

```bash
# Khởi động tất cả services với Docker
docker-compose up -d

# Hoặc khởi động từng phần:
# 1. Khởi động infrastructure trước
docker-compose up -d postgres-product postgres-inventory postgres-order postgres-customer postgres-reporting postgres-alert rabbitmq redis

# 2. Build shared libraries
cd shared/types && npm run build && cd ../..
cd shared/utils && npm run build && cd ../..

# 3. Khởi động services
npm run dev
```

### 4. Kiểm tra hệ thống

```bash
# Kiểm tra API Gateway
curl http://localhost:3000/health

# Kiểm tra các services
curl http://localhost:3001/health  # Product Service
curl http://localhost:3002/health  # Inventory Service
curl http://localhost:3003/health  # Order Service
curl http://localhost:3004/health  # Customer Service
curl http://localhost:3005/health  # Reporting Service
curl http://localhost:3006/health  # Alert Service
```

## 🌐 Truy cập các services

| Service | URL | Mô tả |
|---------|-----|-------|
| **API Gateway** | http://localhost:3000 | Entry point chính |
| **Product Service** | http://localhost:3001 | Quản lý sản phẩm |
| **Inventory Service** | http://localhost:3002 | Quản lý tồn kho |
| **Order Service** | http://localhost:3003 | Xử lý đơn hàng |
| **Customer Service** | http://localhost:3004 | Quản lý khách hàng |
| **Reporting Service** | http://localhost:3005 | Báo cáo & thống kê |
| **Alert Service** | http://localhost:3006 | Cảnh báo & thông báo |
| **RabbitMQ Management** | http://localhost:15672 | Quản lý message queue |

**Thông tin đăng nhập RabbitMQ:** admin/password

## 🧪 Test API nhanh

### 1. Tạo JWT token (cho test)

```bash
# Sử dụng API Gateway để tạo token test
curl -X POST http://localhost:3000/auth/test-token \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-user-id",
    "email": "test@example.com",
    "role": "admin"
  }'
```

### 2. Test Product API

```bash
# Lấy danh sách sản phẩm
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/products

# Tạo sản phẩm mới
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Dell XPS 13",
    "description": "Laptop cao cấp cho doanh nghiệp",
    "sku": "DELL-XPS-13",
    "categoryId": "uuid-category-id",
    "price": 25000000,
    "unit": "chiếc"
  }'
```

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐    ┌──────────────────┐
│   API Gateway   │────│  Load Balancer   │
│   (Port 3000)   │    │   (Nginx/K8s)    │
└─────────────────┘    └──────────────────┘
         │
         ├─────────────────────────────────────┐
         │                                     │
┌─────────────────┐                   ┌─────────────────┐
│ Product Service │                   │Inventory Service│
│   (Port 3001)   │                   │   (Port 3002)   │
└─────────────────┘                   └─────────────────┘
         │                                     │
┌─────────────────┐                   ┌─────────────────┐
│  PostgreSQL     │                   │  PostgreSQL     │
│  product_db     │                   │ inventory_db    │
└─────────────────┘                   └─────────────────┘

         ┌─────────────────┐
         │   RabbitMQ      │ ← Event-driven communication
         │  Message Broker │
         └─────────────────┘
```

## 📊 Monitoring & Logs

### Xem logs

```bash
# Logs của tất cả services
docker-compose logs -f

# Logs của service cụ thể
docker-compose logs -f api-gateway
docker-compose logs -f product-service

# Logs trong development mode
npm run dev  # Sẽ hiển thị logs của tất cả services
```

### Health checks

```bash
# Kiểm tra health tổng thể
curl http://localhost:3000/health

# Kết quả mẫu:
{
  "status": "healthy",
  "timestamp": "2023-12-07T10:00:00Z",
  "service": "api-gateway",
  "version": "1.0.0",
  "dependencies": {
    "product-service": { "status": "healthy", "responseTime": 45 },
    "inventory-service": { "status": "healthy", "responseTime": 32 },
    "order-service": { "status": "healthy", "responseTime": 28 }
  }
}
```

## 🔧 Development Workflow

### 1. Phát triển service mới

```bash
# Tạo service mới
mkdir services/new-service
cd services/new-service
npm init -y

# Copy template từ product-service
cp -r ../product-service/src ./src
cp ../product-service/Dockerfile ./
cp ../product-service/tsconfig.json ./

# Cập nhật package.json và cấu hình
```

### 2. Testing

```bash
# Test tất cả services
npm test

# Test service cụ thể
cd services/product-service
npm test

# Test integration
npm run test:integration
```

### 3. Build và deploy

```bash
# Build tất cả
npm run build

# Build Docker images
npm run build:docker

# Deploy lên Kubernetes
kubectl apply -f infra/k8s/
```

## 🚨 Troubleshooting

### Lỗi thường gặp

1. **Port đã được sử dụng**
   ```bash
   # Kiểm tra port đang sử dụng
   netstat -tulpn | grep :3000
   
   # Kill process
   kill -9 <PID>
   ```

2. **Database connection failed**
   ```bash
   # Kiểm tra PostgreSQL
   docker-compose ps postgres-product
   docker-compose logs postgres-product
   
   # Restart database
   docker-compose restart postgres-product
   ```

3. **RabbitMQ connection issues**
   ```bash
   # Kiểm tra RabbitMQ
   docker-compose ps rabbitmq
   docker-compose logs rabbitmq
   
   # Truy cập management UI
   open http://localhost:15672
   ```

### Reset hệ thống

```bash
# Dừng tất cả services
docker-compose down

# Xóa volumes (cẩn thận - sẽ mất data!)
docker-compose down -v

# Khởi động lại
docker-compose up -d
```

## 📚 Tài liệu chi tiết

- [API Documentation](docs/API.md) - Chi tiết về REST APIs
- [Deployment Guide](docs/DEPLOYMENT.md) - Hướng dẫn deploy production
- [Architecture Overview](docs/ARCHITECTURE.md) - Kiến trúc hệ thống
- [Contributing Guide](CONTRIBUTING.md) - Hướng dẫn đóng góp

## 🆘 Hỗ trợ

Nếu gặp vấn đề:

1. Kiểm tra [Issues](../../issues) đã có
2. Tạo issue mới với:
   - Mô tả lỗi chi tiết
   - Steps to reproduce
   - Logs liên quan
   - Environment info

## 🎯 Bước tiếp theo

1. **Khám phá APIs**: Sử dụng Postman hoặc curl để test các endpoints
2. **Tùy chỉnh**: Chỉnh sửa business logic theo nhu cầu
3. **Mở rộng**: Thêm services mới cho các tính năng khác
4. **Deploy**: Triển khai lên Kubernetes cho production

Chúc bạn phát triển thành công! 🚀
