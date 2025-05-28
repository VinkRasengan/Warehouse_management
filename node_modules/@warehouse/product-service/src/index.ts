import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createLogger, messageQueue } from '@warehouse/utils';
import { AppDataSource } from './config/database';
import { productRouter } from './routes/products';
import { categoryRouter } from './routes/categories';
import { healthRouter } from './routes/health';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const logger = createLogger('product-service');

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', healthRouter);
app.use('/products', productRouter);
app.use('/categories', categoryRouter);

// Default route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Product Service',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Error handling
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database
    await AppDataSource.initialize();
    logger.info('Database connected successfully');

    // Connect to message queue
    await messageQueue.connect();
    logger.info('Message queue connected successfully');

    // Start server
    app.listen(PORT, () => {
      logger.info(`Product Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Shutting down gracefully...');
  
  try {
    await messageQueue.disconnect();
    await AppDataSource.destroy();
    logger.info('Cleanup completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();

export default app;
