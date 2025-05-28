import { Router } from 'express';
import { HealthCheck } from '@warehouse/types';
import { createLogger } from '@warehouse/utils';

const router = Router();
const logger = createLogger('api-gateway-health');

const services = [
  { name: 'product-service', url: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001' },
  { name: 'inventory-service', url: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3002' },
  { name: 'order-service', url: process.env.ORDER_SERVICE_URL || 'http://localhost:3003' },
  { name: 'customer-service', url: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3004' },
  { name: 'reporting-service', url: process.env.REPORTING_SERVICE_URL || 'http://localhost:3005' },
  { name: 'alert-service', url: process.env.ALERT_SERVICE_URL || 'http://localhost:3006' }
];

const checkServiceHealth = async (serviceUrl: string): Promise<{
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  error?: string;
}> => {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${serviceUrl}/health`, {
      method: 'GET',
      timeout: 5000
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return { status: 'healthy', responseTime };
    } else {
      return { 
        status: 'unhealthy', 
        responseTime,
        error: `HTTP ${response.status}` 
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return { 
      status: 'unhealthy', 
      responseTime,
      error: error.message 
    };
  }
};

router.get('/', async (req, res) => {
  const healthCheck: HealthCheck = {
    status: 'healthy',
    timestamp: new Date(),
    service: 'api-gateway',
    version: '1.0.0',
    dependencies: {}
  };

  // Check all downstream services
  const serviceChecks = await Promise.all(
    services.map(async (service) => {
      const health = await checkServiceHealth(service.url);
      return { name: service.name, health };
    })
  );

  // Aggregate service health
  serviceChecks.forEach(({ name, health }) => {
    healthCheck.dependencies[name] = health;
    
    // If any critical service is down, mark gateway as unhealthy
    if (health.status === 'unhealthy') {
      healthCheck.status = 'unhealthy';
    }
  });

  const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
  
  logger.info('Health check performed', {
    status: healthCheck.status,
    unhealthyServices: serviceChecks
      .filter(({ health }) => health.status === 'unhealthy')
      .map(({ name }) => name)
  });

  res.status(statusCode).json(healthCheck);
});

router.get('/ready', (req, res) => {
  // Readiness probe - check if gateway is ready to serve traffic
  res.json({
    status: 'ready',
    timestamp: new Date(),
    service: 'api-gateway'
  });
});

router.get('/live', (req, res) => {
  // Liveness probe - check if gateway is alive
  res.json({
    status: 'alive',
    timestamp: new Date(),
    service: 'api-gateway'
  });
});

export { router as healthRouter };
