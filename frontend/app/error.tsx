"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface unexpected errors in dev; replace with telemetry in prod.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        Something went wrong
      </h2>
      <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
        An unexpected error occurred while rendering this page.
      </p>
      <Button onClick={reset} className="w-auto px-6">
        Try again
      </Button>
    </div>
  );
}
