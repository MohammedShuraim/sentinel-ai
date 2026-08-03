"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { AlertIcon } from "@/components/common/icons";

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
      <span
        aria-hidden
        className="mb-1 grid h-12 w-12 place-items-center rounded-2xl bg-warn-soft text-warn"
      >
        <AlertIcon className="h-6 w-6" />
      </span>
      <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
        Something went wrong
      </h2>
      <p className="max-w-md text-sm leading-relaxed text-fg-muted">
        An unexpected error occurred while rendering this page.
      </p>
      <Button onClick={reset} className="mt-1">
        Try again
      </Button>
    </div>
  );
}
