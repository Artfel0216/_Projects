function Calcular(operation) {
    let n1 = parseFloat(document.getElementById("number1").value);
    let n2 = parseFloat(document.getElementById("number2").value);
    let resultado;

    if (isNaN(n1) || isNaN(n2)) {

        console('Insira 2 números');
    } else {

        switch (operation) {
            case '+': {
                resultado = n1 + n2
            };
                break;
            case '-': {
                resultado = n1 - n2
            }; 
                break;
            case '*': {
                resultado = n1 * n2
            }; 
                break;
            case '/': {
                resultado = n1 / n2
            };
                break;

            default: resultado = console.log('Operação inválida');
        }
    }
    
    document.getElementById("Result").textContent = "Resultado: " + resultado;
}

function Limpar() {
    document.getElementById("number1").value = "";
    document.getElementById("number2").value = "";
    document.getElementById("Result").textContent = "Resultado: 0";
};
