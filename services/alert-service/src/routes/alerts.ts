import { Router } from 'express';
import { AlertController } from '../controllers/AlertController';
import { validateRequest, commonSchemas } from '@warehouse/utils';

const router = Router();
const alertController = new AlertController();

// GET /alerts - Get all alerts
router.get('/', 
  validateRequest({
    query: commonSchemas.pagination.concat(commonSchemas.sort).keys({
      type: require('joi').string().valid('LOW_STOCK', 'OUT_OF_STOCK', 'SYSTEM_ERROR', 'ORDER_ISSUE'),
      severity: require('joi').string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
      isRead: require('joi').boolean(),
      isResolved: require('joi').boolean()
    })
  }),
  alertController.getAlerts.bind(alertController)
);

// PUT /alerts/:id/read - Mark alert as read
router.put('/:id/read',
  validateRequest({
    params: require('joi').object({
      id: commonSchemas.id
    })
  }),
  alertController.markAsRead.bind(alertController)
);

// PUT /alerts/:id/resolve - Resolve alert
router.put('/:id/resolve',
  validateRequest({
    params: require('joi').object({
      id: commonSchemas.id
    }),
    body: require('joi').object({
      resolvedBy: require('joi').string().required().min(1).max(255)
    })
  }),
  alertController.resolveAlert.bind(alertController)
);

export { router as alertsRouter };
