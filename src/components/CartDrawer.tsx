import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { CartItem } from '../types';
import { formatINR } from '../utils/pricing';

interface CartDrawerProps {
  isOpen: boolean;
  cartItems: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: (couponDiscount: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  cartItems,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const rawSubtotal = cartItems.reduce((acc, item) => acc + item.computed_breakdown.subtotal * item.quantity, 0);
  const totalGST = cartItems.reduce((acc, item) => acc + item.computed_breakdown.gst_amount * item.quantity, 0);
  
  const couponDiscount = couponApplied ? Math.round((rawSubtotal + totalGST) * 0.05) : 0; // 5% festival discount
  const grandTotal = Math.max(0, rawSubtotal + totalGST - couponDiscount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'NATESA5' || couponCode.trim().toUpperCase() === 'FESTIVE') {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid code. Try "NATESA5" or "FESTIVE" for 5% off');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="bg-[#FCF8F1] w-full max-w-md h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300 border-l border-[#D4AF37]/40">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#D4AF37]/30 bg-[#8F171B] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-serif text-xl font-bold text-[#EBDCC5]">Shopping Bag</h2>
            <span className="bg-[#D4AF37] text-[#292321] text-xs font-bold px-2 py-0.5 rounded-full ml-1">
              {cartItems.reduce((a, b) => a + b.quantity, 0)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-[#D4AF37]/20">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
              <ShoppingBag className="w-16 h-16 text-[#D4AF37]/50" />
              <h3 className="font-serif text-xl font-bold text-[#292321]">Your bag is currently empty</h3>
              <p className="text-xs text-gray-500 max-w-xs font-light">
                Discover our heritage 22K gold necklaces, antique jhumkas, and temple bangles.
              </p>
              <button
                onClick={onClose}
                className="bg-[#8F171B] text-white px-5 py-2.5 rounded-lg text-xs font-semibold hover:bg-[#580E11] transition-colors"
              >
                Browse Heritage Catalog
              </button>
            </div>
          ) : (
            cartItems.map(({ product, quantity, computed_price, computed_breakdown }) => (
              <div key={product.id} className="pt-4 first:pt-0 flex gap-3">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-lg border border-[#D4AF37]/40 shrink-0"
                  referrerPolicy="no-referrer"
                />

                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-serif text-sm font-bold text-[#292321] line-clamp-1">
                      {product.name}
                    </h4>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(product.id)}
                      className="text-gray-400 hover:text-[#8F171B] p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-[11px] text-[#8F171B] font-mono">
                    {product.net_weight}g Wt. · {product.purity_hallmark}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center border border-[#D4AF37]/40 rounded bg-white">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(product.id, -1)}
                        className="px-2 py-0.5 text-xs font-bold text-[#8F171B]"
                      >
                        -
                      </button>
                      <span className="px-2 py-0.5 text-xs font-mono font-semibold">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(product.id, 1)}
                        className="px-2 py-0.5 text-xs font-bold text-[#8F171B]"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-[#8F171B]">
                        {formatINR(computed_price * quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Summary */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-[#D4AF37]/30 bg-white space-y-3">
            {/* Coupon Code Section */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
                <input
                  type="text"
                  placeholder="Coupon Code (e.g. FESTIVE)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full bg-[#FCF8F1] border border-[#D4AF37]/40 rounded-lg pl-8 pr-3 py-1.5 text-xs uppercase font-semibold text-[#292321]"
                />
              </div>
              <button
                type="submit"
                className="bg-[#292321] text-[#FCF8F1] hover:bg-[#8F171B] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              >
                Apply
              </button>
            </form>
            {couponApplied && (
              <p className="text-[11px] text-emerald-700 font-medium">
                ✓ 5% Festive Offer Applied (-{formatINR(couponDiscount)})
              </p>
            )}
            {couponError && <p className="text-[11px] text-[#8F171B]">{couponError}</p>}

            {/* Calculations Breakdown */}
            <div className="space-y-1 text-xs font-mono text-gray-600 border-t border-gray-100 pt-2">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>{formatINR(rawSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Statutory GST (3%)</span>
                <span>{formatINR(totalGST)}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Special Discount</span>
                  <span>-{formatINR(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500 text-[11px]">
                <span>Insured Doorstep Delivery</span>
                <span className="text-emerald-600 font-semibold">FREE</span>
              </div>
            </div>

            <div className="border-t border-[#D4AF37]/40 pt-2 flex items-baseline justify-between">
              <span className="text-xs font-bold uppercase text-[#8F171B]">Grand Total</span>
              <span className="text-2xl font-bold font-mono text-[#8F171B]">
                {formatINR(grandTotal)}
              </span>
            </div>

            <button
              onClick={() => onProceedToCheckout(couponDiscount)}
              className="w-full bg-[#8F171B] text-white hover:bg-[#580E11] py-3 rounded-lg font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
            </button>

            <div className="text-[10px] text-gray-500 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              Secure 256-Bit Encrypted Express Checkout
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
