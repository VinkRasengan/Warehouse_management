# 🔧 Hướng Dẫn Cài Đặt Thủ Công Infrastructure

## 📋 **Các Service Cần Thiết:**

### 1. **PostgreSQL Database**
```bash
# Download và cài đặt PostgreSQL 15+
# https://www.postgresql.org/download/windows/

# Tạo database và user
psql -U postgres
CREATE DATABASE warehouse_main;
CREATE USER warehouse_user WITH PASSWORD 'warehouse_pass123';
GRANT ALL PRIVILEGES ON DATABASE warehouse_main TO warehouse_user;
```

### 2. **MongoDB**
```bash
# Download và cài đặt MongoDB Community
# https://www.mongodb.com/try/download/community

# Tạo user admin
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "admin123",
  roles: ["userAdminAnyDatabase", "readWriteAnyDatabase"]
})
```

### 3. **Redis**
```bash
# Download Redis for Windows
# https://github.com/microsoftarchive/redis/releases

# Hoặc sử dụng WSL:
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
```

### 4. **RabbitMQ**
```bash
# Download và cài đặt RabbitMQ
# https://www.rabbitmq.com/download.html

# Enable management plugin
rabbitmq-plugins enable rabbitmq_management

# Tạo user
rabbitmqctl add_user admin password
rabbitmqctl set_user_tags admin administrator
rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"
```

## 🔗 **Connection Strings:**

### **PostgreSQL:**
```
Host=localhost;Port=5432;Database=warehouse_main;Username=warehouse_user;Password=warehouse_pass123
```

### **MongoDB:**
```
mongodb://admin:admin123@localhost:27017/warehouse_users?authSource=admin
```

### **Redis:**
```
localhost:6379
```

### **RabbitMQ:**
```
amqp://admin:password@localhost:5672/
```

## 🚀 **Ports Sử Dụng:**
- **PostgreSQL**: 5432
- **MongoDB**: 27017  
- **Redis**: 6379
- **RabbitMQ**: 5672 (AMQP), 15672 (Management UI)

## ✅ **Kiểm Tra Kết Nối:**

### **PostgreSQL:**
```bash
psql -h localhost -p 5432 -U warehouse_user -d warehouse_main
```

### **MongoDB:**
```bash
mongosh "mongodb://admin:admin123@localhost:27017/warehouse_users?authSource=admin"
```

### **Redis:**
```bash
redis-cli ping
```

### **RabbitMQ:**
- Management UI: http://localhost:15672
- Login: admin/password
