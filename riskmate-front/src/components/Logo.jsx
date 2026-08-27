import React from 'react';

const Logo = () => (
  <svg width="34" height="34" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#040b16"/>
    <path 
      d="M 35 75 V 25 H 55 C 68 25 72 32 72 42 C 72 52 68 59 55 59 H 35 M 50 59 L 68 75" 
      stroke="url(#paint0_linear_logo)" 
      strokeWidth="10" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="paint0_linear_logo" x1="30" y1="25" x2="72" y2="75" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0ea5e9"/>
        <stop offset="1" stopColor="#22d3ee"/>
      </linearGradient>
    </defs>
  </svg>
);

export default Logo;