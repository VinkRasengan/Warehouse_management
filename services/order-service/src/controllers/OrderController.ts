import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService';
import { createLogger } from '@warehouse/utils';
import { ApiResponse, PaginatedResponse, QueryParams } from '@warehouse/types';

const logger = createLogger('order-controller');

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const queryParams = req.query as QueryParams;
      const result = await this.orderService.getOrders(queryParams);
      
      const response: PaginatedResponse<any> = {
        success: true,
        data: result.data,
        pagination: result.pagination,
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error getting orders:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get orders',
        timestamp: new Date()
      });
    }
  }

  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await this.orderService.getOrderById(id);
      
      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Order not found',
          timestamp: new Date()
        });
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        data: order,
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error getting order by ID:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get order',
        timestamp: new Date()
      });
    }
  }

  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderData = req.body;
      const order = await this.orderService.createOrder(orderData);
      
      const response: ApiResponse = {
        success: true,
        data: order,
        message: 'Order created successfully',
        timestamp: new Date()
      };
      
      res.status(201).json(response);
    } catch (error) {
      logger.error('Error creating order:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create order',
        timestamp: new Date()
      });
    }
  }

  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const order = await this.orderService.updateOrderStatus(id, status);
      
      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Order not found',
          timestamp: new Date()
        });
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        data: order,
        message: 'Order status updated successfully',
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error updating order status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update order status',
        timestamp: new Date()
      });
    }
  }
}
