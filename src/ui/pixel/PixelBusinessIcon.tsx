import React from 'react';

export interface PixelBusinessIconProps {
  businessKey: string;
  size?: number;
  className?: string;
  title?: string;
}

export const PixelBusinessIcon: React.FC<PixelBusinessIconProps> = ({
  businessKey,
  size = 24,
  className = '',
  title,
}) => {
  const normKey = (businessKey || '').toLowerCase();
  const iconTitle = title || normKey.toUpperCase();

  const renderIcon = () => {
    switch (normKey) {
      case 'edtech':
        // Graduation cap + scroll
        return (
          <>
            {/* Cap Outline */}
            <rect x="7" y="2" width="2" height="1" fill="#102040" />
            <rect x="5" y="3" width="6" height="1" fill="#102040" />
            <rect x="2" y="4" width="12" height="1" fill="#102040" />
            <rect x="1" y="5" width="14" height="2" fill="#5C94FC" />
            <rect x="3" y="5" width="10" height="1" fill="#93C5FD" />
            <rect x="4" y="7" width="8" height="2" fill="#102040" />
            <rect x="5" y="7" width="6" height="2" fill="#1E40AF" />
            {/* Tassel (Gold) */}
            <rect x="12" y="6" width="1" height="4" fill="#FFCC00" />
            <rect x="11" y="9" width="3" height="2" fill="#FFCC00" />
            {/* Diploma / Scroll base */}
            <rect x="4" y="11" width="8" height="3" fill="#FFFFFF" stroke="#102040" strokeWidth="1" />
            <rect x="7" y="11" width="2" height="3" fill="#D32F2F" /> {/* Ribbon */}
          </>
        );

      case 'saas':
        // Cloud + recurring cycle / server
        return (
          <>
            {/* Cloud Outline */}
            <rect x="5" y="3" width="6" height="1" fill="#102040" />
            <rect x="3" y="4" width="10" height="1" fill="#102040" />
            <rect x="2" y="5" width="12" height="5" fill="#5C94FC" />
            <rect x="4" y="5" width="8" height="2" fill="#BAE6FD" />
            <rect x="1" y="7" width="14" height="4" fill="#5C94FC" />
            <rect x="1" y="11" width="14" height="1" fill="#102040" />
            {/* Sync arrows inside */}
            <rect x="5" y="8" width="2" height="2" fill="#FFFFFF" />
            <rect x="9" y="8" width="2" height="2" fill="#FFCC00" />
            {/* Server tray base */}
            <rect x="3" y="12" width="10" height="3" fill="#102040" />
            <rect x="5" y="13" width="2" height="1" fill="#22B14C" /> {/* Online LED */}
            <rect x="9" y="13" width="2" height="1" fill="#FFCC00" />
          </>
        );

      case 'ecommerce':
        // Shopping cart with golden items
        return (
          <>
            {/* Cart Handle */}
            <rect x="1" y="3" width="3" height="1" fill="#102040" />
            <rect x="3" y="4" width="1" height="3" fill="#102040" />
            {/* Basket */}
            <rect x="4" y="5" width="11" height="6" fill="#FFCC00" stroke="#102040" strokeWidth="1" />
            <rect x="5" y="6" width="3" height="2" fill="#D32F2F" /> {/* Parcel 1 */}
            <rect x="9" y="6" width="4" height="3" fill="#22B14C" /> {/* Parcel 2 */}
            <rect x="4" y="11" width="9" height="1" fill="#102040" />
            {/* Wheels */}
            <rect x="5" y="12" width="2" height="2" fill="#102040" />
            <rect x="11" y="12" width="2" height="2" fill="#102040" />
            <rect x="5" y="13" width="1" height="1" fill="#FFFFFF" />
            <rect x="11" y="13" width="1" height="1" fill="#FFFFFF" />
          </>
        );

      case 'fintech':
        // Rupee / Bank vault / coin stack
        return (
          <>
            {/* Rupee / Coin Stack */}
            <rect x="2" y="2" width="12" height="2" fill="#102040" />
            <rect x="4" y="2" width="8" height="1" fill="#FFCC00" />
            {/* Bank Pillars */}
            <rect x="3" y="4" width="2" height="7" fill="#FFCC00" stroke="#102040" strokeWidth="1" />
            <rect x="7" y="4" width="2" height="7" fill="#FFCC00" stroke="#102040" strokeWidth="1" />
            <rect x="11" y="4" width="2" height="7" fill="#FFCC00" stroke="#102040" strokeWidth="1" />
            {/* Plinth */}
            <rect x="1" y="11" width="14" height="2" fill="#102040" />
            <rect x="2" y="11" width="12" height="1" fill="#D97706" />
            {/* Growth indicator arrow */}
            <rect x="12" y="1" width="3" height="1" fill="#22B14C" />
            <rect x="13" y="2" width="2" height="2" fill="#22B14C" />
          </>
        );

      case 'healthtech':
        // Heartbeat + Medical Cross
        return (
          <>
            {/* Rounded Square Card */}
            <rect x="2" y="2" width="12" height="12" fill="#FFFFFF" stroke="#102040" strokeWidth="1" />
            {/* Red Cross */}
            <rect x="6" y="4" width="4" height="8" fill="#D32F2F" />
            <rect x="4" y="6" width="8" height="4" fill="#D32F2F" />
            {/* Cross Highlight */}
            <rect x="7" y="5" width="2" height="2" fill="#EF4444" />
            <rect x="5" y="7" width="2" height="2" fill="#EF4444" />
            {/* Heartbeat pulse accent */}
            <rect x="5" y="7" width="6" height="2" fill="#FFFFFF" />
            <rect x="7" y="5" width="2" height="6" fill="#FFFFFF" />
            <rect x="7" y="7" width="2" height="2" fill="#22B14C" />
          </>
        );

      case 'ai_deeptech':
        // Microchip + Neural Node
        return (
          <>
            {/* Outer Chip Body */}
            <rect x="3" y="3" width="10" height="10" fill="#102040" stroke="#22B14C" strokeWidth="1" />
            {/* Chip Pins */}
            <rect x="5" y="1" width="2" height="2" fill="#FFCC00" />
            <rect x="9" y="1" width="2" height="2" fill="#FFCC00" />
            <rect x="5" y="13" width="2" height="2" fill="#FFCC00" />
            <rect x="9" y="13" width="2" height="2" fill="#FFCC00" />
            <rect x="1" y="5" width="2" height="2" fill="#FFCC00" />
            <rect x="1" y="9" width="2" height="2" fill="#FFCC00" />
            <rect x="13" y="5" width="2" height="2" fill="#FFCC00" />
            <rect x="13" y="9" width="2" height="2" fill="#FFCC00" />
            {/* Core Neural Node */}
            <rect x="5" y="5" width="6" height="6" fill="#22B14C" />
            <rect x="7" y="7" width="2" height="2" fill="#FFFBEB" />
          </>
        );

      case 'devtools':
        // Code terminal < / >
        return (
          <>
            {/* Terminal Window */}
            <rect x="1" y="2" width="14" height="12" fill="#102040" stroke="#5C94FC" strokeWidth="1" />
            {/* Window header buttons */}
            <rect x="2" y="3" width="2" height="1" fill="#D32F2F" />
            <rect x="5" y="3" width="2" height="1" fill="#FFCC00" />
            <rect x="8" y="3" width="2" height="1" fill="#22B14C" />
            {/* < Bracket */}
            <rect x="3" y="6" width="1" height="4" fill="#22B14C" />
            <rect x="4" y="5" width="1" height="1" fill="#22B14C" />
            <rect x="4" y="10" width="1" height="1" fill="#22B14C" />
            {/* Slash / */}
            <rect x="7" y="5" width="2" height="2" fill="#FFCC00" />
            <rect x="6" y="7" width="2" height="2" fill="#FFCC00" />
            <rect x="5" y="9" width="2" height="2" fill="#FFCC00" />
            {/* > Bracket */}
            <rect x="10" y="6" width="1" height="4" fill="#22B14C" />
            <rect x="9" y="5" width="1" height="1" fill="#22B14C" />
            <rect x="9" y="10" width="1" height="1" fill="#22B14C" />
          </>
        );

      case 'cybersecurity':
        // Padlock + Shield
        return (
          <>
            {/* Lock Shackle */}
            <rect x="5" y="2" width="6" height="4" fill="none" stroke="#102040" strokeWidth="2" />
            <rect x="6" y="3" width="4" height="2" fill="#FFFBEB" />
            {/* Shield / Lock Body */}
            <rect x="3" y="6" width="10" height="8" fill="#FFCC00" stroke="#102040" strokeWidth="1" />
            <rect x="4" y="7" width="3" height="6" fill="#FFFBEB" />
            {/* Keyhole */}
            <rect x="7" y="8" width="2" height="2" fill="#102040" />
            <rect x="7" y="10" width="2" height="2" fill="#102040" />
          </>
        );

      case 'cleantech':
        // Sprouting Leaf + Sun ray
        return (
          <>
            {/* Sun */}
            <rect x="11" y="2" width="3" height="3" fill="#FFCC00" />
            {/* Main Leaf Body */}
            <rect x="3" y="4" width="8" height="8" fill="#22B14C" stroke="#102040" strokeWidth="1" />
            <rect x="4" y="3" width="6" height="2" fill="#4ADE80" />
            <rect x="2" y="5" width="2" height="6" fill="#4ADE80" />
            {/* Leaf Vein */}
            <rect x="5" y="6" width="4" height="1" fill="#166534" />
            <rect x="4" y="7" width="2" height="1" fill="#166534" />
            <rect x="3" y="8" width="2" height="1" fill="#166534" />
            {/* Stem & Pot/Earth */}
            <rect x="3" y="10" width="2" height="3" fill="#B84418" />
            <rect x="2" y="13" width="12" height="2" fill="#102040" />
          </>
        );

      case 'robotics':
        // 8-bit Robot Face
        return (
          <>
            {/* Antenna */}
            <rect x="7" y="1" width="2" height="2" fill="#FFCC00" />
            <rect x="7" y="3" width="2" height="2" fill="#102040" />
            {/* Head Body */}
            <rect x="2" y="5" width="12" height="9" fill="#94A3B8" stroke="#102040" strokeWidth="1" />
            {/* Ears/Bolts */}
            <rect x="1" y="8" width="1" height="3" fill="#FFCC00" />
            <rect x="14" y="8" width="1" height="3" fill="#FFCC00" />
            {/* Eyes */}
            <rect x="4" y="7" width="2" height="2" fill="#22B14C" />
            <rect x="10" y="7" width="2" height="2" fill="#22B14C" />
            <rect x="4" y="7" width="1" height="1" fill="#FFFBEB" />
            <rect x="10" y="7" width="1" height="1" fill="#FFFBEB" />
            {/* Grille Mouth */}
            <rect x="5" y="11" width="6" height="2" fill="#102040" />
            <rect x="6" y="11" width="1" height="2" fill="#38BDF8" />
            <rect x="8" y="11" width="1" height="2" fill="#38BDF8" />
          </>
        );

      default:
        // Default Startup Rocket / Block
        return (
          <>
            <rect x="6" y="2" width="4" height="2" fill="#D32F2F" />
            <rect x="4" y="4" width="8" height="6" fill="#FFFFFF" stroke="#102040" strokeWidth="1" />
            <rect x="6" y="6" width="4" height="2" fill="#38BDF8" />
            <rect x="3" y="10" width="10" height="2" fill="#5C94FC" />
            <rect x="6" y="12" width="4" height="3" fill="#FFCC00" />
          </>
        );
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block flex-shrink-0 select-none ${className}`}
      style={{ imageRendering: 'pixelated' }}
      role="img"
      aria-label={iconTitle}
    >
      <title>{iconTitle}</title>
      {renderIcon()}
    </svg>
  );
};
