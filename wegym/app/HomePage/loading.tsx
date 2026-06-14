export default function HomeLoading() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="h-8 w-48 animate-pulse rounded bg-zinc-800" />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-zinc-800" />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-xl bg-zinc-800" />
    </div>
  );
}
