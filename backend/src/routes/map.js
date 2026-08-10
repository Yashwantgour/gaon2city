import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as mapController from '../controllers/mapController.js';

const router = Router();

// GET /api/map/route — get directions between two points (auth required)
// Proxies to Mapbox Directions API so the token stays server-side
router.get('/route', authenticate, mapController.getRoute);

export default router;
