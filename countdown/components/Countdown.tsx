'use client';

import { useEffect, useState } from 'react';
import TimeDisplay from './timedisplay';
import Warning from './warning';
import Buttons from './button';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Countdown() {
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [warning, setWarning] = useState('');
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const calculateTimeLeft = (end: Date) => {
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const totalSeconds = Math.floor(diff / 1000);

    return {
      days: Math.floor(totalSeconds / (3600 * 24)),
      hours: Math.floor((totalSeconds % (3600 * 24)) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    };
  };

  const handleStart = () => {
    const input = document.getElementById('dataInput') as HTMLInputElement;
    const dateValue = input?.value;

    if (!dateValue) {
      setWarning('Insira uma data válida!');
      return;
    }

    const selectedDate = new Date(dateValue);
    if (selectedDate <= new Date()) {
      setWarning('A data deve ser futura!');
      return;
    }

    setTargetDate(selectedDate);
    setWarning('');

    const id = setInterval(() => {
      const updated = calculateTimeLeft(selectedDate);
      setTimeLeft(updated);

      if (
        updated.days === 0 &&
        updated.hours === 0 &&
        updated.minutes === 0 &&
        updated.seconds === 0
      ) {
        clearInterval(id);
      }
    }, 1000);

    setIntervalId(id);
  };

  const handleReset = () => {
    if (intervalId) clearInterval(intervalId);
    setTargetDate(null);
    setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    setWarning('');
    const input = document.getElementById('dataInput') as HTMLInputElement;
    if (input) input.value = '';
  };

  return (
    <div className="container flex flex-col items-center justify-center text-center text-white">
      <h1 className="text-3xl font-bold mb-4">Contador Regressivo</h1>

      <input
        id="dataInput"
        type="datetime-local"
        className="text-black p-2 rounded"
      />

      <Buttons onStart={handleStart} onReset={handleReset} />

      <Warning message={warning} />

      <TimeDisplay time={timeLeft} />
    </div>
  );
}
