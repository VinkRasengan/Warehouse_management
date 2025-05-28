import { messageQueue, createLogger } from '@warehouse/utils';
import { BaseEvent, StockLowEvent } from '@warehouse/types';
import { AlertService } from './AlertService';

const logger = createLogger('alert-event-subscriber');

export class EventSubscriber {
  private alertService: AlertService;

  constructor() {
    this.alertService = new AlertService();
  }

  async start(): Promise<void> {
    try {
      // Subscribe to inventory events
      await messageQueue.subscribe(
        'warehouse.events',
        'alert.inventory.queue',
        ['inventory.stock.low', 'inventory.stock.out'],
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
        case 'STOCK_LOW':
          await this.handleStockLowEvent(event as StockLowEvent);
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

  private async handleStockLowEvent(event: StockLowEvent): Promise<void> {
    logger.info('Processing stock low event', {
      productId: event.productId,
      currentQuantity: event.currentQuantity,
      minThreshold: event.minThreshold
    });

    try {
      await this.alertService.createStockLowAlert(
        event.productId,
        event.currentQuantity,
        event.minThreshold
      );

      logger.info('Stock low alert created successfully', {
        productId: event.productId
      });
    } catch (error) {
      logger.error('Failed to create stock low alert:', {
        error: error.message,
        productId: event.productId
      });
    }
  }
}
