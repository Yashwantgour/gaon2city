export const CATEGORIES = [
  { id: '11111111-1111-4111-a111-111111111111', name: 'Agriculture', slug: 'agriculture', icon: '🌾', color: 'bg-green-50 text-green-700' },
  { id: '22222222-2222-4222-a222-222222222222', name: 'Dairy & Milk', slug: 'dairy-milk', icon: '🥛', color: 'bg-blue-50 text-blue-700' },
  { id: '33333333-3333-4333-a333-333333333333', name: 'Fruits & Vegetables', slug: 'fruits-vegetables', icon: '🥬', color: 'bg-emerald-50 text-emerald-700' },
  { id: '44444444-4444-4444-a444-444444444444', name: 'Handicrafts', slug: 'handicrafts', icon: '🏺', color: 'bg-amber-50 text-amber-700' },
  { id: '55555555-5555-4555-a555-555555555555', name: 'Clothing', slug: 'clothing', icon: '👕', color: 'bg-purple-50 text-purple-700' },
  { id: '66666666-6666-4666-a666-666666666666', name: 'Electronics', slug: 'electronics', icon: '📱', color: 'bg-sky-50 text-sky-700' },
  { id: '77777777-7777-4777-a777-777777777777', name: 'Home & Kitchen', slug: 'home-kitchen', icon: '🏠', color: 'bg-orange-50 text-orange-700' },
  { id: '88888888-8888-4888-a888-888888888888', name: 'Vehicles', slug: 'vehicles', icon: '🚜', color: 'bg-slate-50 text-slate-700' },
  { id: '99999999-9999-4999-a999-999999999999', name: 'Tools & Equipment', slug: 'tools-equipment', icon: '🔧', color: 'bg-zinc-50 text-zinc-700' },
  { id: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', name: 'Services', slug: 'services', icon: '🛠️', color: 'bg-teal-50 text-teal-700' },
  { id: 'bbbbbbbb-bbbb-4bbb-abbb-bbbbbbbbbbbb', name: 'Food & Snacks', slug: 'food-snacks', icon: '🍛', color: 'bg-red-50 text-red-700' },
  { id: 'cccccccc-cccc-4ccc-accc-cccccccccccc', name: 'Health & Beauty', slug: 'health-beauty', icon: '💊', color: 'bg-pink-50 text-pink-700' },
];

export const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'used-like-new', label: 'Used - Like New' },
  { value: 'used-good', label: 'Used - Good' },
  { value: 'used-fair', label: 'Used - Fair' },
];

export const SELLER_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'farmer', label: 'Farmer' },
  { value: 'local_shop', label: 'Local Shop' },
  { value: 'business', label: 'Business' },
  { value: 'service_provider', label: 'Service Provider' },
];

export const RADIUS_OPTIONS = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: null, label: 'All Areas' },
];

export const SORT_OPTIONS = [
  { value: 'nearest', label: 'Nearest First' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
];

export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'ready_for_pickup', label: 'Ready for Pickup' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];
