import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';
import { createLogger } from '@warehouse/utils';
import { ApiResponse, PaginatedResponse, QueryParams } from '@warehouse/types';

const logger = createLogger('product-controller');

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const queryParams = req.query as QueryParams;
      const result = await this.productService.getProducts(queryParams);
      
      const response: PaginatedResponse<any> = {
        success: true,
        data: result.data,
        pagination: result.pagination,
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error getting products:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get products',
        timestamp: new Date()
      });
    }
  }

  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);
      
      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found',
          timestamp: new Date()
        });
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        data: product,
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error getting product by ID:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get product',
        timestamp: new Date()
      });
    }
  }

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const productData = req.body;
      const product = await this.productService.createProduct(productData);
      
      const response: ApiResponse = {
        success: true,
        data: product,
        message: 'Product created successfully',
        timestamp: new Date()
      };
      
      res.status(201).json(response);
    } catch (error) {
      logger.error('Error creating product:', error);
      
      if (error.code === '23505') { // Unique constraint violation
        res.status(409).json({
          success: false,
          error: 'Product with this SKU already exists',
          timestamp: new Date()
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to create product',
        timestamp: new Date()
      });
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const product = await this.productService.updateProduct(id, updateData);
      
      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found',
          timestamp: new Date()
        });
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        data: product,
        message: 'Product updated successfully',
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error updating product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update product',
        timestamp: new Date()
      });
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.productService.deleteProduct(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Product not found',
          timestamp: new Date()
        });
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        message: 'Product deleted successfully',
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error deleting product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete product',
        timestamp: new Date()
      });
    }
  }

  async getProductBySku(req: Request, res: Response): Promise<void> {
    try {
      const { sku } = req.params;
      const product = await this.productService.getProductBySku(sku);
      
      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found',
          timestamp: new Date()
        });
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        data: product,
        timestamp: new Date()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error getting product by SKU:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get product',
        timestamp: new Date()
      });
    }
  }
}
