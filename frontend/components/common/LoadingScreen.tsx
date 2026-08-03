export function LoadingScreen({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-line border-t-brand"
          aria-hidden
        />
        <p className="text-sm text-fg-muted">{label}</p>
      </div>
    </div>
  );
}
