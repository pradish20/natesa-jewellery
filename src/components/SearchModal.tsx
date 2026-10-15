import React, { useState } from 'react';
import { Search, X, Scale } from 'lucide-react';
import { Product, RateSettings } from '../types';
import { calculatePriceBreakdown, formatINR } from '../utils/pricing';

interface SearchModalProps {
  isOpen: boolean;
  products: Product[];
  rates: RateSettings;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  products,
  rates,
  onClose,
  onSelectProduct
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [selectedMetal, setSelectedMetal] = useState<string>('all');

  const filteredProducts = products.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase()) ||
      p.category_slug.toLowerCase().includes(query.toLowerCase());

    const matchesMetal = selectedMetal === 'all' || p.metal_type === selectedMetal;

    return matchesQuery && matchesMetal;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-start justify-center p-4 pt-16">
      <div className="bg-[#FCF8F1] rounded-2xl border-2 border-[#D4AF37]/50 max-w-3xl w-full overflow-hidden shadow-2xl relative animate-in fade-in duration-200">
        
        {/* Search Header Input */}
        <div className="p-4 sm:p-6 bg-[#8F171B] text-white flex items-center gap-3 border-b border-[#D4AF37]/40">
          <Search className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search gold necklaces, antique jhumkas, temple bangles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white placeholder-[#EBDCC5]/60 text-sm sm:text-base focus:outline-none font-medium"
          />
          <button
            onClick={onClose}
            className="p-1.5 text-[#EBDCC5] hover:text-white hover:bg-white/10 rounded-full transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pill Controls */}
        <div className="p-4 border-b border-[#D4AF37]/20 bg-white flex items-center gap-2 overflow-x-auto text-xs">
          <span className="font-bold text-[#8F171B] shrink-0">Filter Metal:</span>
          {[
            { id: 'all', label: 'All Metals' },
            { id: '22k_gold', label: '22K Gold' },
            { id: '24k_gold', label: '24K Gold' },
            { id: '925_silver', label: '92.5 Silver' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedMetal(item.id)}
              className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedMetal === item.id
                  ? 'bg-[#8F171B] text-white font-semibold'
                  : 'bg-[#FCF8F1] text-[#292321] hover:bg-[#EBDCC5]/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 space-y-2">
              <Search className="w-12 h-12 text-[#D4AF37]/40 mx-auto" />
              <p className="font-serif text-lg font-bold text-[#292321]">No jewellery matching "{query}"</p>
              <p className="text-xs">Try searching for "kasu", "jhumka", "kada", or "silver".</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const breakdown = calculatePriceBreakdown(
                product.net_weight,
                product.metal_type,
                product.wastage_percent,
                product.making_charges,
                rates
              );

              return (
                <div
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="bg-white p-3.5 rounded-xl border border-[#D4AF37]/30 hover:border-[#8F171B] transition-all cursor-pointer flex items-center justify-between gap-4 group hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg border border-[#D4AF37]/40 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className="text-[10px] text-[#8F171B] font-mono font-semibold uppercase flex items-center gap-1">
                        <Scale className="w-3 h-3 text-[#D4AF37]" />
                        {product.net_weight}g Net Wt. · {product.purity_hallmark}
                      </span>
                      <h4 className="font-serif text-base font-bold text-[#292321] group-hover:text-[#8F171B] transition-colors">
                        {product.name}
                      </h4>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold font-mono text-[#8F171B] block">
                      {formatINR(breakdown.final_price)}
                    </span>
                    <span className="text-[10px] text-gray-500 block">Click for details →</span>
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
