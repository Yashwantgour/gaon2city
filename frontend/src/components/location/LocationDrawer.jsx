import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineXMark,
  HiOutlineMagnifyingGlass,
  HiOutlineMapPin,
  HiOutlineHome,
  HiOutlineBriefcase,
  HiOutlineBuildingStorefront,
  HiOutlinePlus,
  HiOutlineCheck,
  HiOutlineTrash,
  HiOutlineArrowPath,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2';
import useLocation from '../../hooks/useLocation';
import Button from '../common/Button';

const RADIUS_OPTIONS = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km (Default)' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
];

const ADDRESS_LABELS = [
  { id: 'Home', label: 'Home', icon: HiOutlineHome },
  { id: 'Work', label: 'Work', icon: HiOutlineBriefcase },
  { id: 'Farm', label: 'Farm', icon: HiOutlineBuildingStorefront },
  { id: 'Shop', label: 'Shop', icon: HiOutlineBuildingStorefront },
  { id: 'Other', label: 'Other', icon: HiOutlineMapPin },
];

export default function LocationDrawer() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const {
    isDrawerOpen,
    closeDrawer,
    latitude,
    longitude,
    locationName,
    locality,
    city,
    district,
    state: locState,
    pincode,
    formattedAddress,
    addressLabel,
    radius,
    isLoading: isLocationLoading,
    error: locationError,
    requestLocation,
    searchLocations,
    selectLocation,
    changeRadius,
    saveAddress,
    deleteAddress,
    savedAddresses,
  } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // New Address Form State
  const [newAddrLabel, setNewAddrLabel] = useState('Home');
  const [newAddrFull, setNewAddrFull] = useState('');
  const [newAddrVillage, setNewAddrVillage] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrDistrict, setNewAddrDistrict] = useState('');
  const [newAddrState, setNewAddrState] = useState('');
  const [newAddrPincode, setNewAddrPincode] = useState('');
  const [newAddrCoords, setNewAddrCoords] = useState({ lat: null, lng: null });
  const [isFetchingCoords, setIsFetchingCoords] = useState(false);

  const searchDebounceRef = useRef(null);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError('');
      return;
    }

    setIsSearching(true);
    setSearchError('');

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(async () => {
      try {
        const results = await searchLocations(searchQuery);
        setSearchResults(results || []);
        if (!results || results.length === 0) {
          setSearchError("Couldn't find this location. Try another search.");
        }
      } catch (err) {
        setSearchError('Location service unavailable. Please try again.');
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery, searchLocations]);

  // Handle current location GPS click
  const handleUseCurrentLocation = async () => {
    const res = await requestLocation();
    if (res.success) {
      closeDrawer();
    }
  };

  // Handle selecting search result
  const handleSelectSearchResult = (item) => {
    selectLocation({
      latitude: item.latitude,
      longitude: item.longitude,
      locationName: item.locality || item.name || item.city,
      locality: item.locality || '',
      city: item.city || '',
      district: item.district || '',
      state: item.state || '',
      pincode: item.pincode || '',
      formattedAddress: item.formatted_address || '',
      addressLabel: 'Search Location',
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  // Handle saving new address
  const handleSaveNewAddress = (e) => {
    e.preventDefault();
    if (!newAddrFull.trim()) return;

    const lat = newAddrCoords.lat || latitude || 23.2049;
    const lng = newAddrCoords.lng || longitude || 77.0845;

    const saved = saveAddress({
      label: newAddrLabel,
      full_address: newAddrFull,
      village: newAddrVillage,
      city: newAddrCity,
      district: newAddrDistrict,
      state: newAddrState,
      pincode: newAddrPincode,
      latitude: lat,
      longitude: lng,
    });

    // Auto-select this newly saved address
    selectLocation({
      latitude: lat,
      longitude: lng,
      locationName: newAddrVillage || newAddrCity || newAddrLabel,
      locality: newAddrVillage || '',
      city: newAddrCity || '',
      district: newAddrDistrict || '',
      state: newAddrState || '',
      pincode: newAddrPincode || '',
      formattedAddress: newAddrFull,
      addressLabel: newAddrLabel,
    });

    setIsAddingAddress(false);
    // Reset form
    setNewAddrFull('');
    setNewAddrVillage('');
    setNewAddrCity('');
    setNewAddrDistrict('');
    setNewAddrState('');
    setNewAddrPincode('');
    setNewAddrCoords({ lat: null, lng: null });
  };

  // Auto-fill coords for new address from browser GPS
  const handleFetchCoordsForNewAddr = () => {
    if (!navigator.geolocation) return;
    setIsFetchingCoords(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNewAddrCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsFetchingCoords(false);
      },
      () => setIsFetchingCoords(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Build list of user addresses: profile address (if exists) + local saved addresses
  const allSavedAddresses = [];
  if (user && (user.village || user.city)) {
    const profileAddrStr = [user.village, user.city, user.state, user.postal_code]
      .filter(Boolean)
      .join(', ');
    allSavedAddresses.push({
      id: 'profile_addr',
      label: 'Home',
      full_address: profileAddrStr,
      village: user.village || '',
      city: user.city || '',
      state: user.state || '',
      pincode: user.postal_code || '',
      latitude: latitude || 23.2049,
      longitude: longitude || 77.0845,
      isProfile: true,
    });
  }

  // Add remaining saved addresses
  (savedAddresses || []).forEach((sa) => {
    if (!allSavedAddresses.some((a) => a.id === sa.id)) {
      allSavedAddresses.push(sa);
    }
  });

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          {/* Location Panel Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Select delivery location"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <HiOutlineMapPin className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-800">Select delivery location</h2>
                  <p className="text-xs text-neutral-400">Discover fresh produce in your nearby radius</p>
                </div>
              </div>
              <button
                onClick={closeDrawer}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                aria-label="Close location selector"
              >
                <HiOutlineXMark className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Search Box */}
              <div className="space-y-2">
                <div className="relative">
                  <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by area, street name, PIN code"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      <HiOutlineXMark className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Search Results Dropdown / List */}
                {isSearching && (
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <span>Searching places across India...</span>
                  </div>
                )}

                {searchError && !isSearching && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                    <HiOutlineExclamationCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{searchError}</span>
                  </div>
                )}

                {searchResults.length > 0 && !isSearching && (
                  <div className="rounded-2xl border border-neutral-200 bg-white shadow-xs overflow-hidden divide-y divide-neutral-100">
                    {searchResults.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelectSearchResult(item)}
                        className="w-full text-left p-3.5 hover:bg-primary-50/60 transition-colors flex items-start gap-3 group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-neutral-100 group-hover:bg-primary-100 text-neutral-500 group-hover:text-primary-600 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                          <HiOutlineMapPin className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-neutral-800 truncate">
                            {item.locality || item.name}
                          </p>
                          <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                            {item.formatted_address}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Use My Current Location Action */}
              <div className="rounded-2xl border border-neutral-200 p-4 bg-white hover:border-primary-300 transition-all">
                <button
                  onClick={handleUseCurrentLocation}
                  disabled={isLocationLoading}
                  className="w-full flex items-start gap-3 text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:bg-primary-600 transition-colors">
                    {isLocationLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <HiOutlineMapPin className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-primary-700">Use my current location</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {isLocationLoading
                        ? 'Detecting high-precision GPS coordinates...'
                        : 'Allow browser access to auto-detect village / city'}
                    </p>
                  </div>
                </button>

                {locationError && (
                  <div className="mt-3 p-2.5 rounded-xl bg-red-50 text-red-600 text-xs flex items-start gap-2">
                    <HiOutlineExclamationCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{locationError}</span>
                  </div>
                )}
              </div>

              {/* Radius Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Marketplace Radius
                  </label>
                  <span className="text-xs font-bold text-primary-600">{radius} km</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {RADIUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => changeRadius(opt.value)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition-all ${
                        radius === opt.value
                          ? 'bg-primary-500 text-white border-primary-500 shadow-xs'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      {opt.value} km
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Active Location Display */}
              {latitude && longitude && (
                <div className="rounded-2xl border border-primary-200 bg-primary-50/40 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-primary-700 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active Origin
                    </span>
                    <span className="text-xs font-bold text-primary-700">{radius} km radius</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-800">
                      {locationName || 'Selected Location'}
                    </h4>
                    {formattedAddress && (
                      <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{formattedAddress}</p>
                    )}
                  </div>
                </div>
              )}

              <hr className="border-neutral-100" />

              {/* Saved Addresses Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Saved Addresses
                  </h3>
                  {isAuthenticated && !isAddingAddress && (
                    <button
                      onClick={() => setIsAddingAddress(true)}
                      className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                      <HiOutlinePlus className="w-3.5 h-3.5" />
                      Add new
                    </button>
                  )}
                </div>

                {!isAuthenticated ? (
                  /* Login Prompt for Guest Users */
                  <div className="rounded-2xl border border-neutral-200 p-5 bg-neutral-50 text-center space-y-3">
                    <p className="text-xs text-neutral-600">
                      Log in to access your saved farm & home addresses for one-click delivery origin.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        closeDrawer();
                        navigate('/login');
                      }}
                    >
                      Login to see saved addresses
                    </Button>
                  </div>
                ) : (
                  /* Saved Addresses List */
                  <div className="space-y-2.5">
                    {allSavedAddresses.length > 0 ? (
                      allSavedAddresses.map((addr) => {
                        const isSelected =
                          latitude === addr.latitude && longitude === addr.longitude;

                        return (
                          <div
                            key={addr.id}
                            className={`rounded-2xl border p-3.5 flex items-start justify-between gap-3 transition-all ${
                              isSelected
                                ? 'border-primary-500 bg-primary-50/30 ring-1 ring-primary-500'
                                : 'border-neutral-200 bg-white hover:border-neutral-300'
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0 mt-0.5">
                                {addr.label === 'Work' ? (
                                  <HiOutlineBriefcase className="w-4 h-4" />
                                ) : addr.label === 'Farm' || addr.label === 'Shop' ? (
                                  <HiOutlineBuildingStorefront className="w-4 h-4" />
                                ) : (
                                  <HiOutlineHome className="w-4 h-4" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-neutral-800">
                                    {addr.label}
                                  </span>
                                  {addr.isProfile && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-neutral-100 text-neutral-600">
                                      Profile
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-neutral-600 mt-0.5 line-clamp-2">
                                  {addr.full_address}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {!isSelected ? (
                                <button
                                  onClick={() => {
                                    selectLocation({
                                      latitude: addr.latitude,
                                      longitude: addr.longitude,
                                      locationName: addr.village || addr.city || addr.label,
                                      locality: addr.village || '',
                                      city: addr.city || '',
                                      state: addr.state || '',
                                      pincode: addr.pincode || '',
                                      formattedAddress: addr.full_address,
                                      addressLabel: addr.label,
                                    });
                                  }}
                                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-primary-500 hover:bg-primary-600 text-white transition-colors"
                                >
                                  Select
                                </button>
                              ) : (
                                <span className="p-1.5 rounded-xl bg-primary-100 text-primary-700">
                                  <HiOutlineCheck className="w-4 h-4" />
                                </span>
                              )}

                              {!addr.isProfile && (
                                <button
                                  onClick={() => deleteAddress(addr.id)}
                                  className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                                  title="Delete address"
                                >
                                  <HiOutlineTrash className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      !isAddingAddress && (
                        <p className="text-xs text-neutral-400 text-center py-2">
                          No saved addresses yet. Add your home or farm address below.
                        </p>
                      )
                    )}

                    {/* Add Address Form Accordion */}
                    {isAddingAddress && (
                      <form
                        onSubmit={handleSaveNewAddress}
                        className="rounded-2xl border border-primary-200 bg-primary-50/20 p-4 space-y-3 mt-3"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-neutral-800">Add New Address</h4>
                          <button
                            type="button"
                            onClick={() => setIsAddingAddress(false)}
                            className="text-neutral-400 hover:text-neutral-600"
                          >
                            <HiOutlineXMark className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Label Chips */}
                        <div className="flex gap-2">
                          {ADDRESS_LABELS.map((item) => (
                            <button
                              type="button"
                              key={item.id}
                              onClick={() => setNewAddrLabel(item.id)}
                              className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-all ${
                                newAddrLabel === item.id
                                  ? 'bg-primary-500 text-white border-primary-500'
                                  : 'bg-white text-neutral-600 border-neutral-200'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>

                        <div>
                          <input
                            type="text"
                            required
                            placeholder="Full address (Street, Landmark, House No.)"
                            value={newAddrFull}
                            onChange={(e) => setNewAddrFull(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-primary-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Village / Locality"
                            value={newAddrVillage}
                            onChange={(e) => setNewAddrVillage(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-primary-500"
                          />
                          <input
                            type="text"
                            placeholder="City / Tehsil"
                            value={newAddrCity}
                            onChange={(e) => setNewAddrCity(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-primary-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="State"
                            value={newAddrState}
                            onChange={(e) => setNewAddrState(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-primary-500"
                          />
                          <input
                            type="text"
                            placeholder="PIN code"
                            value={newAddrPincode}
                            onChange={(e) => setNewAddrPincode(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-primary-500"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={handleFetchCoordsForNewAddr}
                            disabled={isFetchingCoords}
                            className="text-[11px] text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
                          >
                            <HiOutlineMapPin className="w-3.5 h-3.5" />
                            <span>
                              {isFetchingCoords
                                ? 'Detecting GPS...'
                                : newAddrCoords.lat
                                ? 'GPS Attached ✓'
                                : 'Attach GPS Location'}
                            </span>
                          </button>

                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => setIsAddingAddress(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" variant="primary" size="sm">
                              Save Address
                            </Button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
