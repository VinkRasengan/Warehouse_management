import { Request, Response, NextFunction } from 'express';
import { createLogger } from '@warehouse/utils';

const logger = createLogger('api-gateway-error');

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
};
