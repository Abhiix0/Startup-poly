import React from 'react';
import {
  PixelClockIcon,
  PixelTeamIcon,
  PixelCoin,
  PixelBuildingIcon,
} from '../../ui/pixel';

export const LandingHud: React.FC<{ className?: string }> = ({ className = '' }) => {
  const chips = [
    {
      id: 'time',
      icon: <PixelClockIcon size={16} />,
      value: '50',
      label: 'MIN',
      fullText: '50 MIN',
    },
    {
      id: 'teams',
      icon: <PixelTeamIcon size={16} />,
      value: '5–6',
      label: 'TEAMS',
      fullText: '5–6 TEAMS',
    },
    {
      id: 'cash',
      icon: <PixelCoin size={16} />,
      value: '₹1,000',
      label: 'START',
      fullText: '₹1,000 START',
    },
    {
      id: 'biz',
      icon: <PixelBuildingIcon size={16} />,
      value: 'MAX 3',
      label: 'BUSINESSES',
      fullText: 'MAX 3 BUSINESSES',
    },
  ];

  return (
    <div className={`w-full max-w-2xl mx-auto px-2 ${className}`}>
      <ul
        aria-label="Match facts"
        className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2.5 w-full list-none p-0 m-0"
      >
        {chips.map((chip) => (
          <li
            key={chip.id}
            aria-label={chip.fullText}
            className="bg-[#102040] border-2 border-[#FFCC00] shadow-[2px_2px_0px_#102040] px-2 sm:px-2.5 py-1 sm:py-1.5 flex items-center justify-center gap-1.5 sm:gap-2 rounded-sm select-none min-h-[36px] max-h-[46px]"
          >
            <span className="shrink-0 flex items-center justify-center" aria-hidden="true">
              {chip.icon}
            </span>
            <div className="flex flex-col items-start leading-none">
              <span className="font-pixel text-[10px] sm:text-[11px] text-white font-bold tracking-tight">
                {chip.value}
              </span>
              <span className="font-mono text-[8px] sm:text-[9px] text-[#FFFBEB]/80 font-medium mt-0.5 tracking-wider uppercase">
                {chip.label}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

