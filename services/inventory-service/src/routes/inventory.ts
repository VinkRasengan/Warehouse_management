import { Router } from 'express';
import { InventoryController } from '../controllers/InventoryController';
import { validateRequest, inventorySchemas, commonSchemas } from '@warehouse/utils';

const router = Router();
const inventoryController = new InventoryController();

// GET /inventory - Get all inventory items with pagination and filtering
router.get('/', 
  validateRequest({
    query: commonSchemas.pagination.concat(commonSchemas.sort).keys({
      productId: require('joi').string().uuid(),
      location: require('joi').string().min(1).max(255),
      lowStock: require('joi').boolean()
    })
  }),
  inventoryController.getInventoryItems.bind(inventoryController)
);

// GET /inventory/:id - Get inventory item by ID
router.get('/:id',
  validateRequest({
    params: require('joi').object({
      id: commonSchemas.id
    })
  }),
  inventoryController.getInventoryById.bind(inventoryController)
);

// GET /inventory/product/:productId - Get inventory by product ID
router.get('/product/:productId',
  validateRequest({
    params: require('joi').object({
      productId: commonSchemas.id
    })
  }),
  inventoryController.getInventoryByProductId.bind(inventoryController)
);

// POST /inventory - Create new inventory item
router.post('/',
  validateRequest({
    body: inventorySchemas.create
  }),
  inventoryController.createInventoryItem.bind(inventoryController)
);

// PUT /inventory/:id - Update inventory item
router.put('/:id',
  validateRequest({
    params: require('joi').object({
      id: commonSchemas.id
    }),
    body: inventorySchemas.update
  }),
  inventoryController.updateInventoryItem.bind(inventoryController)
);

// GET /inventory/check/:productId - Check stock availability
router.get('/check/:productId',
  validateRequest({
    params: require('joi').object({
      productId: commonSchemas.id
    }),
    query: require('joi').object({
      quantity: require('joi').number().integer().positive().required()
    })
  }),
  inventoryController.checkStock.bind(inventoryController)
);

// POST /inventory/reserve - Reserve stock
router.post('/reserve',
  validateRequest({
    body: require('joi').object({
      productId: commonSchemas.id,
      quantity: require('joi').number().integer().positive().required(),
      reference: require('joi').string().required().min(1).max(255)
    })
  }),
  inventoryController.reserveStock.bind(inventoryController)
);

export { router as inventoryRouter };
