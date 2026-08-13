import { motion } from 'framer-motion';
import {
  HiOutlineTruck,
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineChevronRight,
  HiOutlineShieldCheck,
} from 'react-icons/hi2';
import Button from '../common/Button';
import { getSellerTypeLabel } from '../../utils/helpers';

export default function DirectionsPanel({
  routeData,
  profile = 'driving',
  onProfileChange,
  seller,
  product,
  origin,
  destination,
  onChatSeller,
  isLoading = false,
}) {
  const formatETA = (minutes) => {
    if (!minutes || minutes < 1) return '< 1 min';
    if (minutes < 60) return `${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
  };

  const getArrivalTime = (durationMinutes) => {
    if (!durationMinutes) return '';
    const now = new Date();
    now.setMinutes(now.getMinutes() + durationMinutes);
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const openGoogleMaps = () => {
    const origStr = origin?.lat && origin?.lng ? `${origin.lat},${origin.lng}` : '';
    const destStr = destination?.lat && destination?.lng ? `${destination.lat},${destination.lng}` : '';
    const travelmode = profile === 'walking' ? 'walking' : profile === 'bicycling' ? 'bicycling' : 'driving';
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origStr}&destination=${destStr}&travelmode=${travelmode}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm space-y-6">
      {/* Travel Mode Tabs */}
      <div>
        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2.5">
          Travel Mode
        </label>
        <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-100 rounded-xl">
          {[
            { id: 'driving', label: 'Driving', icon: '🚗', speed: 'Avg 40 km/h' },
            { id: 'walking', label: 'Walking', icon: '🚶', speed: 'Avg 5 km/h' },
            { id: 'cycling', label: 'Cycling', icon: '🚴', speed: 'Avg 15 km/h' },
          ].map((mode) => {
            const isActive = profile === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onProfileChange?.(mode.id)}
                className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
                }`}
              >
                <span className="text-base mb-0.5">{mode.icon}</span>
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ETA & Distance Summary Card */}
      <div className="bg-gradient-to-br from-primary-50 to-emerald-50/50 rounded-2xl p-4 border border-primary-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs font-semibold text-primary-700">Estimated Travel Time</span>
            <h3 className="text-3xl font-extrabold text-neutral-900 mt-0.5">
              {isLoading ? 'Calculating...' : formatETA(routeData?.duration_minutes)}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-primary-700">Distance</span>
            <p className="text-2xl font-bold text-primary-600 mt-0.5">
              {isLoading ? '...' : `${routeData?.distance_km ?? 0} km`}
            </p>
          </div>
        </div>

        {routeData?.duration_minutes && (
          <div className="flex items-center gap-1.5 text-xs text-primary-800 font-medium pt-2 border-t border-primary-200/60">
            <HiOutlineClock className="w-4 h-4 text-primary-600 shrink-0" />
            <span>Estimated Arrival by <strong>{getArrivalTime(routeData.duration_minutes)}</strong></span>
          </div>
        )}
      </div>

      {/* Seller & Product Context */}
      {seller && (
        <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700 shrink-0 overflow-hidden">
              {seller.avatar_url ? (
                <img src={seller.avatar_url} alt={seller.name} className="w-full h-full object-cover" />
              ) : (
                (seller.name || 'S').charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-semibold text-neutral-800 truncate">{seller.name}</h4>
                <HiOutlineShieldCheck className="w-4 h-4 text-primary-500 shrink-0" />
              </div>
              <p className="text-xs text-neutral-500">
                {getSellerTypeLabel(seller.seller_type)}
                {seller.village && ` • ${seller.village}, ${seller.city || ''}`}
              </p>
            </div>
          </div>

          {product && (
            <div className="text-xs bg-white p-2.5 rounded-xl border border-neutral-200/60 flex items-center justify-between">
              <span className="text-neutral-500">Visiting for product:</span>
              <strong className="text-neutral-800 truncate max-w-[180px]">{product.title}</strong>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            fullWidth
            icon={<HiOutlineChatBubbleLeftRight />}
            onClick={onChatSeller}
          >
            Chat with Seller
          </Button>
        </div>
      )}

      {/* Step-by-Step Directions */}
      <div>
        <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
          Route Steps
        </h4>
        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {routeData?.steps?.length ? (
            routeData.steps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50/80 border border-neutral-100 text-xs"
              >
                <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-neutral-800 leading-snug">{step.instruction}</p>
                  {step.distance_meters && (
                    <span className="text-[10px] text-neutral-400 mt-0.5 inline-block">
                      {step.distance_meters > 1000
                        ? `${(step.distance_meters / 1000).toFixed(1)} km`
                        : `${step.distance_meters} meters`}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-neutral-400">
              Direct routing calculated. Follow map trajectory.
            </div>
          )}
        </div>
      </div>

      {/* External Launch Button */}
      <div className="pt-2">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          iconRight={<HiOutlineArrowTopRightOnSquare />}
          onClick={openGoogleMaps}
        >
          Open in Google Maps
        </Button>
      </div>
    </div>
  );
}
