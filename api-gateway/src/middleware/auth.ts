import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createLogger } from '@warehouse/utils';

const logger = createLogger('api-gateway-auth');

interface JWTPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip auth for health checks and public endpoints
  if (req.path.includes('/health') || req.path.includes('/docs')) {
    return next();
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token is required',
      timestamp: new Date()
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as JWTPayload;
    
    req.user = decoded;
    
    logger.info('User authenticated', {
      userId: decoded.id,
      role: decoded.role,
      path: req.path
    });
    
    next();
  } catch (error) {
    logger.warn('Authentication failed', {
      error: error.message,
      path: req.path,
      ip: req.ip
    });
    
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
      timestamp: new Date()
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date()
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Insufficient permissions', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path
      });
      
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        timestamp: new Date()
      });
    }

    next();
  };
};

// Generate JWT token (for testing purposes)
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.sign(payload, secret, { expiresIn: '24h' });
};
