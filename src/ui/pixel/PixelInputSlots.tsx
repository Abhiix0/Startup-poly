import React, { useRef } from 'react';

export interface PixelInputSlotsProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  hasError?: boolean;
  ariaLabel?: string;
  id?: string;
}

export const PixelInputSlots: React.FC<PixelInputSlotsProps> = ({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = true,
  className = '',
  hasError = false,
  ariaLabel = '1. Room Code',
  id = 'room-code-input',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const chars = value.toUpperCase().slice(0, length).split('');
  const slots = Array.from({ length }, (_, i) => chars[i] || '');
  const activeIndex = Math.min(chars.length, length - 1);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow alphanumeric characters (safe alphabet)
    const cleaned = e.target.value.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, '').slice(0, length);
    onChange(cleaned);
  };

  return (
    <div
      onClick={handleContainerClick}
      className={`relative flex items-center justify-center gap-1.5 sm:gap-2.5 cursor-text py-2 ${className}`}
    >
      {/* Hidden Transparent Input Layer */}
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={handleInputChange}
        maxLength={length}
        disabled={disabled}
        autoFocus={autoFocus}
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        className="absolute inset-0 w-full h-full opacity-0 cursor-text pointer-events-auto z-20"
        aria-label={ariaLabel}
      />

      {/* 6 Chunky Physical Block Slots */}
      {slots.map((char, index) => {
        const isFilled = Boolean(char);
        const isActive = !disabled && index === (value.length === length ? length - 1 : activeIndex);

        return (
          <div
            key={index}
            className={`
              relative w-10 h-12 sm:w-13 sm:h-16 flex items-center justify-center
              border-3 sm:border-4 border-[#102040] select-none transition-all duration-75
              ${
                hasError
                  ? 'bg-[#FEE2E2] border-[#D32F2F]'
                  : isFilled
                  ? 'bg-[#FFFBEB] shadow-[2px_2px_0px_#102040]'
                  : 'bg-[#5A2C0D]/20 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4)]'
              }
              ${isActive ? 'anim-slot-active ring-2 ring-[#FFCC00]' : ''}
            `}
            style={{
              boxShadow: isFilled
                ? '3px 3px 0px #102040'
                : 'inset 2px 2px 0px rgba(0,0,0,0.5), 1px 1px 0px rgba(255,255,255,0.2)',
            }}
          >
            {/* Top Inset Highlight */}
            <div className="absolute top-0 inset-x-0 h-0.5 sm:h-1 bg-white/40 pointer-events-none" />

            {/* Character */}
            {char ? (
              <span className="font-pixel text-base sm:text-xl md:text-2xl text-[#102040] font-black drop-shadow-[1px_1px_0px_rgba(255,255,255,0.8)]">
                {char}
              </span>
            ) : (
              <span className="font-pixel text-xs text-[#102040]/30">_</span>
            )}

            {/* Blinking typing underline indicator on empty active slot */}
            {isActive && !char && (
              <div className="absolute bottom-2 inset-x-2 h-1 bg-[#FFCC00] anim-blink" />
            )}
          </div>
        );
      })}
    </div>
  );
};
