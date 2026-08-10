import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure(state, action) {
      state.isLoading = false;
      state.user = null;
      state.isAuthenticated = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    updateProfile(state, action) {
      state.user = { ...state.user, ...action.payload };
    },
    clearError(state) {
      state.error = null;
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateProfile,
  clearError,
  setLoading,
} = authSlice.actions;

export default authSlice.reducer;
