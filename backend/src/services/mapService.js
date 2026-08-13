import { ApiError } from '../utils/ApiError.js';

/**
 * Fetch real road-following directions between origin and destination.
 */
export async function getRoute({ origin_lat, origin_lng, dest_lat, dest_lng, profile = 'driving' }) {
  const originLat = parseFloat(origin_lat);
  const originLng = parseFloat(origin_lng);
  const destLat = parseFloat(dest_lat);
  const destLng = parseFloat(dest_lng);

  if (isNaN(originLat) || isNaN(originLng) || isNaN(destLat) || isNaN(destLng)) {
    throw ApiError.badRequest('Invalid geographic coordinates provided');
  }

  const mapboxToken = process.env.MAPBOX_TOKEN || process.env.VITE_MAPBOX_TOKEN;

  // 1. Try Mapbox Directions API if a valid public or secret Mapbox token is configured
  if (mapboxToken && mapboxToken.startsWith('pk.')) {
    try {
      const mapboxProfile = profile === 'walking' ? 'walking' : profile === 'cycling' ? 'cycling' : 'driving';
      const mapboxUrl = `https://api.mapbox.com/directions/v5/mapbox/${mapboxProfile}/${originLng},${originLat};${destLng},${destLat}?geometries=geojson&overview=full&steps=true&access_token=${mapboxToken}`;

      const res = await fetch(mapboxUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          return {
            distance_meters: Math.round(route.distance),
            distance_km: parseFloat((route.distance / 1000).toFixed(1)),
            duration_seconds: Math.round(route.duration),
            duration_minutes: Math.max(1, Math.round(route.duration / 60)),
            geometry: route.geometry, // Genuine road LineString
            profile,
            steps: (route.legs?.[0]?.steps || []).map((step) => ({
              instruction: step.maneuver?.instruction || `Continue on ${step.name || 'route'}`,
              distance_meters: Math.round(step.distance),
              duration_seconds: Math.round(step.duration),
              name: step.name || 'Local Street',
            })),
            is_fallback: false,
            provider: 'mapbox',
          };
        }
      }
    } catch (err) {
      console.warn('Mapbox Directions API exception, switching to road routing engine:', err.message);
    }
  }

  // 2. Real Road Routing Engine (OSRM / OpenStreetMap Real Streets)
  try {
    const osrmProfile = profile === 'walking' ? 'foot' : profile === 'cycling' ? 'bike' : 'driving';
    const osrmUrl = `https://router.project-osrm.org/route/v1/${osrmProfile}/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true`;

    const res = await fetch(osrmUrl, { headers: { 'User-Agent': 'Gaon2City-App/1.0' } });
    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const rawSteps = route.legs?.[0]?.steps || [];

        const formattedSteps = rawSteps.map((step) => {
          const mType = step.maneuver?.type || 'turn';
          const mMod = step.maneuver?.modifier || '';
          let instruction = `${mType} ${mMod}`.trim();
          if (step.name) {
            instruction = `${instruction ? instruction.charAt(0).toUpperCase() + instruction.slice(1) : 'Follow'} on ${step.name}`;
          } else {
            instruction = instruction ? instruction.charAt(0).toUpperCase() + instruction.slice(1) : 'Continue on road';
          }

          return {
            instruction,
            distance_meters: Math.round(step.distance),
            duration_seconds: Math.round(step.duration),
            name: step.name || 'Connecting Road',
          };
        });

        return {
          distance_meters: Math.round(route.distance),
          distance_km: parseFloat((route.distance / 1000).toFixed(1)),
          duration_seconds: Math.round(route.duration),
          duration_minutes: Math.max(1, Math.round(route.duration / 60)),
          geometry: route.geometry, // Genuine road-following LineString with hundreds of curve points
          profile,
          steps: formattedSteps.length > 0 ? formattedSteps : [
            { instruction: 'Start from origin location', distance_meters: 100, duration_seconds: 10, name: 'Start' },
            { instruction: `Follow road route to destination (${parseFloat((route.distance / 1000).toFixed(1))} km)`, distance_meters: Math.round(route.distance), duration_seconds: Math.round(route.duration), name: 'Main Road' },
            { instruction: 'Arrive at destination', distance_meters: 50, duration_seconds: 5, name: 'Arrival' }
          ],
          is_fallback: false,
          provider: 'osrm-real-road',
        };
      }
    }
  } catch (err) {
    console.warn('Real road routing engine exception:', err.message);
  }

  // 3. Fallback (Only in catastrophic network disconnect)
  const directDistanceMeters = Math.round(
    6371000 *
      2 *
      Math.atan2(
        Math.sqrt(
          Math.sin(((destLat - originLat) * Math.PI) / 360) ** 2 +
            Math.cos((originLat * Math.PI) / 180) *
              Math.cos((destLat * Math.PI) / 180) *
              Math.sin(((destLng - originLng) * Math.PI) / 360) ** 2
        ),
        Math.sqrt(
          1 -
            (Math.sin(((destLat - originLat) * Math.PI) / 360) ** 2 +
              Math.cos((originLat * Math.PI) / 180) *
                Math.cos((destLat * Math.PI) / 180) *
                Math.sin(((destLng - originLng) * Math.PI) / 360) ** 2)
        )
      )
  );

  const speed = profile === 'walking' ? 1.39 : profile === 'cycling' ? 4.17 : 11.11;
  const durationSeconds = Math.round(directDistanceMeters / speed);

  return {
    distance_meters: directDistanceMeters,
    distance_km: parseFloat((directDistanceMeters / 1000).toFixed(1)),
    duration_seconds: durationSeconds,
    duration_minutes: Math.max(1, Math.round(durationSeconds / 60)),
    geometry: {
      type: 'LineString',
      coordinates: [
        [originLng, originLat],
        [destLng, destLat],
      ],
    },
    profile,
    steps: [
      { instruction: 'Depart from origin', distance_meters: 0, duration_seconds: 0, name: 'Origin' },
      { instruction: 'Follow direct route to seller location', distance_meters: directDistanceMeters, duration_seconds: durationSeconds, name: 'Connecting Route' },
      { instruction: 'Arrive at destination', distance_meters: 0, duration_seconds: 0, name: 'Destination' },
    ],
    is_fallback: true,
    provider: 'direct-fallback',
  };
}

/**
 * Get client safe map configuration.
 */
export function getMapConfig() {
  const token = process.env.MAPBOX_TOKEN || process.env.VITE_MAPBOX_TOKEN || null;
  return {
    mapbox_token: token && token.startsWith('pk.') ? token : null,
    default_center: [77.2090, 28.6139], // [lng, lat]
    default_zoom: 12,
  };
}
