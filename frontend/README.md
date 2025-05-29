# Warehouse Management System - Frontend

Ứng dụng quản lý kho hàng hiện đại được xây dựng với React, Ant Design và styled-components. Thiết kế lấy cảm hứng từ KiotViet với giao diện thân thiện và dễ sử dụng.

## 🎨 Tính năng

### ✨ Giao diện người dùng
- **Modern UI/UX**: Thiết kế hiện đại, responsive trên mọi thiết bị
- **Dark/Light Theme**: Hỗ trợ chế độ sáng/tối
- **Multilingual**: Hỗ trợ đa ngôn ngữ (Tiếng Việt, English)
- **Real-time Updates**: Cập nhật dữ liệu thời gian thực

### 📊 Dashboard & Analytics
- **Tổng quan hệ thống**: Thống kê tổng quan về doanh thu, đơn hàng, khách hàng
- **Biểu đồ trực quan**: Charts và graphs với Recharts
- **Báo cáo chi tiết**: Xuất báo cáo Excel, PDF
- **Thông báo thông minh**: Alerts và notifications

### 🛍️ Quản lý sản phẩm
- **CRUD Operations**: Thêm, sửa, xóa, xem sản phẩm
- **Phân loại sản phẩm**: Quản lý categories và tags
- **Upload hình ảnh**: Drag & drop image upload
- **Tìm kiếm & lọc**: Advanced search và filtering

### 📦 Quản lý kho hàng
- **Theo dõi tồn kho**: Real-time inventory tracking
- **Nhập/xuất kho**: Stock in/out management
- **Cảnh báo tồn kho**: Low stock alerts
- **Báo cáo tồn kho**: Inventory reports

### 🛒 Quản lý đơn hàng
- **Xử lý đơn hàng**: Order processing workflow
- **Trạng thái đơn hàng**: Order status tracking
- **In hóa đơn**: Invoice printing
- **Lịch sử đơn hàng**: Order history

### 👥 Quản lý khách hàng
- **Hồ sơ khách hàng**: Customer profiles
- **Chương trình loyalty**: Loyalty points system
- **Phân hạng khách hàng**: Customer tiers (Bronze, Silver, Gold, Platinum)
- **Lịch sử mua hàng**: Purchase history

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 16+ 
- npm hoặc yarn
- Backend API đang chạy (port 5004)

### Cài đặt nhanh

```bash
# Clone repository
git clone <repository-url>
cd warehouse-management/frontend

# Cài đặt dependencies
npm install

# Tạo file .env
cp .env.example .env

# Chạy development server
npm start
```

### Hoặc sử dụng PowerShell script

```powershell
# Chạy script tự động
.\start-frontend.ps1
```

## 🔧 Cấu hình

### Environment Variables (.env)

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5004/api
REACT_APP_ENVIRONMENT=development

# App Configuration  
REACT_APP_NAME=Warehouse Management System
REACT_APP_VERSION=1.0.0

# Features
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_NOTIFICATIONS=true
```

### API Endpoints

Frontend kết nối với các API endpoints:

- **Products**: `GET/POST/PUT/DELETE /api/products`
- **Inventory**: `GET/POST/PUT /api/inventory`
- **Orders**: `GET/POST/PUT /api/orders`
- **Customers**: `GET/POST/PUT/DELETE /api/customers`
- **Auth**: `POST /api/auth/login`

## 🎯 Demo Account

```
Email: admin@warehouse.com
Password: admin123
```

## 📱 Responsive Design

Ứng dụng được thiết kế responsive cho:

- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px  
- **Mobile**: < 768px

## 🎨 UI Components

### Ant Design Components
- Tables với pagination và sorting
- Forms với validation
- Modals và Drawers
- Charts và Statistics
- Notifications và Messages

### Custom Components
- **LoadingSpinner**: Loading states
- **MainLayout**: App layout với sidebar
- **StatsCard**: Statistics cards
- **ChartCard**: Chart containers

## 🔐 Authentication

- **JWT Token**: Lưu trong localStorage
- **Auto-refresh**: Tự động refresh token
- **Route Protection**: Protected routes
- **Role-based Access**: Phân quyền theo role

## 📊 State Management

- **React Context**: Global state management
- **React Query**: Server state management
- **Local State**: Component state với useState
- **Form State**: React Hook Form

## 🎯 Performance

### Optimizations
- **Code Splitting**: Lazy loading components
- **Memoization**: React.memo và useMemo
- **Bundle Optimization**: Webpack optimizations
- **Image Optimization**: Lazy loading images

### Bundle Size
- **Gzipped**: ~500KB
- **Parsed**: ~1.5MB
- **Load Time**: <3s on 3G

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📦 Build & Deploy

### Development Build
```bash
npm start
```

### Production Build
```bash
npm run build
```

### Deploy to Netlify/Vercel
```bash
# Build
npm run build

# Deploy build folder
```

## 🔧 Troubleshooting

### Common Issues

1. **API Connection Error**
   ```
   Ensure backend is running on port 5004
   Check REACT_APP_API_URL in .env
   ```

2. **Dependencies Error**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Build Error**
   ```bash
   npm run build -- --verbose
   ```

## 📚 Documentation

- [React Documentation](https://reactjs.org/)
- [Ant Design](https://ant.design/)
- [Styled Components](https://styled-components.com/)
- [Recharts](https://recharts.org/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

- **Email**: support@warehouse.com
- **Documentation**: [Wiki](link-to-wiki)
- **Issues**: [GitHub Issues](link-to-issues)
