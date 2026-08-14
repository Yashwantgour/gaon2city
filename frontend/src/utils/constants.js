export const CATEGORIES = [
  { id: '9afc48ef-9336-42d1-b607-9a01b82129b4', name: 'Grains & Pulses', slug: 'grains-pulses', icon: '🌾', color: 'bg-amber-50 text-amber-700' },
  { id: 'a1fa8152-135c-4958-9bad-2bf1e3e17358', name: 'Vegetables', slug: 'vegetables', icon: '🥬', color: 'bg-green-50 text-green-700' },
  { id: 'fb4ee733-d658-4410-b0e6-e145d390e97f', name: 'Fruits', slug: 'fruits', icon: '🍎', color: 'bg-red-50 text-red-700' },
  { id: '38033e62-fe14-4478-ad44-332cb23b0401', name: 'Dairy & Eggs', slug: 'dairy-eggs', icon: '🥛', color: 'bg-blue-50 text-blue-700' },
  { id: 'de2785fb-4ca6-4c77-b91c-62f96250a700', name: 'Spices & Herbs', slug: 'spices-herbs', icon: '🌿', color: 'bg-emerald-50 text-emerald-700' },
  { id: '809ad623-b3b6-4ab3-a339-8d78e8f2f8a5', name: 'Honey & Preserves', slug: 'honey-preserves', icon: '🍯', color: 'bg-yellow-50 text-yellow-700' },
  { id: '6fc237b9-c094-49f7-9682-3946bec1137f', name: 'Organic Fertilizers', slug: 'organic-fertilizers', icon: '🌱', color: 'bg-teal-50 text-teal-700' },
  { id: '104e2e65-0c4b-4f34-8082-3d5443fbb65c', name: 'Seeds & Plants', slug: 'seeds-plants', icon: '🌻', color: 'bg-purple-50 text-purple-700' },
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
