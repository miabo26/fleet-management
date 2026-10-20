import React from 'react';

/**
 * Egypt Post Official Branding Logo Component (شعار الهيئة القومية للبريد المصري)
 * Features the signature postal falcon / wings emblem in green & gold with Arabic & English typography.
 */
export default function EgyptPostLogo({ 
  className = "h-11", 
  variant = "light", // 'light' for dark backgrounds, 'dark' for white/print
  showText = true,
  subtitle = "الهيئة القومية للبريد المصري"
}) {
  const isLight = variant === "light";
  
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Postal Emblem Icon */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          viewBox="0 0 120 120"
          className="w-11 h-11 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Crest Background */}
          <circle cx="60" cy="60" r="56" fill={isLight ? "url(#postGreenGradLight)" : "url(#postGreenGradDark)"} stroke="#EAAA00" strokeWidth="4" />
          
          {/* Inner Golden Ring */}
          <circle cx="60" cy="60" r="48" stroke="#EAAA00" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
          
          {/* Stylized Postal Falcon / Flying Letter Wings in Golden Yellow & White */}
          <path
            d="M26 62C38 48 55 42 72 45C84 47 94 56 94 56C94 56 82 54 70 57C58 60 48 68 40 76C35 81 29 82 26 80C23 78 22 70 26 62Z"
            fill="url(#goldGrad)"
          />
          <path
            d="M38 52C48 38 65 34 82 38C94 41 102 48 102 48C102 48 90 46 78 49C66 52 56 60 48 68C44 72 39 74 37 72C35 70 34 62 38 52Z"
            fill="#FFFFFF"
            opacity="0.9"
          />
          <path
            d="M24 72C34 62 48 58 62 61C72 63 80 70 80 70C80 70 70 68 60 71C50 74 42 81 35 88C31 92 27 92 25 90C23 88 22 81 24 72Z"
            fill="url(#goldGrad)"
            opacity="0.85"
          />
          
          {/* Small Postal Horn / Envelope Accent */}
          <circle cx="82" cy="74" r="6" fill="#EAAA00" />
          <path d="M79 72L85 74L79 76" stroke="#004D2C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Gradients */}
          <defs>
            <linearGradient id="postGreenGradLight" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
              <stop stopColor="#006837" />
              <stop offset="1" stopColor="#004022" />
            </linearGradient>
            <linearGradient id="postGreenGradDark" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
              <stop stopColor="#005A36" />
              <stop offset="1" stopColor="#00331E" />
            </linearGradient>
            <linearGradient id="goldGrad" x1="20" y1="40" x2="100" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFD700" />
              <stop offset="0.5" stopColor="#EAAA00" />
              <stop offset="1" stopColor="#C68A00" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Typography */}
      {showText && (
        <div className="flex flex-col text-right leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`text-base font-black tracking-tight ${isLight ? 'text-white' : 'text-emerald-950'}`}>
              البريد المصري
            </span>
            <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 uppercase tracking-wider">
              Egypt Post
            </span>
          </div>
          <span className={`text-[11px] font-semibold ${isLight ? 'text-emerald-300' : 'text-emerald-800'}`}>
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
}
