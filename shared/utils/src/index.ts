export * from './logger';
export * from './messageQueue';
export * from './validation';

import { v4 as uuidv4 } from 'uuid';

export const generateId = (): string => uuidv4();

export const generateCorrelationId = (): string => uuidv4();

export const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxAttempts) {
        throw lastError;
      }
      await sleep(delay * attempt);
    }
  }
  
  throw lastError!;
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

export const calculateTax = (amount: number, taxRate: number = 0.1): number => {
  return Math.round(amount * taxRate * 100) / 100;
};

export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `ORD-${timestamp}-${random}`.toUpperCase();
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

export const paginate = <T>(
  items: T[],
  page: number = 1,
  limit: number = 10
): {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} => {
  const offset = (page - 1) * limit;
  const paginatedItems = items.slice(offset, offset + limit);
  
  return {
    data: paginatedItems,
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit)
    }
  };
};
