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

/**
 * Search locations by area, street, city, or pincode.
 */
export async function geocodeAddress(query) {
  if (!query || !query.trim()) return [];
  return await api.get('/map/geocode', {
    params: { q: query.trim() },
  });
}

/**
 * Reverse geocode latitude and longitude into address breakdown.
 */
export async function reverseGeocode({ lat, lng }) {
  return await api.get('/map/reverse', {
    params: { lat, lng },
  });
}
