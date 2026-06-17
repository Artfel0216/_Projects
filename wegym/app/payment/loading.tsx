export default function PaymentLoading() {
  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="h-8 w-48 animate-pulse rounded bg-zinc-800" />
      <div className="h-48 w-full animate-pulse rounded-xl bg-zinc-800" />
      <div className="h-12 w-full animate-pulse rounded-xl bg-orange-900" />
    </div>
  );
}
