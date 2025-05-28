import { Request, Response } from 'express';
import { AlertService } from '../services/AlertService';
import { createLogger } from '@warehouse/utils';
import { ApiResponse, PaginatedResponse, QueryParams } from '@warehouse/types';

const logger = createLogger('alert-controller');

export class AlertController {
  private alertService: AlertService;

  constructor() {
    this.alertService = new AlertService();
  }

  async getAlerts(req: Request, res: Response): Promise<void> {
    try {
      const queryParams = req.query as QueryParams;
      const result = await this.alertService.getAlerts(queryParams);
      
      const response: PaginatedResponse<any> = {
        success: true,
        data: result.data,
        pagination: result.pagination,
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error getting alerts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get alerts',
        timestamp: new Date()
      });
    }
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const alert = await this.alertService.markAsRead(id);
      
      if (!alert) {
        res.status(404).json({
          success: false,
          error: 'Alert not found',
          timestamp: new Date()
        });
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        data: alert,
        message: 'Alert marked as read',
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error marking alert as read:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark alert as read',
        timestamp: new Date()
      });
    }
  }

  async resolveAlert(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { resolvedBy } = req.body;
      
      const alert = await this.alertService.resolveAlert(id, resolvedBy);
      
      if (!alert) {
        res.status(404).json({
          success: false,
          error: 'Alert not found',
          timestamp: new Date()
        });
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        data: alert,
        message: 'Alert resolved successfully',
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error resolving alert:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to resolve alert',
        timestamp: new Date()
      });
    }
  }
}
