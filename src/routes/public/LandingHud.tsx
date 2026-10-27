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
      title: 'TIME',
      value: '50 MIN',
      fullText: '50 MIN',
    },
    {
      id: 'teams',
      icon: <PixelTeamIcon size={16} />,
      title: 'TEAMS',
      value: '5–6',
      fullText: '5–6 TEAMS',
      unit: 'TEAMS',
    },
    {
      id: 'cash',
      icon: <PixelCoin size={16} />,
      title: 'START CASH',
      value: '₹1,000',
      fullText: '₹1,000 START',
      unit: 'START',
    },
    {
      id: 'biz',
      icon: <PixelBuildingIcon size={16} />,
      title: 'BUSINESSES',
      value: 'MAX 3',
      fullText: 'MAX 3 BUSINESSES',
      unit: 'BUSINESSES',
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
            className="bg-[#102040] border-2 border-[#FFCC00] shadow-[3px_3px_0px_#102040] px-2 sm:px-2.5 py-1.5 flex items-center justify-center gap-2 rounded-sm select-none min-h-[40px] max-h-[48px] transition-transform duration-75 hover:scale-[1.03] hover:border-[#FFFBEB]"
          >
            <span className="shrink-0 flex items-center justify-center" aria-hidden="true">
              {chip.icon}
            </span>
            <div className="flex flex-col items-start leading-none">
              <span className="font-mono text-[7.5px] sm:text-[8.5px] text-[#FFFBEB]/70 font-semibold tracking-wider uppercase">
                {chip.title}
              </span>
              <span className="font-pixel text-[10px] sm:text-[11px] text-white font-bold tracking-tight mt-0.5">
                {chip.value}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

