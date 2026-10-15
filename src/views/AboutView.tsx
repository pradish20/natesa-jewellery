import React from 'react';
import { ShieldCheck, Award, Sparkles, Scale, Clock, Heart } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Section */}
      <div className="bg-[#8F171B] text-[#FCF8F1] p-8 sm:p-12 rounded-2xl border-2 border-[#D4AF37]/50 shadow-xl space-y-4">
        <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest flex items-center gap-1">
          <Sparkles className="w-4 h-4" />
          OUR HERITAGE STORY
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#EBDCC5]">
          Tradition That Shines Since Generations
        </h1>
        <p className="text-sm sm:text-base font-light text-[#FCF8F1]/90 max-w-3xl leading-relaxed">
          Natesa Jewellery stands as a symbol of purity, craftsmanship, and unwavering trust across Tamil Nadu.
          Founded with a commitment to fair pricing and authentic gold, we have adorned thousands of brides
          and families for their most sacred milestones.
        </p>
      </div>

      {/* 3 Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#D4AF37]/40 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#8F171B]/10 text-[#8F171B] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#292321]">100% BIS Hallmarked Purity</h3>
          <p className="text-xs text-gray-600 font-light leading-relaxed">
            Every piece of gold jewellery is stamped with official BIS 916 hallmark details, guaranteeing 22K pure gold.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#D4AF37]/40 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#8F171B]/10 text-[#8F171B] flex items-center justify-center">
            <Scale className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#292321]">Absolute Price Transparency</h3>
          <p className="text-xs text-gray-600 font-light leading-relaxed">
            We break down net weight, live gold rate, wastage %, making charges, and 3% GST on every tag and receipt.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#D4AF37]/40 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#8F171B]/10 text-[#8F171B] flex items-center justify-center">
            <Award className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#292321]">Lifetime Buy-Back Guarantee</h3>
          <p className="text-xs text-gray-600 font-light leading-relaxed">
            Enjoy full prevailing market value buy-back and exchange policy across both our Krishnagiri and Dharmapuri showrooms.
          </p>
        </div>
      </div>

      {/* Crafting Process */}
      <div className="bg-[#292321] text-[#FCF8F1] rounded-2xl p-8 border border-[#D4AF37]/40 space-y-6">
        <div className="max-w-xl space-y-1">
          <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest">MASTER ARTISANRY</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#EBDCC5]">From Raw Gold To Regal Masterpieces</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-gray-300 font-light">
          <div className="border-l-2 border-[#D4AF37] pl-4 space-y-1">
            <h4 className="font-serif text-base font-bold text-white">01. Pure Bullion Selection</h4>
            <p>Sourcing highest purity certified 24K gold bullion blocks for casting.</p>
          </div>
          <div className="border-l-2 border-[#D4AF37] pl-4 space-y-1">
            <h4 className="font-serif text-base font-bold text-white">02. Temple Filigree Carving</h4>
            <p>Hand-carving Lakshmi & peacock motifs with traditional South Indian tools.</p>
          </div>
          <div className="border-l-2 border-[#D4AF37] pl-4 space-y-1">
            <h4 className="font-serif text-base font-bold text-white">03. BIS Laser Hallmarking</h4>
            <p>Official government lab testing and laser etching of purity standard marks.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
