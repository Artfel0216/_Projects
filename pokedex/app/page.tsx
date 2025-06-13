'use client';

import React from "react";
import { Box, Container } from "@mui/material";
import Grid from "@mui/material/Grid";
import Navbar from "../components/Navbar";
import PokemonCard from "../components/PokemonCard";
import { Skeletons } from "../components/Skeletons";

interface Pokemon {
  data: {
    name: string;
    sprites: { front_default: string };
    types: any[];
  };
}

interface HomeContentProps {
  pokemons: Pokemon[];
  pokemonFilter: (filter: string) => void;
  pokemonPickHandler: (pokemonData: Pokemon["data"]) => void;
}

export default function HomeContent({
  pokemons,
  pokemonFilter,
  pokemonPickHandler,
}: HomeContentProps) {
  return (
    <div>
      <Navbar pokemonFilter={pokemonFilter} hideSearch={false} />

      <Container maxWidth={false}>
        <Grid container spacing={3}>
          {pokemons.length === 0 ? (
            <Skeletons />
          ) : (
            pokemons.map((pokemon, key) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={key}>
                <Box
                  onClick={() => pokemonPickHandler(pokemon.data)}
                  sx={{ cursor: "pointer" }}
                >
                  <PokemonCard
                    name={pokemon.data.name}
                    image={pokemon.data.sprites.front_default}
                    types={pokemon.data.types}
                  />
                </Box>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </div>
  );
}
