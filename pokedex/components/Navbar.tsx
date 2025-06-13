'use client';
import * as React from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";

interface NavbarProps {
  pokemonFilter: (value: string) => void;
  hideSearch?: boolean;
}

export default function Navbar({ pokemonFilter, hideSearch }: NavbarProps) {
  const navigate = useNavigate();

  return (
    <div className="w-full mb-8">
      <header className="bg-black">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between px-4 py-3">
          <img
            src="/assets/pokemon-logo.png"
            alt="Pokemon Logo"
            className="h-12 cursor-pointer"
            onClick={() => navigate("/")}
          />

          {!hideSearch && (
            <div className="relative w-full max-w-xs ml-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="text-white" />
              </div>
              <input
                type="text"
                placeholder="Pesquisando..."
                aria-label="search"
                className="w-full pl-10 pr-4 py-2 rounded-md bg-white/20 text-white placeholder-white focus:outline-none focus:bg-white/30 transition-all duration-200"
                onChange={(e) => pokemonFilter(e.target.value)}
              />
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
