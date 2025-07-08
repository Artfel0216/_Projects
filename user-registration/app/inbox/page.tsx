'use client';

import Header from "@/components/header/page";

export default function InboxPage() {
  return (
    <main className="bg-black w-full min-h-screen">
      <Header />

      {/* Saudação */}
      <section className="mt-8 ml-8">
        <h1 className="text-white text-2xl font-bold">Bem-vindo, Arthur!</h1>
      </section>

      {/* Seções principais */}
      <section className="flex flex-wrap ml-28 mt-12 gap-16">
        {/* Projetos Recentes */}
        <article
          aria-label="Projetos recentes"
          className="w-[30rem] h-[20rem] bg-[#111111] rounded text-white p-4 font-bold overflow-auto"
        >
          <h2 className="text-[1.6rem]">Recentes:</h2>
          <ol className="mt-4 ml-6 list-decimal text-base font-normal space-y-3">
            <li>
              <a
                href="#"
                className="text-white font-bold text-base hover:underline transition-colors"
              >
                Dashboard Administrativo
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-white font-bold text-base hover:underline transition-colors"
              >
                Site da Agência Criativa
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-white font-bold text-base hover:underline transition-colors"
              >
                Aplicativo de Tarefas Pessoais
              </a>
            </li>
          </ol>
        </article>

        {/* Agenda de Projetos */}
        <article
          aria-label="Agenda de projetos"
          className="w-[30rem] h-[20rem] bg-[#111111] rounded text-white p-4 font-bold overflow-auto"
        >
          <h2 className="text-[1.6rem]">Agenda:</h2>
          <ol className="mt-4 ml-6 list-decimal text-base font-normal space-y-3">
            <li>Reunião com cliente - 08/07 às 10h</li>
            <li>Revisar funcionalidades do painel</li>
            <li>Deploy no ambiente de staging</li>
          </ol>
        </article>
      </section>
    </main>
  );
}
