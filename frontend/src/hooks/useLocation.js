import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setLocation,
  setLocationLoading,
  setLocationError,
  setManualLocation,
  setRadius,
  setPermissionStatus,
  openLocationDrawer,
  closeLocationDrawer,
  toggleLocationDrawer,
  addSavedAddress,
  removeSavedAddress,
  clearLocation,
} from '../features/location/locationSlice';
import { reverseGeocode, geocodeAddress } from '../services/mapApi';

export const useLocation = () => {
  const dispatch = useDispatch();
  const locationState = useSelector((state) => state.location);

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      dispatch(setLocationError('Geolocation is not supported by your browser'));
      return { success: false, error: 'Geolocation is not supported by your browser' };
    }

    dispatch(setLocationLoading(true));

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          try {
            const rev = await reverseGeocode({ lat, lng });
            const locName =
              rev.locality ||
              rev.name ||
              (rev.city ? `${rev.city}` : `${lat.toFixed(4)}, ${lng.toFixed(4)}`);

            const payload = {
              latitude: lat,
              longitude: lng,
              locationName: locName,
              locality: rev.locality || '',
              city: rev.city || '',
              district: rev.district || '',
              state: rev.state || '',
              pincode: rev.pincode || '',
              formattedAddress: rev.formatted_address || '',
              addressLabel: 'Current Location',
            };

            dispatch(setLocation(payload));
            dispatch(setLocationLoading(false));
            resolve({ success: true, location: payload });
          } catch (e) {
            const fallbackPayload = {
              latitude: lat,
              longitude: lng,
              locationName: 'Current Location',
              locality: '',
              city: '',
              district: '',
              state: '',
              pincode: '',
              formattedAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
              addressLabel: 'Current Location',
            };
            dispatch(setLocation(fallbackPayload));
            dispatch(setLocationLoading(false));
            resolve({ success: true, location: fallbackPayload });
          }
        },
        (error) => {
          let message = 'Unable to get your location';
          if (error.code === error.PERMISSION_DENIED) {
            message = 'Location access was denied. Search for your location instead.';
            dispatch(setPermissionStatus('denied'));
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = 'Location information is currently unavailable.';
          } else if (error.code === error.TIMEOUT) {
            message = 'Location request timed out. Please try searching instead.';
          }
          dispatch(setLocationError(message));
          dispatch(setLocationLoading(false));
          resolve({ success: false, error: message });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    });
  }, [dispatch]);

  const searchLocations = useCallback(async (query) => {
    if (!query || !query.trim()) return [];
    try {
      return await geocodeAddress(query);
    } catch (e) {
      console.warn('Geocoding search failed:', e);
      return [];
    }
  }, []);

  const selectLocation = useCallback(
    (loc) => {
      dispatch(
        setLocation({
          latitude: loc.latitude,
          longitude: loc.longitude,
          locationName: loc.locality || loc.name || loc.city || 'Selected Location',
          locality: loc.locality || loc.name || '',
          city: loc.city || '',
          district: loc.district || '',
          state: loc.state || '',
          pincode: loc.pincode || '',
          formattedAddress: loc.formatted_address || loc.formattedAddress || '',
          addressLabel: loc.addressLabel || loc.label || '',
        })
      );
      dispatch(closeLocationDrawer());
    },
    [dispatch]
  );

  const changeRadius = useCallback(
    (newRadius) => {
      dispatch(setRadius(newRadius));
    },
    [dispatch]
  );

  const openDrawer = useCallback(() => dispatch(openLocationDrawer()), [dispatch]);
  const closeDrawer = useCallback(() => dispatch(closeLocationDrawer()), [dispatch]);
  const toggleDrawer = useCallback(() => dispatch(toggleLocationDrawer()), [dispatch]);

  const saveAddress = useCallback(
    (addr) => {
      const newAddress = {
        id: 'addr_' + Date.now(),
        label: addr.label || 'Home',
        full_address: addr.full_address || addr.formatted_address || '',
        village: addr.village || addr.locality || '',
        city: addr.city || '',
        district: addr.district || '',
        state: addr.state || '',
        pincode: addr.pincode || '',
        latitude: addr.latitude,
        longitude: addr.longitude,
      };
      dispatch(addSavedAddress(newAddress));
      return newAddress;
    },
    [dispatch]
  );

  const deleteAddress = useCallback(
    (id) => {
      dispatch(removeSavedAddress(id));
    },
    [dispatch]
  );

  return {
    ...locationState,
    requestLocation,
    searchLocations,
    selectLocation,
    changeRadius,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    saveAddress,
    deleteAddress,
    clearLocation: () => dispatch(clearLocation()),
  };
};

export default useLocation;
