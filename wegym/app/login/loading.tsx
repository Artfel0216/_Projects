export default function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <div className="size-16 animate-pulse rounded-full bg-zinc-800" />
        <div className="h-6 w-32 animate-pulse rounded bg-zinc-800" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-800" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-800" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-orange-900" />
      </div>
    </div>
  );
}
