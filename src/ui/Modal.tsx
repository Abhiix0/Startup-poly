import React, { useEffect, useRef } from 'react';
import { PixelButton } from './PixelButton';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-100"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className={`
          w-full ${maxWidthStyles[maxWidth]} bg-[#FAF8F5]
          border-4 border-[#102040] shadow-[6px_6px_0px_#102040]
          flex flex-col max-h-[90vh] overflow-hidden
        `}
      >
        {/* Modal Header */}
        <div className="bg-[#102040] text-white px-4 py-3 flex items-center justify-between border-b-4 border-[#102040]">
          <h2 className="font-pixel text-xs sm:text-sm uppercase tracking-wider truncate pr-2">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 flex items-center justify-center bg-[#D32F2F] text-white font-pixel text-xs border-2 border-white hover:bg-[#B71C1C] cursor-pointer active:translate-y-0.5"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 font-sans text-sm text-[#102040]">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="bg-[#EAE5D9] px-4 py-3 border-t-4 border-[#102040] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
