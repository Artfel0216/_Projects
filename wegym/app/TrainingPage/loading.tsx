export default function TrainingLoading() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="h-8 w-56 animate-pulse rounded bg-zinc-800" />
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}
