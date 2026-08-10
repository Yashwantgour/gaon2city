import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createReportValidators,
  reportIdValidator,
  updateReportValidators,
} from '../validators/reportValidators.js';
import * as reportsController from '../controllers/reportsController.js';

const router = Router();

// POST /api/reports — file a report (auth required)
router.post('/', authenticate, createReportValidators, validate, reportsController.createReport);

// GET /api/admin/reports — list reports (admin only)
router.get('/admin', authenticate, requireAdmin, reportsController.listReports);

// PATCH /api/admin/reports/:id — update report (admin only)
router.patch('/admin/:id', authenticate, requireAdmin, updateReportValidators, validate, reportsController.updateReport);

export default router;
