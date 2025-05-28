import { Router } from 'express';
import { HealthCheck } from '@warehouse/types';
import { createLogger } from '@warehouse/utils';
import { AppDataSource } from '../config/database';

const router = Router();
const logger = createLogger('reporting-health');

router.get('/', async (req, res) => {
  const healthCheck: HealthCheck = {
    status: 'healthy',
    timestamp: new Date(),
    service: 'reporting-service',
    version: '1.0.0',
    dependencies: {}
  };

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

  const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

router.get('/ready', (req, res) => {
  res.json({
    status: 'ready',
    timestamp: new Date(),
    service: 'reporting-service'
  });
});

router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date(),
    service: 'reporting-service'
  });
});

export { router as healthRouter };
