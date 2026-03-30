import React from 'react';

const Logo = () => (
  <svg width="34" height="34" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#0f172a"/>
    <rect x="25" y="55" width="12" height="25" rx="4" fill="#334155"/>
    <rect x="44" y="45" width="12" height="35" rx="4" fill="#334155"/>
    <rect x="63" y="35" width="12" height="45" rx="4" fill="#334155"/>
    <path d="M25 55L44 45L63 35L80 20M80 20H68M80 20V32" stroke="url(#paint0_linear_logo)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="80" cy="20" r="5" fill="#a78bfa" filter="blur(2px)"/>
    <defs>
      <linearGradient id="paint0_linear_logo" x1="25" y1="55" x2="80" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#60a5fa"/><stop offset="1" stopColor="#a78bfa"/>
      </linearGradient>
    </defs>
  </svg>
);

export default Logo;