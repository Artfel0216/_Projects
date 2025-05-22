interface Props {
  onConvert: () => void;
  onClear: () => void;
}

export default function ActionButtons({ onConvert, onClear }: Props) {
  return (
    <div className="flex gap-4 justify-center mb-4">
      <button
        onClick={onConvert}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Converter
      </button>
      <button
        onClick={onClear}
        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
      >
        Limpar
      </button>
    </div>
  );
}
