import React, { useState, useEffect } from 'react';
import { FeaturedSlide } from '../types';
import { INITIAL_FEATURED_SLIDES } from '../data/initialData';

interface HeroBannerProps {
  slides?: FeaturedSlide[];
  onExploreCatalog: (categorySlug?: string) => void;
  onNavigateTab?: (tab: string) => void;
}

const DEFAULT_JEWELLERY_PHOTO =
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=85';

export const HeroBanner: React.FC<HeroBannerProps> = ({
  slides = INITIAL_FEATURED_SLIDES,
  onExploreCatalog,
  onNavigateTab
}) => {
  const activeSlides = slides && slides.length > 0
    ? slides.filter((s) => s.is_active)
    : INITIAL_FEATURED_SLIDES;

  const slidesToUse = activeSlides.length > 0 ? activeSlides : INITIAL_FEATURED_SLIDES;
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Auto sliding timer (smooth 5s interval)
  useEffect(() => {
    if (slidesToUse.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slidesToUse.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slidesToUse.length]);

  const currentSlide = slidesToUse[currentIndex] || slidesToUse[0];
  const heroImage = currentSlide?.image_url || DEFAULT_JEWELLERY_PHOTO;

  return (
    <section className="relative w-full bg-[#FFF9F0] border-b border-[#E9D6B8]/70 overflow-hidden">
      <div className="w-full flex flex-col lg:flex-row items-stretch min-h-[462px] lg:h-[473px] xl:h-[528px] 2xl:h-[572px]">
        
        {/* ================= LEFT COLUMN: ~47% ================= */}
        <div className="w-full lg:w-[47%] xl:w-[46%] 2xl:w-[44%] relative flex flex-col justify-center px-6 sm:px-10 lg:pl-12 lg:pr-8 xl:pl-16 xl:pr-10 py-10 lg:py-6 bg-gradient-to-br from-[#FFF9F0] via-[#FFF6EB] to-[#F5E8D3] z-10">
          
          {/* Subtle traditional Indian floral ornamentation watermark in bottom-left corner */}
          <div className="absolute bottom-0 left-0 w-36 sm:w-44 h-36 sm:h-44 pointer-events-none opacity-20 text-[#A7793D] overflow-hidden">
            <svg
              viewBox="0 0 160 160"
              fill="currentColor"
              className="w-full h-full transform -translate-x-3 translate-y-3"
            >
              <path d="M0,160 C35,150 70,125 78,95 C84,72 70,48 45,50 C24,52 12,70 18,85 C24,100 42,105 52,92 C60,80 55,65 40,62 C58,55 88,78 80,118 C72,150 32,156 0,160 Z" />
              <path d="M0,128 C24,120 40,96 32,72 C24,48 48,32 64,35 C76,38 80,55 70,66 C60,78 40,82 35,102 C28,118 8,128 0,128 Z" opacity="0.6" />
              <circle cx="45" cy="74" r="4.5" />
              <circle cx="68" cy="62" r="3" />
              <circle cx="28" cy="115" r="3.5" />
            </svg>
          </div>

          <div className="relative z-10 space-y-3.5 sm:space-y-4 max-w-xl">
            {/* 1. Small Uppercase Eyebrow */}
            <div className="text-[10px] sm:text-[11px] font-semibold text-[#8C8178] tracking-[0.25em] uppercase font-sans">
              PURE HERITAGE • EXQUISITE CRAFTSMANSHIP
            </div>

            {/* 2. Main Heading */}
            <h1 className="font-serif text-[32px] sm:text-[40px] lg:text-[45px] xl:text-[50px] font-bold text-[#790F1B] leading-[1.08] tracking-tight">
              Tradition That<br />
              Shines Forever
            </h1>

            {/* 3. Supporting Text */}
            <p className="text-[14px] sm:text-[15px] lg:text-[16px] text-[#39231D] leading-relaxed font-normal max-w-md">
              Discover timeless gold jewellery crafted<br className="hidden sm:inline" /> for every precious moment.
            </p>

            {/* 4. Fine Antique-Gold Horizontal Divider with Center Ornament */}
            <div className="flex items-center gap-2.5 py-0.5 max-w-[260px] sm:max-w-[280px]">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#A7793D]/40 to-[#A7793D]/70" />
              <svg className="w-3.5 h-3.5 text-[#A7793D] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z" />
                <circle cx="12" cy="12" r="2.2" fill="#FFF9F0" />
              </svg>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#A7793D]/40 to-[#A7793D]/70" />
            </div>

            {/* 5. Two Horizontally Aligned Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => onExploreCatalog(currentSlide?.category_slug || 'gold-necklaces-malas')}
                className="bg-[#A7793D] hover:bg-[#8E642E] text-[#FFF9F0] px-5 sm:px-6 py-2.5 sm:py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Collection</span>
                <span className="text-[#FFF9F0] font-bold">→</span>
              </button>

              <button
                onClick={() => (onNavigateTab ? onNavigateTab('contact') : onExploreCatalog('contact'))}
                className="bg-[#FFF9F0]/70 hover:bg-[#790F1B]/5 border border-[#790F1B] text-[#790F1B] px-5 sm:px-6 py-2.5 sm:py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all cursor-pointer"
              >
                Contact Us
              </button>
            </div>

            {/* 6. Three Trust Indicators */}
            <div className="pt-3 sm:pt-4 flex items-center gap-3 sm:gap-5 text-xs text-[#39231D]">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#790F1B] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <polygon points="12 3 2 21 22 21" />
                  <circle cx="12" cy="14" r="3" />
                </svg>
                <span className="text-[11px] sm:text-xs font-medium leading-tight">
                  Hallmarked<br />Gold
                </span>
              </div>

              <div className="h-6 w-[1px] bg-[#A7793D]/30 shrink-0" />

              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#790F1B] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <path d="M6 3h12l4 6-10 12L2 9z" />
                  <path d="M2 9h20M12 21L8 9l4-6 4 6-4 12z" />
                </svg>
                <span className="text-[11px] sm:text-xs font-medium leading-tight">
                  Trusted<br />Craftsmanship
                </span>
              </div>

              <div className="h-6 w-[1px] bg-[#A7793D]/30 shrink-0" />

              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#790F1B] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <circle cx="12" cy="7" r="4" />
                  <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                  <path d="M17 11a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3" />
                  <path d="M22 21v-1a3 3 0 0 0-2-2.8" />
                </svg>
                <span className="text-[11px] sm:text-xs font-medium leading-tight">
                  Made for<br />Generations
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT COLUMN: ~53% ================= */}
        <div className="w-full lg:w-[53%] xl:w-[54%] 2xl:w-[56%] relative min-h-[300px] sm:min-h-[380px] lg:min-h-full overflow-hidden bg-[#292321]">
          {/* Main Jewellery Photograph */}
          <img
            key={currentSlide?.id || 'main-hero'}
            src={heroImage}
            alt={currentSlide?.title || 'Natesa Traditional Gold Necklace & Jhumkas on Burgundy Velvet'}
            className="w-full h-full object-cover object-center transition-all duration-700 ease-out"
            referrerPolicy="no-referrer"
          />

          {/* Left-edge smooth transitional blend into ivory background */}
          <div className="hidden lg:block absolute inset-y-0 left-0 w-28 sm:w-36 bg-gradient-to-r from-[#FFF9F0] via-[#FFF9F0]/60 to-transparent pointer-events-none z-10" />

          {/* Carousel Dots Centered at Bottom */}
          {slidesToUse.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2 z-20 pointer-events-auto">
              {slidesToUse.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`transition-all rounded-full cursor-pointer ${
                    idx === currentIndex
                      ? 'w-2.5 h-2.5 bg-white ring-2 ring-white/60 shadow-xs'
                      : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
