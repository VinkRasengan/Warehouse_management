import { Router } from 'express';
import { HealthCheck } from '@warehouse/types';
import { createLogger } from '@warehouse/utils';
import { AppDataSource } from '../config/database';
import { redisClient } from '../config/redis';

const router = Router();
const logger = createLogger('inventory-health');

router.get('/', async (req, res) => {
  const healthCheck: HealthCheck = {
    status: 'healthy',
    timestamp: new Date(),
    service: 'inventory-service',
    version: '1.0.0',
    dependencies: {}
  };

  // Check database connection
  try {
    await AppDataSource.query('SELECT 1');
    healthCheck.dependencies.database = { status: 'healthy' };
  } catch (error) {
    healthCheck.status = 'unhealthy';
    healthCheck.dependencies.database = { 
      status: 'unhealthy', 
      error: error.message 
    };
  }

  // Check Redis connection
  try {
    await redisClient.ping();
    healthCheck.dependencies.redis = { status: 'healthy' };
  } catch (error) {
    healthCheck.dependencies.redis = { 
      status: 'unhealthy', 
      error: error.message 
    };
  }

  const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

router.get('/ready', (req, res) => {
  res.json({
    status: 'ready',
    timestamp: new Date(),
    service: 'inventory-service'
  });
});

router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date(),
    service: 'inventory-service'
  });
});

export { router as healthRouter };
