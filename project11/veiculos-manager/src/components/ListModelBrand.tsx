import React, { useState, useEffect } from "react";
import api from "../services/api";

type Brand = {
  id: number;
  name: string;
};

type Model = {
  id: number;
  name: string;
  brand: string;
};

function ListModelBrand() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);

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

  useEffect(() => {
    fetchBrands();
    fetchModels();
  }, []);

  useEffect(() => {
    if (selectedBrand === "") {
      setFilteredModels(models);
    } else {
      setFilteredModels(models.filter((model) => model.brand === selectedBrand));
    }
  }, [selectedBrand, models]);

  return (
    <div>
      <h4>Modelos por Marca</h4>

      <select
        id="FilterBrand"
        value={selectedBrand}
        onChange={(e) => setSelectedBrand(e.target.value)}
      >
        <option value="">Todas as marcas</option>
        {brands.map((brand, index) => (
          <option key={index} value={brand.id}>{brand.name}</option>
        ))}
      </select>

      <ul id="ListModels">
        {filteredModels.map((model) => (
          <li key={model.id}>
            {model.name} ({model.brand})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListModelBrand;
