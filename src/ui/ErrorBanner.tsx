import React from 'react';
import { PixelButton } from './PixelButton';

export interface ErrorBannerProps {
  message: string;
  code?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  code,
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`
        border-3 border-[#102040] bg-[#FEF2F2] p-3.5 sm:p-4 text-[#991B1B]
        shadow-[3px_3px_0px_#102040] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3
        ${className}
      `}
    >
      <div className="flex items-start gap-2.5">
        <span className="font-pixel text-sm text-[#D32F2F] mt-0.5 select-none">⚠</span>
        <div>
          <p className="font-mono text-xs sm:text-sm font-bold leading-snug">{message}</p>
          {code && (
            <p className="font-mono text-[10px] text-[#DC2626] tracking-wider uppercase mt-0.5">
              CODE: {code}
            </p>
          )}
        </div>
      </div>

      {onRetry && (
        <PixelButton
          variant="danger"
          size="sm"
          onClick={onRetry}
          className="flex-shrink-0 self-end sm:self-center"
        >
          RETRY
        </PixelButton>
      )}
    </div>
  );
};
