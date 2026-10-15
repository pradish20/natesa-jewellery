import React, { useState } from 'react';
import { MapPin, Phone, Mail, Instagram, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const ContactView: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    branch: 'Krishnagiri Main Branch',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await api.submitEnquiry(formData);
      setIsSubmitting(false);
      setSuccessMsg('Thank you for contacting Natesa Jewellery. Our team will call you back shortly!');
      setFormData({ name: '', phone: '', email: '', branch: 'Krishnagiri Main Branch', message: '' });
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg('Failed to send enquiry. Please call us directly at +91 94432 53072');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-semibold text-[#8F171B] uppercase tracking-widest">GET IN TOUCH</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#292321]">
          Contact Natesa Jewellery
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 font-light">
          Have questions about live gold rates, bridal jewellery customization, or order status? Visit us or write to us.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Showrooms Information (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Branch Krishnagiri */}
          <div className="bg-white rounded-2xl p-6 border border-[#D4AF37]/40 shadow-xs space-y-3">
            <div className="flex items-start justify-between border-b border-[#D4AF37]/20 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#8F171B] uppercase tracking-wider block">MAIN SHOWROOM</span>
                <h3 className="font-serif text-xl font-bold text-[#292321]">Krishnagiri Branch</h3>
              </div>
              <a
                href="tel:+919443253072"
                className="bg-[#8F171B] text-white p-2 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5 text-[#D4AF37]" /> Call Branch
              </a>
            </div>

            <div className="text-xs text-gray-700 space-y-1 font-light">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#8F171B] shrink-0 mt-0.5" />
                <span>Near Old Bus Stand, Gandhi Road, Main Bazaar, Krishnagiri, Tamil Nadu — 635001</span>
              </p>
              <p className="font-mono font-semibold text-[#8F171B] pt-1">
                Phones: +91 94432 53072 / +91 99444 00666
              </p>
            </div>

            <div className="pt-2 rounded-lg overflow-hidden border border-gray-200 h-40">
              <iframe
                title="Krishnagiri Main Branch Map"
                src="https://maps.google.com/maps?q=Krishnagiri+Main+Bazaar&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-none"
                loading="lazy"
              />
            </div>
          </div>

          {/* Second Branch Dharmapuri */}
          <div className="bg-white rounded-2xl p-6 border border-[#D4AF37]/40 shadow-xs space-y-3">
            <div className="flex items-start justify-between border-b border-[#D4AF37]/20 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#8F171B] uppercase tracking-wider block">SECOND SHOWROOM</span>
                <h3 className="font-serif text-xl font-bold text-[#292321]">Dharmapuri Branch</h3>
              </div>
              <a
                href="tel:+917868082878"
                className="bg-[#8F171B] text-white p-2 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5 text-[#D4AF37]" /> Call Branch
              </a>
            </div>

            <div className="text-xs text-gray-700 space-y-1 font-light">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#8F171B] shrink-0 mt-0.5" />
                <span>Bazaar Street, Opposite Town Hall, Near Gandhi Statue, Dharmapuri, Tamil Nadu — 636701</span>
              </p>
              <p className="font-mono font-semibold text-[#8F171B] pt-1">
                Phone: +91 78680 82878
              </p>
            </div>

            <div className="pt-2 rounded-lg overflow-hidden border border-gray-200 h-40">
              <iframe
                title="Dharmapuri Branch Map"
                src="https://maps.google.com/maps?q=Dharmapuri+Town+Hall&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-none"
                loading="lazy"
              />
            </div>
          </div>

        </div>

        {/* Custom Enquiry Form (5 Cols) */}
        <div className="lg:col-span-5 bg-[#FCF8F1] border-2 border-[#D4AF37]/50 rounded-2xl p-6 sm:p-8 shadow-md">
          <div className="space-y-1 pb-4 border-b border-[#D4AF37]/30">
            <span className="text-[10px] font-bold uppercase text-[#8F171B]">CUSTOM ORDER & ENQUIRY</span>
            <h3 className="font-serif text-2xl font-bold text-[#292321]">Send Us A Message</h3>
          </div>

          <form onSubmit={handleSubmit} className="pt-4 space-y-4 text-xs">
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-[#8F171B] p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#8F171B]" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block font-bold text-[#292321] uppercase mb-1">Your Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. S. Lakshmi"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white border border-[#D4AF37]/50 rounded-lg px-3 py-2 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#292321] uppercase mb-1">Phone / WhatsApp Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 94432 00000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-white border border-[#D4AF37]/50 rounded-lg px-3 py-2 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#292321] uppercase mb-1">Preferred Branch</label>
              <select
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full bg-white border border-[#D4AF37]/50 rounded-lg px-3 py-2 font-semibold"
              >
                <option value="Krishnagiri Main Branch">Main Branch — Krishnagiri</option>
                <option value="Dharmapuri Second Branch">Second Branch — Dharmapuri</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#292321] uppercase mb-1">Message / Requirements *</label>
              <textarea
                required
                rows={4}
                placeholder="Details about gold weight requirements, bridal sets, or custom order designs..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-white border border-[#D4AF37]/50 rounded-lg px-3 py-2 font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#8F171B] text-white hover:bg-[#580E11] py-3 rounded-lg font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 text-[#D4AF37]" />
              <span>{isSubmitting ? 'Sending Message...' : 'Submit Enquiry'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
