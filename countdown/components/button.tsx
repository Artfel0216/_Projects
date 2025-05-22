import React from 'react';

interface Props {
  onStart: () => void;
  onReset: () => void;
}

export default function Buttons({ onStart, onReset }: Props) {
  return (
    <div className="flex gap-4 mt-4">
      <button id="startButton" onClick={onStart} className="bg-blue-600 text-white px-4 py-2 rounded">
        Iniciar
      </button>
      <button id="resetButton" onClick={onReset} className="bg-gray-600 text-white px-4 py-2 rounded">
        Resetar
      </button>
    </div>
  );
}
