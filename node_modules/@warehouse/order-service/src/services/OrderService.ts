import { Repository } from 'typeorm';
import { Order } from '../entities/Order';
import { OrderItem } from '../entities/OrderItem';
import { AppDataSource } from '../config/database';
import { createLogger, messageQueue, generateId, generateCorrelationId, generateOrderNumber, calculateTax } from '@warehouse/utils';
import { QueryParams, OrderCreatedEvent, OrderStatus, PaymentStatus } from '@warehouse/types';
import { ExternalServiceClient } from './ExternalServiceClient';

const logger = createLogger('order-service');

export class OrderService {
  private orderRepository: Repository<Order>;
  private orderItemRepository: Repository<OrderItem>;
  private externalServiceClient: ExternalServiceClient;

  constructor() {
    this.orderRepository = AppDataSource.getRepository(Order);
    this.orderItemRepository = AppDataSource.getRepository(OrderItem);
    this.externalServiceClient = new ExternalServiceClient();
  }

  async getOrders(queryParams: QueryParams) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      customerId,
      status,
      paymentStatus
    } = queryParams;

    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items');

    // Filters
    if (customerId) {
      queryBuilder.andWhere('order.customerId = :customerId', { customerId });
    }

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (paymentStatus) {
      queryBuilder.andWhere('order.paymentStatus = :paymentStatus', { paymentStatus });
    }

    // Sorting
    queryBuilder.orderBy(`order.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getOrderById(id: string): Promise<Order | null> {
    return await this.orderRepository.findOne({
      where: { id },
      relations: ['items']
    });
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    return await this.orderRepository.findOne({
      where: { orderNumber },
      relations: ['items']
    });
  }

  async createOrder(data: any): Promise<Order> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate customer exists
      const customer = await this.externalServiceClient.getCustomer(data.customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Check stock availability for all items
      for (const item of data.items) {
        const stockAvailable = await this.externalServiceClient.checkStock(item.productId, item.quantity);
        if (!stockAvailable) {
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }
      }

      // Calculate totals
      let subtotal = 0;
      const orderItems: Partial<OrderItem>[] = [];

      for (const item of data.items) {
        const itemTotal = item.quantity * item.unitPrice;
        subtotal += itemTotal;

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: itemTotal
        });
      }

      const tax = calculateTax(subtotal);
      const total = subtotal + tax;

      // Create order
      const order = queryRunner.manager.create(Order, {
        orderNumber: generateOrderNumber(),
        customerId: data.customerId,
        subtotal,
        tax,
        total,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress || data.shippingAddress,
        notes: data.notes
      });

      const savedOrder = await queryRunner.manager.save(order);

      // Create order items
      for (const itemData of orderItems) {
        const orderItem = queryRunner.manager.create(OrderItem, {
          ...itemData,
          orderId: savedOrder.id
        });
        await queryRunner.manager.save(orderItem);
      }

      await queryRunner.commitTransaction();

      // Reload order with items
      const completeOrder = await this.getOrderById(savedOrder.id);

      // Publish order created event
      await this.publishOrderCreatedEvent(completeOrder!);

      logger.info('Order created successfully', {
        orderId: savedOrder.id,
        orderNumber: savedOrder.orderNumber,
        customerId: savedOrder.customerId,
        total: savedOrder.total
      });

      return completeOrder!;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error('Failed to create order:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const order = await this.getOrderById(id);
    if (!order) return null;

    order.status = status;
    const updatedOrder = await this.orderRepository.save(order);

    logger.info('Order status updated', {
      orderId: id,
      orderNumber: order.orderNumber,
      oldStatus: order.status,
      newStatus: status
    });

    return updatedOrder;
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order | null> {
    const order = await this.getOrderById(id);
    if (!order) return null;

    order.paymentStatus = paymentStatus;
    const updatedOrder = await this.orderRepository.save(order);

    logger.info('Order payment status updated', {
      orderId: id,
      orderNumber: order.orderNumber,
      paymentStatus
    });

    return updatedOrder;
  }

  async cancelOrder(id: string, reason: string): Promise<Order | null> {
    const order = await this.getOrderById(id);
    if (!order) return null;

    if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
      throw new Error('Cannot cancel order in current status');
    }

    order.status = OrderStatus.CANCELLED;
    order.notes = order.notes ? `${order.notes}\nCancelled: ${reason}` : `Cancelled: ${reason}`;
    
    const updatedOrder = await this.orderRepository.save(order);

    // TODO: Publish order cancelled event to release reserved stock

    logger.info('Order cancelled', {
      orderId: id,
      orderNumber: order.orderNumber,
      reason
    });

    return updatedOrder;
  }

  private async publishOrderCreatedEvent(order: Order): Promise<void> {
    try {
      const event: OrderCreatedEvent = {
        eventId: generateId(),
        eventType: 'ORDER_CREATED',
        timestamp: new Date(),
        source: 'order-service',
        correlationId: generateCorrelationId(),
        orderId: order.id,
        customerId: order.customerId,
        total: order.total,
        items: order.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total
        }))
      };

      await messageQueue.publishEvent('warehouse.events', 'order.created', event);
      
      logger.info('Order created event published', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        eventId: event.eventId
      });
    } catch (error) {
      logger.error('Failed to publish order created event:', error);
    }
  }
}
