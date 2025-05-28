import { Request, Response } from 'express';
import { ReportingService } from '../services/ReportingService';
import { createLogger } from '@warehouse/utils';
import { ApiResponse } from '@warehouse/types';

const logger = createLogger('reporting-controller');

export class ReportingController {
  private reportingService: ReportingService;

  constructor() {
    this.reportingService = new ReportingService();
  }

  async getSalesReport(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, groupBy = 'day' } = req.query;
      
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();
      
      const report = await this.reportingService.getSalesReport(start, end, groupBy as string);
      
      const response: ApiResponse = {
        success: true,
        data: report,
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error generating sales report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate sales report',
        timestamp: new Date()
      });
    }
  }

  async getInventoryReport(req: Request, res: Response): Promise<void> {
    try {
      const report = await this.reportingService.getInventoryReport();
      
      const response: ApiResponse = {
        success: true,
        data: report,
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error generating inventory report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate inventory report',
        timestamp: new Date()
      });
    }
  }

  async getTopProducts(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10, period = '30d' } = req.query;
      
      const report = await this.reportingService.getTopProducts(
        parseInt(limit as string), 
        period as string
      );
      
      const response: ApiResponse = {
        success: true,
        data: report,
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error generating top products report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate top products report',
        timestamp: new Date()
      });
    }
  }

  async getCustomerReport(req: Request, res: Response): Promise<void> {
    try {
      const report = await this.reportingService.getCustomerReport();
      
      const response: ApiResponse = {
        success: true,
        data: report,
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error generating customer report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate customer report',
        timestamp: new Date()
      });
    }
  }
}
