import React from 'react';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixText?: string;
  suffixText?: string;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, helperText, prefixText, suffixText, className = '', id, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="font-pixel text-[11px] uppercase tracking-wider text-[#102040] select-none"
          >
            {label}
            {props.required && <span className="text-[#D32F2F] ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {prefixText && (
            <span className="absolute left-3.5 font-mono font-bold text-[#64748B] select-none pointer-events-none text-sm">
              {prefixText}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`
              w-full min-h-[48px] px-3.5 py-2.5 font-mono text-sm bg-white text-[#102040]
              border-3 border-[#102040] shadow-[2px_2px_0px_#102040]
              placeholder:text-[#94A3B8] placeholder:font-sans
              focus:outline-hidden focus:bg-[#FFFBEB] focus:border-[#22B14C] focus:shadow-[3px_3px_0px_#102040]
              disabled:bg-[#F1F5F9] disabled:text-[#94A3B8] disabled:cursor-not-allowed
              ${prefixText ? 'pl-8' : ''}
              ${suffixText ? 'pr-8' : ''}
              ${error ? 'border-[#D32F2F] bg-[#FEF2F2]' : ''}
              ${className}
            `}
            {...props}
          />

          {suffixText && (
            <span className="absolute right-3.5 font-mono font-bold text-[#64748B] select-none pointer-events-none text-sm">
              {suffixText}
            </span>
          )}
        </div>

        {error ? (
          <p className="font-mono text-xs text-[#D32F2F] font-semibold flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        ) : helperText ? (
          <p className="font-mono text-[11px] text-[#64748B]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

TextField.displayName = 'TextField';
