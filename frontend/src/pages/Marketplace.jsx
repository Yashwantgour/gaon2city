import { motion } from 'framer-motion';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineMagnifyingGlass,
  HiChevronDown,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineMapPin,
  HiOutlineSquares2X2,
  HiOutlineMap,
  HiOutlineXMark,
} from 'react-icons/hi2';
import ProductGrid from '../components/product/ProductGrid';
import MarketplaceMap from '../components/map/MarketplaceMap';
import { listProducts, getNearbyProducts } from '../services/productsApi';
import { setProducts, setLoading, setError } from '../features/products/productsSlice';
import useLocation from '../hooks/useLocation';
import useDebounce from '../hooks/useDebounce';
import {
  CATEGORIES,
  CONDITIONS,
  SELLER_TYPES,
  SORT_OPTIONS,
  RADIUS_OPTIONS,
} from '../utils/constants';

export default function Marketplace() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const products = useSelector((state) => state.products.items);
  const isLoading = useSelector((state) => state.products.isLoading);
  const { radius, changeRadius, latitude, longitude } = useLocation();

  // Scroll ref & scroll indicators for Category Chip Bar
  const categoryScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Read URL parameters
  const urlCategory = searchParams.get('category') || null;
  const urlSearch = searchParams.get('search') || '';
  const urlSort = searchParams.get('sort') || 'newest';

  const [searchInput, setSearchInput] = useState(urlSearch);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [selectedSellerType, setSelectedSellerType] = useState(null);
  const [selectedSort, setSelectedSort] = useState(urlSort);

  const debouncedSearch = useDebounce(searchInput, 400);

  // Check scroll state for left/right gradient & arrow indicators
  const checkScrollState = useCallback(() => {
    const el = categoryScrollRef.current;
    if (el) {
      const hasOverflow = el.scrollWidth > el.clientWidth;
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    }
  }, []);

  useEffect(() => {
    checkScrollState();
    window.addEventListener('resize', checkScrollState);
    return () => window.removeEventListener('resize', checkScrollState);
  }, [checkScrollState]);

  const scrollCategoryTrack = (direction) => {
    const el = categoryScrollRef.current;
    if (el) {
      const scrollAmount = 260;
      el.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Sync state when URL search params change
  useEffect(() => {
    const nextCat = searchParams.get('category');
    if (nextCat === 'all') {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(nextCat || null);
    }
  }, [searchParams]);

  useEffect(() => {
    const nextSearch = searchParams.get('search') || '';
    setSearchInput(nextSearch);
  }, [searchParams]);

  useEffect(() => {
    const nextSort = searchParams.get('sort') || 'newest';
    setSelectedSort(nextSort);
  }, [searchParams]);

  // Handle category chip selection and URL update
  const handleCategorySelect = useCallback((slug) => {
    const nextSlug = selectedCategory === slug ? null : slug;
    setSelectedCategory(nextSlug);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (nextSlug) {
        p.set('category', nextSlug);
      } else {
        p.delete('category');
      }
      return p;
    }, { replace: true });
  }, [selectedCategory, setSearchParams]);

  // Handle sort selection and URL update
  const handleSortSelect = useCallback((sortValue) => {
    setSelectedSort(sortValue);
    setSortOpen(false);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (sortValue && sortValue !== 'newest') {
        p.set('sort', sortValue);
      } else {
        p.delete('sort');
      }
      return p;
    }, { replace: true });
  }, [setSearchParams]);

  // Clear all active filters
  const handleClearFilters = useCallback(() => {
    setSelectedCategory(null);
    setSelectedCondition(null);
    setSelectedSellerType(null);
    setPriceMin('');
    setPriceMax('');
    setSearchInput('');
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.delete('category');
      p.delete('search');
      return p;
    }, { replace: true });
  }, [setSearchParams]);

  // Fetch products matching all active filters
  useEffect(() => {
    async function fetchFilteredProducts() {
      dispatch(setLoading(true));
      try {
        if (selectedSort === 'nearest' && latitude != null && longitude != null) {
          const nearby = await getNearbyProducts({
            lat: latitude,
            lng: longitude,
            radius: radius || 10,
          });
          let filtered = Array.isArray(nearby) ? nearby : [];

          if (debouncedSearch) {
            const query = debouncedSearch.toLowerCase();
            filtered = filtered.filter(
              (p) =>
                p.title?.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query)
            );
          }

          if (selectedCategory && selectedCategory !== 'all') {
            const matchedCategory = CATEGORIES.find(
              (c) => c.slug === selectedCategory || c.id === selectedCategory
            );
            filtered = filtered.filter(
              (p) =>
                p.category?.slug === selectedCategory ||
                p.category?.id === selectedCategory ||
                p.category_id === selectedCategory ||
                (matchedCategory && p.category_id === matchedCategory.id)
            );
          }

          if (selectedCondition) {
            filtered = filtered.filter((p) => p.condition === selectedCondition);
          }
          if (priceMin) {
            filtered = filtered.filter((p) => Number(p.price) >= Number(priceMin));
          }
          if (priceMax) {
            filtered = filtered.filter((p) => Number(p.price) <= Number(priceMax));
          }
          dispatch(setProducts(filtered));
        } else {
          const res = await listProducts({
            search: debouncedSearch || undefined,
            category: selectedCategory && selectedCategory !== 'all' ? selectedCategory : undefined,
            condition: selectedCondition || undefined,
            minPrice: priceMin || undefined,
            maxPrice: priceMax || undefined,
            sort:
              selectedSort === 'price_low'
                ? 'price-low'
                : selectedSort === 'price_high'
                ? 'price-high'
                : 'newest',
          });
          dispatch(setProducts(res?.products || []));
        }
      } catch (err) {
        console.warn('Marketplace fetch error:', err);
        dispatch(setError(err?.message || 'Failed to load products'));
        dispatch(setProducts([]));
      } finally {
        dispatch(setLoading(false));
      }
    }
    fetchFilteredProducts();
  }, [
    dispatch,
    debouncedSearch,
    selectedCategory,
    selectedCondition,
    selectedSellerType,
    priceMin,
    priceMax,
    selectedSort,
    latitude,
    longitude,
    radius,
  ]);

  const activeCategoryObj = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'all') return null;
    return CATEGORIES.find((c) => c.slug === selectedCategory || c.id === selectedCategory) || null;
  }, [selectedCategory]);

  const activeFilterCount = [
    selectedCategory,
    selectedCondition,
    selectedSellerType,
    priceMin,
    priceMax,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Header & View Mode Switcher */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Marketplace
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Discover authentic rural produce, crafts, and goods from verified local producers
          </p>
        </div>

        {/* View Mode Switcher (Grid vs Map) */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-2xl self-start sm:self-auto border border-neutral-200/60 shadow-2xs">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-primary-700 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <HiOutlineSquares2X2 className="w-4 h-4" />
            <span>Grid View</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'map'
                ? 'bg-white text-primary-700 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <HiOutlineMap className="w-4 h-4" />
            <span>Map View</span>
          </button>
        </div>
      </motion.div>

      {/* Search & Main Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search produce, wheat, mangoes, crafts..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-2xs"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
            >
              <HiOutlineXMark className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:border-neutral-300 transition-colors w-full sm:w-auto shadow-2xs cursor-pointer"
          >
            <span>{SORT_OPTIONS.find((s) => s.value === selectedSort)?.label || 'Sort'}</span>
            <HiChevronDown className="w-4 h-4 text-neutral-400" />
          </button>
          {sortOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-1.5 bg-white rounded-2xl shadow-lg border border-neutral-100 py-1.5 z-20 min-w-[190px]"
            >
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortSelect(option.value)}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer ${
                    selectedSort === option.value ? 'text-primary-600 bg-primary-50' : 'text-neutral-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Filters Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-medium transition-colors shadow-2xs cursor-pointer ${
            showFilters || activeFilterCount > 0
              ? 'border-primary-500 bg-primary-50 text-primary-700 font-bold'
              : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
          }`}
        >
          <HiOutlineAdjustmentsHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-[11px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Production-Grade Category Chip Bar with Gradient Fades and Smooth Navigation */}
      <div className="relative w-full max-w-full group">
        {/* Left subtle gradient fade and scroll button */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pr-4 pl-0.5 bg-gradient-to-r from-neutral-50/95 via-neutral-50/70 to-transparent pointer-events-none">
            <button
              onClick={() => scrollCategoryTrack('left')}
              className="pointer-events-auto p-1.5 rounded-full bg-white text-neutral-700 shadow-md border border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 transition-all cursor-pointer hidden sm:flex items-center justify-center"
              aria-label="Scroll categories left"
            >
              <HiChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Horizontal scroll container (No page-level horizontal overflow) */}
        <div
          ref={categoryScrollRef}
          onScroll={checkScrollState}
          className="flex items-center gap-2 overflow-x-auto overflow-y-hidden py-1 px-0.5 scroll-smooth overscroll-x-contain scrollbar-none w-full"
        >
          <button
            onClick={() => handleCategorySelect(null)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all select-none cursor-pointer ${
              !selectedCategory
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/60'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.slug)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer ${
                selectedCategory === cat.slug
                  ? 'bg-primary-600 text-white font-bold shadow-xs'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/60'
              }`}
            >
              <span className="text-sm leading-none">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Right subtle gradient fade and scroll button */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pl-4 pr-0.5 bg-gradient-to-l from-neutral-50/95 via-neutral-50/70 to-transparent pointer-events-none">
            <button
              onClick={() => scrollCategoryTrack('right')}
              className="pointer-events-auto p-1.5 rounded-full bg-white text-neutral-700 shadow-md border border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 transition-all cursor-pointer hidden sm:flex items-center justify-center"
              aria-label="Scroll categories right"
            >
              <HiChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Radius Quick Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-neutral-500 flex items-center gap-1">
          <HiOutlineMapPin className="w-3.5 h-3.5 text-primary-500" />
          Radius:
        </span>
        <div className="flex gap-1.5">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r.label}
              onClick={() => changeRadius(r.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                radius === r.value
                  ? 'bg-primary-500 text-white shadow-xs'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Drawer / Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-3xl border border-neutral-100 p-5 sm:p-6 shadow-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => handleCategorySelect(e.target.value || null)}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Condition
              </label>
              <select
                value={selectedCondition || ''}
                onChange={(e) => setSelectedCondition(e.target.value || null)}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
              >
                <option value="">Any Condition</option>
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Seller Type
              </label>
              <select
                value={selectedSellerType || ''}
                onChange={(e) => setSelectedSellerType(e.target.value || null)}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
              >
                <option value="">All Sellers</option>
                {SELLER_TYPES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Price Range (₹)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                />
              </div>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="mt-4 pt-3 border-t border-neutral-100 flex justify-end">
              <button
                onClick={handleClearFilters}
                className="text-xs text-primary-600 font-bold hover:text-primary-700 cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {activeCategoryObj ? (
            <div className="flex items-center gap-1.5 text-sm font-bold text-neutral-800">
              <span className="text-lg">{activeCategoryObj.icon}</span>
              <span>{activeCategoryObj.name}</span>
              <span className="text-neutral-400 font-normal text-xs">
                ({products.length} {products.length === 1 ? 'item' : 'items'})
              </span>
            </div>
          ) : (
            <p className="text-sm font-semibold text-neutral-700">
              {products.length} {products.length === 1 ? 'product' : 'products'} available
            </p>
          )}
        </div>
      </div>

      {/* Main View: Grid vs Interactive Map */}
      {viewMode === 'map' ? (
        <MarketplaceMap
          products={products}
          userLocation={{ latitude, longitude }}
          radius={radius}
          className="h-[580px] w-full"
        />
      ) : (
        <ProductGrid products={products} isLoading={isLoading} />
      )}
    </div>
  );
}
