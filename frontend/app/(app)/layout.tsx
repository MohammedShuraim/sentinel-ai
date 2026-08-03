"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { AppShell } from "@/components/layout/AppShell";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingScreen label="Loading workspace…" />;
  }

  if (!isAuthenticated || !user) {
    return <LoadingScreen label="Redirecting to sign in…" />;
  }

  return <AppShell>{children}</AppShell>;
}
