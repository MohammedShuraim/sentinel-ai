"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { LoadingScreen } from "@/components/common/LoadingScreen";

function OAuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithToken } = useAuth();
  const { push } = useToast();

  useEffect(() => {
    const token = searchParams.get("access_token");
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
  }, [searchParams, loginWithToken, router, push]);

  return <LoadingScreen label="Completing Google sign-in…" />;
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <OAuthCallbackInner />
    </Suspense>
  );
}
