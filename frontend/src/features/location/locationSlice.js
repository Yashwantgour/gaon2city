import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'g2c_user_location';
const SAVED_ADDRESSES_KEY = 'g2c_saved_addresses';

const loadStoredLocation = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load stored location:', e);
  }
  return null;
};

const loadStoredSavedAddresses = () => {
  try {
    const raw = localStorage.getItem(SAVED_ADDRESSES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load stored saved addresses:', e);
  }
  return [];
};

const savedLoc = loadStoredLocation();
const storedAddresses = loadStoredSavedAddresses();

const initialState = {
  latitude: savedLoc?.latitude ?? null,
  longitude: savedLoc?.longitude ?? null,
  radius: savedLoc?.radius ?? 10,
  locationName: savedLoc?.locationName ?? '',
  locality: savedLoc?.locality ?? '',
  city: savedLoc?.city ?? '',
  district: savedLoc?.district ?? '',
  state: savedLoc?.state ?? '',
  pincode: savedLoc?.pincode ?? '',
  formattedAddress: savedLoc?.formattedAddress ?? '',
  addressLabel: savedLoc?.addressLabel ?? '',
  permissionStatus: 'prompt', // 'prompt' | 'granted' | 'denied'
  isLoading: false,
  error: null,
  isDrawerOpen: false,
  savedAddresses: storedAddresses,
};

const persistLocation = (state) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        latitude: state.latitude,
        longitude: state.longitude,
        radius: state.radius,
        locationName: state.locationName,
        locality: state.locality,
        city: state.city,
        district: state.district,
        state: state.state,
        pincode: state.pincode,
        formattedAddress: state.formattedAddress,
        addressLabel: state.addressLabel,
      })
    );
  } catch (e) {
    console.warn('Failed to persist location:', e);
  }
};

const persistSavedAddresses = (addresses) => {
  try {
    localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(addresses));
  } catch (e) {
    console.warn('Failed to persist saved addresses:', e);
  }
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    openLocationDrawer(state) {
      state.isDrawerOpen = true;
    },
    closeLocationDrawer(state) {
      state.isDrawerOpen = false;
    },
    toggleLocationDrawer(state) {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
    setLocation(state, action) {
      const p = action.payload;
      state.latitude = p.latitude;
      state.longitude = p.longitude;
      state.locationName = p.locationName || p.name || p.locality || p.city || 'Selected Location';
      state.locality = p.locality || '';
      state.city = p.city || '';
      state.district = p.district || '';
      state.state = p.state || '';
      state.pincode = p.pincode || '';
      state.formattedAddress = p.formattedAddress || p.formatted_address || '';
      state.addressLabel = p.addressLabel || p.label || '';
      state.permissionStatus = 'granted';
      state.error = null;
      persistLocation(state);
    },
    setRadius(state, action) {
      state.radius = Number(action.payload) || 10;
      persistLocation(state);
    },
    setPermissionStatus(state, action) {
      state.permissionStatus = action.payload;
    },
    setLocationLoading(state, action) {
      state.isLoading = action.payload;
    },
    setLocationError(state, action) {
      state.error = action.payload;
      state.permissionStatus = 'denied';
    },
    setManualLocation(state, action) {
      const p = action.payload;
      state.latitude = p.latitude;
      state.longitude = p.longitude;
      state.locationName = p.locationName || p.name || p.locality || 'Selected Location';
      state.locality = p.locality || '';
      state.city = p.city || '';
      state.district = p.district || '';
      state.state = p.state || '';
      state.pincode = p.pincode || '';
      state.formattedAddress = p.formattedAddress || '';
      state.addressLabel = p.addressLabel || '';
      state.permissionStatus = 'granted';
      state.error = null;
      persistLocation(state);
    },
    setSavedAddresses(state, action) {
      state.savedAddresses = action.payload || [];
      persistSavedAddresses(state.savedAddresses);
    },
    addSavedAddress(state, action) {
      state.savedAddresses = [action.payload, ...state.savedAddresses];
      persistSavedAddresses(state.savedAddresses);
    },
    removeSavedAddress(state, action) {
      state.savedAddresses = state.savedAddresses.filter((a) => a.id !== action.payload);
      persistSavedAddresses(state.savedAddresses);
    },
    clearLocation(state) {
      state.latitude = null;
      state.longitude = null;
      state.locationName = '';
      state.locality = '';
      state.city = '';
      state.district = '';
      state.state = '';
      state.pincode = '';
      state.formattedAddress = '';
      state.addressLabel = '';
      state.permissionStatus = 'prompt';
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    },
  },
});

export const {
  openLocationDrawer,
  closeLocationDrawer,
  toggleLocationDrawer,
  setLocation,
  setRadius,
  setPermissionStatus,
  setLocationLoading,
  setLocationError,
  setManualLocation,
  setSavedAddresses,
  addSavedAddress,
  removeSavedAddress,
  clearLocation,
} = locationSlice.actions;

export default locationSlice.reducer;
