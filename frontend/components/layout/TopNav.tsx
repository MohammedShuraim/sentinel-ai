"use client";

import { useAuth } from "@/components/providers/AuthProvider";

export function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 lg:hidden dark:border-zinc-700 dark:text-zinc-200"
        aria-label="Open sidebar"
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex flex-1 items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {user?.full_name}
          </p>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {user?.email}
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="shrink-0 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
