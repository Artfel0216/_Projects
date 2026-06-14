"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 p-4">
      <div className="rounded-full bg-red-900/20 p-4">
        <svg className="size-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-zinc-100">Algo deu errado</h2>
      <p className="text-sm text-zinc-500 text-center max-w-sm">
        Ocorreu um erro inesperado. Tente novamente.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-orange-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
      >
        Tentar novamente
      </button>
    </div>
  );
}
