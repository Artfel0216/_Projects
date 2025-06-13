import React, { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Home } from "../app/page"
import Profile from "../app/Profile";


type PokemonData = {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    front_female: string;
    front_shiny: string;
    front_shiny_female: string;
  };
  moves: { move: { name: string } }[];
 
};


export const Router = () => {
  const [pokemonData, setPokemonData] = useState<PokemonData | null>(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home setPokemonData={setPokemonData} />} />
        <Route path="/profile" element={<Profile pokemonData={pokemonData ?? undefined} />} />
      </Routes>
    </BrowserRouter>
  );
};
