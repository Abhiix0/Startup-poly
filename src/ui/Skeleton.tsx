import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  height?: string | number;
  width?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
  height,
  width,
}) => {
  const variantStyles = {
    text: 'h-4 w-full',
    rect: 'w-full',
    circle: 'rounded-none aspect-square',
  };

  const style: React.CSSProperties = {
    ...(height ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
    ...(width ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
  };

  return (
    <div
      style={style}
      className={`
        bg-[#E2E8F0] border-2 border-[#102040] animate-pulse
        ${variantStyles[variant]}
        ${className}
      `}
    />
  );
};
