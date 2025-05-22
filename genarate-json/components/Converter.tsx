'use client';

import { useState } from 'react';
import TextArea from './TextArea';
import ActionButtons from './ActionButtons';

export default function Converter() {
  const [jsonInput, setJsonInput] = useState('');
  const [csvOutput, setCsvOutput] = useState('');

  const convertToCSV = () => {
    try {
      const json = JSON.parse(jsonInput);
      if (!Array.isArray(json)) throw new Error('JSON deve ser um array de objetos');

      const keys = Object.keys(json[0]);
      const csv = [
        keys.join(','), // Cabeçalho
        ...json.map((obj: any) => keys.map((key) => JSON.stringify(obj[key] ?? '')).join(',')),
      ].join('\n');

      setCsvOutput(csv);
    } catch (error) {
      setCsvOutput('Erro: JSON inválido ou estrutura incorreta.');
    }
  };

  const limparCampos = () => {
    setJsonInput('');
    setCsvOutput('');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4 text-center">JSON2CSV Converter</h1>

      <label htmlFor="jsonInput" className="block font-medium mb-1">JSON de entrada:</label>
      <TextArea
        id="jsonInput"
        placeholder="Cole aqui o JSON"
        value={jsonInput}
        onChange={setJsonInput}
      />

      <ActionButtons onConvert={convertToCSV} onClear={limparCampos} />

      <label htmlFor="csvOutput" className="block font-medium mt-4 mb-1">CSV de saída:</label>
      <TextArea
        id="csvOutput"
        placeholder="O CSV aparecerá aqui"
        value={csvOutput}
        readOnly
      />
    </div>
  );
}
