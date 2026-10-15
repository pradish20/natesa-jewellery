import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgLogoContent = `
<svg width="800" height="240" viewBox="0 0 800 240" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F7E7CE" />
      <stop offset="30%" stop-color="#D4AF37" />
      <stop offset="70%" stop-color="#AA7C11" />
      <stop offset="100%" stop-color="#EBDCC5" />
    </linearGradient>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8F171B" />
      <stop offset="50%" stop-color="#6F0F12" />
      <stop offset="100%" stop-color="#8F171B" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Background Card with rounded corners and gold border -->
  <rect x="8" y="8" width="784" height="224" rx="20" fill="url(#bgGrad)" stroke="url(#goldGrad)" stroke-width="4" filter="url(#shadow)"/>
  <rect x="16" y="16" width="768" height="208" rx="14" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" stroke-dasharray="8 4"/>

  <!-- Left/Center Crest Emblem -->
  <g transform="translate(110, 120)">
    <!-- Outer Ring -->
    <circle cx="0" cy="0" r="70" fill="none" stroke="url(#goldGrad)" stroke-width="3" />
    <circle cx="0" cy="0" r="62" fill="none" stroke="url(#goldGrad)" stroke-width="1" stroke-dasharray="4 3" />
    
    <!-- Temple Crown Top -->
    <path d="M0 -72 L12 -58 L28 -64 L18 -48 L0 -54 L-18 -48 L-28 -64 L-12 -58 Z" fill="url(#goldGrad)" />
    
    <!-- Outer Filigree Petals -->
    <path d="M0 -50 C18 -50 42 -32 42 0 C42 32 18 50 0 50 C-18 50 -42 32 -42 0 C-42 -32 -18 -50 0 -50 Z" fill="none" stroke="url(#goldGrad)" stroke-width="2" />
    <path d="M-50 0 C-50 -18 -32 -42 0 -42 C32 -42 50 -18 50 0 C50 18 32 42 0 42 C-32 42 -50 18 -50 0 Z" fill="none" stroke="url(#goldGrad)" stroke-width="2" />

    <!-- Monogram NJ -->
    <text x="0" y="16" text-anchor="middle" fill="url(#goldGrad)" font-family="'Cormorant Garamond', Georgia, serif" font-weight="bold" font-size="52" letter-spacing="-1">N</text>
    
    <!-- Bottom Sparkle -->
    <circle cx="0" cy="58" r="4" fill="url(#goldGrad)" />
  </g>

  <!-- Brand Text -->
  <g transform="translate(210, 0)">
    <!-- Main Title -->
    <text x="30" y="122" fill="url(#goldGrad)" font-family="'Cormorant Garamond', Georgia, serif" font-weight="800" font-size="62" letter-spacing="2">
      NATESA JEWELLERY
    </text>
    
    <!-- Divider Line -->
    <line x1="32" y1="142" x2="520" y2="142" stroke="url(#goldGrad)" stroke-width="2" opacity="0.8" />
    <circle cx="276" cy="142" r="4" fill="url(#goldGrad)" />

    <!-- Subtitle Tagline -->
    <text x="32" y="176" fill="#FCF8F1" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="20" letter-spacing="6" opacity="0.95">
      TRADITION • TRUST • TIMELESS BEAUTY
    </text>
  </g>
</svg>
`;

const svgTransparentContent = `
<svg width="800" height="200" viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="maroonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8F171B" />
      <stop offset="100%" stop-color="#580E11" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D4AF37" />
      <stop offset="50%" stop-color="#AA7C11" />
      <stop offset="100%" stop-color="#8F171B" />
    </linearGradient>
  </defs>

  <!-- Left Emblem -->
  <g transform="translate(80, 100)">
    <circle cx="0" cy="0" r="55" fill="none" stroke="#8F171B" stroke-width="3" />
    <circle cx="0" cy="0" r="48" fill="none" stroke="#D4AF37" stroke-width="1.5" stroke-dasharray="3 2" />
    <path d="M0 -55 L10 -43 L22 -48 L14 -35 L0 -40 L-14 -35 L-22 -48 L-10 -43 Z" fill="#8F171B" />
    <text x="0" y="14" text-anchor="middle" fill="#8F171B" font-family="'Cormorant Garamond', Georgia, serif" font-weight="bold" font-size="44">NJ</text>
  </g>

  <!-- Right Text -->
  <g transform="translate(160, 0)">
    <text x="10" y="105" fill="#8F171B" font-family="'Cormorant Garamond', Georgia, serif" font-weight="800" font-size="56" letter-spacing="2">
      NATESA JEWELLERY
    </text>
    <text x="12" y="145" fill="#292321" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="18" letter-spacing="5" opacity="0.85">
      TRADITION • TRUST • TIMELESS BEAUTY
    </text>
  </g>
</svg>
`;

async function main() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Save SVG
  fs.writeFileSync(path.join(publicDir, 'natesa-logo.svg'), svgLogoContent);
  fs.writeFileSync(path.join(publicDir, 'natesa-logo-transparent.svg'), svgTransparentContent);

  // Generate PNG files using Sharp at 2x density for ultra-crisp resolution
  await sharp(Buffer.from(svgLogoContent))
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'natesa-logo.png'));

  await sharp(Buffer.from(svgTransparentContent))
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'natesa-logo-transparent.png'));

  console.log('PNG logos successfully generated in /public/natesa-logo.png and /public/natesa-logo-transparent.png!');
}

main().catch(console.error);
