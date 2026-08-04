"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { useToast } from "@/components/providers/ToastProvider";
import { getInvestorProfile } from "@/lib/api/investorProfile";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);
  const { push } = useToast();

  useEffect(() => {
    let cancelled = false;

    async function checkPreferences() {
      try {
        const profile = await getInvestorProfile();
        if (!cancelled) {
          setOnboardingOpen(!profile.has_preferences);
        }
      } catch {
        // Fail closed: do not block the app if profile fetch fails.
        if (!cancelled) {
          setOnboardingOpen(false);
        }
      } finally {
        if (!cancelled) {
          setProfileChecked(true);
        }
      }
    }

    void checkPreferences();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-bg text-fg">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-brand-ink focus:shadow-glow focus:outline-none"
      >
        Skip to content
      </a>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col lg:pl-sidebar">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main id="main-content" className="flex-1 py-6 lg:py-8">
          <div className="container-page animate-fade-up">{children}</div>
        </main>
      </div>

      {profileChecked ? (
        <OnboardingWizard
          open={onboardingOpen}
          onComplete={() => {
            setOnboardingOpen(false);
            router.push("/dashboard");
          }}
          onSuccessToast={(message) => push(message, "success")}
          onErrorToast={(message) => push(message, "error")}
        />
      ) : null}
    </div>
  );
}
