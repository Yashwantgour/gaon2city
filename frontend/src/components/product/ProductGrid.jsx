import ProductCard from './ProductCard';
import EmptyState from '../common/EmptyState';
import { HiOutlineBuildingStorefront } from 'react-icons/hi2';

export default function ProductGrid({
  products = [],
  isLoading = false,
  favoriteProductIds,
  onToggleFavorite,
}) {
  if (!isLoading && products.length === 0) {
    return (
      <EmptyState
        icon={<HiOutlineBuildingStorefront className="w-10 h-10 text-neutral-300" />}
        title="No products found"
        description="Try adjusting your filters or increasing the search radius."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          favoriteProductIds={favoriteProductIds}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
