import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validateRequest = (schema: {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    if (schema.body) {
      const { error } = schema.body.validate(req.body);
      if (error) {
        errors.push(`Body: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    if (schema.query) {
      const { error } = schema.query.validate(req.query);
      if (error) {
        errors.push(`Query: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    if (schema.params) {
      const { error } = schema.params.validate(req.params);
      if (error) {
        errors.push(`Params: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors,
        timestamp: new Date()
      });
    }

    next();
  };
};

// Common validation schemas
export const commonSchemas = {
  id: Joi.string().uuid().required(),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  }),
  sort: Joi.object({
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc')
  })
};

export const productSchemas = {
  create: Joi.object({
    name: Joi.string().required().min(1).max(255),
    description: Joi.string().max(1000),
    sku: Joi.string().required().min(1).max(100),
    categoryId: Joi.string().uuid().required(),
    price: Joi.number().positive().required(),
    unit: Joi.string().required().min(1).max(50),
    isActive: Joi.boolean().default(true)
  }),
  update: Joi.object({
    name: Joi.string().min(1).max(255),
    description: Joi.string().max(1000),
    sku: Joi.string().min(1).max(100),
    categoryId: Joi.string().uuid(),
    price: Joi.number().positive(),
    unit: Joi.string().min(1).max(50),
    isActive: Joi.boolean()
  })
};

export const inventorySchemas = {
  create: Joi.object({
    productId: Joi.string().uuid().required(),
    quantity: Joi.number().integer().min(0).required(),
    minThreshold: Joi.number().integer().min(0).required(),
    maxThreshold: Joi.number().integer().min(0),
    location: Joi.string().required().min(1).max(255)
  }),
  update: Joi.object({
    quantity: Joi.number().integer().min(0),
    minThreshold: Joi.number().integer().min(0),
    maxThreshold: Joi.number().integer().min(0),
    location: Joi.string().min(1).max(255)
  }),
  stockMovement: Joi.object({
    productId: Joi.string().uuid().required(),
    type: Joi.string().valid('IN', 'OUT', 'ADJUSTMENT').required(),
    quantity: Joi.number().integer().positive().required(),
    reason: Joi.string().required().min(1).max(255),
    reference: Joi.string().max(255),
    performedBy: Joi.string().required().min(1).max(255)
  })
};

export const customerSchemas = {
  create: Joi.object({
    firstName: Joi.string().required().min(1).max(100),
    lastName: Joi.string().required().min(1).max(100),
    email: Joi.string().email().required(),
    phone: Joi.string().max(20),
    address: Joi.object({
      street: Joi.string().required().min(1).max(255),
      city: Joi.string().required().min(1).max(100),
      state: Joi.string().required().min(1).max(100),
      zipCode: Joi.string().required().min(1).max(20),
      country: Joi.string().required().min(1).max(100)
    }),
    isActive: Joi.boolean().default(true)
  }),
  update: Joi.object({
    firstName: Joi.string().min(1).max(100),
    lastName: Joi.string().min(1).max(100),
    email: Joi.string().email(),
    phone: Joi.string().max(20),
    address: Joi.object({
      street: Joi.string().min(1).max(255),
      city: Joi.string().min(1).max(100),
      state: Joi.string().min(1).max(100),
      zipCode: Joi.string().min(1).max(20),
      country: Joi.string().min(1).max(100)
    }),
    isActive: Joi.boolean()
  })
};

export const orderSchemas = {
  create: Joi.object({
    customerId: Joi.string().uuid().required(),
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().uuid().required(),
        quantity: Joi.number().integer().positive().required(),
        unitPrice: Joi.number().positive().required()
      })
    ).min(1).required(),
    shippingAddress: Joi.object({
      street: Joi.string().required().min(1).max(255),
      city: Joi.string().required().min(1).max(100),
      state: Joi.string().required().min(1).max(100),
      zipCode: Joi.string().required().min(1).max(20),
      country: Joi.string().required().min(1).max(100)
    }),
    billingAddress: Joi.object({
      street: Joi.string().required().min(1).max(255),
      city: Joi.string().required().min(1).max(100),
      state: Joi.string().required().min(1).max(100),
      zipCode: Joi.string().required().min(1).max(20),
      country: Joi.string().required().min(1).max(100)
    }),
    notes: Joi.string().max(1000)
  })
};
