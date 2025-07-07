import { ClockPlus, Home, LayoutDashboard, Plus } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full h-[4rem] bg-[#162D3A] flex items-center justify-center px-6 gap-4">
      <form role="search" className="flex items-center gap-4">
        <input
          type="search"
          placeholder="Pesquisar Projeto..."
          className="w-[20rem] h-[2rem] cursor-pointer font-bold border-white text-white border-[1px] rounded px-6 bg-transparent"
        />

        <button
          type="button"
          className="flex items-center justify-center bg-white text-black font-bold rounded px-4 h-[2rem] cursor-pointer gap-2"
        >
          <Plus />
          <span>Novo Projeto</span>
        </button>
      </form>

      <nav className="flex items-center gap-4 ml-8">
        <button
          type="button"
          className="flex items-center justify-center bg-white text-black w-[3rem] h-[2rem] rounded cursor-pointer"
          aria-label="Dashboard"
        >
          <LayoutDashboard />
        </button>

        <button
          type="button"
          className="flex items-center justify-center bg-white text-black w-[3rem] h-[2rem] rounded cursor-pointer"
          aria-label="Criar Registro"
        >
          <ClockPlus />
        </button>

        <button
          type="button"
          className="flex items-center justify-center bg-white text-black w-[3rem] h-[2rem] rounded cursor-pointer"
          aria-label="Página Inicial"
        >
          <Home />
        </button>
      </nav>
    </header>
  );
}
