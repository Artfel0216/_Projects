'use client';

import { useState } from 'react';
import ParagraphInput from './ParagraphInput';
import Buttons from './Buttons';
import Output from './Output';

export default function Generator() {
  const [paragraphs, setParagraphs] = useState(3);
  const [output, setOutput] = useState<string[]>([]);

  const generateLorem = () => {
    const loremText =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
    const newOutput = Array(paragraphs).fill(loremText);
    setOutput(newOutput);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output.join('\n\n'));
    alert('Texto copiado!');
  };

  return (
    <div className="bg-black p-6 rounded-lg shadow-md w-full max-w-lg mx-auto text-center">
      <h1 className="text-2xl text-white font-bold mb-4">Gerador de Lorem Ipsum</h1>
      <ParagraphInput value={paragraphs} onChange={setParagraphs} />
      <Buttons onGenerate={generateLorem} onCopy={copyToClipboard} />
      <Output paragraphs={output} />
    </div>
  );
}
