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
            className="font-pixel text-[11px] uppercase tracking-wider text-brand-navy select-none"
          >
            {label}
            {props.required && <span className="text-brand-red ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {prefixText && (
            <span className="absolute left-3.5 font-mono font-bold text-neutral-500 select-none pointer-events-none text-sm">
              {prefixText}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`
              w-full min-h-[48px] px-3.5 py-2.5 font-mono text-sm bg-brand-white text-brand-navy
              border-3 border-brand-navy shadow-pixel-sm
              placeholder:text-neutral-400 placeholder:font-sans
              focus:outline-hidden focus:bg-status-warning-bg focus:border-brand-green focus:shadow-[3px_3px_0px_var(--color-brand-navy)]
              disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed
              ${prefixText ? 'pl-8' : ''}
              ${suffixText ? 'pr-8' : ''}
              ${error ? 'border-brand-red bg-status-danger-bg' : ''}
              ${className}
            `}
            {...props}
          />

          {suffixText && (
            <span className="absolute right-3.5 font-mono font-bold text-neutral-500 select-none pointer-events-none text-sm">
              {suffixText}
            </span>
          )}
        </div>

        {error ? (
          <p className="font-mono text-xs text-brand-red font-semibold flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        ) : helperText ? (
          <p className="font-mono text-[11px] text-neutral-700">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

TextField.displayName = 'TextField';
