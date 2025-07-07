import Header from "@/components/header/page";

export default function InboxPage() {
  return (
    <main className="bg-black w-full h-screen">
      <Header />

      <section className="mt-[2rem] ml-[2rem]">
        <h1 className="text-white text-[2rem] font-bold">
          Bem-vindo, Arthur!
        </h1>
      </section>

      <section className="flex ml-[7rem] mt-[3rem] gap-[4rem]">
        {/* Área de Recentes */}
        <article
          aria-label="Projetos recentes"
          className="w-[30rem] h-[20rem] bg-[#111111] rounded text-white p-4 font-bold"
        >
          <h2 className="text-[1.6rem]">Recentes:</h2>
        </article>

        {/* Área de Agenda */}
        <article
          aria-label="Agenda de projetos"
          className="w-[30rem] h-[20rem] bg-[#111111] rounded text-white p-4 font-bold"
        >
          <h2 className="text-[1.6rem]">Agenda:</h2>
        </article>
      </section>
    </main>
  );
}
