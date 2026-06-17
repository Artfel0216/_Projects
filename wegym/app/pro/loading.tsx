export default function ProLoading() {
  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="h-8 w-48 animate-pulse rounded bg-zinc-800" />
      <div className="size-32 animate-pulse rounded-full bg-zinc-800" />
      <div className="h-10 w-full animate-pulse rounded-xl bg-orange-900" />
    </div>
  );
}
