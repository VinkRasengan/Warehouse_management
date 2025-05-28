import amqp, { Connection, Channel } from 'amqplib';
import { BaseEvent } from '@warehouse/types';
import { logger } from './logger';

export class MessageQueue {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private readonly url: string;

  constructor(url: string = process.env.RABBITMQ_URL || 'amqp://localhost') {
    this.url = url;
  }

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();
      
      this.connection.on('error', (err) => {
        logger.error('RabbitMQ connection error:', err);
      });

      this.connection.on('close', () => {
        logger.warn('RabbitMQ connection closed');
      });

      logger.info('Connected to RabbitMQ');
    } catch (error) {
      logger.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      logger.info('Disconnected from RabbitMQ');
    } catch (error) {
      logger.error('Error disconnecting from RabbitMQ:', error);
    }
  }

  async publishEvent(exchange: string, routingKey: string, event: BaseEvent): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized. Call connect() first.');
    }

    try {
      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      
      const message = Buffer.from(JSON.stringify(event));
      const published = this.channel.publish(exchange, routingKey, message, {
        persistent: true,
        messageId: event.eventId,
        timestamp: event.timestamp.getTime(),
        headers: {
          eventType: event.eventType,
          source: event.source,
          correlationId: event.correlationId
        }
      });

      if (!published) {
        throw new Error('Failed to publish message');
      }

      logger.info(`Published event ${event.eventType} to ${exchange}/${routingKey}`, {
        eventId: event.eventId,
        correlationId: event.correlationId
      });
    } catch (error) {
      logger.error('Failed to publish event:', error);
      throw error;
    }
  }

  async subscribe(
    exchange: string,
    queue: string,
    routingKeys: string[],
    handler: (event: BaseEvent) => Promise<void>
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized. Call connect() first.');
    }

    try {
      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      await this.channel.assertQueue(queue, { durable: true });

      for (const routingKey of routingKeys) {
        await this.channel.bindQueue(queue, exchange, routingKey);
      }

      await this.channel.consume(queue, async (msg) => {
        if (!msg) return;

        try {
          const event = JSON.parse(msg.content.toString()) as BaseEvent;
          await handler(event);
          this.channel!.ack(msg);
          
          logger.info(`Processed event ${event.eventType}`, {
            eventId: event.eventId,
            correlationId: event.correlationId
          });
        } catch (error) {
          logger.error('Error processing message:', error);
          this.channel!.nack(msg, false, false); // Dead letter queue
        }
      });

      logger.info(`Subscribed to ${exchange} with queue ${queue}`);
    } catch (error) {
      logger.error('Failed to subscribe to queue:', error);
      throw error;
    }
  }
}

export const messageQueue = new MessageQueue();
