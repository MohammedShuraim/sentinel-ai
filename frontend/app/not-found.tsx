import Link from "next/link";
import { CompassIcon } from "@/components/common/icons";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span
        aria-hidden
        className="mb-1 grid h-12 w-12 place-items-center rounded-2xl bg-elevated text-fg-subtle ring-1 ring-line"
      >
        <CompassIcon className="h-6 w-6" />
      </span>
      <p className="font-display text-sm font-medium uppercase tracking-widest text-fg-subtle">
        404
      </p>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-fg">
        Page not found
      </h1>
      <p className="max-w-sm text-sm leading-relaxed text-fg-muted">
        The page you are looking for does not exist or was moved.
      </p>
      <Link
        href="/dashboard"
        className="mt-1 inline-flex h-10 items-center rounded-xl border border-line bg-surface px-5 text-sm font-medium text-fg transition-[border-color,color,box-shadow] duration-200 hover:border-brand/50 hover:text-brand hover:shadow-[0_0_16px_rgb(214_40_40/0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
