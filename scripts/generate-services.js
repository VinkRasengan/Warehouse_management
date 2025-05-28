#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const services = [
  {
    name: 'customer-service',
    port: 3004,
    dbPort: 5435,
    dbName: 'customer_db',
    description: 'Customer management microservice'
  },
  {
    name: 'reporting-service', 
    port: 3005,
    dbPort: 5436,
    dbName: 'reporting_db',
    description: 'Analytics and reporting microservice'
  },
  {
    name: 'alert-service',
    port: 3006,
    dbPort: 5437,
    dbName: 'alert_db',
    description: 'Notification and alert microservice'
  }
];

function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeFile(filePath, content) {
  createDirectory(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
  console.log(`Created: ${filePath}`);
}

function generatePackageJson(service) {
  return `{
  "name": "@warehouse/${service.name}",
  "version": "1.0.0",
  "description": "${service.description}",
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix"
  },
  "dependencies": {
    "@warehouse/types": "^1.0.0",
    "@warehouse/utils": "^1.0.0",
    "express": "^4.18.2",
    "pg": "^8.11.1",
    "typeorm": "^0.3.17",
    "reflect-metadata": "^0.1.13",
    "dotenv": "^16.3.1",
    "helmet": "^7.0.0",
    "cors": "^2.8.5",
    "compression": "^1.7.4",
    "morgan": "^1.10.0"${service.name === 'alert-service' ? ',\n    "nodemailer": "^6.9.4"' : ''}
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/pg": "^8.10.2",
    "@types/cors": "^2.8.13",
    "@types/compression": "^1.7.2",
    "@types/morgan": "^1.9.4",
    "@types/node": "^20.0.0",${service.name === 'alert-service' ? '\n    "@types/nodemailer": "^6.4.9",' : ''}
    "nodemon": "^3.0.1",
    "ts-node": "^10.9.1",
    "typescript": "^5.1.0",
    "jest": "^29.6.1",
    "@types/jest": "^29.5.3",
    "ts-jest": "^29.1.1"
  }
}`;
}

function generateIndexTs(service) {
  const serviceName = service.name.replace('-', '');
  return `import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createLogger, messageQueue } from '@warehouse/utils';
import { AppDataSource } from './config/database';
import { healthRouter } from './routes/health';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || ${service.port};
const logger = createLogger('${service.name}');

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', healthRouter);

// Default route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '${service.description}',
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
      logger.info(\`${service.description} running on port \${PORT}\`);
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

export default app;`;
}

function generateDatabaseConfig(service) {
  return `import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '${service.dbPort}'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || '${service.dbName}',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: ['src/entities/*.ts'],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
});`;
}

function generateHealthRoute(service) {
  return `import { Router } from 'express';
import { HealthCheck } from '@warehouse/types';
import { createLogger } from '@warehouse/utils';
import { AppDataSource } from '../config/database';

const router = Router();
const logger = createLogger('${service.name}-health');

router.get('/', async (req, res) => {
  const healthCheck: HealthCheck = {
    status: 'healthy',
    timestamp: new Date(),
    service: '${service.name}',
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

  const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

router.get('/ready', (req, res) => {
  res.json({
    status: 'ready',
    timestamp: new Date(),
    service: '${service.name}'
  });
});

router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date(),
    service: '${service.name}'
  });
});

export { router as healthRouter };`;
}

function generateErrorHandler(service) {
  return `import { Request, Response, NextFunction } from 'express';
import { createLogger } from '@warehouse/utils';

const logger = createLogger('${service.name}-error');

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    correlationId: req.headers['x-correlation-id']
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: isDevelopment ? error.message : 'Something went wrong',
    timestamp: new Date(),
    correlationId: req.headers['x-correlation-id']
  });
};`;
}

function generateTsConfig() {
  return `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}`;
}

function generateDockerfile(service) {
  return `# Multi-stage build for ${service.description}
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY services/${service.name}/package*.json ./services/${service.name}/
COPY shared/ ./shared/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY services/${service.name}/src ./services/${service.name}/src
COPY services/${service.name}/tsconfig.json ./services/${service.name}/

# Build shared libraries
WORKDIR /app/shared/types
RUN npm ci && npm run build

WORKDIR /app/shared/utils
RUN npm ci && npm run build

# Build ${service.description}
WORKDIR /app/services/${service.name}
RUN npm ci && npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/services/${service.name}/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/services/${service.name}/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/shared ./shared

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Create logs directory
RUN mkdir -p logs && chown nodejs:nodejs logs

USER nodejs

EXPOSE ${service.port}

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:${service.port}/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/index.js"]`;
}

// Generate all services
services.forEach(service => {
  const serviceDir = `services/${service.name}`;
  
  // Create basic structure
  writeFile(`${serviceDir}/package.json`, generatePackageJson(service));
  writeFile(`${serviceDir}/src/index.ts`, generateIndexTs(service));
  writeFile(`${serviceDir}/src/config/database.ts`, generateDatabaseConfig(service));
  writeFile(`${serviceDir}/src/routes/health.ts`, generateHealthRoute(service));
  writeFile(`${serviceDir}/src/middleware/errorHandler.ts`, generateErrorHandler(service));
  writeFile(`${serviceDir}/tsconfig.json`, generateTsConfig());
  writeFile(`${serviceDir}/Dockerfile`, generateDockerfile(service));
  
  console.log(`✅ Generated ${service.name}`);
});

console.log('\\n🎉 All services generated successfully!');
console.log('\\nNext steps:');
console.log('1. Run: npm run install:all');
console.log('2. Add specific entities and business logic for each service');
console.log('3. Update docker-compose.yml if needed');
console.log('4. Test the services: npm run dev');`;
}

module.exports = { services, generatePackageJson, generateIndexTs };

// Run if called directly
if (require.main === module) {
  // Execute the generation
  eval(fs.readFileSync(__filename, 'utf8').split('module.exports')[0]);
}
