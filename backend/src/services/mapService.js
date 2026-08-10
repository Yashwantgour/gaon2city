import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

/**
 * Map service — server-side Mapbox proxy.
 * Keeps Mapbox token server-side so it's never exposed to the browser.
 */

/**
 * Get route/directions between two points via Mapbox Directions API.
 */
export async function getRoute({ originLat, originLng, destLat, destLng, profile = 'driving' }) {
  const token = process.env.MAPBOX_TOKEN;

  if (!token) {
    throw ApiError.internal('Mapbox token not configured');
  }

  const validProfiles = ['driving', 'walking', 'cycling', 'driving-traffic'];
  if (!validProfiles.includes(profile)) {
    throw ApiError.badRequest('Invalid travel profile');
  }

  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${originLng},${originLat};${destLng},${destLat}?access_token=${token}&geometries=geojson&overview=full&steps=true`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.code !== 'Ok') {
      logger.error('Mapbox API error:', data.message || 'Unknown error');
      throw ApiError.internal('Failed to fetch route');
    }

    const route = data.routes[0];

    return {
      distance: route.distance, // meters
      duration: route.duration, // seconds
      geometry: route.geometry,
      steps: route.legs[0]?.steps || [],
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    logger.error('Mapbox fetch error:', err.message);
    throw ApiError.internal('Failed to connect to Mapbox');
  }
}
