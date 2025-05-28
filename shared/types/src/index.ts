// Common types shared across all microservices

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Product types
export interface Product extends BaseEntity {
  name: string;
  description?: string;
  sku: string;
  categoryId: string;
  price: number;
  unit: string;
  isActive: boolean;
}

export interface Category extends BaseEntity {
  name: string;
  description?: string;
  parentId?: string;
}

// Inventory types
export interface InventoryItem extends BaseEntity {
  productId: string;
  quantity: number;
  minThreshold: number;
  maxThreshold?: number;
  location: string;
  lastUpdated: Date;
}

export interface StockMovement extends BaseEntity {
  productId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  reference?: string;
  performedBy: string;
}

// Customer types
export interface Customer extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: Address;
  loyaltyPoints: number;
  isActive: boolean;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Order types
export interface Order extends BaseEntity {
  orderNumber: string;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

// Alert types
export interface Alert extends BaseEntity {
  type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  productId?: string;
  isRead: boolean;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export enum AlertType {
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  ORDER_ISSUE = 'ORDER_ISSUE'
}

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Event types for message broker
export interface BaseEvent {
  eventId: string;
  eventType: string;
  timestamp: Date;
  source: string;
  correlationId?: string;
}

export interface StockLowEvent extends BaseEvent {
  eventType: 'STOCK_LOW';
  productId: string;
  currentQuantity: number;
  minThreshold: number;
}

export interface OrderCreatedEvent extends BaseEvent {
  eventType: 'ORDER_CREATED';
  orderId: string;
  customerId: string;
  total: number;
  items: OrderItem[];
}

export interface ProductUpdatedEvent extends BaseEvent {
  eventType: 'PRODUCT_UPDATED';
  productId: string;
  changes: Partial<Product>;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: any;
}

export interface QueryParams extends PaginationParams, SortParams, FilterParams {}

// Health check
export interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: Date;
  service: string;
  version: string;
  dependencies: {
    [key: string]: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
  };
}
