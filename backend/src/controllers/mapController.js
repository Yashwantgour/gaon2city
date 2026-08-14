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

/**
 * GET /api/map/geocode?q=...
 */
export async function geocode(req, res, next) {
  try {
    const results = await mapService.geocodeAddress(req.query.q);
    res.json(results);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/map/reverse?lat=...&lng=...
 */
export async function reverseGeocode(req, res, next) {
  try {
    const result = await mapService.reverseGeocode(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
