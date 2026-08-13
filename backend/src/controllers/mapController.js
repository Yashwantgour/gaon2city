import * as mapService from '../services/mapService.js';

/**
 * GET /api/map/route
 */
export async function getRoute(req, res, next) {
  try {
    const route = await mapService.getRoute(req.query);
    res.json(route);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/map/config
 */
export async function getMapConfig(req, res, next) {
  try {
    const config = mapService.getMapConfig();
    res.json(config);
  } catch (err) {
    next(err);
  }
}
