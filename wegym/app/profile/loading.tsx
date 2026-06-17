export default function ProfileLoading() {
  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="size-24 animate-pulse rounded-full bg-zinc-800" />
      <div className="h-6 w-40 animate-pulse rounded bg-zinc-800" />
      <div className="flex flex-col gap-4 w-full">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}
