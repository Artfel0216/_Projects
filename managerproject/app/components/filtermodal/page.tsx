// components/FilterModal.tsx
'use client';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilter: (date: string) => void;
  onClear: () => void;
}

export default function FilterModal({ isOpen, onClose, onFilter, onClear }: FilterModalProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilter(e.target.value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white text-black p-6 rounded shadow-lg w-[90%] max-w-md">
        <h2 className="text-xl font-bold mb-4">Filtrar Projetos por Data</h2>

        <input
          type="date"
          onChange={handleDateChange}
          className="w-full border p-2 mb-4 rounded font-bold"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              onClear();
              onClose();
            }}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Limpar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
