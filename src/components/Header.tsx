import React, { useState } from 'react';
import { ShoppingBag, Heart, Search, ShieldCheck, Phone, Sparkles, Menu, X, Lock, ChevronDown } from 'lucide-react';
import { Category, RateSettings, StoreContactSettings } from '../types';
import { Logo } from './Logo';

interface HeaderProps {
  rates: RateSettings;
  cartCount: number;
  wishlistCount: number;
  activeTab: string;
  categories: Category[];
  storeContact?: StoreContactSettings;
  setActiveTab: (tab: string, categorySlug?: string) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  wishlistCount,
  activeTab,
  categories,
  storeContact,
  setActiveTab,
  onOpenCart,
  onOpenWishlist,
  onOpenSearch
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [goldDropdownOpen, setGoldDropdownOpen] = useState(false);
  const [silverDropdownOpen, setSilverDropdownOpen] = useState(false);

  const phoneDisplay = storeContact?.phone_primary || '+91 94432 53072';
  const phoneTel = phoneDisplay.replace(/[^0-9+]/g, '');
  const announcement = storeContact?.announcement_text || 'Crafted with Trust • Timeless Since Generations';

  // Dynamic Submenus
  const goldSubmenu = [
    { label: 'All Gold Jewellery', slug: 'all' },
    ...categories
      .filter((c) => c.slug.toLowerCase().includes('gold'))
      .map((c) => ({ label: c.name, slug: c.slug }))
  ];

