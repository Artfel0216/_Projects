function convertToCSV() {
    const input = document.getElementById("jsonInput").value.trim();
    const output = document.getElementById("csvOutput");

    if (!input) {
      alert("Por favor, insira o JSON.");
      return;
    }

    let jsonData;
    try {
      jsonData = JSON.parse(input);
    } catch (error) {
      alert("JSON inválido.");
      return;
    }

    if (!Array.isArray(jsonData)) {
      alert("O JSON deve ser um array de objetos.");
      return;
    }

    if (jsonData.length === 0) {
      alert("O array JSON está vazio.");
      return;
    }

    const header = Object.keys(jsonData[0]).join(",");
    const rows = jsonData.map(obj => Object.values(obj).join(","));
    const csv = [header, ...rows].join("\n");

    output.value = csv;
  }

  function limparCampos() {
    document.getElementById("jsonInput").value = "";
    document.getElementById("csvOutput").value = "";
  }