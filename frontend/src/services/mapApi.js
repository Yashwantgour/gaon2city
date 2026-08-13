import api from './api';

/**
 * Fetch directions and route between origin and destination coordinates.
 */
export async function getRoute({ origin_lat, origin_lng, dest_lat, dest_lng, profile = 'driving' }) {
  return await api.get('/map/route', {
    params: {
      origin_lat,
      origin_lng,
      dest_lat,
      dest_lng,
      profile,
    },
  });
}

/**
 * Fetch map configuration.
 */
export async function getMapConfig() {
  return await api.get('/map/config');
}
