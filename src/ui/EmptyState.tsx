import React from 'react';
import { PixelButton } from './PixelButton';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`
        border-4 border-dashed border-[#102040] bg-[#FAF8F5] p-8 text-center
        flex flex-col items-center justify-center gap-3
        ${className}
      `}
    >
      {icon ? (
        <div className="text-3xl text-[#64748B] mb-1 select-none">{icon}</div>
      ) : (
        <div className="w-12 h-12 border-3 border-[#102040] bg-[#FFCC00] flex items-center justify-center font-pixel text-lg text-[#102040] shadow-[2px_2px_0px_#102040] mb-1">
          ?
        </div>
      )}

      <h3 className="font-pixel text-xs sm:text-sm uppercase tracking-wide text-[#102040]">
        {title}
      </h3>

      {description && (
        <p className="font-mono text-xs text-[#64748B] max-w-sm">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <div className="mt-2">
          <PixelButton variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </PixelButton>
        </div>
      )}
    </div>
  );
};
