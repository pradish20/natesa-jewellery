import React, { useState } from 'react';
import { X, ShieldCheck, Award, ShoppingBag, Heart, Scale, Sparkles, CheckCircle2 } from 'lucide-react';
import { Product, RateSettings } from '../types';
import { calculatePriceBreakdown, formatINR } from '../utils/pricing';

interface ProductDetailModalProps {
  product: Product | null;
  rates: RateSettings;
  isWishlisted: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onToggleWishlist: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  rates,
  isWishlisted,
  onClose,
  onAddToCart,
  onToggleWishlist
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState<number>(1);
  const breakdown = calculatePriceBreakdown(
    product.net_weight,
    product.metal_type,
    product.wastage_percent,
    product.making_charges,
    rates
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#FCF8F1] rounded-2xl border-2 border-[#D4AF37]/50 max-w-4xl w-full overflow-hidden shadow-2xl relative my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-white/80 hover:bg-white text-[#292321] p-1.5 sm:p-2 rounded-full transition-colors shadow-md"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 w-full">
          {/* Image Gallery Column */}
          <div className="md:col-span-5 bg-[#292321] p-4 sm:p-6 flex flex-col justify-between relative min-h-[260px] sm:min-h-[320px]">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-56 sm:h-72 md:h-96 object-cover rounded-xl border border-[#D4AF37]/30 shadow-lg"
              referrerPolicy="no-referrer"
            />

            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#D4AF37]/20 text-[11px] sm:text-xs text-[#EBDCC5] space-y-1.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>100% Certified {product.purity_hallmark}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Free Insured Doorstep Express Shipping</span>
              </div>
            </div>
          </div>

          {/* Detailed Info Column */}
          <div className="md:col-span-7 p-4 sm:p-8 space-y-4 sm:space-y-5">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-xs font-bold text-[#8F171B] uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {product.purity_hallmark}
                </span>

                <button
                  type="button"
                  onClick={() => onToggleWishlist(product)}
                  className={`p-1.5 sm:p-2 rounded-full border transition-all ${
                    isWishlisted
                      ? 'bg-[#8F171B] text-white border-[#8F171B]'
                      : 'bg-white text-[#292321] border-[#D4AF37]/40 hover:text-[#8F171B]'
                  }`}
                  title="Toggle Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-[#292321] mt-1">
                {product.name}
              </h2>
              <p className="text-xs text-gray-600 font-light mt-1.5 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Transparent Calculation Breakdown Table */}
            <div className="bg-white border border-[#D4AF37]/40 rounded-xl p-3 sm:p-4 shadow-2xs space-y-2 sm:space-y-3">
              <div className="text-[11px] sm:text-xs font-bold text-[#8F171B] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#D4AF37]/20 pb-1.5 sm:pb-2">
                <Scale className="w-4 h-4 text-[#D4AF37]" />
                <span>Transparent Price Calculation</span>
              </div>

              <div className="space-y-1 text-xs font-mono text-[#292321]">
                <div className="flex justify-between py-0.5">
                  <span className="text-gray-600">Net Weight</span>
                  <span className="font-semibold">{product.net_weight} Grams</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-gray-600">Current Market Rate</span>
                  <span className="font-semibold">{formatINR(breakdown.rate_per_gram)} / g</span>
                </div>
                <div className="flex justify-between py-0.5 border-t border-gray-100 pt-1">
                  <span className="text-gray-600">Raw Metal Value</span>
                  <span className="font-semibold">{formatINR(breakdown.metal_value)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-gray-600">Wastage ({product.wastage_percent}%)</span>
                  <span className="font-semibold">{formatINR(breakdown.wastage_value)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-gray-600">Making Charges</span>
                  <span className="font-semibold">{formatINR(breakdown.making_charges)}</span>
                </div>
                <div className="flex justify-between py-0.5 border-t border-gray-100 pt-1 text-[#8F171B]">
                  <span>GST (3% Statutory Tax)</span>
                  <span className="font-semibold">{formatINR(breakdown.gst_amount)}</span>
                </div>
              </div>

              <div className="border-t border-[#D4AF37]/40 pt-2 flex items-baseline justify-between">
                <span className="text-xs font-bold uppercase text-[#8F171B]">Final Total Price</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-[#8F171B]">
                  {formatINR(breakdown.final_price * quantity)}
                </span>
              </div>
            </div>

            {/* Quantity Stepper & Add to Bag */}
            <div className="pt-1 flex items-center gap-3 sm:gap-4">
              <div className="flex items-center border border-[#D4AF37]/50 rounded-lg bg-white overflow-hidden shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-[#8F171B] hover:bg-[#EBDCC5]/40"
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-xs font-bold font-mono">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-[#8F171B] hover:bg-[#EBDCC5]/40"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onAddToCart(product, quantity);
                  onClose();
                }}
                className="flex-1 bg-[#8F171B] text-white hover:bg-[#580E11] py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                <span>Add {quantity} to Shopping Bag</span>
              </button>
            </div>

            <p className="text-[10px] text-gray-500 flex items-center gap-1 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Includes official tax invoice, BIS hallmarked certificate tag, and lifetime buy-back guarantee.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
