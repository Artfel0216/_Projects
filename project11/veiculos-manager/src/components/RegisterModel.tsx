import React, { useEffect, useState } from "react";
import api from "../services/api";

type Brand = {
  id: number;
  name: string;
};

type Model = {
  id: number;
  name: string;
  brandId: number;
  brandName?: string;
};

function RegisterModel() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [newModelName, setNewModelName] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState<number>(0);

  useEffect(() => {
    fetchBrands();
    fetchModels();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await api.get<Brand[]>("/brands");
      setBrands(response.data);
    } catch (error) {
      console.error("Erro ao buscar marcas:", error);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await api.get<Model[]>("/models");
      setModels(response.data);
    } catch (error) {
      console.error("Erro ao buscar modelos:", error);
    }
  };

  const registerModel = async () => {
    const name = newModelName.trim();
    if (!name || selectedBrandId === 0) return;

    try {
      const response = await api.post("/models", {
        name,
        brandId: selectedBrandId,
      });
      setModels([...models, response.data]);
      setNewModelName("");
      setSelectedBrandId(0);
    } catch (error) {
      console.error("Erro ao cadastrar modelo:", error);
    }
  };

  const editModel = async (index: number) => {
    const model = models[index];
    const newName = prompt("Insira um novo nome para o modelo:", model.name);
    if (!newName || newName === model.name) return;

    try {
      const response = await api.put(`/models/${model.id}`, {
        name: newName,
        brandId: model.brandId,
      });
      const updated = [...models];
      updated[index] = response.data;
      setModels(updated);
    } catch (error) {
      console.error("Erro ao editar modelo:", error);
    }
  };

  const deleteModel = async (index: number) => {
    const model = models[index];
    if (confirm("Tem certeza que deseja excluir este modelo?")) {
      try {
        await api.delete(`/models/${model.id}`);
        setModels(models.filter((_, i) => i !== index));
      } catch (error) {
        console.error("Erro ao excluir modelo:", error);
      }
    }
  };

  return (
    <div>
      <h1>Gerenciador de Veículos</h1>

      <h2 className="">Cadastrar Modelo</h2>
      <input
        type="text"
        placeholder="Nome do modelo"
        value={newModelName}
        onChange={(e) => setNewModelName(e.target.value)}
      />
      <select
        value={selectedBrandId}
        onChange={(e) => setSelectedBrandId(Number(e.target.value))}
      >
        <option value={0}>Selecione uma marca</option>
        {brands.map((brand) => (
          <option key={brand.id} value={brand.id}>
            {brand.name}
          </option>
        ))}
      </select>
      <button onClick={registerModel}>Cadastrar Modelo</button>

      <h3>Modelos Cadastrados</h3>
      <ul>
        {models.map((model, index) => (
          <li key={model.id}>
            {model.name} ({brands.find(b => b.id === model.brandId)?.name || "Marca desconhecida"}){" "}
            <button onClick={() => editModel(index)}>Editar</button>{" "}
            <button onClick={() => deleteModel(index)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RegisterModel;
