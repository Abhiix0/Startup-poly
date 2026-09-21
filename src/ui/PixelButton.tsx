import React from 'react';

export interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const PixelButton: React.FC<PixelButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  className = '',
  icon,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-[#22B14C] hover:bg-[#1fa145] text-[#102040]',
    secondary: 'bg-[#FFCC00] hover:bg-[#ebd000] text-[#102040]',
    danger: 'bg-[#D32F2F] hover:bg-[#bf2626] text-white',
    ghost: 'bg-white hover:bg-[#F0EDE6] text-[#102040]',
  };

  const sizeStyles = {
    sm: 'min-h-[44px] px-3 py-1.5 text-xs font-pixel',
    md: 'min-h-[48px] px-4 py-2.5 text-sm font-pixel',
    lg: 'min-h-[56px] px-6 py-3 text-base font-pixel',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2 cursor-pointer font-bold select-none
        border-4 border-[#102040] shadow-[4px_4px_0px_#102040]
        active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#102040]
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFCC00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#102040]
        transition-all duration-75 motion-reduce:transition-none motion-reduce:transform-none
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[4px_4px_0px_#102040]
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-1">
          <span className="animate-pulse">●</span>
          <span className="animate-pulse delay-100">●</span>
          <span className="animate-pulse delay-200">●</span>
        </span>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};
