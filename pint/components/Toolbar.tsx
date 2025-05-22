'use client';

import { useRef } from 'react';

type ToolbarProps = {
  onClear: () => void;
  onSave: () => void;
  onToolChange: (tool: 'pencil' | 'eraser') => void;
  onColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
};

const Toolbar = ({ onClear, onSave, onToolChange, onColorChange, onSizeChange }: ToolbarProps) => {
  const colorRef = useRef<HTMLInputElement>(null);
  const sizeRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap justify-center items-center gap-3 p-4 bg-gray-100 shadow-md">
      <button onClick={() => onToolChange('pencil')} className="btn">✏️ Lápis</button>
      <button onClick={() => onToolChange('eraser')} className="btn">🧽 Borracha</button>
      <button onClick={onClear} className="btn">
        <img src="/img/trash.png" alt="Limpar" className="w-5 h-5" />
      </button>
      <button onClick={onSave} className="btn">Save</button>
      <input type="color" defaultValue="#000000" ref={colorRef} onChange={(e) => onColorChange(e.target.value)} />
      <input type="range" min={1} max={30} defaultValue={5} ref={sizeRef} onChange={(e) => onSizeChange(Number(e.target.value))} />
    </div>
  );
};

export default Toolbar;
