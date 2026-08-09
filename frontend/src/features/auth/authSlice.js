import { createSlice } from '@reduxjs/toolkit';
import { mockUser } from '../../services/mockData';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
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
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    updateProfile(state, action) {
      state.user = { ...state.user, ...action.payload };
    },
    clearError(state) {
      state.error = null;
    },
    // Mock login for development
    mockLogin(state) {
      state.isLoading = false;
      state.user = mockUser;
      state.isAuthenticated = true;
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateProfile, clearError, mockLogin } = authSlice.actions;
export default authSlice.reducer;
