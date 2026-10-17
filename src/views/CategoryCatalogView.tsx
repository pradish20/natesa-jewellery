import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Category, Product, RateSettings } from '../types';
import { getProductPrice } from '../utils/pricing';
import { Sparkles, SlidersHorizontal } from 'lucide-react';

interface CategoryCatalogViewProps {
  products: Product[];
  categories: Category[];
  rates: RateSettings;
  wishlist: Product[];
  selectedCategorySlug?: string;
  isSilverOnly?: boolean;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const CategoryCatalogView: React.FC<CategoryCatalogViewProps> = ({
  products,
  categories,
  rates,
  wishlist,
  selectedCategorySlug,
  isSilverOnly = false,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(
    selectedCategorySlug || (isSilverOnly ? 'silver-kolusu-anklets' : 'all')
  );
  const [sortBy, setSortBy] = useState<string>('featured');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync activeCategory whenever selectedCategorySlug prop updates from sub-menu selection
  useEffect(() => {
    if (selectedCategorySlug) {
      setActiveCategory(selectedCategorySlug);
    } else if (isSilverOnly) {
      setActiveCategory('silver-kolusu-anklets');
    } else {
      setActiveCategory('all');
    }
  }, [selectedCategorySlug, isSilverOnly]);

  // Filter categories for the current view (Silver vs Gold)
  const displayCategories = isSilverOnly
    ? categories.filter(c => c.is_silver_only || products.some(p => p.category_slug === c.slug && p.metal_type === '925_silver'))
    : categories.filter(c => !c.is_silver_only);

  // Filter items
  const filteredProducts = products.filter((p) => {
    if (isSilverOnly && p.metal_type !== '925_silver') return false;
    if (!isSilverOnly && p.metal_type === '925_silver') return false;
    if (activeCategory !== 'all' && p.category_slug !== activeCategory) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Sort items
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') {
      return getProductPrice(a, rates) - getProductPrice(b, rates);
    }
    if (sortBy === 'price-high') {
      return getProductPrice(b, rates) - getProductPrice(a, rates);
    }
    if (sortBy === 'weight-high') {
      return b.net_weight - a.net_weight;
    }
    return 0;
  });

  return (
    <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 space-y-8 w-full">
      
      {/* Header Banner */}
      <div className="bg-[#8F171B] text-[#FCF8F1] p-6 sm:p-10 rounded-2xl border-2 border-[#D4AF37]/50 shadow-md">
        <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          {isSilverOnly ? '92.5 Sterling Silver Collection' : '22K & 24K Gold Fine Jewellery'}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#EBDCC5] mt-1">
          {isSilverOnly ? 'Sterling Silver Kolusu & Articles' : 'Exquisite Heritage Gold Catalog'}
        </h1>
        <p className="text-xs sm:text-sm font-light text-[#FCF8F1]/80 max-w-2xl mt-2">
          Explore handcrafted jewellery with live market gold & silver price updates, hallmarked BIS 916 purity, and zero hidden costs.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#D4AF37]/30 shadow-2xs space-y-4">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#8F171B] text-white shadow-xs'
                : 'bg-[#FCF8F1] text-[#292321] hover:bg-[#EBDCC5]/40'
            }`}
          >
            {isSilverOnly ? 'All Silver Categories' : 'All Gold Categories'}
          </button>
          {displayCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeCategory === cat.slug
                  ? 'bg-[#8F171B] text-white shadow-xs'
                  : 'bg-[#FCF8F1] text-[#292321] hover:bg-[#EBDCC5]/40'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 border-t border-gray-100">
          <input
            type="text"
            placeholder="Search within catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-80 bg-[#FCF8F1] border border-[#D4AF37]/40 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#292321]"
          />

          <div className="flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto justify-end">
            <SlidersHorizontal className="w-4 h-4 text-[#8F171B]" />
            <span className="font-semibold text-gray-600 shrink-0">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#FCF8F1] border border-[#D4AF37]/40 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#292321]"
            >
              <option value="featured">Featured First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="weight-high">Net Weight: Heavy First</option>
            </select>
          </div>
        </div>

      </div>

      {/* Product Cards Grid */}
      {sortedProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#D4AF37]/30 p-12 text-center space-y-3">
          <p className="font-serif text-xl sm:text-2xl font-bold text-[#292321]">No jewellery found matching your filters</p>
          <p className="text-xs sm:text-sm text-gray-500">Try clearing search or selecting a different category.</p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
            }}
            className="bg-[#8F171B] text-white px-5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              rates={rates}
              isWishlisted={wishlist.some((w) => w.id === product.id)}
              onToggleWishlist={onToggleWishlist}
              onAddToCart={onAddToCart}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      )}

    </div>
  );
};
