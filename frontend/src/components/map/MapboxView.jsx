import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getMapConfig } from '../../services/mapApi';

export default function MapboxView({
  origin = { lat: 28.6139, lng: 77.2090, label: 'Your Location' },
  destination = { lat: 28.7041, lng: 77.1025, label: 'Seller Location' },
  routeGeometry,
  className = '',
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const originMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  // Initialize Mapbox GL Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      try {
        let token = import.meta.env.VITE_MAPBOX_TOKEN;
        if (!token || !token.startsWith('pk.')) {
          const config = await getMapConfig();
          if (config?.mapbox_token) {
            token = config.mapbox_token;
          }
        }

        // Determine map style: Mapbox streets if token is present, otherwise CartoDB / OSM real streets style
        let mapStyle;
        if (token && token.startsWith('pk.')) {
          mapboxgl.accessToken = token;
          mapStyle = 'mapbox://styles/mapbox/streets-v12';
        } else {
          // Standard client-safe real road geographic tile style
          mapboxgl.accessToken = 'pk.eyJ1IjoicGxhY2Vob2xkZXIiLCJhIjoiY2xwbGFjZWhvbGRlciJ9.placeholder';
          mapStyle = {
            version: 8,
            sources: {
              'osm-tiles': {
                type: 'raster',
                tiles: [
                  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                ],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors',
              },
            },
            layers: [
              {
                id: 'osm-tiles-layer',
                type: 'raster',
                source: 'osm-tiles',
                minzoom: 0,
                maxzoom: 19,
              },
            ],
          };
        }

        if (!mapContainerRef.current) return;

        // Clean up previous map if exists
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: mapStyle,
          center: [origin.lng, origin.lat],
          zoom: 12,
          attributionControl: true,
        });

        // Add native Mapbox navigation controls (zoom in, zoom out, compass/bearing)
        map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');

        map.on('load', () => {
          if (!isMounted) return;
          mapRef.current = map;
          setMapLoaded(true);
        });

        map.on('error', (e) => {
          // Ignore non-fatal tile errors
          if (e?.error?.status !== 401 && e?.error?.status !== 403) {
            console.warn('Mapbox non-fatal event:', e);
          }
        });
      } catch (err) {
        console.error('Failed to initialize Mapbox:', err);
        if (isMounted) setMapError('Unable to initialize map view.');
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Markers and Route Layer whenever origin, destination, or routeGeometry changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // 1. Create or Update Origin Marker (Buyer)
    if (!originMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'custom-buyer-marker flex flex-col items-center cursor-pointer';
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-full bg-sky-400/30 animate-ping absolute"></div>
          <div class="w-5 h-5 rounded-full bg-sky-600 border-2 border-white shadow-md flex items-center justify-center">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
        </div>
        <div class="px-2 py-0.5 mt-1 bg-slate-900 text-sky-400 text-[10px] font-bold rounded-md shadow-md border border-sky-400/40 whitespace-nowrap">
          You
        </div>
      `;
      originMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([origin.lng, origin.lat])
        .addTo(map);
    } else {
      originMarkerRef.current.setLngLat([origin.lng, origin.lat]);
    }

    // 2. Create or Update Destination Marker (Seller)
    if (!destMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'custom-seller-marker flex flex-col items-center cursor-pointer';
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="w-9 h-9 rounded-full bg-emerald-400/30 animate-pulse absolute"></div>
          <div class="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">
            🏪
          </div>
        </div>
        <div class="px-2.5 py-0.5 mt-1 bg-slate-900 text-emerald-400 text-[10px] font-bold rounded-md shadow-md border border-emerald-400/40 whitespace-nowrap">
          Seller
        </div>
      `;
      destMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([destination.lng, destination.lat])
        .addTo(map);
    } else {
      destMarkerRef.current.setLngLat([destination.lng, destination.lat]);
    }

    // 3. Render Real Road-Following Route Polyline
    const coordinates = routeGeometry?.coordinates?.length
      ? routeGeometry.coordinates
      : [
          [origin.lng, origin.lat],
          [destination.lng, destination.lat],
        ];

    const geojsonData = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates,
      },
    };

    if (map.getSource('route')) {
      map.getSource('route').setData(geojsonData);
    } else {
      map.addSource('route', {
        type: 'geojson',
        data: geojsonData,
      });

      // Outer casing for road contrast
      map.addLayer({
        id: 'route-casing',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#ffffff',
          'line-width': 8,
          'line-opacity': 0.9,
        },
      });

      // Navigation blue route line
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#2563eb',
          'line-width': 5,
        },
      });
    }

    // 4. Auto-fit Map to Complete Route Bounds
    if (coordinates.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      coordinates.forEach(([lng, lat]) => bounds.extend([lng, lat]));
      bounds.extend([origin.lng, origin.lat]);
      bounds.extend([destination.lng, destination.lat]);

      map.fitBounds(bounds, {
        padding: { top: 60, bottom: 60, left: 60, right: 60 },
        duration: 800,
        maxZoom: 16,
      });
    }
  }, [origin, destination, routeGeometry, mapLoaded]);

  // Handle Container Resize
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-neutral-200 shadow-sm ${className}`}>
      {/* Mapbox Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[440px] bg-neutral-100" />

      {/* Loading Overlay */}
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 bg-neutral-100 flex flex-col items-center justify-center gap-2 z-20">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-neutral-600">Loading real map...</span>
        </div>
      )}

      {/* Error Overlay */}
      {mapError && (
        <div className="absolute inset-0 bg-neutral-50 flex flex-col items-center justify-center p-6 text-center z-20">
          <p className="text-sm font-semibold text-neutral-700 mb-1">Unable to load the live map.</p>
          <p className="text-xs text-neutral-400 mb-3">Please use Google Maps navigation below.</p>
        </div>
      )}
    </div>
  );
}