  const silverSubmenu = [
    { label: 'All Silver Jewellery', slug: 'all' },
    ...categories
      .filter((c) => c.slug.toLowerCase().includes('silver'))
      .map((c) => ({ label: c.name, slug: c.slug }))
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FCF8F1] border-b border-[#D4AF37]/30 shadow-xs w-full">
      {/* 1. Announcement Banner */}
      <div className="bg-[#8F171B] text-[#EBDCC5] px-4 sm:px-6 lg:px-8 xl:px-10 py-1.5 text-xs font-medium tracking-wide flex items-center justify-between max-w-[1440px] 2xl:max-w-[1600px] mx-auto w-full">
        <div className="flex items-center gap-2 mx-auto sm:mx-0 text-[11px] sm:text-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 animate-pulse" />
          <span className="truncate">{announcement}</span>
          <span className="hidden sm:inline-block text-[#D4AF37]/60">|</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[#EBDCC5]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" /> 100% BIS 916 Hallmarked Gold
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-[11px] text-[#EBDCC5] shrink-0">
          <a href={`tel:${phoneTel}`} className="hover:text-white transition-colors flex items-center gap-1">
            <Phone className="w-3 h-3 text-[#D4AF37]" /> {phoneDisplay}
          </a>
        </div>
      </div>

      {/* 2. Main Header Navigation */}
      <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-3.5 flex items-center justify-between gap-4 lg:gap-8 w-full">
        {/* Zone 1: Single Text Element Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-[#8F171B] hover:text-[#580E11] focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Logo
            onClick={() => setActiveTab('home')}
            className="h-10 sm:h-12 lg:h-14 xl:h-16"
          />
        </div>

        {/* Zone 2: Navigation Links with Sub-Menus */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm xl:text-base font-medium text-[#292321]">
          {/* Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`whitespace-nowrap shrink-0 py-1 transition-all ${
              activeTab === 'home'
                ? 'text-[#8F171B] font-bold border-b-2 border-[#8F171B]'
                : 'hover:text-[#8F171B] text-[#292321]/80'
            }`}
          >
            Home
          </button>

          {/* Gold Jewellery with Sub-Menu */}
          <div
            className="relative"
            onMouseEnter={() => setGoldDropdownOpen(true)}
            onMouseLeave={() => setGoldDropdownOpen(false)}
          >
            <button
              onClick={() => setActiveTab('gold')}
              className={`whitespace-nowrap shrink-0 py-1 flex items-center gap-1 transition-all ${
                activeTab === 'gold'
                  ? 'text-[#8F171B] font-bold border-b-2 border-[#8F171B]'
                  : 'hover:text-[#8F171B] text-[#292321]/80'
              }`}
            >
              <span>Gold Jewellery</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#D4AF37] transition-transform ${goldDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {goldDropdownOpen && (
              <div className="absolute top-full left-0 w-64 bg-[#292321] text-[#FCF8F1] rounded-xl shadow-2xl border border-[#D4AF37]/40 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                <div className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider px-3 py-1 border-b border-[#D4AF37]/20">
                  Gold Categories
                </div>
                {goldSubmenu.map((sub) => (
                  <button
                    key={sub.label}
                    onClick={() => {
                      setActiveTab('gold', sub.slug);
                      setGoldDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#8F171B] hover:text-white rounded-lg transition-colors font-medium block"
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Silver Jewellery with Sub-Menu */}
          <div
            className="relative"
            onMouseEnter={() => setSilverDropdownOpen(true)}
            onMouseLeave={() => setSilverDropdownOpen(false)}
          >
            <button
              onClick={() => setActiveTab('silver')}
              className={`whitespace-nowrap shrink-0 py-1 flex items-center gap-1 transition-all ${
                activeTab === 'silver'
                  ? 'text-[#8F171B] font-bold border-b-2 border-[#8F171B]'
                  : 'hover:text-[#8F171B] text-[#292321]/80'
              }`}
            >
              <span>Silver Jewellery</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#D4AF37] transition-transform ${silverDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {silverDropdownOpen && (
              <div className="absolute top-full left-0 w-60 bg-[#292321] text-[#FCF8F1] rounded-xl shadow-2xl border border-[#D4AF37]/40 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                <div className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider px-3 py-1 border-b border-[#D4AF37]/20">
                  Silver Articles
                </div>
                {silverSubmenu.map((sub) => (
                  <button
                    key={sub.label}
                    onClick={() => {
                      setActiveTab('silver', sub.slug);
                      setSilverDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#8F171B] hover:text-white rounded-lg transition-colors font-medium block"
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Collections */}
          <button
            onClick={() => setActiveTab('collections')}
            className={`whitespace-nowrap shrink-0 py-1 transition-all ${
              activeTab === 'collections'
                ? 'text-[#8F171B] font-bold border-b-2 border-[#8F171B]'
                : 'hover:text-[#8F171B] text-[#292321]/80'
            }`}
          >
            Collections
          </button>

          {/* About Us */}
          <button
            onClick={() => setActiveTab('about')}
            className={`whitespace-nowrap shrink-0 py-1 transition-all ${
              activeTab === 'about'
                ? 'text-[#8F171B] font-bold border-b-2 border-[#8F171B]'
                : 'hover:text-[#8F171B] text-[#292321]/80'
            }`}
          >
            About Us
          </button>

          {/* Contact */}
          <button
            onClick={() => setActiveTab('contact')}
            className={`whitespace-nowrap shrink-0 py-1 transition-all ${
              activeTab === 'contact'
                ? 'text-[#8F171B] font-bold border-b-2 border-[#8F171B]'
                : 'hover:text-[#8F171B] text-[#292321]/80'
            }`}
          >
            Contact
          </button>

          {/* Order Tracking */}
          <button
            onClick={() => setActiveTab('tracking')}
            className={`whitespace-nowrap shrink-0 py-1 transition-all ${
              activeTab === 'tracking'
                ? 'text-[#8F171B] font-bold border-b-2 border-[#8F171B]'
                : 'hover:text-[#8F171B] text-[#292321]/80'
            }`}
          >
            Order Tracking
          </button>
        </nav>

        {/* Zone 3: Actions (Search, Wishlist, Cart Drawer) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenSearch}
            className="p-2 text-[#292321] hover:text-[#8F171B] hover:bg-[#EBDCC5]/40 rounded-full transition-colors relative"
            title="Search Jewellery"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenWishlist}
            className="p-2 text-[#292321] hover:text-[#8F171B] hover:bg-[#EBDCC5]/40 rounded-full transition-colors relative"
            title="Saved Wishlist"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#8F171B] text-[#FCF8F1] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 bg-[#8F171B] text-[#FCF8F1] hover:bg-[#580E11] px-4 py-2.5 rounded-lg transition-all shadow-xs text-xs sm:text-sm font-medium whitespace-nowrap"
            aria-label="Shopping Bag"
          >
            <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
            <span className="hidden sm:inline">Bag</span>
            <span className="bg-[#D4AF37] text-[#292321] text-xs font-bold px-1.5 py-0.5 rounded-md ml-1">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#D4AF37]/30 bg-[#FCF8F1] px-4 pt-3 pb-6 space-y-2 w-full max-w-full">
          <button
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'home' ? 'bg-[#8F171B] text-white font-bold' : 'text-[#292321]'}`}
          >
            Home
          </button>

          <div className="space-y-1 pl-2 border-l-2 border-[#8F171B]">
            <button
              onClick={() => { setActiveTab('gold'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-2 py-1 text-sm font-bold text-[#8F171B]"
            >
              Gold Jewellery
            </button>
            {goldSubmenu.map((sub) => (
              <button
                key={sub.label}
                onClick={() => { setActiveTab('gold', sub.slug); setMobileMenuOpen(false); }}
                className="block w-full text-left px-2 py-1 text-xs text-gray-700 hover:text-[#8F171B]"
              >
                · {sub.label}
              </button>
            ))}
          </div>

          <div className="space-y-1 pl-2 border-l-2 border-[#D4AF37] pt-2">
            <button
              onClick={() => { setActiveTab('silver'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-2 py-1 text-sm font-bold text-[#8F171B]"
            >
              Silver Jewellery
            </button>
            {silverSubmenu.map((sub) => (
              <button
                key={sub.label}
                onClick={() => { setActiveTab('silver', sub.slug); setMobileMenuOpen(false); }}
                className="block w-full text-left px-2 py-1 text-xs text-gray-700 hover:text-[#8F171B]"
              >
                · {sub.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => { setActiveTab('collections'); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-[#292321]"
          >
            Collections
          </button>
          <button
            onClick={() => { setActiveTab('about'); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-[#292321]"
          >
            About Us
          </button>
          <button
            onClick={() => { setActiveTab('contact'); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-[#292321]"
          >
            Contact
          </button>
          <button
            onClick={() => { setActiveTab('tracking'); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-[#292321]"
          >
            Order Tracking
          </button>

          <div className="pt-3 border-t border-[#D4AF37]/20 flex items-center justify-between text-xs text-[#292321]/80">
            <span>Main Branch: Krishnagiri</span>
            <a href={`tel:${phoneTel}`} className="text-[#8F171B] font-semibold hover:underline">
              {phoneDisplay}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
