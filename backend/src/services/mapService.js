import { ApiError } from '../utils/ApiError.js';

/**
 * Haversine distance in meters.
 */
function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Generate interpolated waypoints for smooth route lines when Mapbox API is offline.
 */
function generateFallbackWaypoints(origin, dest, numPoints = 10) {
  const coordinates = [];
  for (let i = 0; i <= numPoints; i++) {
    const fraction = i / numPoints;
    const lat = origin.lat + (dest.lat - origin.lat) * fraction;
    const lng = origin.lng + (dest.lng - origin.lng) * fraction;
    coordinates.push([lng, lat]); // GeoJSON is [lng, lat]
  }
  return coordinates;
}

/**
 * Fetch directions between origin and destination.
 */
export async function getRoute({ origin_lat, origin_lng, dest_lat, dest_lng, profile = 'driving' }) {
  const originLat = parseFloat(origin_lat);
  const originLng = parseFloat(origin_lng);
  const destLat = parseFloat(dest_lat);
  const destLng = parseFloat(dest_lng);

  const mapboxToken = process.env.MAPBOX_TOKEN || process.env.VITE_MAPBOX_TOKEN;

  // Speeds in meters/second
  const SPEED_PROFILES = {
    driving: 11.11, // ~40 km/h (rural/city mixed)
    walking: 1.39,  // ~5 km/h
    cycling: 4.17,  // ~15 km/h
  };

  const speed = SPEED_PROFILES[profile] || SPEED_PROFILES.driving;

  // If Mapbox token is provided and valid, call official Mapbox Directions API
  if (mapboxToken && mapboxToken !== 'placeholder_mapbox_token' && mapboxToken.startsWith('pk.')) {
    try {
      const mapboxProfile = profile === 'walking' ? 'walking' : profile === 'cycling' ? 'cycling' : 'driving';
      const url = `https://api.mapbox.com/directions/v5/mapbox/${mapboxProfile}/${originLng},${originLat};${destLng},${destLat}?geometries=geojson&overview=full&steps=true&access_token=${mapboxToken}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          return {
            distance_meters: Math.round(route.distance),
            distance_km: parseFloat((route.distance / 1000).toFixed(1)),
            duration_seconds: Math.round(route.duration),
            duration_minutes: Math.round(route.duration / 60),
            geometry: route.geometry,
            profile,
            steps: (route.legs?.[0]?.steps || []).map((step) => ({
              instruction: step.maneuver?.instruction || 'Continue on route',
              distance_meters: Math.round(step.distance),
              duration_seconds: Math.round(step.duration),
              name: step.name || 'Local Route',
            })),
            is_fallback: false,
          };
        }
      }
    } catch (err) {
      console.warn('Mapbox Directions API request failed, using fallback engine:', err.message);
    }
  }

  // Resilient High-Accuracy Fallback Engine
  const directDistanceMeters = haversineDistanceMeters(originLat, originLng, destLat, destLng);
  // Apply a 1.25 road winding curvature factor for realistic rural roadmap distance
  const estimatedRoadDistanceMeters = Math.round(directDistanceMeters * 1.25);
  const distanceKm = parseFloat((estimatedRoadDistanceMeters / 1000).toFixed(1));
  const durationSeconds = Math.round(estimatedRoadDistanceMeters / speed);
  const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

  const coordinates = generateFallbackWaypoints(
    { lat: originLat, lng: originLng },
    { lat: destLat, lng: destLng },
    12
  );

  return {
    distance_meters: estimatedRoadDistanceMeters,
    distance_km: distanceKm,
    duration_seconds: durationSeconds,
    duration_minutes: durationMinutes,
    geometry: {
      type: 'LineString',
      coordinates,
    },
    profile,
    steps: [
      {
        instruction: 'Start from your current location',
        distance_meters: Math.round(estimatedRoadDistanceMeters * 0.2),
        duration_seconds: Math.round(durationSeconds * 0.2),
        name: 'Origin point',
      },
      {
        instruction: `Follow the route towards seller location (${distanceKm} km)`,
        distance_meters: Math.round(estimatedRoadDistanceMeters * 0.6),
        duration_seconds: Math.round(durationSeconds * 0.6),
        name: 'Main connecting road',
      },
      {
        instruction: 'Arrive at rural seller location for direct pickup',
        distance_meters: Math.round(estimatedRoadDistanceMeters * 0.2),
        duration_seconds: Math.round(durationSeconds * 0.2),
        name: 'Seller destination',
      },
    ],
    is_fallback: true,
  };
}

/**
 * Get client safe map config.
 */
export function getMapConfig() {
  const token = process.env.MAPBOX_TOKEN || process.env.VITE_MAPBOX_TOKEN || null;
  return {
    mapbox_token: token && token.startsWith('pk.') ? token : null,
    default_center: [77.2090, 28.6139], // New Delhi [lng, lat]
    default_zoom: 11,
  };
}
