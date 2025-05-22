'use client';

import { useState } from 'react';

interface Props {
  onSearch: (city: string) => void;
}

export default function SearchBox({ onSearch }: Props) {
  const [input, setInput] = useState('');

  const handleSearch = () => {
    if (input.trim()) {
      onSearch(input.trim());
      setInput('');
    }
  };

  return (
    <div className="search-box mb-4">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Digite a cidade..."
        className="w-full border border-gray-300 rounded px-4 py-2"
      />
      <button
        onClick={handleSearch}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Buscar
      </button>
    </div>
  );
}
