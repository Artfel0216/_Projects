import React from 'react';

interface Props {
  message: string;
}

export default function Warning({ message }: Props) {
  if (!message) return null;

  return (
    <div id="warning" className="text-red-500 mt-2">
      {message}
    </div>
  );
}
