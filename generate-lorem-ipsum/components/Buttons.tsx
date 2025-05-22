interface Props {
  onGenerate: () => void;
  onCopy: () => void;
}

export default function Buttons({ onGenerate, onCopy }: Props) {
  return (
    <div className="space-x-4 mb-4">
      <button
        onClick={onGenerate}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Gerar
      </button>
      <button
        onClick={onCopy}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        Copiar
      </button>
    </div>
  );
}
