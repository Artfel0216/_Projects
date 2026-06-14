import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 p-4">
      <h2 className="text-lg font-semibold text-zinc-100">Página não encontrada</h2>
      <p className="text-sm text-zinc-500">A página que você procura não existe.</p>
      <Link
        href="/"
        className="rounded-lg bg-orange-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
