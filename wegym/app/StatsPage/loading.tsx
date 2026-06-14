export default function StatsLoading() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="h-8 w-40 animate-pulse rounded bg-zinc-800" />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}
