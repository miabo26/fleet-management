import React from 'react';

/**
 * Official Egypt Post Logo Component (شعار البريد المصري الرسمي)
 * Uses the authentic vector emblem and official typography of Egypt Post.
 */
export default function EgyptPostLogo({ 
  className = "h-8", 
  variant = "light", // 'light' for dark headers (white SVG), 'dark' for print & light forms (green SVG)
  showSubtitle = false,
  subtitle = "الهيئة القومية للبريد المصري"
}) {
  const isLight = variant === "light";

  return (
    <div className="flex items-center gap-2.5 shrink-0 select-none">
      <img 
        src={isLight ? "/egypt-post-logo-white.svg" : "/egypt-post-logo.svg"} 
        alt="البريد المصري - Egypt Post" 
        className={`${className} w-auto object-contain drop-shadow-sm`}
      />
      {showSubtitle && (
        <span className={`text-[11px] font-bold ${isLight ? 'text-emerald-300' : 'text-emerald-800'}`}>
          {subtitle}
        </span>
      )}
    </div>
  );
}
