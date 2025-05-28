import { Request, Response } from 'express';
import { CategoryService } from '../services/CategoryService';
import { createLogger } from '@warehouse/utils';
import { ApiResponse } from '@warehouse/types';

const logger = createLogger('category-controller');

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await this.categoryService.getCategories();
      
      const response: ApiResponse = {
        success: true,
        data: categories,
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error getting categories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get categories',
        timestamp: new Date()
      });
    }
  }

  async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const category = await this.categoryService.getCategoryById(id);
      
      if (!category) {
        res.status(404).json({
          success: false,
          error: 'Category not found',
          timestamp: new Date()
        });
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        data: category,
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error getting category by ID:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get category',
        timestamp: new Date()
      });
    }
  }

  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const categoryData = req.body;
      const category = await this.categoryService.createCategory(categoryData);
      
      const response: ApiResponse = {
        success: true,
        data: category,
        message: 'Category created successfully',
        timestamp: new Date()
      };
      
      res.status(201).json(response);
    } catch (error) {
      logger.error('Error creating category:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create category',
        timestamp: new Date()
      });
    }
  }
}
