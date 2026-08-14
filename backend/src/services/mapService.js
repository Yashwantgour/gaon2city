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
 * Geocode query to list of matching locations with lat/lng.
 */
export async function geocodeAddress(query) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return [];
  }

  const cleanQuery = query.trim();
  const mapboxToken = process.env.MAPBOX_TOKEN || process.env.VITE_MAPBOX_TOKEN;

  // 1. Try Mapbox Geocoding API if configured
  if (mapboxToken && mapboxToken !== 'placeholder_mapbox_token' && mapboxToken.startsWith('pk.')) {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cleanQuery)}.json?country=IN&types=country,region,postcode,district,place,locality,neighborhood,address,poi&access_token=${mapboxToken}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          return data.features.map((f) => {
            const context = f.context || [];
            const postcode = context.find((c) => c.id.startsWith('postcode'))?.text || '';
            const district = context.find((c) => c.id.startsWith('district'))?.text || '';
            const region = context.find((c) => c.id.startsWith('region'))?.text || '';
            return {
              id: f.id,
              name: f.text || f.place_name.split(',')[0],
              formatted_address: f.place_name,
              latitude: f.center[1],
              longitude: f.center[0],
              locality: f.text,
              city: district || f.text,
              state: region,
              pincode: postcode,
            };
          });
        }
      }
    } catch (err) {
      console.warn('Mapbox Geocoding failed, falling back to Nominatim:', err.message);
    }
  }

  // 2. High-precision OpenStreetMap Nominatim for India
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanQuery)}&format=json&countrycodes=in&addressdetails=1&limit=6`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Gaon2City-Marketplace/1.0 (contact@gaon2city.in)' },
    });
    if (res.ok) {
      const data = await res.json();
      return data.map((item) => {
        const addr = item.address || {};
        const locality = addr.village || addr.suburb || addr.neighbourhood || addr.town || addr.city || item.name;
        const city = addr.city || addr.town || addr.county || addr.city_district || addr.state_district || locality;
        const district = addr.state_district || addr.county || city;
        const state = addr.state || '';
        const pincode = addr.postcode || '';

        return {
          id: String(item.osm_id || item.place_id),
          name: locality || item.name || item.display_name.split(',')[0],
          formatted_address: item.display_name,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          locality,
          city,
          district,
          state,
          pincode,
        };
      });
    }
  } catch (err) {
    console.error('Nominatim Geocoding error:', err.message);
  }

  return [];
}

/**
 * Reverse geocode latitude and longitude to address details.
 */
export async function reverseGeocode({ lat, lng }) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new ApiError(400, 'Valid latitude and longitude required');
  }

  const mapboxToken = process.env.MAPBOX_TOKEN || process.env.VITE_MAPBOX_TOKEN;

  // 1. Try Mapbox Reverse Geocoding
  if (mapboxToken && mapboxToken !== 'placeholder_mapbox_token' && mapboxToken.startsWith('pk.')) {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          const f = data.features[0];
          const context = f.context || [];
          const postcode = context.find((c) => c.id.startsWith('postcode'))?.text || '';
          const district = context.find((c) => c.id.startsWith('district'))?.text || '';
          const region = context.find((c) => c.id.startsWith('region'))?.text || '';
          return {
            name: f.text || f.place_name.split(',')[0],
            formatted_address: f.place_name,
            latitude,
            longitude,
            locality: f.text,
            city: district || f.text,
            state: region,
            pincode: postcode,
          };
        }
      }
    } catch (err) {
      console.warn('Mapbox Reverse Geocoding failed, falling back to Nominatim:', err.message);
    }
  }

  // 2. OpenStreetMap Nominatim Reverse Geocoding
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Gaon2City-Marketplace/1.0 (contact@gaon2city.in)' },
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const locality = addr.village || addr.suburb || addr.neighbourhood || addr.town || addr.city || 'Current Location';
      const city = addr.city || addr.town || addr.county || addr.city_district || addr.state_district || locality;
      const district = addr.state_district || addr.county || city;
      const state = addr.state || '';
      const pincode = addr.postcode || '';

      return {
        name: locality,
        formatted_address: data.display_name,
        latitude,
        longitude,
        locality,
        city,
        district,
        state,
        pincode,
      };
    }
  } catch (err) {
    console.error('Nominatim Reverse Geocoding error:', err.message);
  }

  return {
    name: 'Current Location',
    formatted_address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    latitude,
    longitude,
    locality: 'Current Location',
    city: '',
    district: '',
    state: '',
    pincode: '',
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
