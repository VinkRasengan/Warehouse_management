import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { validateRequest, productSchemas, commonSchemas } from '@warehouse/utils';

const router = Router();
const productController = new ProductController();

// GET /products - Get all products with pagination and filtering
router.get('/', 
  validateRequest({
    query: commonSchemas.pagination.concat(commonSchemas.sort).keys({
      categoryId: require('joi').string().uuid(),
      isActive: require('joi').boolean(),
      search: require('joi').string().min(1).max(255)
    })
  }),
  productController.getProducts.bind(productController)
);

// GET /products/:id - Get product by ID
router.get('/:id',
  validateRequest({
    params: require('joi').object({
      id: commonSchemas.id
    })
  }),
  productController.getProductById.bind(productController)
);

// POST /products - Create new product
router.post('/',
  validateRequest({
    body: productSchemas.create
  }),
  productController.createProduct.bind(productController)
);

// PUT /products/:id - Update product
router.put('/:id',
  validateRequest({
    params: require('joi').object({
      id: commonSchemas.id
    }),
    body: productSchemas.update
  }),
  productController.updateProduct.bind(productController)
);

// DELETE /products/:id - Delete product
router.delete('/:id',
  validateRequest({
    params: require('joi').object({
      id: commonSchemas.id
    })
  }),
  productController.deleteProduct.bind(productController)
);

// GET /products/sku/:sku - Get product by SKU
router.get('/sku/:sku',
  validateRequest({
    params: require('joi').object({
      sku: require('joi').string().required()
    })
  }),
  productController.getProductBySku.bind(productController)
);

export { router as productRouter };
