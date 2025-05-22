'use client';

import { useState } from 'react';
import Header from '@/components/header';
import Toolbar from '@/components/Toolbar';
import Canvas from '@/components/Canvas';
import Footer from '@/components/Footer';

export default function Home() {
  const [tool, setTool] = useState<'pencil' | 'eraser'>('pencil');
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(5);

  const handleClear = () => {
    const canvas = document.querySelector('canvas');
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSave = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'drawing.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <Header />
      <Toolbar
        onClear={handleClear}
        onSave={handleSave}
        onToolChange={setTool}
        onColorChange={setColor}
        onSizeChange={setSize}
      />
      <Canvas tool={tool} color={color} size={size} />
      <Footer />
    </main>
  );
}
