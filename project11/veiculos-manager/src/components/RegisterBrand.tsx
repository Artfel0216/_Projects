import React, { useState, useEffect } from "react";
import api from "../services/api";

interface Brand {
  id: number
  name: string
}

function RegisterBrand() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [newBrand, setNewBrand] = useState("");

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await api.get<Brand[]>("/brands");
      setBrands(response.data);
    } catch (error) {
      console.error("Erro ao buscar marcas:", error);
    }
  };

  const registerBrand = async () => {
    const name = newBrand.trim();
    if (!name) return;

    try {
      const response = await api.post<Brand>("/brands", { name });
      setBrands([...brands, response.data]);
      setNewBrand("");
    } catch (error) {
      console.error("Erro ao cadastrar marca:", error);
    }
  };

  const editBrand = async (index: number) => {
    const current = brands[index];
    const newName = prompt("Insira o novo nome da marca:", current.name);

    if (newName && newName.trim() !== "" && newName !== current.name) {
      try {
        const updated = { ...current, name: newName };
        await api.put(`/brands/${current.id}`, updated);
        const updatedBrands = [...brands];
        updatedBrands[index] = updated;
        setBrands(updatedBrands);
      } catch (error) {
        console.error("Erro ao editar marca:", error);
      }
    }
  };

  const deleteBrand = async (index: number) => {
    const confirmDelete = confirm("Deseja excluir esta marca?");
    if (!confirmDelete) return;

    const brandToDelete = brands[index];
    try {
      await api.delete(`/brands/${brandToDelete.id}`);
      setBrands(brands.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Erro ao excluir marca:", error);
    }
  };

  return (
    <div>
      <h1>Gerenciador de Veículos</h1>

      <h2>Cadastrar Marca</h2>
      <input
        type="text"
        value={newBrand}
        onChange={(e) => setNewBrand(e.target.value)}
        placeholder="Insira o Nome da Marca"
      />
      <button onClick={registerBrand}>Cadastrar Marca</button>

      <h3>Marcas Cadastradas</h3>
      <ul>
        {brands.map((brand, index) => (
          <li key={brand.id}>
            {brand.name}{" "}
            <button onClick={() => editBrand(index)}>Editar</button>{" "}
            <button onClick={() => deleteBrand(index)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RegisterBrand;
