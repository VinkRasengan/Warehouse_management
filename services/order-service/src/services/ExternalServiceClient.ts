import axios, { AxiosInstance } from 'axios';
import { createLogger } from '@warehouse/utils';

const logger = createLogger('order-external-client');

export class ExternalServiceClient {
  private inventoryClient: AxiosInstance;
  private customerClient: AxiosInstance;

  constructor() {
    this.inventoryClient = axios.create({
      baseURL: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3002',
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.customerClient = axios.create({
      baseURL: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3004',
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptors for logging
    this.inventoryClient.interceptors.request.use(
      (config) => {
        logger.info('Calling inventory service', {
          method: config.method,
          url: config.url,
          data: config.data
        });
        return config;
      },
      (error) => {
        logger.error('Inventory service request error:', error);
        return Promise.reject(error);
      }
    );

    this.customerClient.interceptors.request.use(
      (config) => {
        logger.info('Calling customer service', {
          method: config.method,
          url: config.url,
          data: config.data
        });
        return config;
      },
      (error) => {
        logger.error('Customer service request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptors for error handling
    this.inventoryClient.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('Inventory service response error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        return Promise.reject(error);
      }
    );

    this.customerClient.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('Customer service response error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        return Promise.reject(error);
      }
    );
  }

  async checkStock(productId: string, quantity: number): Promise<boolean> {
    try {
      const response = await this.inventoryClient.get(`/inventory/check/${productId}`, {
        params: { quantity }
      });
      
      return response.data.success && response.data.data.available;
    } catch (error) {
      logger.error('Failed to check stock:', {
        productId,
        quantity,
        error: error.message
      });
      return false;
    }
  }

  async reserveStock(productId: string, quantity: number, reference: string): Promise<boolean> {
    try {
      const response = await this.inventoryClient.post('/inventory/reserve', {
        productId,
        quantity,
        reference
      });
      
      return response.data.success;
    } catch (error) {
      logger.error('Failed to reserve stock:', {
        productId,
        quantity,
        reference,
        error: error.message
      });
      return false;
    }
  }

  async getCustomer(customerId: string): Promise<any | null> {
    try {
      const response = await this.customerClient.get(`/customers/${customerId}`);
      
      if (response.data.success) {
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      
      logger.error('Failed to get customer:', {
        customerId,
        error: error.message
      });
      throw error;
    }
  }

  async validateCustomer(customerId: string): Promise<boolean> {
    try {
      const customer = await this.getCustomer(customerId);
      return customer !== null && customer.isActive;
    } catch (error) {
      logger.error('Failed to validate customer:', {
        customerId,
        error: error.message
      });
      return false;
    }
  }
}
