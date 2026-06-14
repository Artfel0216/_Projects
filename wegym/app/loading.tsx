export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <div className="size-10 animate-spin rounded-full border-4 border-zinc-800 border-t-orange-500" />
        <p className="text-sm text-zinc-500">Carregando...</p>
      </div>
    </div>
  );
}
