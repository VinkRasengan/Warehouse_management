import { Router } from 'express';
import { ReportingController } from '../controllers/ReportingController';

const router = Router();
const reportingController = new ReportingController();

// GET /reports/sales - Sales report
router.get('/sales', reportingController.getSalesReport.bind(reportingController));

// GET /reports/inventory - Inventory report
router.get('/inventory', reportingController.getInventoryReport.bind(reportingController));

// GET /reports/top-products - Top products report
router.get('/top-products', reportingController.getTopProducts.bind(reportingController));

// GET /reports/customers - Customer report
router.get('/customers', reportingController.getCustomerReport.bind(reportingController));

export { router as reportsRouter };
