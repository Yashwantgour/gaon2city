import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isMobileMenuOpen: false,
  isFilterDrawerOpen: false,
  toast: null, // { type: 'success' | 'error' | 'info', message: '' }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMobileMenu(state) {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    closeMobileMenu(state) {
      state.isMobileMenuOpen = false;
    },
    toggleFilterDrawer(state) {
      state.isFilterDrawerOpen = !state.isFilterDrawerOpen;
    },
    closeFilterDrawer(state) {
      state.isFilterDrawerOpen = false;
    },
    showToast(state, action) {
      state.toast = action.payload;
    },
    hideToast(state) {
      state.toast = null;
    },
  },
});

export const {
  toggleMobileMenu, closeMobileMenu,
  toggleFilterDrawer, closeFilterDrawer,
  showToast, hideToast,
} = uiSlice.actions;
export default uiSlice.reducer;
