import React from 'react';

interface Props {
  className?: string;
  size?: number;
}

export const ECGLandscapeLogoIcon: React.FC<Props> = ({ className = '', size = 36 }) => {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Background Circle */}
        <circle cx="50" cy="50" r="46" fill="url(#logo_grad)" stroke="#10b981" strokeWidth="4" />

        {/* Sun Behind Mountains */}
        <circle cx="50" cy="38" r="14" fill="#fbbf24" />
        {/* Sun Rays */}
        <path d="M50 18V22M50 54V58M30 38H34M66 38H70M36 24L39 27M61 49L64 52M36 52L39 49M61 27L64 24" stroke="#fde047" strokeWidth="2.5" strokeLinecap="round" />

        {/* Mountain Silhouettes */}
        <path
          d="M10 75L32 45L48 62L68 36L90 75H10Z"
          fill="#047857"
          opacity="0.9"
        />

        {/* ECG Line Morphing into Horizon Peaks */}
        <path
          d="M8 68H20L24 62L28 72L34 38L42 78L48 64L54 68H62L66 58L72 74L78 68H92"
          stroke="#34d399"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Forward Pulse Dot */}
        <circle cx="78" cy="68" r="3.5" fill="#fde047" className="animate-ping" />

        <defs>
          <linearGradient id="logo_grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#064e3b" />
            <stop offset="1" stopColor="#022c22" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
