import { Repository } from 'typeorm';
import { InventoryItem } from '../entities/InventoryItem';
import { StockMovement } from '../entities/StockMovement';
import { AppDataSource } from '../config/database';
import { redisClient } from '../config/redis';
import { createLogger, messageQueue, generateId, generateCorrelationId } from '@warehouse/utils';
import { QueryParams, StockLowEvent } from '@warehouse/types';

const logger = createLogger('inventory-service');

export class InventoryService {
  private inventoryRepository: Repository<InventoryItem>;
  private movementRepository: Repository<StockMovement>;

  constructor() {
    this.inventoryRepository = AppDataSource.getRepository(InventoryItem);
    this.movementRepository = AppDataSource.getRepository(StockMovement);
  }

  async getInventoryItems(queryParams: QueryParams) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      productId,
      location,
      lowStock
    } = queryParams;

    const queryBuilder = this.inventoryRepository.createQueryBuilder('inventory');

    // Filters
    if (productId) {
      queryBuilder.andWhere('inventory.productId = :productId', { productId });
    }

    if (location) {
      queryBuilder.andWhere('inventory.location ILIKE :location', { location: `%${location}%` });
    }

    if (lowStock === 'true') {
      queryBuilder.andWhere('inventory.quantity <= inventory.minThreshold');
    }

    // Sorting
    queryBuilder.orderBy(`inventory.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getInventoryById(id: string): Promise<InventoryItem | null> {
    const cacheKey = `inventory:${id}`;
    
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      logger.warn('Redis get failed:', error);
    }

    const item = await this.inventoryRepository.findOne({ where: { id } });
    
    if (item) {
      try {
        await redisClient.setEx(cacheKey, 300, JSON.stringify(item)); // Cache for 5 minutes
      } catch (error) {
        logger.warn('Redis set failed:', error);
      }
    }

    return item;
  }

  async getInventoryByProductId(productId: string): Promise<InventoryItem | null> {
    const cacheKey = `inventory:product:${productId}`;
    
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      logger.warn('Redis get failed:', error);
    }

    const item = await this.inventoryRepository.findOne({ where: { productId } });
    
    if (item) {
      try {
        await redisClient.setEx(cacheKey, 300, JSON.stringify(item));
      } catch (error) {
        logger.warn('Redis set failed:', error);
      }
    }

    return item;
  }

  async createInventoryItem(data: Partial<InventoryItem>): Promise<InventoryItem> {
    const item = this.inventoryRepository.create({
      ...data,
      lastUpdated: new Date()
    });

    const savedItem = await this.inventoryRepository.save(item);

    // Clear cache
    try {
      await redisClient.del(`inventory:product:${savedItem.productId}`);
    } catch (error) {
      logger.warn('Redis delete failed:', error);
    }

    logger.info('Inventory item created', { itemId: savedItem.id, productId: savedItem.productId });

    return savedItem;
  }

  async updateInventoryItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem | null> {
    const item = await this.inventoryRepository.findOne({ where: { id } });
    if (!item) return null;

    const oldQuantity = item.quantity;
    Object.assign(item, data, { lastUpdated: new Date() });
    const updatedItem = await this.inventoryRepository.save(item);

    // Clear cache
    try {
      await redisClient.del(`inventory:${id}`);
      await redisClient.del(`inventory:product:${updatedItem.productId}`);
    } catch (error) {
      logger.warn('Redis delete failed:', error);
    }

    // Check for low stock and publish event
    if (updatedItem.quantity <= updatedItem.minThreshold && oldQuantity > updatedItem.minThreshold) {
      await this.publishStockLowEvent(updatedItem);
    }

    logger.info('Inventory item updated', { 
      itemId: updatedItem.id, 
      productId: updatedItem.productId,
      oldQuantity,
      newQuantity: updatedItem.quantity
    });

    return updatedItem;
  }

  async recordStockMovement(data: Partial<StockMovement>): Promise<{ movement: StockMovement; inventory: InventoryItem }> {
    const movement = this.movementRepository.create(data);
    const savedMovement = await this.movementRepository.save(movement);

    // Update inventory quantity
    let inventory = await this.getInventoryByProductId(data.productId!);
    
    if (!inventory) {
      // Create new inventory item if doesn't exist
      inventory = await this.createInventoryItem({
        productId: data.productId!,
        quantity: 0,
        minThreshold: 10,
        location: 'Default'
      });
    }

    const oldQuantity = inventory.quantity;
    let newQuantity = oldQuantity;

    switch (data.type) {
      case 'IN':
        newQuantity = oldQuantity + data.quantity!;
        break;
      case 'OUT':
        newQuantity = Math.max(0, oldQuantity - data.quantity!);
        break;
      case 'ADJUSTMENT':
        newQuantity = data.quantity!;
        break;
    }

    inventory = await this.updateInventoryItem(inventory.id, { quantity: newQuantity })!;

    logger.info('Stock movement recorded', {
      movementId: savedMovement.id,
      productId: data.productId,
      type: data.type,
      quantity: data.quantity,
      oldQuantity,
      newQuantity
    });

    return { movement: savedMovement, inventory: inventory! };
  }

  async getStockMovements(queryParams: QueryParams) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      productId,
      type
    } = queryParams;

    const queryBuilder = this.movementRepository.createQueryBuilder('movement');

    // Filters
    if (productId) {
      queryBuilder.andWhere('movement.productId = :productId', { productId });
    }

    if (type) {
      queryBuilder.andWhere('movement.type = :type', { type });
    }

    // Sorting
    queryBuilder.orderBy(`movement.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [movements, total] = await queryBuilder.getManyAndCount();

    return {
      data: movements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async checkStock(productId: string, requiredQuantity: number): Promise<boolean> {
    const inventory = await this.getInventoryByProductId(productId);
    return inventory ? inventory.quantity >= requiredQuantity : false;
  }

  async reserveStock(productId: string, quantity: number, reference: string): Promise<boolean> {
    const inventory = await this.getInventoryByProductId(productId);
    
    if (!inventory || inventory.quantity < quantity) {
      return false;
    }

    await this.recordStockMovement({
      productId,
      type: 'OUT',
      quantity,
      reason: 'Stock reservation',
      reference,
      performedBy: 'system'
    });

    return true;
  }

  private async publishStockLowEvent(inventory: InventoryItem): Promise<void> {
    try {
      const event: StockLowEvent = {
        eventId: generateId(),
        eventType: 'STOCK_LOW',
        timestamp: new Date(),
        source: 'inventory-service',
        correlationId: generateCorrelationId(),
        productId: inventory.productId,
        currentQuantity: inventory.quantity,
        minThreshold: inventory.minThreshold
      };

      await messageQueue.publishEvent('warehouse.events', 'inventory.stock.low', event);
      
      logger.info('Stock low event published', {
        productId: inventory.productId,
        currentQuantity: inventory.quantity,
        minThreshold: inventory.minThreshold
      });
    } catch (error) {
      logger.error('Failed to publish stock low event:', error);
    }
  }
}
