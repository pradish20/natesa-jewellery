import React from 'react';
import { ArrowRight, ShieldCheck, Award, Clock } from 'lucide-react';

interface HeroBannerProps {
  onExploreCatalog: (categorySlug?: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreCatalog }) => {
  return (
    <section className="relative bg-[#292321] text-[#FCF8F1] overflow-hidden border-b border-[#D4AF37]/30 w-full">
      {/* Background Decorative Gold Filigree Accents */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-10 sm:py-14 lg:py-16 xl:py-20 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
            {/* Hero Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8F171B]/80 text-[#EBDCC5] text-xs font-semibold tracking-widest uppercase border border-[#D4AF37]/40 shadow-xs max-w-full">
              <span>PURE HERITAGE • EXQUISITE CRAFTSMANSHIP</span>
            </div>

            {/* Hero Heading */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-[#EBDCC5] leading-[1.1] text-balance">
              Tradition That Shines Forever
            </h1>

            {/* Hero Subtitle */}
            <p className="text-base sm:text-lg xl:text-xl text-[#FCF8F1]/85 max-w-2xl font-light leading-relaxed">
              Discover timeless gold jewellery crafted for every precious moment.
              Handcrafted with generations of trust, certified 100% BIS 916 hallmarked pure gold and fine 92.5 sterling silver.
            </p>

            {/* Action Button */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => onExploreCatalog('gold-necklaces-malas')}
                className="bg-[#8F171B] text-white hover:bg-[#580E11] px-6 sm:px-8 py-3.5 sm:py-4 rounded-lg font-semibold text-sm sm:text-base transition-all shadow-md flex items-center gap-2.5 group border border-[#D4AF37]/40 cursor-pointer"
              >
                <span>Explore Heritage Collections</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Trust Badges Bar */}
            <div className="pt-6 sm:pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#D4AF37]/20 text-xs sm:text-sm text-[#EBDCC5]/90">
              <div className="flex items-center justify-center lg:justify-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <span>100% BIS 916 Hallmarked Gold</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2.5">
                <Award className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <span>Fair Transparent Pricing</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2.5">
                <Clock className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <span>Generations of Trust</span>
              </div>
            </div>
          </div>

          {/* Right Featured Banner Showcase */}
          <div className="lg:col-span-5 relative w-full">
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#D4AF37]/40 shadow-2xl group bg-[#8F171B] w-full">
              <img
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80"
                alt="Natesa Jewellery Royal Kasu Haram Gold Necklace"
                className="w-full h-[320px] sm:h-[400px] lg:h-[480px] xl:h-[520px] object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#292321] via-transparent to-transparent opacity-85" />
              
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 space-y-2">
                <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest block">
                  Signature Bridal Masterpiece
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  Royal Kasu & Mango Haram
                </h2>
                <p className="text-xs sm:text-sm text-[#FCF8F1]/80 font-light">
                  Custom weight options with zero hidden charges. Live rate calculation applied automatically.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => onExploreCatalog('gold-necklaces-malas')}
                    className="text-xs sm:text-sm font-semibold text-[#D4AF37] hover:text-white transition-colors underline flex items-center gap-1 cursor-pointer"
                  >
                    View Gold Necklaces & Malas →
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mandatory Promo Banner */}
      <div className="bg-[#8F171B] border-t border-[#D4AF37]/30 py-3 sm:py-3.5 px-4 text-center text-xs sm:text-sm lg:text-base font-semibold tracking-wider text-[#EBDCC5] uppercase w-full">
        Celebrate Every Moment with Natesa Jewellery — WEDDINGS • FESTIVALS • LIFE'S PRECIOUS MOMENTS
      </div>
    </section>
  );
};
