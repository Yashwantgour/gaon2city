import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import {
  HiOutlinePlus,
  HiOutlineMinus,
  HiOutlineMapPin,
  HiOutlineBuildingStorefront,
  HiOutlineArrowPath,
} from 'react-icons/hi2';

export default function MapboxView({
  origin = { lat: 28.6139, lng: 77.2090, label: 'Your Location' },
  destination = { lat: 28.7041, lng: 77.1025, label: 'Seller Location' },
  routeGeometry,
  className = '',
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Calculate bounding box and SVG projection
  const { pathData, originPoint, destPoint, viewBox, centerPoint } = useMemo(() => {
    const rawCoords = routeGeometry?.coordinates?.length
      ? routeGeometry.coordinates
      : [
          [origin.lng, origin.lat],
          [destination.lng, destination.lat],
        ];

    let minLng = Infinity;
    let maxLng = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;

    rawCoords.forEach(([lng, lat]) => {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    });

    // Add 25% padding so markers don't clip
    const lngSpan = Math.max(0.01, maxLng - minLng);
    const latSpan = Math.max(0.01, maxLat - minLat);
    const paddingLng = lngSpan * 0.35;
    const paddingLat = latSpan * 0.35;

    const bounds = {
      minLng: minLng - paddingLng,
      maxLng: maxLng + paddingLng,
      minLat: minLat - paddingLat,
      maxLat: maxLat + paddingLat,
    };

    const width = 800;
    const height = 500;

    const project = (lng, lat) => {
      const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
      // Invert Y because SVG coordinates have y=0 at top
      const y = height - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height;
      return { x, y };
    };

    const projectedPoints = rawCoords.map(([lng, lat]) => project(lng, lat));

    // Construct smooth SVG path
    let d = '';
    projectedPoints.forEach((p, index) => {
      if (index === 0) {
        d += `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      } else {
        d += ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      }
    });

    const orig = project(origin.lng, origin.lat);
    const dest = project(destination.lng, destination.lat);
    const center = {
      x: (orig.x + dest.x) / 2,
      y: (orig.y + dest.y) / 2,
    };

    return {
      pathData: d,
      originPoint: orig,
      destPoint: dest,
      viewBox: `0 0 ${width} ${height}`,
      centerPoint: center,
    };
  }, [origin, destination, routeGeometry]);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(2.5, z + 0.25));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.75, z - 0.25));
  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 select-none ${className}`}>
      {/* Map Background with Geographic Grid and Terrain Texture */}
      <div className="absolute inset-0 bg-[#0f172a] opacity-95">
        {/* Subtle Map Grid lines */}
        <svg className="w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-emerald-500" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#map-grid)" />
        </svg>

        {/* Ambient Geographic Glows */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Vector Route Canvas */}
      <div
        className="w-full h-full flex items-center justify-center p-4 transition-transform duration-300"
        style={{
          transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
        }}
      >
        <svg viewBox={viewBox} className="w-full h-full max-h-[550px] overflow-visible">
          <defs>
            {/* Route Gradient */}
            <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Route Shadow / Ambient Glow */}
          {pathData && (
            <path
              d={pathData}
              fill="none"
              stroke="#10b981"
              strokeWidth="10"
              strokeOpacity="0.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Main Route Line */}
          {pathData && (
            <path
              d={pathData}
              fill="none"
              stroke="url(#route-gradient)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
            />
          )}

          {/* Animated Direction Flow Dots */}
          {pathData && (
            <path
              d={pathData}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeDasharray="6 14"
              strokeLinecap="round"
              className="animate-pulse"
              strokeOpacity="0.85"
            />
          )}

          {/* Origin Marker (Buyer) */}
          <g transform={`translate(${originPoint.x}, ${originPoint.y})`}>
            {/* Pulsing halo */}
            <circle r="22" fill="#38bdf8" fillOpacity="0.2" className="animate-ping" />
            <circle r="14" fill="#0284c7" stroke="#ffffff" strokeWidth="2.5" />
            <circle r="5" fill="#ffffff" />

            {/* Label Pin */}
            <g transform="translate(0, -26)">
              <rect x="-48" y="-12" width="96" height="24" rx="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="0" y="4" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                You (Buyer)
              </text>
            </g>
          </g>

          {/* Destination Marker (Seller) */}
          <g transform={`translate(${destPoint.x}, ${destPoint.y})`}>
            {/* Pulsing halo */}
            <circle r="24" fill="#10b981" fillOpacity="0.25" className="animate-pulse" />
            <circle r="16" fill="#059669" stroke="#ffffff" strokeWidth="3" />

            {/* Icon representation */}
            <circle r="6" fill="#ffffff" />

            {/* Label Pin */}
            <g transform="translate(0, -30)">
              <rect x="-56" y="-14" width="112" height="26" rx="13" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
              <text x="0" y="4" fill="#10b981" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                Seller (Farm/Store)
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* Map Controls (Top-Right) */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 rounded-xl bg-neutral-800/90 hover:bg-neutral-700 text-white backdrop-blur-md flex items-center justify-center border border-neutral-700 shadow-lg transition-all"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <HiOutlinePlus className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 rounded-xl bg-neutral-800/90 hover:bg-neutral-700 text-white backdrop-blur-md flex items-center justify-center border border-neutral-700 shadow-lg transition-all"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <HiOutlineMinus className="w-5 h-5" />
        </button>
        <button
          onClick={handleReset}
          className="w-10 h-10 rounded-xl bg-neutral-800/90 hover:bg-neutral-700 text-white backdrop-blur-md flex items-center justify-center border border-neutral-700 shadow-lg transition-all"
          title="Reset View"
          aria-label="Reset View"
        >
          <HiOutlineArrowPath className="w-4 h-4" />
        </button>
      </div>

      {/* Mapbox Branding / Live GPS Badge (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-xl bg-neutral-900/90 backdrop-blur-md border border-neutral-700 text-xs font-semibold text-neutral-300 flex items-center gap-1.5 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Mapbox Live Navigation</span>
        </div>
      </div>
    </div>
  );
}
