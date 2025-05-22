import React from 'react';

interface Props {
  time: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export default function TimeDisplay({ time }: Props) {
  const { days, hours, minutes, seconds } = time;

  const format = (n: number) => n.toString().padStart(2, '0');

  return (
    <div id="contador" className="text-2xl text-white mt-4">
      {format(days)}D {format(hours)}H {format(minutes)}M {format(seconds)}S
    </div>
  );
}
