import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { routeValidators } from '../validators/mapValidators.js';
import * as mapController from '../controllers/mapController.js';

const router = Router();

// GET /api/map/route
router.get('/route', routeValidators, validate, mapController.getRoute);

// GET /api/map/config
router.get('/config', mapController.getMapConfig);

export default router;
