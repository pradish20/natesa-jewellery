import React from 'react';
import { MapPin, Phone, Mail, Instagram, ShieldCheck, Award, Clock } from 'lucide-react';
import { Logo } from './Logo';

interface FooterProps {
  onNavigateTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab }) => {
  return (
    <footer className="bg-[#292321] text-[#FCF8F1] border-t-2 border-[#D4AF37]/50 pt-12 pb-8 w-full">
      <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 space-y-12 w-full">
        
        {/* Top Trust Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10 border-b border-[#D4AF37]/20 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl bg-white/5 border border-[#D4AF37]/20">
            <ShieldCheck className="w-8 h-8 text-[#D4AF37] shrink-0" />
            <div>
              <h4 className="font-serif text-base font-bold text-[#EBDCC5]">100% BIS 916 Hallmarked</h4>
              <p className="text-xs text-gray-400 font-light">Every gold jewel certified for purity & hallmark authenticity.</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl bg-white/5 border border-[#D4AF37]/20">
            <Award className="w-8 h-8 text-[#D4AF37] shrink-0" />
            <div>
              <h4 className="font-serif text-base font-bold text-[#EBDCC5]">Generations of Trust</h4>
              <p className="text-xs text-gray-400 font-light">Serving families with transparent pricing & zero hidden costs.</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl bg-white/5 border border-[#D4AF37]/20">
            <Clock className="w-8 h-8 text-[#D4AF37] shrink-0" />
            <div>
              <h4 className="font-serif text-base font-bold text-[#EBDCC5]">Insured Express Delivery</h4>
              <p className="text-xs text-gray-400 font-light">Tamper-evident 100% transit insured courier across India.</p>
            </div>
          </div>
        </div>

        {/* Middle Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-xs sm:text-sm">
          
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-3">
            <Logo
              variant="card"
              className="h-14 sm:h-16"
              onClick={() => onNavigateTab('home')}
            />
            <p className="text-gray-300 font-light leading-relaxed pt-1">
              Crafting South Indian bridal gold harams, antique jhumkas, temple bangles, and sterling silver since generations.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://instagram.com/natesajewellery"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-[#8F171B] p-2.5 rounded-full transition-colors text-[#EBDCC5] hover:text-white"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="mailto:natesajewellery@gmail.com"
                className="bg-white/10 hover:bg-[#8F171B] p-2.5 rounded-full transition-colors text-[#EBDCC5] hover:text-white"
                title="Email Us"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="tel:+919443253072"
                className="bg-white/10 hover:bg-[#8F171B] p-2.5 rounded-full transition-colors text-[#EBDCC5] hover:text-white"
                title="Call Us"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-serif text-base sm:text-lg font-bold text-[#EBDCC5] border-b border-[#D4AF37]/30 pb-1.5">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-gray-300 font-light text-xs sm:text-sm">
              <li>
                <button onClick={() => onNavigateTab('home')} className="hover:text-[#D4AF37] transition-colors cursor-pointer">
                  Home & Featured Collections
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('gold')} className="hover:text-[#D4AF37] transition-colors cursor-pointer">
                  Gold Necklaces & Malas
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('silver')} className="hover:text-[#D4AF37] transition-colors cursor-pointer">
                  92.5 Sterling Silver Kolusu
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('collections')} className="hover:text-[#D4AF37] transition-colors cursor-pointer">
                  Bridal & Antique Collections
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('about')} className="hover:text-[#D4AF37] transition-colors cursor-pointer">
                  About Our Heritage
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('tracking')} className="hover:text-[#D4AF37] transition-colors cursor-pointer">
                  Track Order Status
                </button>
              </li>
            </ul>
          </div>

          {/* Showroom Branch 1: Krishnagiri */}
          <div className="md:col-span-5 space-y-4">
            <h4 className="font-serif text-base sm:text-lg font-bold text-[#EBDCC5] border-b border-[#D4AF37]/30 pb-1.5">
              Our Physical Showroom Branches
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Branch 1 */}
              <div className="bg-white/5 border border-[#D4AF37]/20 p-3.5 rounded-lg space-y-1">
                <span className="text-[#D4AF37] font-bold block text-xs uppercase">
                  Main Branch — Krishnagiri
                </span>
                <p className="text-gray-300 text-xs font-light">
                  Near Old Bus Stand, Gandhi Road, Main Bazaar, Krishnagiri, Tamil Nadu — 635001
                </p>
                <p className="text-gray-200 font-mono font-semibold text-xs pt-1">
                  +91 94432 53072 / +91 99444 00666
                </p>
              </div>

              {/* Branch 2 */}
              <div className="bg-white/5 border border-[#D4AF37]/20 p-3.5 rounded-lg space-y-1">
                <span className="text-[#D4AF37] font-bold block text-xs uppercase">
                  Second Branch — Dharmapuri
                </span>
                <p className="text-gray-300 text-xs font-light">
                  Bazaar Street, Opposite Town Hall, Near Gandhi Statue, Dharmapuri, Tamil Nadu — 636701
                </p>
                <p className="text-gray-200 font-mono font-semibold text-xs pt-1">
                  +91 78680 82878
                </p>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-gray-400 text-xs">
              <span>Email: natesajewellery@gmail.com</span>
              <span>Daily: 9:30 AM – 9:00 PM</span>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Line */}
        <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-400 font-light">
          <div>
            © {new Date().getFullYear()} Natesa Jewellery. All Rights Reserved. Crafted with Trust Since Generations.
          </div>
          <div className="flex gap-4">
            <button onClick={() => onNavigateTab('about')} className="hover:text-white cursor-pointer">Hallmark Guarantee</button>
            <button onClick={() => onNavigateTab('contact')} className="hover:text-white cursor-pointer">Custom Orders</button>
            <button onClick={() => onNavigateTab('tracking')} className="hover:text-white cursor-pointer">Order Tracking</button>
          </div>
        </div>

      </div>
    </footer>
  );
};
