"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  getGoogleLoginUrl,
  loginWithPassword,
} from "@/lib/api/auth";
import { getCurrentUser, registerUser } from "@/lib/api/users";
import { isPublicRoute } from "@/lib/auth/routes";
import { clearToken, getToken, setToken } from "@/lib/auth/token";
import { clearChatSession } from "@/lib/chat/chatStore";
import type { UserRead } from "@/lib/api/types";
import { LoadingScreen } from "@/components/common/LoadingScreen";

interface AuthContextValue {
  user: UserRead | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => void;
  loginWithToken: (accessToken: string) => Promise<void>;
  logout: () => void;
  register: (payload: {
    email: string;
    full_name: string;
    password: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserRead | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const publicRoute = isPublicRoute(pathname ?? "/");

    if (publicRoute) {
      // Auth is not required on public routes; clear state on next microtask.
      queueMicrotask(() => {
        setUser(null);
        setIsLoading(false);
      });
      return;
    }

    const token = getToken();
    if (!token) {
      queueMicrotask(() => {
        setUser(null);
        setIsLoading(false);
      });
      router.replace("/login");
      return;
    }

    let cancelled = false;
    getCurrentUser()
      .then((profile) => {
        if (!cancelled) {
          setUser(profile);
        }
      })
      .catch(() => {
        clearToken();
        if (!cancelled) {
          setUser(null);
          router.replace("/login");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  const login = useCallback(
    async (email: string, password: string) => {
      const token = await loginWithPassword(email, password);
      setToken(token.access_token);
      const profile = await getCurrentUser();
      setUser(profile);
      router.replace("/dashboard");
    },
    [router],
  );

  const loginWithGoogle = useCallback(() => {
    window.location.href = getGoogleLoginUrl();
  }, []);

  const loginWithToken = useCallback(
    async (accessToken: string) => {
      setToken(accessToken);
      const profile = await getCurrentUser();
      setUser(profile);
      router.replace("/dashboard");
    },
    [router],
  );

  const logout = useCallback(() => {
    clearToken();
    clearChatSession();
    setUser(null);
    router.replace("/login");
  }, [router]);

  const register = useCallback(
    async (payload: { email: string; full_name: string; password: string }) => {
      await registerUser(payload);
    },
    [],
  );

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      loginWithGoogle,
      loginWithToken,
      logout,
      register,
    }),
    [user, isLoading, login, loginWithGoogle, loginWithToken, logout, register],
  );

  return (
    <AuthContext.Provider value={value}>
      <AuthGate isLoading={isLoading}>{children}</AuthGate>
    </AuthContext.Provider>
  );
}

function AuthGate({
  children,
  isLoading,
}: {
  children: ReactNode;
  isLoading: boolean;
}) {
  const pathname = usePathname();
  if (isLoading && !isPublicRoute(pathname ?? "/")) {
    return <LoadingScreen label="Checking your session…" />;
  }
  return <>{children}</>;
}

export function getAuthErrorMessage(error: unknown): string {
  return getApiErrorMessage(error);
}
