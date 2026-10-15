import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  logoUrl?: string;
  variant?: 'card' | 'transparent';
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  className = 'h-10 sm:h-12 md:h-14',
  logoUrl,
  variant = 'card',
  onClick
}) => {
  // Candidate image sources in priority order
  const userImageCandidates = [
    '/natesa jewellry logo.png',
    '/natesa-logo.png',
    '/natesa-logo-transparent.png',
    '/natesa_logo.png'
  ];

  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  const initialSrc = logoUrl || userImageCandidates[0];
  const activeSrc = logoUrl ? logoUrl : userImageCandidates[currentSourceIndex] || '/natesa-logo.png';

  const handleImageError = () => {
    if (logoUrl) {
      setImageFailed(true);
      return;
    }

    if (currentSourceIndex < userImageCandidates.length - 1) {
      setCurrentSourceIndex((prev) => prev + 1);
    } else {
      setImageFailed(true);
    }
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center focus:outline-none group text-left ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
      type={onClick ? 'button' : undefined}
      title="Natesa Jewellery - Tradition • Trust • Timeless Beauty"
    >
      {!imageFailed ? (
        <img
          src={encodeURI(activeSrc)}
          alt="Natesa Jewellery Logo"
          className={`${className} w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02] drop-shadow-xs max-w-full`}
          onError={handleImageError}
        />
      ) : (
        /* Fallback Brand Monogram Header Badge */
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#8F171B] border-2 border-[#D4AF37] flex items-center justify-center text-[#EBDCC5] font-serif font-bold text-lg shadow-xs">
            NJ
          </div>
          <div className="text-left">
            <span className="block font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#8F171B] leading-none">
              Natesa Jewellery
            </span>
            <span className="block text-[9px] sm:text-[10px] tracking-widest uppercase font-semibold text-[#292321]/80 mt-0.5">
              Tradition • Trust • Timeless Beauty
            </span>
          </div>
        </div>
      )}
    </button>
  );
};
