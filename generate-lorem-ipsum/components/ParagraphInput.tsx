interface Props {
  value: number;
  onChange: (value: number) => void;
}

export default function ParagraphInput({ value, onChange }: Props) {
  return (
    <div className="mb-4">
      <label htmlFor="numParagraphs" className="block mb-1 font-medium">
        Número de Parágrafos:
      </label>
      <input
        id="numParagraphs"
        type="number"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="border px-3 py-2 rounded w-24 text-center"
      />
    </div>
  );
}
