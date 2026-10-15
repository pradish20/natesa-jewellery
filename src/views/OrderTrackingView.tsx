import React, { useState } from 'react';
import { Search, Truck, CheckCircle2, Clock, AlertCircle, ShieldCheck } from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';
import { formatINR } from '../utils/pricing';

interface OrderTrackingViewProps {
  onOpenReceipt: (order: Order) => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({ onOpenReceipt }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setFoundOrder(null);

    try {
      const order = await api.trackOrder(query.trim());
      setFoundOrder(order);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setErrorMsg('No order record found for this ID or Phone number. Please check your order confirmation email/SMS.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold text-[#8F171B] uppercase tracking-widest">REAL-TIME SHIPMENT STATUS</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#292321]">
          Track Your Jewellery Order
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 font-light">
          Enter your Order ID (e.g. NJ-2026-8841) or phone number to view live courier tracking.
        </p>
      </div>

      {/* Lookup Form */}
      <form onSubmit={handleTrack} className="bg-white p-6 rounded-2xl border-2 border-[#D4AF37]/40 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            <input
              type="text"
              required
              placeholder="Enter Order ID (NJ-2026-8841) or Phone (+91 98401 23456)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#FCF8F1] border border-[#D4AF37]/50 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-[#292321]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#8F171B] text-white hover:bg-[#580E11] px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
          >
            <Truck className="w-4 h-4 text-[#D4AF37]" />
            <span>{loading ? 'Searching...' : 'Track Order'}</span>
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-[#8F171B] p-3 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#8F171B]" />
            <span>{errorMsg}</span>
          </div>
        )}
      </form>

      {/* Found Order Card */}
      {foundOrder && (
        <div className="bg-[#FCF8F1] border-2 border-[#D4AF37]/60 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D4AF37]/30">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#8F171B] tracking-wider block">ORDER ID</span>
              <h2 className="font-serif text-2xl font-bold text-[#292321]">{foundOrder.id}</h2>
              <span className="text-xs text-gray-500 font-mono">
                Placed on: {new Date(foundOrder.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-[#8F171B] text-[#EBDCC5] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#D4AF37]">
                Status: {foundOrder.status}
              </span>
              <button
                onClick={() => onOpenReceipt(foundOrder)}
                className="bg-white border border-[#D4AF37] hover:bg-[#8F171B] hover:text-white text-[#8F171B] text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                View Tax Invoice
              </button>
            </div>
          </div>

          {/* Stepper Pipeline */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs pt-2">
            {[
              { label: 'Pending', step: 'Pending' },
              { label: 'Processing', step: 'Processing' },
              { label: 'Shipped', step: 'Shipped' },
              { label: 'Delivered', step: 'Delivered' }
            ].map((st, idx) => {
              const statusOrder = ['Pending', 'Processing', 'Shipped', 'Delivered'];
              const currentIdx = statusOrder.indexOf(foundOrder.status);
              const isPassed = currentIdx >= idx;

              return (
                <div key={st.step} className="space-y-1">
                  <div
                    className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                      isPassed ? 'bg-[#8F171B] text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className={`block font-semibold ${isPassed ? 'text-[#8F171B]' : 'text-gray-400'}`}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Courier Details Box */}
          <div className="bg-white p-4 rounded-xl border border-[#D4AF37]/30 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#8F171B] uppercase">Courier Service:</span>
              <span className="font-mono font-semibold">{foundOrder.courier_name || 'DTDC / Blue Dart Express'}</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-2">
              <span className="font-bold text-[#8F171B] uppercase">Tracking AWB Number:</span>
              <span className="font-mono font-bold text-[#292321]">{foundOrder.tracking_number || 'TN992831'}</span>
            </div>
          </div>

          {/* Itemized Summary */}
          <div className="space-y-2">
            <h4 className="font-serif text-base font-bold text-[#292321]">Order Items:</h4>
            {foundOrder.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-xs bg-white p-3 rounded-lg border border-gray-200">
                <div>
                  <span className="font-semibold text-[#292321] block">{item.product_name}</span>
                  <span className="text-gray-500 font-mono text-[11px]">{item.net_weight}g Net Weight</span>
                </div>
                <span className="font-bold font-mono text-[#8F171B]">
                  {formatINR(item.price_per_unit * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-gray-500 flex items-center justify-center gap-1 pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            Insured door-to-door transit powered by Natesa Jewellery
          </div>
        </div>
      )}

    </div>
  );
};
