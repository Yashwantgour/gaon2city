import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getMapConfig } from '../../services/mapApi';
import { formatPrice, formatDistance, getSellerTypeLabel } from '../../utils/helpers';

export default function MarketplaceMap({
  products = [],
  userLocation,
  radius = 10,
  className = '',
}) {
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Real Mapbox Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      try {
        let token = import.meta.env.VITE_MAPBOX_TOKEN;
        if (!token || !token.startsWith('pk.')) {
          const config = await getMapConfig();
          if (config?.mapbox_token) token = config.mapbox_token;
        }

        let mapStyle;
        if (token && token.startsWith('pk.')) {
          mapboxgl.accessToken = token;
          mapStyle = 'mapbox://styles/mapbox/streets-v12';
        } else {
          mapboxgl.accessToken = 'pk.eyJ1IjoicGxhY2Vob2xkZXIiLCJhIjoiY2xwbGFjZWhvbGRlciJ9.placeholder';
          mapStyle = {
            version: 8,
            sources: {
              'osm-tiles': {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
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

        const centerLng = userLocation?.longitude || 77.2090;
        const centerLat = userLocation?.latitude || 28.6139;

        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: mapStyle,
          center: [centerLng, centerLat],
          zoom: 11,
        });

        map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');

        map.on('load', () => {
          if (!isMounted) return;
          mapRef.current = map;
          setMapLoaded(true);
        });
      } catch (err) {
        console.error('Marketplace map init error:', err);
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

  // Populate Real Geographic Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const userLat = userLocation?.latitude || 28.6139;
    const userLng = userLocation?.longitude || 77.2090;

    // 1. Add User Location Marker
    const userEl = document.createElement('div');
    userEl.className = 'user-gps-marker flex flex-col items-center';
    userEl.innerHTML = `
      <div class="relative flex items-center justify-center">
        <div class="w-8 h-8 rounded-full bg-sky-400/30 animate-ping absolute"></div>
        <div class="w-4 h-4 rounded-full bg-sky-600 border-2 border-white shadow-md"></div>
      </div>
    `;
    const userMarker = new mapboxgl.Marker({ element: userEl })
      .setLngLat([userLng, userLat])
      .addTo(map);
    markersRef.current.push(userMarker);

    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([userLng, userLat]);

    // 2. Add Product Price Markers
    products.forEach((prod, index) => {
      // Deterministic coordinate spread for unmapped items
      const angle = (index * 2 * Math.PI) / Math.max(1, products.length);
      const lat = prod.latitude != null ? parseFloat(prod.latitude) : userLat + Math.sin(angle) * 0.035;
      const lng = prod.longitude != null ? parseFloat(prod.longitude) : userLng + Math.cos(angle) * 0.035;

      const markerEl = document.createElement('div');
      markerEl.className = 'cursor-pointer hover:scale-110 transition-transform';
      markerEl.innerHTML = `
        <div class="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-lg border-2 border-white flex items-center gap-1 whitespace-nowrap">
          <span>🌾</span>
          <span>${formatPrice(prod.price)}</span>
        </div>
      `;

      const popupHtml = `
        <div class="p-2 font-sans max-w-[200px]">
          <h4 class="font-bold text-sm text-slate-900 truncate">${prod.title}</h4>
          <p class="font-extrabold text-emerald-600 text-sm mt-0.5">${formatPrice(prod.price)}</p>
          <p class="text-[11px] text-slate-500 mt-1">${getSellerTypeLabel(prod.seller?.seller_type || 'individual')}</p>
          <div class="mt-2 flex gap-1">
            <a href="/product/${prod.id}" class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-2 py-1 rounded-md font-semibold text-center flex-1">View</a>
            <a href="/directions?seller=${prod.seller_id || prod.seller?.id || ''}&product=${prod.id}" class="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded-md font-semibold text-center flex-1">Go to Seller</a>
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupHtml);

      const marker = new mapboxgl.Marker({ element: markerEl })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([lng, lat]);
    });

    if (products.length > 0) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 600 });
    }
  }, [products, userLocation, mapLoaded]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-neutral-200 shadow-sm ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px] bg-neutral-100" />
      {!mapLoaded && (
        <div className="absolute inset-0 bg-neutral-100 flex flex-col items-center justify-center gap-2 z-20">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-neutral-600">Loading marketplace map...</span>
        </div>
      )}
    </div>
  );
}
