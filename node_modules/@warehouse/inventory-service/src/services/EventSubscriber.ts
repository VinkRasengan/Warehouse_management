import { messageQueue, createLogger } from '@warehouse/utils';
import { BaseEvent, OrderCreatedEvent } from '@warehouse/types';
import { InventoryService } from './InventoryService';

const logger = createLogger('inventory-event-subscriber');

export class EventSubscriber {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  async start(): Promise<void> {
    try {
      // Subscribe to order events
      await messageQueue.subscribe(
        'warehouse.events',
        'inventory.order.queue',
        ['order.created', 'order.cancelled'],
        this.handleEvent.bind(this)
      );

      logger.info('Event subscriber started successfully');
    } catch (error) {
      logger.error('Failed to start event subscriber:', error);
      throw error;
    }
  }

  private async handleEvent(event: BaseEvent): Promise<void> {
    try {
      logger.info(`Processing event: ${event.eventType}`, {
        eventId: event.eventId,
        correlationId: event.correlationId
      });

      switch (event.eventType) {
        case 'ORDER_CREATED':
          await this.handleOrderCreated(event as OrderCreatedEvent);
          break;
        default:
          logger.warn(`Unhandled event type: ${event.eventType}`);
      }
    } catch (error) {
      logger.error('Error processing event:', {
        error: error.message,
        eventId: event.eventId,
        eventType: event.eventType
      });
      throw error;
    }
  }

  private async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    logger.info('Processing order created event', {
      orderId: event.orderId,
      correlationId: event.correlationId
    });

    // Reserve stock for each item in the order
    for (const item of event.items) {
      try {
        const success = await this.inventoryService.reserveStock(
          item.productId,
          item.quantity,
          `ORDER-${event.orderId}`
        );

        if (!success) {
          logger.error('Failed to reserve stock for order item', {
            orderId: event.orderId,
            productId: item.productId,
            quantity: item.quantity
          });
          
          // TODO: Publish stock reservation failed event
          // This would trigger order cancellation or backorder process
        } else {
          logger.info('Stock reserved successfully', {
            orderId: event.orderId,
            productId: item.productId,
            quantity: item.quantity
          });
        }
      } catch (error) {
        logger.error('Error reserving stock for order item:', {
          error: error.message,
          orderId: event.orderId,
          productId: item.productId,
          quantity: item.quantity
        });
      }
    }
  }
}
