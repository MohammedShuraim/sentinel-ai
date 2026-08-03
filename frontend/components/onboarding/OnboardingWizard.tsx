"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";
import { updateInvestorProfile } from "@/lib/api/investorProfile";
import { getApiErrorMessage } from "@/lib/api/client";
import { dispatchProfileReady } from "@/lib/onboarding/events";
import { fadeIn, fadeUp, staggerContainer } from "@/lib/motion/presets";
import { cn } from "@/lib/utils/cn";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

const RISK_OPTIONS = ["Conservative", "Moderate", "Aggressive"] as const;
const STYLE_OPTIONS = ["Dividend", "Growth", "Value", "Momentum"] as const;
const SECTOR_OPTIONS = [
  "Technology",
  "Banking",
  "Pharma",
  "FMCG",
  "Energy",
  "Auto",
  "IT Services",
  "Infrastructure",
] as const;
const MARKET_CAP_OPTIONS = [
  "Large Cap",
  "Mid Cap",
  "Small Cap",
  "No Preference",
] as const;

const TOTAL_STEPS = 7;

export interface OnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
  onErrorToast: (message: string) => void;
  onSuccessToast: (message: string) => void;
}

export function OnboardingWizard({
  open,
  onComplete,
  onErrorToast,
  onSuccessToast,
}: OnboardingWizardProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [risk, setRisk] = useState<string | null>(null);
  const [style, setStyle] = useState<string | null>(null);
  const [sectors, setSectors] = useState<string[]>([]);
  const [marketCap, setMarketCap] = useState<string | null>(null);
  const [dividend, setDividend] = useState(false);
  const [saving, setSaving] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const panel = panelRef.current;
    const target =
      panel?.querySelector<HTMLElement>("[data-autofocus]") ??
      panel?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ??
      panel;
    target?.focus();
  }, [open, step]);

  function handleKeyDown(event: React.KeyboardEvent) {
    // Non-dismissible: ignore Escape
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (event.key !== "Tab") {
      return;
    }
    const panel = panelRef.current;
    if (!panel) {
      return;
    }
    const focusables = Array.from(
      panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );
    if (focusables.length === 0) {
      event.preventDefault();
      panel.focus();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function toggleSector(sector: string) {
    setSectors((current) =>
      current.includes(sector)
        ? current.filter((item) => item !== sector)
        : [...current, sector],
    );
  }

  function canContinue(): boolean {
    if (step === 2) return risk !== null;
    if (step === 3) return style !== null;
    if (step === 5) return marketCap !== null;
    return true;
  }

  async function finish() {
    if (saving || !risk || !style || !marketCap) {
      return;
    }
    setStep(7);
    setSaving(true);
    try {
      const payload: {
        risk_tolerance: string;
        investment_style: string;
        preferred_sectors: string[];
        dividend_preference: boolean;
        preferred_market_cap?: string;
      } = {
        risk_tolerance: risk,
        investment_style: style,
        preferred_sectors: sectors,
        dividend_preference: dividend,
      };
      if (marketCap !== "No Preference") {
        payload.preferred_market_cap = marketCap;
      }
      await updateInvestorProfile(payload);
      onSuccessToast("Your AI profile is ready.");
      dispatchProfileReady();
      onComplete();
    } catch (error) {
      setStep(6);
      onErrorToast(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  function goNext() {
    if (step === 6) {
      void finish();
      return;
    }
    if (!canContinue()) {
      return;
    }
    setStep((current) => Math.min(current + 1, TOTAL_STEPS));
  }

  function goBack() {
    if (saving || step <= 1) {
      return;
    }
    setStep((current) => current - 1);
  }

  const progress = Math.min(step, 6) / 6;

  if (!mounted || !open) {
    return null;
  }

  const stepMotion = reduceMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : fadeUp;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
      onKeyDown={handleKeyDown}
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-bg/70 backdrop-blur-md"
        {...(reduceMotion
          ? { initial: false }
          : { initial: { opacity: 0 }, animate: { opacity: 1 } })}
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line/80 bg-surface/90 shadow-[0_24px_80px_rgb(0_0_0/0.45)] outline-none ring-1 ring-ai/20 backdrop-blur-xl"
        {...(reduceMotion
          ? {}
          : {
              initial: { opacity: 0, y: 16, scale: 0.98 },
              animate: { opacity: 1, y: 0, scale: 1 },
              transition: { duration: 0.35 },
            })}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(60%_80%_at_50%_0%,rgb(167_139_250/0.14),transparent_70%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent"
        />

        <div className="relative flex items-center justify-between gap-3 border-b border-line/60 px-5 py-4 sm:px-6">
          <Logo size="sm" />
          <div className="flex min-w-[7rem] flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] text-fg-subtle">
              <span>Setup</span>
              <span className="tnum">
                {Math.min(step, 6)} / 6
              </span>
            </div>
            <div
              className="h-1 overflow-hidden rounded-full bg-elevated"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={6}
              aria-valuenow={Math.min(step, 6)}
              aria-label="Onboarding progress"
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand to-ai"
                initial={false}
                animate={{ width: `${progress * 100}%` }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
                }
              />
            </div>
          </div>
        </div>

        <div className="relative min-h-[22rem] px-5 py-6 sm:px-6 sm:py-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={stepMotion}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="flex h-full flex-col"
            >
              {step === 1 && (
                <WelcomeStep titleId={titleId} />
              )}
              {step === 2 && (
                <ChoiceStep
                  titleId={titleId}
                  title="Risk Tolerance"
                  subtitle="How much market volatility are you comfortable with?"
                  options={RISK_OPTIONS}
                  value={risk}
                  onChange={setRisk}
                />
              )}
              {step === 3 && (
                <ChoiceStep
                  titleId={titleId}
                  title="Investment Style"
                  subtitle="What approach should your AI analyst prioritize?"
                  options={STYLE_OPTIONS}
                  value={style}
                  onChange={setStyle}
                />
              )}
              {step === 4 && (
                <SectorStep
                  titleId={titleId}
                  selected={sectors}
                  onToggle={toggleSector}
                />
              )}
              {step === 5 && (
                <ChoiceStep
                  titleId={titleId}
                  title="Preferred Market Cap"
                  subtitle="Company size preference for recommendations."
                  options={MARKET_CAP_OPTIONS}
                  value={marketCap}
                  onChange={setMarketCap}
                />
              )}
              {step === 6 && (
                <DividendStep
                  titleId={titleId}
                  value={dividend}
                  onChange={setDividend}
                />
              )}
              {step === 7 && <SavingStep titleId={titleId} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {step < 7 && (
          <div className="relative flex items-center justify-between gap-3 border-t border-line/60 px-5 py-4 sm:px-6">
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              disabled={step === 1 || saving}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="primary"
              data-autofocus={step === 1 ? true : undefined}
              onClick={goNext}
              disabled={!canContinue() || saving}
              loading={saving && step === 6}
            >
              {step === 1 ? "Get Started" : step === 6 ? "Finish" : "Continue"}
            </Button>
          </div>
        )}
      </motion.div>
    </div>,
    document.body,
  );
}

function WelcomeStep({ titleId }: { titleId: string }) {
  return (
    <motion.div
      className="flex flex-1 flex-col items-center justify-center gap-4 text-center"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <motion.span
        variants={fadeIn}
        aria-hidden
        className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-ai-strong to-ai text-ai-ink shadow-[0_0_28px_rgb(139_92_246/0.35)] ring-1 ring-ai/40"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
          <path d="M12 2l1.6 5.2L19 9l-5.4 1.8L12 16l-1.6-5.2L5 9l5.4-1.8L12 2z" />
        </svg>
      </motion.span>
      <motion.h2
        id={titleId}
        variants={fadeUp}
        className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl"
      >
        Welcome to Sentellent AI
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="max-w-sm text-sm leading-relaxed text-fg-muted"
      >
        Let&apos;s personalize your AI investment experience.
      </motion.p>
    </motion.div>
  );
}

function ChoiceStep({
  titleId,
  title,
  subtitle,
  options,
  value,
  onChange,
}: {
  titleId: string;
  title: string;
  subtitle: string;
  options: readonly string[];
  value: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2
          id={titleId}
          className="font-display text-xl font-semibold tracking-tight text-fg"
        >
          {title}
        </h2>
        <p className="mt-1.5 text-sm text-fg-muted">{subtitle}</p>
      </div>
      <div
        className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
        role="radiogroup"
        aria-labelledby={titleId}
      >
        {options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option)}
              className={cn(
                "rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-[border-color,background-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 active:scale-[0.99]",
                selected
                  ? "border-brand/50 bg-brand/10 text-fg shadow-[0_0_20px_rgb(52_211_153/0.12)]"
                  : "border-line bg-elevated/60 text-fg-muted hover:border-line-strong hover:text-fg",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SectorStep({
  titleId,
  selected,
  onToggle,
}: {
  titleId: string;
  selected: string[];
  onToggle: (sector: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2
          id={titleId}
          className="font-display text-xl font-semibold tracking-tight text-fg"
        >
          Preferred Sectors
        </h2>
        <p className="mt-1.5 text-sm text-fg-muted">
          Select one or more sectors you care about. Optional — you can skip.
        </p>
      </div>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-labelledby={titleId}
      >
        {SECTOR_OPTIONS.map((sector) => {
          const active = selected.includes(sector);
          return (
            <button
              key={sector}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(sector)}
              className={cn(
                "rounded-full border px-3.5 py-2 text-xs font-medium transition-[border-color,background-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ai/40",
                active
                  ? "border-ai/50 bg-ai-soft text-ai shadow-[0_0_16px_rgb(139_92_246/0.18)]"
                  : "border-line bg-elevated/50 text-fg-muted hover:border-line-strong hover:text-fg",
              )}
            >
              {sector}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DividendStep({
  titleId,
  value,
  onChange,
}: {
  titleId: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2
          id={titleId}
          className="font-display text-xl font-semibold tracking-tight text-fg"
        >
          Dividend Preference
        </h2>
        <p className="mt-1.5 text-sm text-fg-muted">
          Tell us if income-oriented companies should be prioritized.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-labelledby={titleId}
        onClick={() => onChange(!value)}
        className={cn(
          "flex items-center justify-between gap-4 rounded-xl border px-4 py-4 text-left transition-[border-color,background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
          value
            ? "border-brand/40 bg-brand/10"
            : "border-line bg-elevated/60",
        )}
      >
        <span className="text-sm font-medium text-fg">
          I prefer dividend-paying companies.
        </span>
        <span
          aria-hidden
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
            value ? "bg-brand" : "bg-line-strong",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
              value ? "translate-x-5" : "translate-x-0.5",
            )}
          />
        </span>
      </button>
    </div>
  );
}

function SavingStep({ titleId }: { titleId: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <span
        aria-hidden
        className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-ai"
      />
      <h2
        id={titleId}
        className="font-display text-xl font-semibold tracking-tight text-fg"
      >
        Building your AI investment profile…
      </h2>
      <p className="text-sm text-fg-muted" aria-live="polite">
        Personalizing recommendations for you.
      </p>
    </div>
  );
}
