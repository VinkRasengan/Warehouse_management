import { Router } from 'express';
import { InventoryController } from '../controllers/InventoryController';
import { validateRequest, inventorySchemas, commonSchemas } from '@warehouse/utils';

const router = Router();
const inventoryController = new InventoryController();

// GET /movements - Get all stock movements with pagination and filtering
router.get('/', 
  validateRequest({
    query: commonSchemas.pagination.concat(commonSchemas.sort).keys({
      productId: require('joi').string().uuid(),
      type: require('joi').string().valid('IN', 'OUT', 'ADJUSTMENT')
    })
  }),
  inventoryController.getStockMovements.bind(inventoryController)
);

// POST /movements - Record new stock movement
router.post('/',
  validateRequest({
    body: inventorySchemas.stockMovement
  }),
  inventoryController.recordStockMovement.bind(inventoryController)
);

export { router as movementRouter };
