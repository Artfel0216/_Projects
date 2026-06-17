export default function PersonalLoading() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="h-8 w-48 animate-pulse rounded bg-zinc-800" />
      <div className="flex gap-2">
        <div className="h-10 flex-1 animate-pulse rounded-lg bg-zinc-800" />
        <div className="h-10 w-20 animate-pulse rounded-lg bg-zinc-800" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}
