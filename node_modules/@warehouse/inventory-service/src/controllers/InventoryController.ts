import { Request, Response } from 'express';
import { InventoryService } from '../services/InventoryService';
import { createLogger } from '@warehouse/utils';
import { ApiResponse, PaginatedResponse, QueryParams } from '@warehouse/types';

const logger = createLogger('inventory-controller');

export class InventoryController {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  async getInventoryItems(req: Request, res: Response): Promise<void> {
    try {
      const queryParams = req.query as QueryParams;
      const result = await this.inventoryService.getInventoryItems(queryParams);
      
      const response: PaginatedResponse<any> = {
        success: true,
        data: result.data,
        pagination: result.pagination,
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error getting inventory items:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get inventory items',
        timestamp: new Date()
      });
    }
  }

  async getInventoryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.inventoryService.getInventoryById(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Inventory item not found',
          timestamp: new Date()
        });
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        data: item,
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error getting inventory item by ID:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get inventory item',
        timestamp: new Date()
      });
    }
  }

  async getInventoryByProductId(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const item = await this.inventoryService.getInventoryByProductId(productId);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Inventory item not found for this product',
          timestamp: new Date()
        });
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        data: item,
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error getting inventory item by product ID:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get inventory item',
        timestamp: new Date()
      });
    }
  }

  async createInventoryItem(req: Request, res: Response): Promise<void> {
    try {
      const itemData = req.body;
      const item = await this.inventoryService.createInventoryItem(itemData);
      
      const response: ApiResponse = {
        success: true,
        data: item,
        message: 'Inventory item created successfully',
        timestamp: new Date()
      };
      
      res.status(201).json(response);
    } catch (error) {
      logger.error('Error creating inventory item:', error);
      
      if (error.code === '23505') { // Unique constraint violation
        res.status(409).json({
          success: false,
          error: 'Inventory item for this product already exists',
          timestamp: new Date()
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to create inventory item',
        timestamp: new Date()
      });
    }
  }

  async updateInventoryItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const item = await this.inventoryService.updateInventoryItem(id, updateData);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Inventory item not found',
          timestamp: new Date()
        });
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        data: item,
        message: 'Inventory item updated successfully',
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error updating inventory item:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update inventory item',
        timestamp: new Date()
      });
    }
  }

  async recordStockMovement(req: Request, res: Response): Promise<void> {
    try {
      const movementData = req.body;
      const result = await this.inventoryService.recordStockMovement(movementData);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Stock movement recorded successfully',
        timestamp: new Date()
      };
      
      res.status(201).json(response);
    } catch (error) {
      logger.error('Error recording stock movement:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record stock movement',
        timestamp: new Date()
      });
    }
  }

  async getStockMovements(req: Request, res: Response): Promise<void> {
    try {
      const queryParams = req.query as QueryParams;
      const result = await this.inventoryService.getStockMovements(queryParams);
      
      const response: PaginatedResponse<any> = {
        success: true,
        data: result.data,
        pagination: result.pagination,
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error getting stock movements:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get stock movements',
        timestamp: new Date()
      });
    }
  }

  async checkStock(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const { quantity } = req.query;
      
      if (!quantity) {
        res.status(400).json({
          success: false,
          error: 'Quantity parameter is required',
          timestamp: new Date()
        });
        return;
      }

      const available = await this.inventoryService.checkStock(productId, parseInt(quantity as string));
      
      const response: ApiResponse = {
        success: true,
        data: { available, productId, requestedQuantity: parseInt(quantity as string) },
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error checking stock:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check stock',
        timestamp: new Date()
      });
    }
  }

  async reserveStock(req: Request, res: Response): Promise<void> {
    try {
      const { productId, quantity, reference } = req.body;
      
      const success = await this.inventoryService.reserveStock(productId, quantity, reference);
      
      if (!success) {
        res.status(400).json({
          success: false,
          error: 'Insufficient stock or product not found',
          timestamp: new Date()
        });
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        message: 'Stock reserved successfully',
        data: { productId, quantity, reference },
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error reserving stock:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reserve stock',
        timestamp: new Date()
      });
    }
  }
}
