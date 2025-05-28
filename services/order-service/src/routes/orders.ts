import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { validateRequest, orderSchemas, commonSchemas } from '@warehouse/utils';

const router = Router();
const orderController = new OrderController();

// GET /orders - Get all orders
router.get('/', 
  validateRequest({
    query: commonSchemas.pagination.concat(commonSchemas.sort).keys({
      customerId: require('joi').string().uuid(),
      status: require('joi').string().valid('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'),
      paymentStatus: require('joi').string().valid('PENDING', 'PAID', 'FAILED', 'REFUNDED')
    })
  }),
  orderController.getOrders.bind(orderController)
);

// GET /orders/:id - Get order by ID
router.get('/:id',
  validateRequest({
    params: require('joi').object({
      id: commonSchemas.id
    })
  }),
  orderController.getOrderById.bind(orderController)
);

// POST /orders - Create new order
router.post('/',
  validateRequest({
    body: orderSchemas.create
  }),
  orderController.createOrder.bind(orderController)
);

// PUT /orders/:id/status - Update order status
router.put('/:id/status',
  validateRequest({
    params: require('joi').object({
      id: commonSchemas.id
    }),
    body: require('joi').object({
      status: require('joi').string().valid('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED').required()
    })
  }),
  orderController.updateOrderStatus.bind(orderController)
);

export { router as orderRouter };
