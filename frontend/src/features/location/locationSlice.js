import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  latitude: null,
  longitude: null,
  radius: 10,
  locationName: '',
  permissionStatus: 'prompt', // 'prompt' | 'granted' | 'denied'
  isLoading: false,
  error: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation(state, action) {
      state.latitude = action.payload.latitude;
      state.longitude = action.payload.longitude;
      state.locationName = action.payload.locationName || '';
      state.permissionStatus = 'granted';
      state.error = null;
    },
    setRadius(state, action) {
      state.radius = action.payload;
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
      state.latitude = action.payload.latitude;
      state.longitude = action.payload.longitude;
      state.locationName = action.payload.locationName;
      state.permissionStatus = 'granted';
      state.error = null;
    },
    clearLocation(state) {
      state.latitude = null;
      state.longitude = null;
      state.locationName = '';
      state.permissionStatus = 'prompt';
    },
  },
});

export const {
  setLocation, setRadius, setPermissionStatus,
  setLocationLoading, setLocationError, setManualLocation, clearLocation,
} = locationSlice.actions;
export default locationSlice.reducer;
