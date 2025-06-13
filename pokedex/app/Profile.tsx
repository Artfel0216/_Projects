
"use client"; 

import { useEffect } from "react";
import { useRouter } from "next/router"; 
import { Chip, Container, Divider, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import Navbar from "../components/Navbar";
import PokemonTable from "../components/PokemonTable";

interface ProfileProps {
  pokemonData?: {
    name: string;
    sprites: {
      front_default: string;
      front_female: string;
      front_shiny: string;
      front_shiny_female: string;
    };
    moves: { move: { name: string } }[];
  };
}

const Profile = ({ pokemonData }: ProfileProps) => {
  const router = useRouter();

  useEffect(() => {
    if (!pokemonData) {
      router.push("/");
    }
  }, [pokemonData]);

  if (!pokemonData) return null;

  const { name, sprites, moves } = pokemonData;

  return (
    <>
      <Navbar hideSearch pokemonFilter={null} />
      <Container maxWidth="md">
        <Paper elevation={3}>
          <Box display="flex" flexDirection="column" alignItems="center" p={5}>
            <Typography variant="h4">{name}</Typography>

            <Box
              display="flex"
              alignItems="center"
              width="100%"
              marginBottom="15px"
              sx={{
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              <Box
                component="img"
                src={sprites.front_default}
                width="50%"
                height="100%"
              />
              <PokemonTable pokemonData={pokemonData} />
            </Box>

            <Box width="100%">
              <Divider>Variações</Divider>
              <Box display="flex" justifyContent="space-between">
                <Box component="img" src={sprites.front_female} width="25%" height="25%" />
                <Box component="img" src={sprites.front_shiny} width="25%" height="25%" />
                <Box component="img" src={sprites.front_shiny_female} width="25%" height="25%" />
              </Box>

              <Divider>Ataques</Divider>
              <Box textAlign="center" marginTop="15px">
                {moves.map((moveData, key) => (
                  <Chip key={key} sx={{ m: "5px" }} label={moveData.move.name} />
                ))}
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default Profile;
