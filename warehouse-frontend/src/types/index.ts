// TypeScript types for Warehouse Management System

export interface InventoryItem {
  id: number;
  productId: number;
  sku: string;
  quantity: number;
  reservedQuantity: number;
  minimumStock: number;
  maximumStock: number;
  location: string;
  lastUpdated: string;
  createdAt: string;
}

export interface CreateInventoryItem {
  productId: number;
  sku: string;
  quantity: number;
  minimumStock: number;
  maximumStock: number;
  location: string;
}

export interface UpdateInventoryItem {
  quantity?: number;
  minimumStock?: number;
  maximumStock?: number;
  location?: string;
}

export interface StockAdjustment {
  inventoryItemId: number;
  adjustmentType: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  notes?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  status: OrderStatus;
  totalAmount: number;
  subTotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  orderDate: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateOrder {
  customerId: number;
  orderItems: CreateOrderItem[];
  shippingAmount?: number;
  discountAmount?: number;
  notes?: string;
}

export interface CreateOrderItem {
  productId: number;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  isActive: boolean;
  loyaltyPoints: number;
  customerType: CustomerType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  customerType?: CustomerType;
}

export interface UpdateCustomer {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  isActive?: boolean;
  customerType?: CustomerType;
}

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paymentDate: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface Alert {
  id: number;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

// Enums
export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'PROCESSING' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED';

export type CustomerType = 
  | 'REGULAR' 
  | 'PREMIUM' 
  | 'VIP' 
  | 'WHOLESALE';

export type PaymentMethod = 
  | 'CREDIT_CARD' 
  | 'DEBIT_CARD' 
  | 'PAYPAL' 
  | 'BANK_TRANSFER' 
  | 'CASH';

export type PaymentStatus = 
  | 'PENDING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'REFUNDED';

export type NotificationType = 
  | 'INFO' 
  | 'WARNING' 
  | 'ERROR' 
  | 'SUCCESS';

export type AlertType = 
  | 'LOW_STOCK' 
  | 'OUT_OF_STOCK' 
  | 'SYSTEM_ERROR' 
  | 'ORDER_ISSUE' 
  | 'PAYMENT_ISSUE';

export type AlertSeverity = 
  | 'LOW' 
  | 'MEDIUM' 
  | 'HIGH' 
  | 'CRITICAL';

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Dashboard types
export interface DashboardStats {
  totalInventoryItems: number;
  totalOrders: number;
  totalCustomers: number;
  lowStockItems: number;
  pendingOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
  lowStockAlerts: Alert[];
}

export interface ChartData {
  name: string;
  value: number;
  date?: string;
}

// Filter and search types
export interface InventoryFilters {
  search?: string;
  location?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
}

export interface OrderFilters {
  search?: string;
  status?: OrderStatus;
  customerId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface CustomerFilters {
  search?: string;
  customerType?: CustomerType;
  isActive?: boolean;
  city?: string;
  country?: string;
}
