import * as mapService from '../services/mapService.js';

/**
 * GET /api/map/route
 */
export async function getRoute(req, res, next) {
  try {
    const result = await mapService.getRoute({
      originLat: req.query.originLat,
      originLng: req.query.originLng,
      destLat: req.query.destLat,
      destLng: req.query.destLng,
      profile: req.query.profile,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}
