import React, { useState } from 'react';
import { MapPin, Phone, Mail, Instagram, ShieldCheck, Award, Clock, X } from 'lucide-react';
import { Logo } from './Logo';
import { StoreContactSettings } from '../types';

interface FooterProps {
  storeContact?: StoreContactSettings;
  onNavigateTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ storeContact, onNavigateTab }) => {
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const primaryPhone = storeContact?.phone_primary || '+91 94432 53072';
  const secondaryPhone = storeContact?.phone_secondary || '+91 99444 00666';
  const whatsappPhone = storeContact?.phone_whatsapp || '+91 94432 53072';
  const supportEmail = storeContact?.email || 'natesajewellery@gmail.com';
  const hours = storeContact?.opening_hours || 'Daily: 9:30 AM – 9:00 PM';
  const mainAddress = storeContact?.main_branch_address || 'Near Old Bus Stand, Gandhi Road, Main Bazaar, Krishnagiri, Tamil Nadu — 635001';
  const secondAddress = storeContact?.second_branch_address || 'Bazaar Street, Opposite Town Hall, Near Gandhi Statue, Dharmapuri, Tamil Nadu — 636701';

  const cleanPhone = (p: string) => p.replace(/[^0-9+]/g, '');

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
                href={`mailto:${supportEmail}`}
                className="bg-white/10 hover:bg-[#8F171B] p-2.5 rounded-full transition-colors text-[#EBDCC5] hover:text-white"
                title="Email Us"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href={`tel:${cleanPhone(primaryPhone)}`}
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

          {/* Showroom Branches */}
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
                <p className="text-gray-300 text-xs font-light leading-relaxed">
                  {mainAddress}
                </p>
                <p className="text-gray-200 font-mono font-semibold text-xs pt-1">
                  <a href={`tel:${cleanPhone(primaryPhone)}`} className="hover:text-[#D4AF37] transition-colors">
                    {primaryPhone}
                  </a>
                  {secondaryPhone && (
                    <> / <a href={`tel:${cleanPhone(secondaryPhone)}`} className="hover:text-[#D4AF37] transition-colors">{secondaryPhone}</a></>
                  )}
                </p>
              </div>

              {/* Branch 2 */}
              <div className="bg-white/5 border border-[#D4AF37]/20 p-3.5 rounded-lg space-y-1">
                <span className="text-[#D4AF37] font-bold block text-xs uppercase">
                  Second Branch — Dharmapuri
                </span>
                <p className="text-gray-300 text-xs font-light leading-relaxed">
                  {secondAddress}
                </p>
                <p className="text-gray-200 font-mono font-semibold text-xs pt-1">
                  <a href={`tel:${cleanPhone(primaryPhone)}`} className="hover:text-[#D4AF37] transition-colors">
                    {primaryPhone}
                  </a>
                </p>
              </div>
            </div>

            <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between text-gray-400 text-xs gap-1">
              <span>Email: <a href={`mailto:${supportEmail}`} className="text-[#EBDCC5] hover:underline">{supportEmail}</a></span>
              <span>{hours}</span>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Line */}
        <div className="pt-6 border-t border-gray-800 flex flex-col lg:flex-row justify-between items-center gap-4 text-xs text-gray-400 font-light">
          <div>
            © {new Date().getFullYear()} Natesa Jewellery. All Rights Reserved. Crafted with Trust Since Generations.
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D4AF37] hover:underline flex items-center gap-1 font-medium"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Instagram</span>
            </a>
            <button onClick={() => setTermsOpen(true)} className="hover:text-white cursor-pointer underline">Terms & Conditions</button>
            <button onClick={() => setPrivacyOpen(true)} className="hover:text-white cursor-pointer underline">Privacy Policy</button>
            <button onClick={() => onNavigateTab('about')} className="hover:text-white cursor-pointer">Hallmark Guarantee</button>
            <button onClick={() => onNavigateTab('tracking')} className="hover:text-white cursor-pointer">Order Tracking</button>
          </div>
        </div>

      </div>

      {/* Terms & Conditions Modal */}
      {termsOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#FFF9F0] text-[#292321] rounded-xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setTermsOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black p-1.5 rounded-full hover:bg-black/5"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-2xl font-bold text-[#790F1B] mb-4 border-b border-[#D4AF37]/30 pb-2">
              Terms & Conditions
            </h3>
            <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
              <p>Welcome to Natesa Jewellery. By accessing or purchasing from our website or showrooms in Krishnagiri and Dharmapuri, you agree to abide by the following terms and conditions:</p>
              <h4 className="font-bold text-[#790F1B]">1. Gold & Silver Pricing & Rates</h4>
              <p>Gold and silver item pricing is computed dynamically based on daily bullion market rates (22k gold, 24k gold, and 92.5 sterling silver) plus making charges and applicable GST (3%). Rates fluctuate in accordance with international bullion exchanges.</p>
              <h4 className="font-bold text-[#790F1B]">2. Hallmarking & Purity</h4>
              <p>All gold jewellery sold by Natesa Jewellery is 100% BIS 916 hallmarked. Silver articles carry standard 92.5 purity hallmarks. Authenticity certificates are issued with every precious purchase.</p>
              <h4 className="font-bold text-[#790F1B]">3. Orders & Delivery</h4>
              <p>Orders are dispatched via fully insured secure transit couriers with tamper-evident packaging. Delivery timelines vary from 3 to 7 working days depending on destination PIN codes.</p>
              <h4 className="font-bold text-[#790F1B]">4. Return & Exchange</h4>
              <p>Items may be exchanged or returned in accordance with our showroom policy within 7 days of delivery, provided original hallmark tags and certification are intact.</p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#D4AF37]/30 text-right">
              <button
                onClick={() => setTermsOpen(false)}
                className="bg-[#790F1B] text-[#FFF9F0] px-5 py-2 rounded-lg text-xs font-semibold hover:bg-[#580E11]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {privacyOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#FFF9F0] text-[#292321] rounded-xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setPrivacyOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black p-1.5 rounded-full hover:bg-black/5"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-2xl font-bold text-[#790F1B] mb-4 border-b border-[#D4AF37]/30 pb-2">
              Privacy Policy
            </h3>
            <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
              <p>Natesa Jewellery respects your privacy and is committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data:</p>
              <h4 className="font-bold text-[#790F1B]">1. Information Collection</h4>
              <p>When placing orders, tracking shipments, or submitting inquiries, we collect necessary contact information including your name, phone number, delivery address, and email address.</p>
              <h4 className="font-bold text-[#790F1B]">2. Use of Information</h4>
              <p>Your details are used strictly for order fulfillment, insured shipping, customer support, and communicating updates regarding your purchase.</p>
              <h4 className="font-bold text-[#790F1B]">3. Data Security</h4>
              <p>We implement secure encryption protocols and maintain strict confidentiality. We never sell, rent, or share your personal data with third-party marketers.</p>
              <h4 className="font-bold text-[#790F1B]">4. Contact Us</h4>
              <p>If you have any questions regarding our privacy practices, please contact our Krishnagiri or Dharmapuri showrooms or email us at {supportEmail}.</p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#D4AF37]/30 text-right">
              <button
                onClick={() => setPrivacyOpen(false)}
                className="bg-[#790F1B] text-[#FFF9F0] px-5 py-2 rounded-lg text-xs font-semibold hover:bg-[#580E11]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
