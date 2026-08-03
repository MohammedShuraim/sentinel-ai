"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AlertIcon } from "@/components/common/icons";

interface ErrorStateProps {
  title: string;
  description: string;
  onRetry: () => void;
}

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  return (
    <Card className="flex flex-col items-center gap-3 py-12 text-center">
      <span
        aria-hidden
        className="mb-1 grid h-10 w-10 place-items-center rounded-xl bg-warn-soft text-warn"
      >
        <AlertIcon className="h-5 w-5" />
      </span>
      <p className="text-sm font-medium text-fg">{title}</p>
      <p className="max-w-sm text-sm text-fg-muted">{description}</p>
      <Button variant="secondary" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </Card>
  );
}
