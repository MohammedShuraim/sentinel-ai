"use client";

import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-6 text-center">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Something went wrong
          </h2>
          <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
            The application hit an unexpected error. You can try again.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
