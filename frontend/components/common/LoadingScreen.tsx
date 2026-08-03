export function LoadingScreen({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100"
          aria-hidden
        />
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{label}</p>
      </div>
    </div>
  );
}
