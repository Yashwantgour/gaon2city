import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlinePlus,
  HiOutlineMinus,
  HiOutlineArrowPath,
  HiOutlineMapPin,
  HiOutlineXMark,
  HiOutlineArrowTopRightOnSquare,
} from 'react-icons/hi2';
import { formatPrice, formatDistance, getSellerTypeLabel } from '../../utils/helpers';
import Button from '../common/Button';

export default function MarketplaceMap({
  products = [],
  userLocation,
  radius = 10,
  className = '',
}) {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Derive geographical bounds
  const { markers, viewBox, centerPoint } = useMemo(() => {
    const userLat = userLocation?.latitude || 28.6139;
    const userLng = userLocation?.longitude || 77.2090;

    // Distribute products with coordinates or pseudo-geographical spread for rural demo
    const calculatedMarkers = products.map((prod, index) => {
      // Deterministic offset based on product ID if exact coords are null
      const angle = (index * 2 * Math.PI) / Math.max(1, products.length);
      const distOffset = 0.03 + (index % 3) * 0.02;

      const lat = prod.latitude != null ? parseFloat(prod.latitude) : userLat + Math.sin(angle) * distOffset;
      const lng = prod.longitude != null ? parseFloat(prod.longitude) : userLng + Math.cos(angle) * distOffset;

      return {
        product: prod,
        lat,
        lng,
      };
    });

    let minLng = userLng - 0.05;
    let maxLng = userLng + 0.05;
    let minLat = userLat - 0.05;
    let maxLat = userLat + 0.05;

    calculatedMarkers.forEach((m) => {
      if (m.lng < minLng) minLng = m.lng;
      if (m.lng > maxLng) maxLng = m.lng;
      if (m.lat < minLat) minLat = m.lat;
      if (m.lat > maxLat) maxLat = m.lat;
    });

    const lngSpan = Math.max(0.04, maxLng - minLng);
    const latSpan = Math.max(0.04, maxLat - minLat);
    const padLng = lngSpan * 0.25;
    const padLat = latSpan * 0.25;

    const bounds = {
      minLng: minLng - padLng,
      maxLng: maxLng + padLng,
      minLat: minLat - padLat,
      maxLat: maxLat + padLat,
    };

    const width = 800;
    const height = 550;

    const project = (lng, lat) => {
      const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
      const y = height - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height;
      return { x, y };
    };

    const projectedMarkers = calculatedMarkers.map((m) => ({
      ...m,
      point: project(m.lng, m.lat),
    }));

    const userPoint = project(userLng, userLat);

    return {
      markers: projectedMarkers,
      userPoint,
      viewBox: `0 0 ${width} ${height}`,
      centerPoint: { x: width / 2, y: height / 2 },
    };
  }, [products, userLocation]);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 select-none ${className}`}>
      {/* Dark Map Canvas */}
      <div className="absolute inset-0 bg-[#0f172a] opacity-95">
        <svg className="w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="market-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-emerald-500" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#market-grid)" />
        </svg>

        {/* Ambient Map Glow */}
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* SVG Interactive Markers Layer */}
      <div
        className="w-full h-full flex items-center justify-center p-4 transition-transform duration-300"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <svg viewBox={viewBox} className="w-full h-full max-h-[580px] overflow-visible">
          {/* User Location Radar */}
          {markers.userPoint && (
            <g transform={`translate(${markers.userPoint.x}, ${markers.userPoint.y})`}>
              <circle r="36" fill="#38bdf8" fillOpacity="0.15" className="animate-ping" />
              <circle r="12" fill="#0284c7" stroke="#ffffff" strokeWidth="2.5" />
              <circle r="4" fill="#ffffff" />
            </g>
          )}

          {/* Product Price Tag Markers */}
          {markers.map(({ product, point }, idx) => {
            const isSelected = selectedProduct?.id === product.id;
            return (
              <g
                key={product.id || idx}
                transform={`translate(${point.x}, ${point.y})`}
                onClick={() => setSelectedProduct(product)}
                className="cursor-pointer transition-transform hover:scale-110"
              >
                {/* Pin Stem */}
                <path d="M 0 0 L 0 -10" stroke={isSelected ? '#10b981' : '#334155'} strokeWidth="2" />

                {/* Price Bubble Badge */}
                <g transform="translate(0, -22)">
                  <rect
                    x="-34"
                    y="-12"
                    width="68"
                    height="24"
                    rx="12"
                    fill={isSelected ? '#10b981' : '#1e293b'}
                    stroke={isSelected ? '#ffffff' : '#10b981'}
                    strokeWidth="1.5"
                    className="shadow-lg"
                  />
                  <text
                    x="0"
                    y="4"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="sans-serif"
                  >
                    {formatPrice(product.price)}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Map Control Buttons */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
          className="w-10 h-10 rounded-xl bg-neutral-800/90 hover:bg-neutral-700 text-white backdrop-blur-md flex items-center justify-center border border-neutral-700 shadow-lg"
          aria-label="Zoom in"
        >
          <HiOutlinePlus className="w-5 h-5" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
          className="w-10 h-10 rounded-xl bg-neutral-800/90 hover:bg-neutral-700 text-white backdrop-blur-md flex items-center justify-center border border-neutral-700 shadow-lg"
          aria-label="Zoom out"
        >
          <HiOutlineMinus className="w-5 h-5" />
        </button>
        <button
          onClick={() => setZoomLevel(1)}
          className="w-10 h-10 rounded-xl bg-neutral-800/90 hover:bg-neutral-700 text-white backdrop-blur-md flex items-center justify-center border border-neutral-700 shadow-lg"
          aria-label="Reset Zoom"
        >
          <HiOutlineArrowPath className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Product Floating Card Popup */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white rounded-2xl p-4 border border-neutral-100 shadow-2xl z-20"
          >
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 right-3 p-1 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
            >
              <HiOutlineXMark className="w-4 h-4" />
            </button>

            <div className="flex gap-3 items-center">
              <div className="w-16 h-16 rounded-xl bg-neutral-100 overflow-hidden shrink-0">
                {selectedProduct.images?.[0] ? (
                  <img
                    src={typeof selectedProduct.images[0] === 'string' ? selectedProduct.images[0] : selectedProduct.images[0]?.storage_path}
                    alt={selectedProduct.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">🌾</div>
                )}
              </div>

              <div className="flex-1 min-w-0 pr-4">
                <h4 className="text-sm font-semibold text-neutral-900 truncate">
                  {selectedProduct.title}
                </h4>
                <p className="text-base font-bold text-primary-600">
                  {formatPrice(selectedProduct.price)}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-0.5">
                  <HiOutlineMapPin className="w-3.5 h-3.5 text-primary-500" />
                  <span>{formatDistance(selectedProduct.distance)}</span>
                  <span>• {getSellerTypeLabel(selectedProduct.seller?.seller_type)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-neutral-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/product/${selectedProduct.id}`)}
              >
                View Item
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<HiOutlineMapPin />}
                onClick={() => {
                  const sId = selectedProduct.seller_id || selectedProduct.seller?.id;
                  navigate(sId ? `/directions?seller=${sId}&product=${selectedProduct.id}` : `/directions?product=${selectedProduct.id}`);
                }}
              >
                Go to Seller
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
