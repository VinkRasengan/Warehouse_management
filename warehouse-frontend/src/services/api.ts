import axios from 'axios';
import {
  InventoryItem,
  CreateInventoryItem,
  UpdateInventoryItem,
  StockAdjustment,
  Order,
  CreateOrder,
  Customer,
  CreateCustomer,
  UpdateCustomer,
  Payment,
  Notification,
  Alert,
  DashboardStats,
  InventoryFilters,
  OrderFilters,
  CustomerFilters,
} from '../types';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token (if needed)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Inventory API
export const inventoryApi = {
  getAll: (filters?: InventoryFilters) => 
    api.get<InventoryItem[]>('/api/inventory', { params: filters }),
  
  getById: (id: number) => 
    api.get<InventoryItem>(`/api/inventory/${id}`),
  
  create: (item: CreateInventoryItem) => 
    api.post<InventoryItem>('/api/inventory', item),
  
  update: (id: number, item: UpdateInventoryItem) => 
    api.put<InventoryItem>(`/api/inventory/${id}`, item),
  
  delete: (id: number) => 
    api.delete(`/api/inventory/${id}`),
  
  adjustStock: (adjustment: StockAdjustment) => 
    api.post('/api/inventory/adjust', adjustment),
  
  getLowStock: () => 
    api.get<InventoryItem[]>('/api/inventory/low-stock'),
  
  getReport: () => 
    api.get('/api/inventory/report'),
};

// Orders API
export const ordersApi = {
  getAll: (filters?: OrderFilters) => 
    api.get<Order[]>('/api/orders', { params: filters }),
  
  getById: (id: number) => 
    api.get<Order>(`/api/orders/${id}`),
  
  create: (order: CreateOrder) => 
    api.post<Order>('/api/orders', order),
  
  update: (id: number, order: Partial<Order>) => 
    api.put<Order>(`/api/orders/${id}`, order),
  
  delete: (id: number) => 
    api.delete(`/api/orders/${id}`),
  
  confirm: (id: number) => 
    api.post(`/api/orders/${id}/confirm`),
  
  cancel: (id: number, reason: string) => 
    api.post(`/api/orders/${id}/cancel`, { reason }),
  
  updateStatus: (id: number, status: string) => 
    api.put(`/api/orders/${id}/status`, { status }),
  
  getByCustomer: (customerId: number) => 
    api.get<Order[]>(`/api/orders/customer/${customerId}`),
};

// Customers API
export const customersApi = {
  getAll: (filters?: CustomerFilters) => 
    api.get<Customer[]>('/api/customers', { params: filters }),
  
  getById: (id: number) => 
    api.get<Customer>(`/api/customers/${id}`),
  
  create: (customer: CreateCustomer) => 
    api.post<Customer>('/api/customers', customer),
  
  update: (id: number, customer: UpdateCustomer) => 
    api.put<Customer>(`/api/customers/${id}`, customer),
  
  delete: (id: number) => 
    api.delete(`/api/customers/${id}`),
  
  activate: (id: number) => 
    api.put(`/api/customers/${id}/activate`),
  
  deactivate: (id: number) => 
    api.put(`/api/customers/${id}/deactivate`),
  
  addLoyaltyPoints: (id: number, points: number) => 
    api.post(`/api/customers/${id}/loyalty-points`, { points }),
};

// Payments API
export const paymentsApi = {
  getAll: () => 
    api.get<Payment[]>('/api/payments'),
  
  getById: (id: number) => 
    api.get<Payment>(`/api/payments/${id}`),
  
  getByOrder: (orderId: number) => 
    api.get<Payment[]>(`/api/payments/order/${orderId}`),
  
  create: (payment: Omit<Payment, 'id' | 'createdAt'>) => 
    api.post<Payment>('/api/payments', payment),
  
  refund: (id: number, amount: number) => 
    api.post(`/api/payments/${id}/refund`, { amount }),
};

// Notifications API
export const notificationsApi = {
  getAll: () => {
    const mockNotifications: Notification[] = [
      {
        id: 1,
        title: 'Low Stock Alert',
        message: 'Product SKU-001 is running low on stock',
        type: 'WARNING',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Order Completed',
        message: 'Order ORD-001 has been delivered successfully',
        type: 'SUCCESS',
        isRead: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      }
    ];
    return Promise.resolve({ data: mockNotifications });
  },

  getUnread: () => {
    const mockNotifications: Notification[] = [
      {
        id: 1,
        title: 'Low Stock Alert',
        message: 'Product SKU-001 is running low on stock',
        type: 'WARNING',
        isRead: false,
        createdAt: new Date().toISOString(),
      }
    ];
    return Promise.resolve({ data: mockNotifications });
  },

  markAsRead: (id: number) =>
    api.put(`/api/notifications/${id}/read`),

  markAllAsRead: () =>
    api.put('/api/notifications/read-all'),

  delete: (id: number) =>
    api.delete(`/api/notifications/${id}`),
};

// Alerts API
export const alertsApi = {
  getAll: () => {
    const mockAlerts: Alert[] = [
      {
        id: 1,
        title: 'Critical Low Stock',
        message: 'Multiple items are critically low on stock',
        type: 'LOW_STOCK',
        severity: 'HIGH',
        isResolved: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'System Performance',
        message: 'Database response time is slower than usual',
        type: 'SYSTEM_ERROR',
        severity: 'MEDIUM',
        isResolved: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      }
    ];
    return Promise.resolve({ data: mockAlerts });
  },

  getActive: () => {
    const mockAlerts: Alert[] = [
      {
        id: 1,
        title: 'Critical Low Stock',
        message: 'Multiple items are critically low on stock',
        type: 'LOW_STOCK',
        severity: 'HIGH',
        isResolved: false,
        createdAt: new Date().toISOString(),
      }
    ];
    return Promise.resolve({ data: mockAlerts });
  },

  getById: (id: number) =>
    api.get<Alert>(`/api/alerts/${id}`),

  resolve: (id: number) =>
    api.put(`/api/alerts/${id}/resolve`),

  delete: (id: number) =>
    api.delete(`/api/alerts/${id}`),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => {
    // Mock data for now - replace with real API call when backend is ready
    const mockStats: DashboardStats = {
      totalInventoryItems: 150,
      totalOrders: 45,
      totalCustomers: 23,
      lowStockItems: 8,
      pendingOrders: 12,
      totalRevenue: 12500.50,
      recentOrders: [
        {
          id: 1,
          orderNumber: 'ORD-001',
          customerId: 1,
          status: 'PENDING',
          totalAmount: 299.99,
          subTotal: 299.99,
          taxAmount: 0,
          shippingAmount: 0,
          discountAmount: 0,
          orderDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          orderNumber: 'ORD-002',
          customerId: 2,
          status: 'DELIVERED',
          totalAmount: 150.00,
          subTotal: 150.00,
          taxAmount: 0,
          shippingAmount: 0,
          discountAmount: 0,
          orderDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ],
      lowStockAlerts: []
    };

    return Promise.resolve({ data: mockStats });
  },

  getRevenueChart: (period: string) =>
    api.get(`/api/dashboard/revenue-chart?period=${period}`),

  getOrdersChart: (period: string) =>
    api.get(`/api/dashboard/orders-chart?period=${period}`),

  getInventoryChart: () =>
    api.get('/api/dashboard/inventory-chart'),
};

// Health check
export const healthApi = {
  check: () => api.get('/health'),
  
  checkServices: () => api.get('/status'),
};

export default api;
