"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { LoadingScreen } from "@/components/common/LoadingScreen";

function readAccessTokenFromLocation(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const fromHash = new URLSearchParams(hash).get("access_token");
  if (fromHash) {
    return fromHash;
  }

  // Legacy query-string handoff (pre-hash redirect). Prefer hash going forward.
  return new URLSearchParams(window.location.search).get("access_token");
}

function clearTokenFromLocation(): void {
  if (typeof window === "undefined") {
    return;
  }
  const { pathname, search } = window.location;
  const params = new URLSearchParams(search);
  params.delete("access_token");
  const nextSearch = params.toString();
  const nextUrl = nextSearch ? `${pathname}?${nextSearch}` : pathname;
  window.history.replaceState(null, "", nextUrl);
}

function OAuthCallbackInner() {
  const router = useRouter();
  const { loginWithToken } = useAuth();
  const { push } = useToast();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) {
      return;
    }
    started.current = true;

    const token = readAccessTokenFromLocation();
    clearTokenFromLocation();

    if (!token) {
      push("Missing OAuth token in callback", "error");
      router.replace("/login");
      return;
    }

    loginWithToken(token)
      .then(() => {
        push("Signed in with Google", "success");
      })
      .catch(() => {
        push("Could not finish Google sign-in", "error");
        router.replace("/login");
      });
  }, [loginWithToken, router, push]);

  return <LoadingScreen label="Completing Google sign-in…" />;
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <OAuthCallbackInner />
    </Suspense>
  );
}
