import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product, RateSettings } from '../types';
import { calculatePriceBreakdown, formatINR } from '../utils/pricing';

interface WishlistDrawerProps {
  isOpen: boolean;
  wishlistItems: Product[];
  rates: RateSettings;
  onClose: () => void;
  onRemoveFromWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  wishlistItems,
  rates,
  onClose,
  onRemoveFromWishlist,
  onAddToCart
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="bg-[#FCF8F1] w-full max-w-md h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300 border-l border-[#D4AF37]/40">
        
        {/* Header */}
        <div className="p-5 border-b border-[#D4AF37]/30 bg-[#8F171B] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#D4AF37] fill-current" />
            <h2 className="font-serif text-xl font-bold text-[#EBDCC5]">Saved Wishlist</h2>
            <span className="bg-[#D4AF37] text-[#292321] text-xs font-bold px-2 py-0.5 rounded-full ml-1">
              {wishlistItems.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-[#D4AF37]/20">
          {wishlistItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
              <Heart className="w-16 h-16 text-[#D4AF37]/40" />
              <h3 className="font-serif text-xl font-bold text-[#292321]">No saved items yet</h3>
              <p className="text-xs text-gray-500 max-w-xs">
                Click the heart icon on any gold or silver piece to save it to your personal wishlist.
              </p>
            </div>
          ) : (
            wishlistItems.map((product) => {
              const breakdown = calculatePriceBreakdown(
                product.net_weight,
                product.metal_type,
                product.wastage_percent,
                product.making_charges,
                rates
              );

              return (
                <div key={product.id} className="pt-4 first:pt-0 flex gap-3">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg border border-[#D4AF37]/40 shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-serif text-sm font-bold text-[#292321] line-clamp-1">
                        {product.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => onRemoveFromWishlist(product)}
                        className="text-gray-400 hover:text-[#8F171B] p-1"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-[11px] text-[#8F171B] font-mono">
                      {product.net_weight}g Wt. · {product.purity_hallmark}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-bold font-mono text-[#8F171B]">
                        {formatINR(breakdown.final_price)}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          onAddToCart(product);
                          onRemoveFromWishlist(product);
                        }}
                        className="bg-[#8F171B] text-white hover:bg-[#580E11] px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 shadow-2xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" /> Add to Bag
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
