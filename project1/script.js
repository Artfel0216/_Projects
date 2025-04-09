const display = document.getElementById('display');
let current = '';
let previous = '';
let operator = null;

function updateDisplay(value) {
  display.innerText = value;
}

function inputDigit(digit) {
  if (current.length >= 8) return;
  if (current === '0') current = '';
  current += digit;
  updateDisplay(current);
}

function inputOp(op) {
  if (current === '' && previous === '') return;
  if (current && previous && operator) {
    calculate();
  }
  operator = op;
  previous = current || previous;
  current = '';
}

function calculate() {
  if (!operator || current === '') return;
  let result;
  const num1 = parseFloat(previous);
  const num2 = parseFloat(current);

  switch (operator) {
    case '+': result = num1 + num2; break;
    case '-': result = num1 - num2; break;
    case '/': result = num2 !== 0 ? num1 / num2 : 'ERR'; break;
  }

  if (result === 'ERR' || result.toString().replace('.', '').length > 8) {
    updateDisplay('ERR');
    resetState();
    return;
  }

  result = +result.toFixed(8);
  updateDisplay(result);
  current = result.toString();
  previous = '';
  operator = null;
}

function clearEntry() {
  if (current) {
    current = '';
    updateDisplay('0');
  } else if (operator) {
    operator = null;
    updateDisplay(previous);
  } else {
    allClear();
  }
}

function allClear() {
  current = '';
  previous = '';
  operator = null;
  updateDisplay('0');
}

function resetState() {
  current = '';
  previous = '';
  operator = null;
}