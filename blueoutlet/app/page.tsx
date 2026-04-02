import { Suspense } from "react";
import LoginPage from "./Loginpage/page";
import { Loader2 } from "lucide-react";

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-black selection:bg-purple-500/30 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <Suspense 
        fallback={
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
            <Loader2 className="h-10 w-10 animate-spin text-purple-500" strokeWidth={2} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
              Carregando Ambiente
            </span>
          </div>
        }
      >
        <section className="relative z-10 w-full flex items-center justify-center p-4">
          <LoginPage />
        </section>
      </Suspense>

      <footer className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <p className="text-[10px] font-bold text-white/10 uppercase tracking-[0.3em] whitespace-nowrap">
          Freitas Outlet &copy; {new Date().getFullYear()} • Conexão Segura
        </p>
      </footer>
    </main>
  );
}