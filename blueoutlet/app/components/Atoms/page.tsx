import { LucideIcon } from 'lucide-react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon;
}

export const InputField = ({ 
  label, icon: Icon, disabled, ...props 
}: InputFieldProps) => (
  <div className="group space-y-2 w-full">
    <label className="text-xs font-medium text-white/40 uppercase tracking-wider ml-1">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white transition-colors">
        <Icon size={18} />
      </div>
      <input
        {...props}
        disabled={disabled}
        className={`w-full bg-white/3 border rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-white/20 transition-all duration-300 focus:outline-none 
          ${disabled 
            ? "border-transparent opacity-60 cursor-not-allowed" 
            : "border-white/8 hover:border-white/20 focus:border-white/30 focus:bg-white/5 shadow-inner"}`}
      />
    </div>
  </div>
);