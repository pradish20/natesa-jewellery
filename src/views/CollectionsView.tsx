import React from 'react';
import { ProductCard } from '../components/ProductCard';
import { Product, RateSettings } from '../types';
import { Award, Sparkles, HeartHandshake } from 'lucide-react';

interface CollectionsViewProps {
  products: Product[];
  rates: RateSettings;
  wishlist: Product[];
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  products,
  rates,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct
}) => {
  const bridalCollection = products.filter((p) => p.net_weight >= 30 || p.category_slug.includes('necklaces'));
  const antiqueCollection = products.filter((p) => p.category_slug.includes('jhumkas') || p.category_slug.includes('temple'));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-semibold text-[#8F171B] uppercase tracking-widest flex items-center justify-center gap-1">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          CURATED THEMED MASTERPIECES
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#292321]">
          Bridal & Heritage Collections
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 font-light">
          Specially crafted ensembles designed for grand South Indian weddings, auspicious festivals, and family celebrations.
        </p>
      </div>

      {/* Bridal Heritage Collection */}
      <section className="space-y-6">
        <div className="bg-[#8F171B] text-white p-6 rounded-2xl border-2 border-[#D4AF37]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest block">GRAND WEDDING EDITION</span>
            <h2 className="font-serif text-2xl font-bold text-[#EBDCC5]">Royal Tamil Bridal Heritage</h2>
            <p className="text-xs text-gray-200 font-light">Grand harams, choker sets, and heavy temple kadas.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37]">
            <Award className="w-5 h-5" />
            <span>BIS 916 Guaranteed Pure Gold</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bridalCollection.map((product) => (
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
      </section>

      {/* Antique Temple Collection */}
      <section className="space-y-6 pt-6">
        <div className="bg-[#292321] text-white p-6 rounded-2xl border-2 border-[#D4AF37]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest block">DIVINE CRAFTSMANSHIP</span>
            <h2 className="font-serif text-2xl font-bold text-[#EBDCC5]">Antique Temple & Jhumka Vault</h2>
            <p className="text-xs text-gray-300 font-light">Goddess Lakshmi motifs, ruby jhumkas, and peacock filigree.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37]">
            <HeartHandshake className="w-5 h-5" />
            <span>Handcarved Artisanal Gold</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {antiqueCollection.map((product) => (
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
      </section>
    </div>
  );
};
