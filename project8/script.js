const passwordEl = document.getElementById('password');
const lengthEl = document.getElementById('length');
const uppercaseEl = document.getElementById('uppercase');
const lowercaseEl = document.getElementById('lowercase');
const numbersEl = document.getElementById('numbers');
const symbolsEl = document.getElementById('symbols');


function getRandomLower() {
  return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
}

function getRandomUpper() {
  return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
}

function getRandomNumber() {
  return String.fromCharCode(Math.floor(Math.random() * 10) + 48);
}

function getRandomSymbol() {
  const symbols = '!@#$%^&*(){}[]=<>/,.';
  return symbols[Math.floor(Math.random() * symbols.length)];
}


const randomFunc = {
  lower: getRandomLower,
  upper: getRandomUpper,
  number: getRandomNumber,
  symbol: getRandomSymbol
};


function GeneratePassword() {
  const length = +lengthEl.value;
  const hasLower = lowercaseEl.checked;
  const hasUpper = uppercaseEl.checked;
  const hasNumber = numbersEl.checked;
  const hasSymbol = symbolsEl.checked;

  const senha = GenaretaPasswordFinally(hasLower, hasUpper, hasNumber, hasSymbol, length);
  passwordEl.innerText = senha || 'Selecione uma opção';
}


function GenaretaPasswordFinally(lower, upper, number, symbol, length) {
  let senhaGerada = '';
  const tiposSelecionados = lower + upper + number + symbol;
  const tiposArr = [{ lower }, { upper }, { number }, { symbol }].filter(tipo => Object.values(tipo)[0]);

  if (tiposSelecionados === 0) return '';

  for (let i = 0; i < length; i += tiposSelecionados) {
    tiposArr.forEach(tipo => {
      const funcName = Object.keys(tipo)[0];
      senhaGerada += randomFunc[funcName]();
    });
  }

  return senhaGerada.slice(0, length);
}

function passwordCopy () {
    const textToCopy = passwordEl.innerText

    if(!textToCopy || textToCopy === '************' || textToCopy === 'Selecione uma opção') {
        alert("Nada para copiar!");
        return
    }

    navigator.clipboard.writeText(textToCopy)
    .then(() => {
        alert('Senha copiada !!!')
    })
    .catch(err => {
        alert('Senha não copiada', err)
    })

}