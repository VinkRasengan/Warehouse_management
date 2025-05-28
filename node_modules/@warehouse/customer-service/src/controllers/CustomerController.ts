import { Request, Response } from 'express';
import { CustomerService } from '../services/CustomerService';
import { createLogger } from '@warehouse/utils';
import { ApiResponse, PaginatedResponse, QueryParams } from '@warehouse/types';

const logger = createLogger('customer-controller');

export class CustomerController {
  private customerService: CustomerService;

  constructor() {
    this.customerService = new CustomerService();
  }

  async getCustomers(req: Request, res: Response): Promise<void> {
    try {
      const queryParams = req.query as QueryParams;
      const result = await this.customerService.getCustomers(queryParams);
      
      const response: PaginatedResponse<any> = {
        success: true,
        data: result.data,
        pagination: result.pagination,
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error getting customers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get customers',
        timestamp: new Date()
      });
    }
  }

  async getCustomerById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const customer = await this.customerService.getCustomerById(id);
      
      if (!customer) {
        res.status(404).json({
          success: false,
          error: 'Customer not found',
          timestamp: new Date()
        });
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        data: customer,
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error getting customer by ID:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get customer',
        timestamp: new Date()
      });
    }
  }

  async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      const customerData = req.body;
      const customer = await this.customerService.createCustomer(customerData);
      
      const response: ApiResponse = {
        success: true,
        data: customer,
        message: 'Customer created successfully',
        timestamp: new Date()
      };
      
      res.status(201).json(response);
    } catch (error) {
      logger.error('Error creating customer:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create customer',
        timestamp: new Date()
      });
    }
  }

  async updateCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const customer = await this.customerService.updateCustomer(id, updateData);
      
      if (!customer) {
        res.status(404).json({
          success: false,
          error: 'Customer not found',
          timestamp: new Date()
        });
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        data: customer,
        message: 'Customer updated successfully',
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error updating customer:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update customer',
        timestamp: new Date()
      });
    }
  }

  async deleteCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.customerService.deleteCustomer(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Customer not found',
          timestamp: new Date()
        });
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        message: 'Customer deleted successfully',
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error deleting customer:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete customer',
        timestamp: new Date()
      });
    }
  }
}
