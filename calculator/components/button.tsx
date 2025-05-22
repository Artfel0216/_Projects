type ButtonProps = {
  label: string;
  onClick: () => void;
  className?: string;
  variant: 'digit' | 'op' | 'equal' | 'clear';
};

export default function Button({ label, onClick, className = '', variant }: ButtonProps) {
  const base =
    'p-5 text-lg font-semibold rounded-[10px] border-none cursor-pointer transition duration-200';

  const variants: Record<ButtonProps['variant'], string> = {
    digit: 'bg-[#4e8cff] text-white hover:bg-[#3b6edc]',
    op: 'bg-[#ff6b6b] text-white hover:bg-[#e85a5a]',
    equal: 'bg-[#00c27f] text-white hover:bg-[#00a76a]',
    clear: 'bg-[#999] text-white hover:bg-[#777]',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} onClick={onClick}>
      {label}
    </button>
  );
}
