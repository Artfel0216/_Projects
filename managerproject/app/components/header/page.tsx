import { Calendar, LayoutDashboard, Plus } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full h-[4rem] bg-black flex items-center justify-center px-4">
      <div className="flex items-center justify-center gap-8 mx-auto">
        <label htmlFor="projectName" className="sr-only">
          Nome do Projeto
        </label>
        <input
          id="projectName"
          type="text"
          placeholder="Informe o Nome do Projeto"
          className="w-[20rem] h-[3rem] border-white border-[1px] rounded p-4 text-white font-bold bg-black placeholder-white"
        />

        <button
          type="button"
          className="w-[13rem] h-[3rem] bg-white text-black gap-2 flex items-center justify-center rounded font-bold cursor-pointer"
        >
          <Plus />
          Criar Novo Projeto
        </button>

        <button
          type="button"
          className="w-[6rem] h-[3rem] bg-white text-black gap-2 flex items-center justify-center rounded font-bold cursor-pointer"
          aria-label="Acessar dashboard"
        >
          <LayoutDashboard />
        </button>
        <button className="w-[6rem] h-[3rem] bg-white text-black flex items-center justify-center rounded font-bold cursor-pointer">
            <Calendar />
        </button>
      </div>
    </header>
  );
}
