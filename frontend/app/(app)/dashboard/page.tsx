"use client";

import { useAuth } from "@/components/providers/AuthProvider";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Welcome back, {user?.full_name}
      </h1>
      <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
        This is the protected app shell. Feature modules (Dashboard, Stocks,
        Portfolio, Chat, Recommendations) will render here.
      </p>
    </div>
  );
}
