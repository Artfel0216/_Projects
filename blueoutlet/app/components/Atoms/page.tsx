import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon;
  error?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, icon: Icon, disabled, error, className = "", ...props }, ref) => {
    const id = props.id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={`group space-y-2 w-full animate-in fade-in duration-500 ${className}`}>
        <label 
          htmlFor={id}
          className="text-[10px] font-bold text-white/40 uppercase tracking-[0.15em] ml-1 select-none transition-colors group-focus-within:text-white/70"
        >
          {label}
        </label>
        
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white group-hover:text-white/50 transition-all duration-300 pointer-events-none">
            <Icon size={18} strokeWidth={2.5} />
          </div>
          
          <input
            {...props}
            id={id}
            ref={ref}
            disabled={disabled}
            className={`
              w-full bg-white/3 border rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white 
              placeholder:text-white/10 transition-all duration-300 focus:outline-none 
              ${error 
                ? "border-red-500/50 bg-red-500/5 focus:border-red-500 focus:ring-4 ring-red-500/10" 
                : "border-white/5 hover:border-white/10 focus:border-white/20 focus:bg-white/6 focus:ring-4 ring-white/5 shadow-2xl"}
              ${disabled 
                ? "opacity-40 cursor-not-allowed grayscale shadow-none" 
                : "active:scale-[0.99]"}
            `}
          />
        </div>

        {error && (
          <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1 animate-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";