interface Props {
  length: number;
  setLength: (value: number) => void;
}

export default function LengthInput({ length, setLength }: Props) {
  return (
    <div>
      <label htmlFor="length" className="block mb-1 font-medium">Comprimento da senha</label>
      <input
        type="number"
        id="length"
        min={4}
        max={32}
        value={length}
        onChange={(e) => setLength(Number(e.target.value))}
        className="w-full border px-3 py-2 rounded"
      />
    </div>
  );
}
