import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  inventoryApi,
  ordersApi,
  customersApi,
  paymentsApi,
  notificationsApi,
  alertsApi,
  dashboardApi,
} from '../services/api';
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
  InventoryFilters,
  OrderFilters,
  CustomerFilters,
} from '../types';

// Query Keys
export const queryKeys = {
  inventory: {
    all: ['inventory'] as const,
    lists: () => [...queryKeys.inventory.all, 'list'] as const,
    list: (filters: InventoryFilters) => [...queryKeys.inventory.lists(), filters] as const,
    details: () => [...queryKeys.inventory.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.inventory.details(), id] as const,
    lowStock: () => [...queryKeys.inventory.all, 'low-stock'] as const,
  },
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters: OrderFilters) => [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.orders.details(), id] as const,
    byCustomer: (customerId: number) => [...queryKeys.orders.all, 'customer', customerId] as const,
  },
  customers: {
    all: ['customers'] as const,
    lists: () => [...queryKeys.customers.all, 'list'] as const,
    list: (filters: CustomerFilters) => [...queryKeys.customers.lists(), filters] as const,
    details: () => [...queryKeys.customers.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.customers.details(), id] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    charts: () => [...queryKeys.dashboard.all, 'charts'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
  },
  alerts: {
    all: ['alerts'] as const,
    active: () => [...queryKeys.alerts.all, 'active'] as const,
  },
};

// Inventory Hooks
export const useInventory = (filters?: InventoryFilters) => {
  return useQuery({
    queryKey: queryKeys.inventory.list(filters || {}),
    queryFn: () => inventoryApi.getAll(filters).then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useInventoryItem = (id: number) => {
  return useQuery({
    queryKey: queryKeys.inventory.detail(id),
    queryFn: () => inventoryApi.getById(id).then(res => res.data),
    enabled: !!id,
  });
};

export const useLowStockItems = () => {
  return useQuery({
    queryKey: queryKeys.inventory.lowStock(),
    queryFn: () => inventoryApi.getLowStock().then(res => res.data),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (item: CreateInventoryItem) => inventoryApi.create(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      enqueueSnackbar('Inventory item created successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(`Failed to create inventory item: ${error.message}`, { variant: 'error' });
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, item }: { id: number; item: UpdateInventoryItem }) => 
      inventoryApi.update(id, item),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.detail(id) });
      enqueueSnackbar('Inventory item updated successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(`Failed to update inventory item: ${error.message}`, { variant: 'error' });
    },
  });
};

export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (adjustment: StockAdjustment) => inventoryApi.adjustStock(adjustment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      enqueueSnackbar('Stock adjusted successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(`Failed to adjust stock: ${error.message}`, { variant: 'error' });
    },
  });
};

// Orders Hooks
export const useOrders = (filters?: OrderFilters) => {
  return useQuery({
    queryKey: queryKeys.orders.list(filters || {}),
    queryFn: () => ordersApi.getAll(filters).then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });
};

export const useOrder = (id: number) => {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => ordersApi.getById(id).then(res => res.data),
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (order: CreateOrder) => ordersApi.create(order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      enqueueSnackbar('Order created successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(`Failed to create order: ${error.message}`, { variant: 'error' });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      ordersApi.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(id) });
      enqueueSnackbar('Order status updated successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(`Failed to update order status: ${error.message}`, { variant: 'error' });
    },
  });
};

// Customers Hooks
export const useCustomers = (filters?: CustomerFilters) => {
  return useQuery({
    queryKey: queryKeys.customers.list(filters || {}),
    queryFn: () => customersApi.getAll(filters).then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCustomer = (id: number) => {
  return useQuery({
    queryKey: queryKeys.customers.detail(id),
    queryFn: () => customersApi.getById(id).then(res => res.data),
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (customer: CreateCustomer) => customersApi.create(customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      enqueueSnackbar('Customer created successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(`Failed to create customer: ${error.message}`, { variant: 'error' });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, customer }: { id: number; customer: UpdateCustomer }) => 
      customersApi.update(id, customer),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(id) });
      enqueueSnackbar('Customer updated successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(`Failed to update customer: ${error.message}`, { variant: 'error' });
    },
  });
};

// Dashboard Hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: () => dashboardApi.getStats().then(res => res.data),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Notifications Hooks
export const useNotifications = () => {
  return useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: () => notificationsApi.getAll().then(res => res.data),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useUnreadNotifications = () => {
  return useQuery({
    queryKey: queryKeys.notifications.unread(),
    queryFn: () => notificationsApi.getUnread().then(res => res.data),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

// Alerts Hooks
export const useActiveAlerts = () => {
  return useQuery({
    queryKey: queryKeys.alerts.active(),
    queryFn: () => alertsApi.getActive().then(res => res.data),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};
