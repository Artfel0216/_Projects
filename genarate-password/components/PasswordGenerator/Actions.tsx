interface Props {
  onGenerate: () => void;
  onCopy: () => void;
}

export default function Actions({ onGenerate, onCopy }: Props) {
  return (
    <div className="flex gap-4 justify-center">
      <button
        onClick={onGenerate}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Gerar Senha
      </button>
      <button
        onClick={onCopy}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Copiar Senha
      </button>
    </div>
  );
}
