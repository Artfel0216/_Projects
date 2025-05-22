'use client';

import { useEffect, useState } from 'react';
import LightContainer from './LightContainer';
import ToggleButton from './ToggleButton';
import SpeedControl from './SpeedControl';

export default function LightsController() {
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 7);
    }, speed);

    return () => clearInterval(interval);
  }, [isRunning, speed]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🎄 Luzes de Natal 🎄</h1>
      <LightContainer activeIndex={activeIndex} />
      <ToggleButton isRunning={isRunning} onClick={() => setIsRunning((prev) => !prev)} />
      <SpeedControl speed={speed} onChange={setSpeed} />
    </div>
  );
}
