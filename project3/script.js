document.addEventListener("DOMContentLoaded", () => {
    const dataInput = document.getElementById("dataInput");
    const startButton = document.getElementById("startButton");
    const resetButton = document.getElementById("resetButton");
    const contador = document.getElementById("contador");
    const warning = document.getElementById("warning");

    let intervalo;

    function calcularTempoRestante(dataFinal) {
        const eventoTime = new Date(dataFinal).getTime();
        const agora = new Date().getTime();
        const diferenca = eventoTime - agora;

        if (diferenca <= 0) {
            clearInterval(intervalo);
            contador.textContent = "00D 00H 00M 00S";
            alert('O tempo expirou')
            return;
        }

        const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

        contador.textContent = `${dias}D ${horas}H ${minutos}M ${segundos}S`;
    }

    function iniciarContador() {
        if (!dataInput.value) {
            alert('Insira uma data válida')
            return;
        }
        
        warning.textContent = "";
        clearInterval(intervalo);

        intervalo = setInterval(() => {
            calcularTempoRestante(dataInput.value);
        }, 1000);
    }

    function resetarContador() {
        clearInterval(intervalo);
        contador.textContent = "00D 00H 00M 00S";
        warning.textContent = "";
        dataInput.value = "";
    }

    startButton.addEventListener("click", iniciarContador);
    resetButton.addEventListener("click", resetarContador);
});
