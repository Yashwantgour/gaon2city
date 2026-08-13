import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation as useRouterLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  HiOutlineArrowLeft,
  HiOutlineMapPin,
  HiOutlineShieldCheck,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import MapboxView from '../components/map/MapboxView';
import DirectionsPanel from '../components/map/DirectionsPanel';
import Button from '../components/common/Button';
import useLocation from '../hooks/useLocation';
import { getRoute } from '../services/mapApi';
import { getProductById } from '../services/productsApi';

export default function Directions() {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);

  const routeState = routerLocation.state || {};
  const sellerParam = searchParams.get('seller');
  const productParam = searchParams.get('product');

  const {
    latitude: userLat,
    longitude: userLng,
    locationName,
    requestLocation,
    isLoading: isLocating,
  } = useLocation();

  const [product, setProduct] = useState(routeState.product || null);
  const [seller, setSeller] = useState(routeState.seller || null);
  const [profile, setProfile] = useState('driving');
  const [routeData, setRouteData] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);
  const [error, setError] = useState(null);

  // Fallback coordinates if user GPS is not yet enabled (New Delhi region / User's default)
  const defaultOrigin = {
    lat: userLat || 28.6139,
    lng: userLng || 77.2090,
    label: locationName || 'Your Location',
  };

  // Load product & seller details if not passed via state
  useEffect(() => {
    async function loadData() {
      if (productParam && !product) {
        try {
          const prod = await getProductById(productParam);
          if (prod) {
            setProduct(prod);
            if (prod.seller) setSeller(prod.seller);
          }
        } catch (err) {
          console.error('Failed to load product for directions:', err);
        }
      }
    }
    loadData();
  }, [productParam, product]);

  // Determine destination coordinates
  const destLat = product?.latitude != null
    ? parseFloat(product.latitude)
    : seller?.latitude != null
    ? parseFloat(seller.latitude)
    : defaultOrigin.lat + 0.085; // Default seller offset (~10 km) for demo / unmapped rural sellers

  const destLng = product?.longitude != null
    ? parseFloat(product.longitude)
    : seller?.longitude != null
    ? parseFloat(seller.longitude)
    : defaultOrigin.lng - 0.065;

  const destination = {
    lat: destLat,
    lng: destLng,
    label: seller?.name ? `${seller.name}'s Location` : 'Seller Location',
  };

  // Fetch Route from Mapbox Directions backend proxy
  useEffect(() => {
    async function fetchDirections() {
      setIsLoadingRoute(true);
      setError(null);

      try {
        const data = await getRoute({
          origin_lat: defaultOrigin.lat,
          origin_lng: defaultOrigin.lng,
          dest_lat: destination.lat,
          dest_lng: destination.lng,
          profile,
        });
        setRouteData(data);
      } catch (err) {
        console.error('Error fetching route:', err);
        setError('Failed to calculate directions. Please verify your connection.');
      } finally {
        setIsLoadingRoute(false);
      }
    }

    fetchDirections();
  }, [defaultOrigin.lat, defaultOrigin.lng, destination.lat, destination.lng, profile]);

  const handleChatSeller = () => {
    const targetSellerId = sellerParam || seller?.id || product?.seller_id;
    if (targetSellerId) {
      navigate(`/chat?seller=${targetSellerId}&product=${product?.id || productParam || ''}`, {
        state: { seller, product },
      });
    } else {
      navigate('/chat');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb / Top Bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition-colors shadow-xs"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">
              Go to Seller
            </h1>
            <p className="text-xs text-neutral-500">
              Live Mapbox turn-by-turn routing and navigation
            </p>
          </div>
        </div>

        {(!userLat || !userLng) && (
          <Button
            variant="outline"
            size="sm"
            onClick={requestLocation}
            isLoading={isLocating}
            icon={<HiOutlineMapPin className="w-4 h-4" />}
          >
            Detect Current GPS
          </Button>
        )}
      </motion.div>

      {/* Main Grid Layout: Map (Left) + Directions Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mapbox Route Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-7 xl:col-span-8 flex flex-col"
        >
          <MapboxView
            origin={defaultOrigin}
            destination={destination}
            routeGeometry={routeData?.geometry}
            className="h-[460px] sm:h-[550px] w-full shadow-sm"
          />

          {error && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
              <HiOutlineExclamationTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </motion.div>

        {/* Directions & ETA Control Panel */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5 xl:col-span-4"
        >
          <DirectionsPanel
            routeData={routeData}
            profile={profile}
            onProfileChange={setProfile}
            seller={seller}
            product={product}
            origin={defaultOrigin}
            destination={destination}
            onChatSeller={handleChatSeller}
            isLoading={isLoadingRoute}
          />
        </motion.div>
      </div>
    </div>
  );
}
