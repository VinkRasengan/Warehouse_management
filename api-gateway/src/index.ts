import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import { createLogger } from '@warehouse/utils';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const logger = createLogger('api-gateway');

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.use('/health', healthRouter);

// Service proxy configurations
const services = {
  product: {
    target: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001',
    pathRewrite: { '^/api/products': '' }
  },
  inventory: {
    target: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3002',
    pathRewrite: { '^/api/inventory': '' }
  },
  order: {
    target: process.env.ORDER_SERVICE_URL || 'http://localhost:3003',
    pathRewrite: { '^/api/orders': '' }
  },
  customer: {
    target: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3004',
    pathRewrite: { '^/api/customers': '' }
  },
  reporting: {
    target: process.env.REPORTING_SERVICE_URL || 'http://localhost:3005',
    pathRewrite: { '^/api/reports': '' }
  },
  alert: {
    target: process.env.ALERT_SERVICE_URL || 'http://localhost:3006',
    pathRewrite: { '^/api/alerts': '' }
  }
};

// Create proxy middleware for each service
Object.entries(services).forEach(([serviceName, config]) => {
  const proxyMiddleware = createProxyMiddleware({
    target: config.target,
    changeOrigin: true,
    pathRewrite: config.pathRewrite,
    onError: (err, req, res) => {
      logger.error(`Proxy error for ${serviceName}:`, err);
      res.status(503).json({
        success: false,
        error: `Service ${serviceName} is currently unavailable`,
        timestamp: new Date()
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add correlation ID for tracing
      const correlationId = req.headers['x-correlation-id'] || 
        require('uuid').v4();
      proxyReq.setHeader('x-correlation-id', correlationId);
      
      // Add user info from JWT if available
      if (req.user) {
        proxyReq.setHeader('x-user-id', req.user.id);
        proxyReq.setHeader('x-user-role', req.user.role);
      }
      
      logger.info(`Proxying ${req.method} ${req.path} to ${serviceName}`, {
        correlationId,
        userId: req.user?.id
      });
    }
  });

  // Apply authentication middleware before proxying
  const routePath = `/api/${serviceName === 'product' ? 'products' : 
                           serviceName === 'inventory' ? 'inventory' :
                           serviceName === 'order' ? 'orders' :
                           serviceName === 'customer' ? 'customers' :
                           serviceName === 'reporting' ? 'reports' : 'alerts'}`;
  
  app.use(routePath, authMiddleware, proxyMiddleware);
});

// Default route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Warehouse Management API Gateway',
    version: '1.0.0',
    timestamp: new Date(),
    services: Object.keys(services)
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    timestamp: new Date()
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info('Available services:', Object.keys(services));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
