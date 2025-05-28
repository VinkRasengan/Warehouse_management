import { Router } from 'express';
import { CustomerController } from '../controllers/CustomerController';
import { validateRequest, customerSchemas, commonSchemas } from '@warehouse/utils';

const router = Router();
const customerController = new CustomerController();

// GET /customers - Get all customers
router.get('/', 
  validateRequest({
    query: commonSchemas.pagination.concat(commonSchemas.sort).keys({
      search: require('joi').string().min(1).max(255),
      isActive: require('joi').boolean()
    })
  }),
  customerController.getCustomers.bind(customerController)
);

// GET /customers/:id - Get customer by ID
router.get('/:id',
  validateRequest({
    params: require('joi').object({
      id: commonSchemas.id
    })
  }),
  customerController.getCustomerById.bind(customerController)
);

// POST /customers - Create new customer
router.post('/',
  validateRequest({
    body: customerSchemas.create
  }),
  customerController.createCustomer.bind(customerController)
);

// PUT /customers/:id - Update customer
router.put('/:id',
  validateRequest({
    params: require('joi').object({
      id: commonSchemas.id
    }),
    body: customerSchemas.update
  }),
  customerController.updateCustomer.bind(customerController)
);

// DELETE /customers/:id - Delete customer
router.delete('/:id',
  validateRequest({
    params: require('joi').object({
      id: commonSchemas.id
    })
  }),
  customerController.deleteCustomer.bind(customerController)
);

export { router as customerRouter };
