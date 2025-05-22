'use client';

import { useState } from 'react';
import Display from './display';
import Button from './button';

export default function Calculator() {
  const [display, setDisplay] = useState<string>('0');
  const [operator, setOperator] = useState<string | null>(null);
  const [operand, setOperand] = useState<number | null>(null);

  const inputDigit = (digit: string) => {
    if (display.length >= 8) return;
    setDisplay(display === '0' ? digit : display + digit);
  };

  const inputOp = (op: string) => {
    setOperator(op);
    setOperand(parseFloat(display));
    setDisplay('');
  };

  const calculate = () => {
    if (operator && operand !== null) {
      const current = parseFloat(display);
      let result: number | string = 0;

      switch (operator) {
        case '+':
          result = operand + current;
          break;
        case '-':
          result = operand - current;
          break;
        case '/':
          result = current !== 0 ? operand / current : 'Erro';
          break;
        default:
          return;
      }

      setDisplay(result.toString().slice(0, 8));
      setOperator(null);
      setOperand(null);
    }
  };

  const clearEntry = () => setDisplay('0');

  const allClear = () => {
    setDisplay('0');
    setOperator(null);
    setOperand(null);
  };

  return (
    <div className="bg-[#2d2d44] p-5 rounded-[20px] w-[320px] shadow-[0_5px_15px_rgba(0,0,0,0.4)]">
      <Display value={display} />

      <div className="grid grid-cols-4 gap-[10px]">
        {/* Linha 1 */}
        <Button label="C" onClick={clearEntry} variant="clear" />
        <Button label="AC" onClick={allClear} variant="clear" />
        <Button label="/" onClick={() => inputOp('/')} variant="op" />
        <Button label="−" onClick={() => inputOp('-')} variant="op" />

        {/* Linha 2 */}
        {[7, 8, 9].map((n) => (
          <Button key={n} label={n.toString()} onClick={() => inputDigit(n.toString())} variant="digit" />
        ))}
        <Button label="+" onClick={() => inputOp('+')} variant="op" />

        {/* Linha 3 */}
        {[4, 5, 6].map((n) => (
          <Button key={n} label={n.toString()} onClick={() => inputDigit(n.toString())} variant="digit" />
        ))}
        <div></div>

        {/* Linha 4 */}
        {[1, 2, 3].map((n) => (
          <Button key={n} label={n.toString()} onClick={() => inputDigit(n.toString())} variant="digit" />
        ))}
        <div></div>

        {/* Linha 5 */}
        <Button label="0" onClick={() => inputDigit('0')} variant="digit" />
        <Button label="=" onClick={calculate} variant="equal" className="col-span-3" />
      </div>
    </div>
  );
}
