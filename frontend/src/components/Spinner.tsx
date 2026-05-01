export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`inline-block size-8 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-500 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
