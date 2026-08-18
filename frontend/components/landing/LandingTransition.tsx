"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/brand/Logo";

/* ------------------------------------------------------------------ */
/* Timing                                                              */
/* ------------------------------------------------------------------ */

const EXIT_MS = 280;
const EXIT_MS_REDUCED = 120;
const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

interface LandingTransitionValue {
  exiting: boolean;
  startExit: (href: string) => void;
}

const LandingTransitionContext =
  createContext<LandingTransitionValue | null>(null);

function useLandingTransition(): LandingTransitionValue {
  const ctx = useContext(LandingTransitionContext);
  if (!ctx) {
    throw new Error(
      "useLandingTransition must be used within LandingTransitionProvider",
    );
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Provider + transition veil                                          */
/* ------------------------------------------------------------------ */

export function LandingTransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [exiting, setExiting] = useState(false);
  const exitingRef = useRef(false);
  const timerRef = useRef<number | undefined>(undefined);

  const startExit = useCallback(
    (href: string) => {
      if (exitingRef.current) return;
      exitingRef.current = true;
      setExiting(true);
      router.prefetch(href);
      timerRef.current = window.setTimeout(
        () => router.push(href),
        reduceMotion ? EXIT_MS_REDUCED : EXIT_MS,
      );
    },
    [router, reduceMotion],
  );

  useEffect(() => {
    router.prefetch("/login");
    return () => window.clearTimeout(timerRef.current);
  }, [router]);

  const value = useMemo(() => ({ exiting, startExit }), [exiting, startExit]);

  return (
    <LandingTransitionContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {exiting ? (
          <motion.div
            key="transition-veil"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.35, ease: EASE }}
            className="fixed inset-0 z-50 grid place-items-center bg-bg/30 backdrop-blur-[6px]"
          >
            {/* soft AI pulse: glowing logo, never a blank page */}
            <motion.div
              animate={
                reduceMotion
                  ? undefined
                  : { scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }
              }
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Logo size="lg" withWordmark={false} />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </LandingTransitionContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Exit choreography                                                   */
/* ------------------------------------------------------------------ */

export type ExitLayer = "ambient" | "chart" | "nav" | "hero" | "footer";

const layerExit: Record<ExitLayer, { y?: number; duration: number }> = {
  ambient: { duration: 0.65 },
  chart: { duration: 0.4 },
  nav: { y: -10, duration: 0.4 },
  hero: { y: -24, duration: 0.5 },
  footer: { duration: 0.3 },
};

function buildVariants(layer: ExitLayer, reduced: boolean): Variants {
  const spec = layerExit[layer];
  if (reduced) {
    return {
      idle: { opacity: 1 },
      exit: { opacity: 0, transition: { duration: 0.18, ease: EASE } },
    };
  }
  return {
    idle: { opacity: 1, y: 0 },
    exit: {
      opacity: 0,
      y: spec.y ?? 0,
      transition: { duration: spec.duration, ease: EASE },
    },
  };
}

export function ExitScope({
  layer,
  className,
  children,
}: {
  layer: ExitLayer;
  className?: string;
  children: ReactNode;
}) {
  const { exiting } = useLandingTransition();
  const reduceMotion = useReducedMotion();
  const variants = useMemo(
    () => buildVariants(layer, Boolean(reduceMotion)),
    [layer, reduceMotion],
  );

  return (
    <motion.div
      className={className}
      initial="idle"
      animate={exiting ? "exit" : "idle"}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Cinematic CTA link                                                  */
/* ------------------------------------------------------------------ */

export function CinematicLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const { startExit } = useLandingTransition();
  const reduceMotion = useReducedMotion();

  return (
    <Link
      href={href}
      onClick={(event) => {
        // Let modified clicks (new tab, etc.) behave normally.
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }
        event.preventDefault();
        startExit(href);
      }}
      className={cn("group relative inline-block", className)}
    >
      <motion.span
        className="inline-block"
        whileHover={reduceMotion ? undefined : { scale: 1.02 }}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        {children}
      </motion.span>
      {reduceMotion ? null : (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
        >
          <span className="absolute inset-y-0 left-0 w-1/2 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[250%]" />
        </span>
      )}
    </Link>
  );
}
