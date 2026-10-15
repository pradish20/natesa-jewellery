import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, MapPin, Phone } from 'lucide-react';
import { Order } from '../types';
import { formatINR } from '../utils/pricing';
import { Logo } from './Logo';

interface OrderReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FCF8F1] rounded-2xl border-2 border-[#D4AF37]/60 max-w-2xl w-full overflow-hidden shadow-2xl my-8 relative animate-in zoom-in-95 duration-200 print:m-0 print:p-0 print:border-none print:shadow-none">
        
        {/* Actions Bar */}
        <div className="bg-[#292321] text-white p-4 flex items-center justify-between border-b border-[#D4AF37]/30 print:hidden">
          <div className="flex items-center gap-2 text-xs text-[#EBDCC5] font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Order Confirmed & Invoice Generated</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-[#8F171B] hover:bg-[#580E11] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#D4AF37]" /> Print Tax Invoice
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Body */}
        <div className="p-6 sm:p-8 space-y-6 text-[#292321]">
          {/* Invoice Header */}
          <div className="border-b-2 border-[#D4AF37] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Logo className="h-12 w-auto mb-1" />
              <div className="text-[10px] text-gray-600 mt-1 space-y-0.5">
                <p>Main Branch: Near Old Bus Stand, Gandhi Road, Main Bazaar, Krishnagiri — 635001</p>
                <p>Second Branch: Bazaar Street, Opp Town Hall, Dharmapuri — 636701</p>
                <p>Phones: +91 94432 53072 / +91 99444 00666 | GSTIN: 33AAAAA0000A1Z5</p>
              </div>
            </div>

            <div className="sm:text-right bg-[#8F171B]/5 border border-[#8F171B]/20 p-3 rounded-xl min-w-[180px]">
              <span className="text-[10px] font-bold uppercase text-[#8F171B] block">OFFICIAL TAX INVOICE</span>
              <span className="text-base font-bold font-mono text-[#8F171B] block">{order.id}</span>
              <span className="text-[10px] text-gray-500 font-mono block">
                Date: {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </span>
            </div>
          </div>

          {/* Customer & Shipping Summary */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-white p-4 rounded-xl border border-[#D4AF37]/30">
            <div>
              <span className="text-[10px] font-bold text-[#8F171B] uppercase block mb-1">Billed & Shipped To:</span>
              <p className="font-bold text-[#292321]">{order.customer_name}</p>
              <p className="text-gray-600 font-light whitespace-pre-line">{order.address}</p>
              <p className="text-gray-600">{order.city}, {order.state} — {order.pincode}</p>
              <p className="text-gray-800 font-mono mt-1">Phone: {order.phone}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#8F171B] uppercase block mb-1">Order & Payment Info:</span>
              <p className="text-gray-700">Payment Mode: <strong>{order.payment_method}</strong></p>
              <p className="text-gray-700">Payment Status: <strong className="text-emerald-700">{order.payment_status}</strong></p>
              <p className="text-gray-700">Order Status: <strong className="text-[#8F171B]">{order.status}</strong></p>
              <p className="text-gray-600 font-mono mt-1 text-[11px]">
                Tracking Code: {order.tracking_number || 'Assigning Courier...'}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#8F171B] text-white font-serif border-b border-[#D4AF37]">
                  <th className="p-2.5">Item Description</th>
                  <th className="p-2.5">Net Wt.</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Price/Unit</th>
                  <th className="p-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4AF37]/20 font-mono bg-white">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 font-sans font-semibold text-[#292321]">
                      {item.product_name}
                      <span className="block text-[10px] text-gray-500 font-mono">
                        {item.metal_type === '925_silver' ? '92.5 Sterling Silver' : '22K Hallmarked Gold'}
                      </span>
                    </td>
                    <td className="p-2.5 text-gray-700">{item.net_weight}g</td>
                    <td className="p-2.5 text-center">{item.quantity}</td>
                    <td className="p-2.5 text-right">{formatINR(item.price_per_unit)}</td>
                    <td className="p-2.5 text-right font-bold text-[#8F171B]">
                      {formatINR(item.price_per_unit * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax Breakdown & Grand Total */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-t border-[#D4AF37]/40 pt-4 text-xs">
            <div className="text-[10px] text-gray-500 space-y-1 max-w-sm">
              <p className="flex items-center gap-1 font-semibold text-[#8F171B]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                100% BIS 916 Hallmarked Authenticity Certified
              </p>
              <p>Keep this tax invoice for warranty, free annual polish, and buy-back services at any Natesa branch.</p>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 font-mono text-xs bg-white p-3 rounded-lg border border-[#D4AF37]/30">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatINR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Statutory GST (3%)</span>
                <span>{formatINR(order.gst_total)}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-[11px]">
                <span>Insured Delivery</span>
                <span className="text-emerald-700">FREE</span>
              </div>
              <div className="border-t border-[#D4AF37]/50 pt-1.5 flex justify-between font-bold text-sm text-[#8F171B]">
                <span>Grand Total</span>
                <span>{formatINR(order.grand_total)}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-[10px] text-gray-500 pt-4 border-t border-gray-200">
            Thank you for choosing Natesa Jewellery • Krishnagiri & Dharmapuri • Tradition • Trust • Timeless Beauty
          </div>
        </div>

      </div>
    </div>
  );
};
