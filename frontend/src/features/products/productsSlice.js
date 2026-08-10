import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    category: null,
    condition: null,
    sellerType: null,
    minPrice: '',
    maxPrice: '',
    sort: 'nearest',
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
  },
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts(state, action) {
      state.items = action.payload;
    },
    setPagination(state, action) {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setCurrentProduct(state, action) {
      state.currentProduct = action.payload;
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setFilter(state, action) {
      const { key, value } = action.payload;
      state.filters[key] = value;
      state.pagination.page = 1;
    },
    clearFilters(state) {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    setPage(state, action) {
      state.pagination.page = action.payload;
    },
    addProduct(state, action) {
      state.items.unshift(action.payload);
      state.pagination.total += 1;
    },
    updateProduct(state, action) {
      const index = state.items.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeProduct(state, action) {
      state.items = state.items.filter((p) => p.id !== action.payload);
      state.pagination.total -= 1;
    },
  },
});

export const {
  setProducts,
  setPagination,
  setCurrentProduct,
  setLoading,
  setError,
  setFilter,
  clearFilters,
  setPage,
  addProduct,
  updateProduct,
  removeProduct,
} = productsSlice.actions;

export default productsSlice.reducer;
