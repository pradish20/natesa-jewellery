import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, ShieldCheck, Scale } from 'lucide-react';
import { Product, RateSettings } from '../types';
import { calculatePriceBreakdown, formatINR } from '../utils/pricing';

interface ProductCardProps {
  product: Product;
  rates: RateSettings;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  rates,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct
}) => {
  const [imageLoaded, setImageLoaded] = useState(true);
  const breakdown = calculatePriceBreakdown(
    product.net_weight,
    product.metal_type,
    product.wastage_percent,
    product.making_charges,
    rates
  );

  return (
    <div className="bg-white rounded-xl border border-[#D4AF37]/30 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
      {/* Product Image Box */}
      <div className="relative bg-[#FCF8F1] overflow-hidden aspect-4/3 cursor-pointer" onClick={() => onSelectProduct(product)}>
        {imageLoaded ? (
          <img
            src={product.image_url}
            alt={product.name}
            onError={() => setImageLoaded(false)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FCF8F1] to-[#EBDCC5] p-4 text-center">
            <span className="font-serif text-lg font-bold text-[#8F171B]">{product.name}</span>
            <span className="text-xs text-[#292321]/60 mt-1">{product.net_weight}g Net Gold Weight</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
          <span className="bg-[#8F171B]/90 text-[#FCF8F1] text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs uppercase tracking-wider backdrop-blur-xs">
            {product.purity_hallmark}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all pointer-events-auto ${
              isWishlisted
                ? 'bg-[#8F171B] text-white shadow-md'
                : 'bg-white/80 text-[#292321] hover:text-[#8F171B] hover:bg-white'
            }`}
            title="Add to Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Quick View Overlay Bar */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="bg-white/90 text-[#292321] hover:bg-white text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#8F171B]" /> Full Breakdown
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Metadata line without pill shapes */}
          <div className="text-[11px] text-[#8F171B] font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Scale className="w-3 h-3 text-[#D4AF37]" />
            <span>{product.net_weight} Grams</span>
            <span className="text-gray-300">·</span>
            <span>{product.metal_type === '925_silver' ? '92.5 Silver' : '22K Gold'}</span>
          </div>

          <h3
            onClick={() => onSelectProduct(product)}
            className="font-serif text-lg font-bold text-[#292321] hover:text-[#8F171B] transition-colors line-clamp-1 cursor-pointer"
          >
            {product.name}
          </h3>

          <p className="text-xs text-gray-600 line-clamp-2 font-light mt-1">
            {product.description}
          </p>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="pt-2 border-t border-[#D4AF37]/20 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Live Calculated Price</span>
            <div className="text-lg font-bold font-mono text-[#8F171B]">
              {formatINR(breakdown.final_price)}
            </div>
            <span className="text-[9.5px] text-gray-500 block -mt-0.5">Incl. 3% GST & Making</span>
          </div>

          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="bg-[#8F171B] text-white hover:bg-[#580E11] px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Add to Bag</span>
          </button>
        </div>
      </div>
    </div>
  );
};
