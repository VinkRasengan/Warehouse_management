import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { validateRequest, commonSchemas } from '@warehouse/utils';

const router = Router();
const categoryController = new CategoryController();

// GET /categories - Get all categories
router.get('/', categoryController.getCategories.bind(categoryController));

// GET /categories/:id - Get category by ID
router.get('/:id',
  validateRequest({
    params: require('joi').object({
      id: commonSchemas.id
    })
  }),
  categoryController.getCategoryById.bind(categoryController)
);

// POST /categories - Create new category
router.post('/',
  validateRequest({
    body: require('joi').object({
      name: require('joi').string().required().min(1).max(255),
      description: require('joi').string().max(1000),
      parentId: require('joi').string().uuid()
    })
  }),
  categoryController.createCategory.bind(categoryController)
);

export { router as categoryRouter };
