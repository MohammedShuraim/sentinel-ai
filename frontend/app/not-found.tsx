import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
        404
      </p>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        Page not found
      </h1>
      <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
        The page you are looking for does not exist or was moved.
      </p>
      <Link
        href="/"
        className="text-sm font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
      >
        Back to home
      </Link>
    </div>
  );
}
