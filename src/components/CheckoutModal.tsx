import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { CartItem, Order } from '../types';
import { formatINR } from '../utils/pricing';

interface CheckoutModalProps {
  isOpen: boolean;
  cartItems: CartItem[];
  couponDiscount: number;
  onClose: () => void;
  onOrderPlaced: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  cartItems,
  couponDiscount,
  onClose,
  onOrderPlaced
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Krishnagiri',
    state: 'Tamil Nadu',
    pincode: '635001',
    paymentMethod: 'COD' as 'COD' | 'Razorpay'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRazorpaySim, setShowRazorpaySim] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const rawSubtotal = cartItems.reduce((acc, item) => acc + item.computed_breakdown.subtotal * item.quantity, 0);
  const totalGST = cartItems.reduce((acc, item) => acc + item.computed_breakdown.gst_amount * item.quantity, 0);
  const grandTotal = Math.max(0, rawSubtotal + totalGST - couponDiscount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address || !formData.pincode) {
      setErrorMessage('Please complete all required address and phone fields.');
      return;
    }

    if (formData.paymentMethod === 'Razorpay') {
      setShowRazorpaySim(true);
      return;
    }

    await finalizeOrder('Pending', 'COD');
  };

  const finalizeOrder = async (paymentStatus: 'Pending' | 'Paid', method: 'COD' | 'Razorpay') => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const orderPayload = {
        customer_name: formData.name,
        email: formData.email || `${formData.phone.replace(/[^0-9]/g, '')}@natesa.com`,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        items: cartItems.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          net_weight: item.product.net_weight,
          metal_type: item.product.metal_type,
          price_per_unit: item.computed_price,
          quantity: item.quantity,
          image_url: item.product.image_url
        })),
        subtotal: rawSubtotal,
        gst_total: totalGST,
        grand_total: grandTotal,
        payment_method: method,
        payment_status: paymentStatus
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) throw new Error('Failed to create order on server');
      const createdOrder: Order = await response.json();

      setIsSubmitting(false);
      setShowRazorpaySim(false);
      onOrderPlaced(createdOrder);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(err instanceof Error ? err.message : 'Order processing failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FCF8F1] rounded-2xl border-2 border-[#D4AF37]/50 max-w-2xl w-full overflow-hidden shadow-2xl my-8 relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#8F171B] text-[#FCF8F1] p-5 flex items-center justify-between border-b border-[#D4AF37]/40">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest block">Natesa Jewellery</span>
            <h2 className="font-serif text-2xl font-bold text-[#EBDCC5]">Checkout & Shipping Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showRazorpaySim ? (
          /* Razorpay Gateway Simulation Modal */
          <div className="p-8 space-y-6 text-center">
            <div className="bg-[#02042B] text-white p-6 rounded-xl space-y-4 border border-[#D4AF37]/40">
              <div className="flex items-center justify-between text-xs text-gray-300 border-b border-gray-700 pb-3">
                <span className="font-bold tracking-wider text-[#3399FF]">RAZORPAY SECURE GATEWAY</span>
                <span>Natesa Jewellery Merchant</span>
              </div>

              <div>
                <span className="text-xs text-gray-400 uppercase">Amount Payable</span>
                <div className="text-3xl font-bold font-mono text-[#D4AF37]">{formatINR(grandTotal)}</div>
              </div>

              <div className="bg-white/10 rounded-lg p-3 text-xs text-left space-y-2">
                <p className="font-semibold text-gray-200">Select Simulated Payment Method:</p>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="rzp" defaultChecked className="text-[#3399FF]" />
                    <span>UPI App (GPay / PhonePe / Paytm / BHIM)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="rzp" className="text-[#3399FF]" />
                    <span>Credit / Debit Card (Visa, Mastercard, RuPay)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="rzp" className="text-[#3399FF]" />
                    <span>Net Banking (SBI, HDFC, ICICI, Canara)</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRazorpaySim(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => finalizeOrder('Paid', 'Razorpay')}
                  className="flex-1 bg-[#3399FF] hover:bg-[#2080E0] text-white py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? 'Processing Payment...' : 'Pay ' + formatINR(grandTotal)}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Normal Shipping Form */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-[#8F171B] px-4 py-2.5 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#292321] uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. S. Meenakshi"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-[#D4AF37]/50 rounded-lg px-3 py-2 text-xs font-semibold text-[#292321]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#292321] uppercase mb-1">
                  Phone / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 94432 00000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white border border-[#D4AF37]/50 rounded-lg px-3 py-2 text-xs font-semibold text-[#292321]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#292321] uppercase mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="meenakshi@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white border border-[#D4AF37]/50 rounded-lg px-3 py-2 text-xs font-semibold text-[#292321]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#292321] uppercase mb-1">
                Street Address *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Door No, Street Name, Landmark"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-white border border-[#D4AF37]/50 rounded-lg px-3 py-2 text-xs font-semibold text-[#292321]"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#292321] uppercase mb-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-white border border-[#D4AF37]/50 rounded-lg px-3 py-2 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#292321] uppercase mb-1">
                  State
                </label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-white border border-[#D4AF37]/50 rounded-lg px-3 py-2 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#292321] uppercase mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full bg-white border border-[#D4AF37]/50 rounded-lg px-3 py-2 text-xs font-semibold"
                />
              </div>
            </div>

            {/* Payment Method Radio Selection */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-[#8F171B] uppercase mb-2">
                Payment Option
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`border rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all ${
                    formData.paymentMethod === 'COD'
                      ? 'border-[#8F171B] bg-[#8F171B]/5 ring-1 ring-[#8F171B]'
                      : 'border-[#D4AF37]/40 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={formData.paymentMethod === 'COD'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                    className="text-[#8F171B]"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#292321] flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-[#8F171B]" /> Cash on Delivery
                    </div>
                    <div className="text-[10px] text-gray-500">Pay at doorstep upon delivery</div>
                  </div>
                </label>

                <label
                  className={`border rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all ${
                    formData.paymentMethod === 'Razorpay'
                      ? 'border-[#8F171B] bg-[#8F171B]/5 ring-1 ring-[#8F171B]'
                      : 'border-[#D4AF37]/40 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={formData.paymentMethod === 'Razorpay'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'Razorpay' })}
                    className="text-[#8F171B]"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#292321] flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-[#8F171B]" /> Online Payment
                    </div>
                    <div className="text-[10px] text-gray-500">UPI, Cards, NetBanking via Razorpay</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Total Order Cost Summary */}
            <div className="bg-[#292321] text-[#FCF8F1] rounded-xl p-4 flex items-center justify-between border border-[#D4AF37]/40">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] block">Final Payable Amount</span>
                <span className="text-xs text-gray-300">{cartItems.length} items with free insured courier</span>
              </div>
              <div className="text-2xl font-bold font-mono text-[#D4AF37]">
                {formatINR(grandTotal)}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#8F171B] text-white hover:bg-[#580E11] py-3.5 rounded-lg font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Generating Order Receipt...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                  <span>
                    {formData.paymentMethod === 'Razorpay' ? 'Proceed to Razorpay' : 'Place Order Now'}
                  </span>
                </>
              )}
            </button>

            <div className="text-[10px] text-center text-gray-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              Fully Insured Transit Guarantee by Natesa Jewellery
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
