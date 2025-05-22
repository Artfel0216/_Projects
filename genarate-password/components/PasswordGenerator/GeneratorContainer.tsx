'use client';

import { useState } from 'react';
import PasswordBox from './PasswordBox';
import LengthInput from './LengthInput';
import Options from './Options';
import Actions from './Actions';

export default function GeneratorContainer() {
  const [length, setLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [password, setPassword] = useState('');

  const generatePassword = () => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+{}[]<>?';
    let charset = '';
    if (includeUppercase) charset += upper;
    if (includeLowercase) charset += lower;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;

    if (!charset) {
      setPassword('Selecione ao menos uma opção');
      return;
    }

    let pass = '';
    for (let i = 0; i < length; i++) {
      pass += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setPassword(pass);
  };

  const copyPassword = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      alert('Senha copiada!');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">Gerador de Senhas</h1>
      <PasswordBox password={password} />
      <LengthInput length={length} setLength={setLength} />
      <Options
        includeUppercase={includeUppercase}
        setIncludeUppercase={setIncludeUppercase}
        includeLowercase={includeLowercase}
        setIncludeLowercase={setIncludeLowercase}
        includeNumbers={includeNumbers}
        setIncludeNumbers={setIncludeNumbers}
        includeSymbols={includeSymbols}
        setIncludeSymbols={setIncludeSymbols}
      />
      <Actions onGenerate={generatePassword} onCopy={copyPassword} />
    </div>
  );
}
