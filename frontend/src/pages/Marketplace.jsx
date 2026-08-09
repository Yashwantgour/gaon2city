import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineMapPin,
  HiOutlineXMark,
  HiChevronDown,
} from 'react-icons/hi2';
import ProductGrid from '../components/product/ProductGrid';
import Button from '../components/common/Button';
import { CATEGORIES, CONDITIONS, SELLER_TYPES, RADIUS_OPTIONS, SORT_OPTIONS } from '../utils/constants';
import { setFilter, clearFilters } from '../features/products/productsSlice';
import useLocation from '../hooks/useLocation';
import useDebounce from '../hooks/useDebounce';

export default function Marketplace() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const products = useSelector((state) => state.products.items);
  const filters = useSelector((state) => state.products.filters);
  const { radius, changeRadius, locationName, requestLocation, permissionStatus } = useLocation();

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || null);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [selectedSellerType, setSelectedSellerType] = useState(null);
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'nearest');

  const debouncedSearch = useDebounce(searchInput, 300);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category?.name?.toLowerCase().includes(query)
      );
    }

    // Category
    if (selectedCategory) {
      result = result.filter((p) => p.category?.slug === selectedCategory);
    }

    // Condition
    if (selectedCondition) {
      result = result.filter((p) => p.condition === selectedCondition);
    }

    // Seller type
    if (selectedSellerType) {
      result = result.filter((p) => p.seller?.seller_type === selectedSellerType);
    }

    // Price range
    if (priceMin) result = result.filter((p) => p.price >= Number(priceMin));
    if (priceMax) result = result.filter((p) => p.price <= Number(priceMax));

    // Radius
    if (radius) {
      result = result.filter((p) => (p.distance || 0) <= radius);
    }

    // Sort
    switch (selectedSort) {
      case 'nearest':
        result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'price_low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        result.sort((a, b) => b.price - a.price);
        break;
    }

    return result;
  }, [products, debouncedSearch, selectedCategory, selectedCondition, selectedSellerType, priceMin, priceMax, radius, selectedSort]);

  const activeFilterCount = [selectedCategory, selectedCondition, selectedSellerType, priceMin, priceMax].filter(Boolean).length;

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedCondition(null);
    setSelectedSellerType(null);
    setPriceMin('');
    setPriceMax('');
    setSearchInput('');
    dispatch(clearFilters());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-neutral-800 mb-1">Marketplace</h1>
        <p className="text-sm text-neutral-500">
          Discover products from sellers near you
        </p>
      </motion.div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <HiOutlineXMark className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:border-neutral-300 transition-colors w-full sm:w-auto"
          >
            {SORT_OPTIONS.find((s) => s.value === selectedSort)?.label || 'Sort'}
            <HiChevronDown className="w-4 h-4" />
          </button>
          {sortOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-neutral-100 py-1 z-20 min-w-[180px]"
            >
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedSort(option.value);
                    setSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 transition-colors ${
                    selectedSort === option.value ? 'text-primary-600 font-medium bg-primary-50' : 'text-neutral-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
            showFilters || activeFilterCount > 0
              ? 'border-primary-500 bg-primary-50 text-primary-600'
              : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
          }`}
        >
          <HiOutlineAdjustmentsHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Location & Radius Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={requestLocation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-medium hover:bg-primary-100 transition-colors"
        >
          <HiOutlineMapPin className="w-4 h-4" />
          {locationName || 'Set Location'}
        </button>

        <div className="flex gap-1.5">
          {RADIUS_OPTIONS.map((option) => (
            <button
              key={option.label}
              onClick={() => changeRadius(option.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                radius === option.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-2xl border border-neutral-100 p-4 sm:p-6 mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Category</label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Condition</label>
              <select
                value={selectedCondition || ''}
                onChange={(e) => setSelectedCondition(e.target.value || null)}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                <option value="">Any Condition</option>
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Seller Type */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Seller Type</label>
              <select
                value={selectedSellerType || ''}
                onChange={(e) => setSelectedSellerType(e.target.value || null)}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                <option value="">All Sellers</option>
                {SELLER_TYPES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="mt-4 pt-3 border-t border-neutral-100 flex justify-end">
              <button
                onClick={handleClearFilters}
                className="text-sm text-primary-600 font-medium hover:text-primary-700"
              >
                Clear all filters
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Category Pills — horizontal scroll */}
      <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-1">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !selectedCategory
              ? 'bg-primary-500 text-white'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
              selectedCategory === cat.slug
                ? 'bg-primary-500 text-white'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <span>{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-neutral-500">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Product Grid */}
      <ProductGrid products={filteredProducts} />
    </div>
  );
}
