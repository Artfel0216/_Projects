interface Props {
  id: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export default function TextArea({ id, value, onChange, placeholder, readOnly = false }: Props) {
  return (
    <textarea
      id={id}
      value={value}
      placeholder={placeholder}
      readOnly={readOnly}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full border border-gray-300 rounded px-3 py-2 h-40 resize-none mb-4"
    />
  );
}
