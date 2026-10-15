import React from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { ProductCard } from '../components/ProductCard';
import { Category, FeaturedSlide, Product, RateSettings } from '../types';
import { ArrowRight, ShieldCheck, Award, Sparkles, MapPin, Phone } from 'lucide-react';

interface HomeViewProps {
  products: Product[];
  categories: Category[];
  rates: RateSettings;
  wishlist: Product[];
  slides?: FeaturedSlide[];
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onNavigateTab: (tab: string, categorySlug?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  categories,
  rates,
  wishlist,
  slides,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct,
  onNavigateTab
}) => {
  const featuredProducts = products.filter((p) => p.is_featured);

  return (
    <div className="space-y-12 sm:space-y-16 pb-16 w-full">
      {/* 1. Hero Section */}
      <HeroBanner
        slides={slides}
        onExploreCatalog={(slug) => onNavigateTab('gold', slug)}
        onNavigateTab={onNavigateTab}
      />

      <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 space-y-12 sm:space-y-16 w-full">
        
        {/* 2. Catalog Categories Showcase */}
        <section className="space-y-6 pt-2 sm:pt-4 w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#D4AF37]/30 pb-4">
            <div>
              <span className="text-xs font-semibold text-[#8F171B] uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                Explore By Category
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#292321] mt-1">
                Heritage Collections
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('gold')}
              className="text-xs sm:text-sm font-semibold text-[#8F171B] hover:text-[#580E11] transition-colors underline flex items-center gap-1 cursor-pointer"
            >
              Browse All Categories →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => onNavigateTab(cat.slug.includes('silver') ? 'silver' : 'gold', cat.slug)}
                className="group relative rounded-xl overflow-hidden border border-[#D4AF37]/40 shadow-xs hover:shadow-lg transition-all cursor-pointer bg-[#292321] aspect-3/4 flex flex-col justify-end w-full"
              >
                <img
                  src={cat.banner_image_url}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                
                <div className="relative z-10 p-4 space-y-1">
                  <h3 className="font-serif text-base sm:text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-300 font-light line-clamp-2">
                    {cat.description}
                  </p>
                  <span className="text-[10px] sm:text-xs text-[#D4AF37] font-semibold flex items-center gap-1 pt-1">
                    Explore Collection <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Featured Masterpiece Showcase */}
        <section className="space-y-6 w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#D4AF37]/30 pb-4">
            <div>
              <span className="text-xs font-semibold text-[#8F171B] uppercase tracking-widest flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                Curated Selection
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#292321] mt-1">
                Featured Bridal & Antique Masterpieces
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('collections')}
              className="text-xs sm:text-sm font-semibold text-[#8F171B] hover:text-[#580E11] transition-colors underline cursor-pointer"
            >
              View Full Collection →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
            {featuredProducts.map((product) => (
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

        {/* 4. Heritage Story & Trust Section */}
        <section className="bg-[#8F171B] text-[#FCF8F1] rounded-2xl p-6 sm:p-10 lg:p-12 xl:p-16 border-2 border-[#D4AF37]/50 shadow-xl relative overflow-hidden w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest">
                SINCE GENERATIONS IN TAMIL NADU
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#EBDCC5]">
                Crafted With Trust, Delivered With Pride
              </h2>
              <p className="text-sm sm:text-base font-light leading-relaxed text-[#FCF8F1]/90 max-w-3xl">
                Natesa Jewellery has been the household hallmark of trust in Krishnagiri and Dharmapuri.
                Every piece of gold is hallmarked by BIS 916 standards, and every purchase comes with a transparent
                weight breakdown and lifetime buy-back promise.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-[#D4AF37]">
                <span>✓ Zero Hidden Charges</span>
                <span>✓ Live Market Linked Pricing</span>
                <span>✓ Insured Transit Guarantee</span>
              </div>
            </div>

            <div className="lg:col-span-4 bg-[#292321] p-6 rounded-xl border border-[#D4AF37]/40 space-y-4 w-full">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#EBDCC5]">Need Custom Jewellery?</h3>
              <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
                Send us your design via WhatsApp or visit our Krishnagiri / Dharmapuri showrooms for custom weight orders.
              </p>
              <a
                href="https://wa.me/919443253072"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#292321] hover:bg-white font-bold text-xs sm:text-sm px-4 py-3 rounded-lg transition-colors"
              >
                <Phone className="w-4 h-4" /> WhatsApp Us: +91 94432 53072
              </a>
            </div>
          </div>
        </section>

        {/* 5. Physical Showrooms Directory */}
        <section className="space-y-6 w-full">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-semibold text-[#8F171B] uppercase tracking-widest">VISIT OUR SHOWROOMS</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#292321]">Experience Luxury In Person</h2>
            <p className="text-xs sm:text-sm text-gray-600">Explore our physical gold vaults in Krishnagiri and Dharmapuri.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Main Branch Krishnagiri */}
            <div className="bg-white border border-[#D4AF37]/40 rounded-xl p-6 sm:p-8 shadow-xs space-y-3 w-full">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-[#8F171B] uppercase tracking-wider block">MAIN BRANCH</span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#292321]">Krishnagiri Showroom</h3>
                </div>
                <MapPin className="w-6 h-6 text-[#8F171B] shrink-0" />
              </div>
              <p className="text-xs sm:text-sm text-gray-600 font-light">
                Near Old Bus Stand, Gandhi Road, Main Bazaar, Krishnagiri, Tamil Nadu — 635001
              </p>
              <div className="pt-2 text-xs sm:text-sm font-mono text-[#8F171B] font-semibold">
                Phones: +91 94432 53072 / +91 99444 00666
              </div>
            </div>

            {/* Second Branch Dharmapuri */}
            <div className="bg-[#FCF8F1] border border-[#D4AF37]/40 rounded-xl p-6 sm:p-8 shadow-xs space-y-3 w-full">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-[#8F171B] uppercase tracking-wider block">SECOND BRANCH</span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#292321]">Dharmapuri Showroom</h3>
                </div>
                <MapPin className="w-6 h-6 text-[#8F171B] shrink-0" />
              </div>
              <p className="text-xs sm:text-sm text-gray-600 font-light">
                Bazaar Street, Opposite Town Hall, Near Gandhi Statue, Dharmapuri, Tamil Nadu — 636701
              </p>
              <div className="pt-2 text-xs sm:text-sm font-mono text-[#8F171B] font-semibold">
                Phone: +91 78680 82878
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
