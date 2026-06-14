"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-zinc-950 text-zinc-100">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
          <h2 className="text-lg font-semibold">Erro crítico</h2>
          <p className="text-sm text-zinc-500">Ocorreu um erro crítico no aplicativo.</p>
          <button
            onClick={reset}
            className="rounded-lg bg-orange-600 px-6 py-2 text-sm font-medium text-white"
          >
            Recarregar
          </button>
        </div>
      </body>
    </html>
  );
}
