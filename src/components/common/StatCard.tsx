import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  type?: 'cash' | 'cv' | 'neutral' | 'active';
  badge?: string;
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  type = 'neutral',
  badge,
  onClick,
  className = '',
}) => {
  const getColors = () => {
    switch (type) {
      case 'cash':
        return {
          text: 'text-[#33FF67]',
          bg: 'bg-[#222222]',
          border: 'border-[#33FF67]/20 hover:border-[#33FF67]/40',
          glow: 'group-hover:shadow-glow-green',
        };
      case 'cv':
        return {
          text: 'text-[#7484FE]',
          bg: 'bg-[#222222]',
          border: 'border-[#7484FE]/20 hover:border-[#7484FE]/40',
          glow: 'group-hover:shadow-glow-blue',
        };
      case 'active':
        return {
          text: 'text-[#F7F2F6]',
          bg: 'bg-[#2E2E2E]',
          border: 'border-[#7484FE]/40',
          glow: '',
        };
      default:
        return {
          text: 'text-[#F7F2F6]',
          bg: 'bg-[#222222]',
          border: 'border-[#F7F2F6]/10 hover:border-[#F7F2F6]/20',
          glow: '',
        };
    }
  };

  const style = getColors();

  return (
    <div
      onClick={onClick}
      className={`group relative p-4 rounded-2xl ${style.bg} border ${style.border} transition-all duration-200 ${
        onClick ? 'cursor-pointer active:scale-98' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#A5A2A5]">
          {label}
        </span>
        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7484FE]/15 text-[#7484FE] border border-[#7484FE]/30">
            {badge}
          </span>
        )}
      </div>

      <div className={`text-2xl xs:text-3xl font-black tracking-tight ${style.text} my-0.5`}>
        {value}
      </div>

      {subtext && (
        <p className="text-[12px] font-medium text-[#A5A2A5]/90 mt-1 truncate">
          {subtext}
        </p>
      )}
    </div>
  );
};
