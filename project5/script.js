document.addEventListener("DOMContentLoaded", () => {
    const loremIpsumText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum euismod, nisl eget consectetur sagittis, nisl nunc aliquet nunc, et scelerisque nisl nunc eget nunc.";

    const numParagraphsInput = document.getElementById("numParagraphs");
    const generateButton = document.getElementById("generateButton");
    const copyButton = document.getElementById("copyButton");
    const outputDiv = document.getElementById("output");

    function generateLoremIpsum() {
        const numParagraphs = parseInt(numParagraphsInput.value);
        outputDiv.innerHTML = "";

        for (let i = 0; i < numParagraphs; i++) {
            const p = document.createElement("p");
            p.textContent = loremIpsumText;
            outputDiv.appendChild(p);
        }
    }

    function copyToClipboard() {
        const textToCopy = outputDiv.innerText;

        if (textToCopy.trim() === "") {
            alert("Nada para copiar!");
            return;
        }

        navigator.clipboard.writeText(textToCopy)
            .then(() => alert("Texto copiado !!!"))
            .catch(err => alert("Erro ao copiar: " + err));
    }

    generateButton.addEventListener("click", generateLoremIpsum);
    copyButton.addEventListener("click", copyToClipboard);
});
