"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

/* ------------------------------------------------------------------ */
/* Deterministic market series                                         */
/* ------------------------------------------------------------------ */

const VIEW_W = 1200;
const VIEW_H = 400;
const PAD_Y = 56;
const POINT_COUNT = 46;
const TICK_MS = 1500;

const PRICE_MIN = 20;
const PRICE_MAX = 180;

interface MarketState {
  price: number;
  momentum: number;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Mean-reverting momentum + gentle upward drift produces trends that
 * correct themselves naturally instead of chaotic random noise.
 */
function stepPrice(state: MarketState, rand: () => number): MarketState {
  const shock = (rand() - 0.5) * 3.2;
  const momentum = state.momentum * 0.74 + shock;
  const reversion = (100 - state.price) * 0.018;
  const drift = 0.42;
  const price = Math.min(
    PRICE_MAX,
    Math.max(PRICE_MIN, state.price + momentum + reversion + drift),
  );
  return { price, momentum };
}

function generateSeries(count: number, seed: number): number[] {
  const rand = mulberry32(seed);
  let state: MarketState = { price: 78, momentum: 0.8 };
  const values: number[] = [];
  for (let i = 0; i < count; i += 1) {
    values.push(state.price);
    state = stepPrice(state, rand);
  }
  return values;
}

const xFor = (index: number): number => (index / (POINT_COUNT - 1)) * VIEW_W;

const yFor = (value: number): number =>
  VIEW_H -
  PAD_Y -
  ((value - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * (VIEW_H - PAD_Y * 2);

/** Catmull-Rom spline → cubic bézier path for TradingView-smooth curves. */
function linePath(values: number[]): string {
  const pts = values.map((v, i) => [xFor(i), yFor(v)] as const);
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

function areaPath(values: number[]): string {
  return `${linePath(values)} L ${VIEW_W} ${VIEW_H} L 0 ${VIEW_H} Z`;
}

/** Faint moving-average "trend" line, like analysts overlay on charts. */
function movingAverage(values: number[], window = 6): number[] {
  return values.map((_, i) => {
    const from = Math.max(0, i - window + 1);
    const slice = values.slice(from, i + 1);
    return slice.reduce((sum, v) => sum + v, 0) / slice.length;
  });
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const drawTransition = {
  d: { duration: TICK_MS / 1000, ease: "easeInOut" as const },
  pathLength: { duration: 2.4, ease: "easeInOut" as const },
};

export function MarketChart({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  const initialValues = useMemo(() => generateSeries(POINT_COUNT, 20260803), []);
  const [values, setValues] = useState(initialValues);

  const marketRef = useRef<MarketState>({
    price: initialValues[initialValues.length - 1],
    momentum: 0.6,
  });
  const randRef = useRef<() => number>(() => 0.5);

  useEffect(() => {
    // Seed the live walk client-side only; SSR stays deterministic.
    randRef.current = mulberry32(0x9e3779b9);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setValues((prev) => {
        const next = stepPrice(marketRef.current, randRef.current);
        marketRef.current = next;
        return [...prev.slice(1), next.price];
      });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const line = useMemo(() => linePath(values), [values]);
  const area = useMemo(() => areaPath(values), [values]);
  const average = useMemo(() => linePath(movingAverage(values)), [values]);

  const drawInitial = reduceMotion ? false : { pathLength: 0 };

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none select-none [mask-image:linear-gradient(90deg,transparent,black_14%,black_86%,transparent)]",
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-full w-full"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        role="presentation"
      >
        <defs>
          <linearGradient id="market-area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D62828" stopOpacity="0.28" />
            <stop offset="55%" stopColor="#D62828" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#D62828" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* soft glow underlay: CSS-blurred copy, composited on GPU */}
        <motion.path
          d={line}
          animate={{ d: line }}
          transition={drawTransition}
          stroke="#D62828"
          strokeWidth={7}
          strokeLinecap="round"
          className="opacity-25 blur-[6px]"
        />

        {/* gradient area under the curve */}
        <motion.path
          d={area}
          animate={{ d: area }}
          transition={drawTransition}
          fill="url(#market-area-fill)"
        />

        {/* faint moving-average trend (tablet/desktop only) */}
        <motion.path
          d={average}
          stroke="#A7A7A7"
          strokeWidth={1.25}
          strokeDasharray="2 7"
          strokeLinecap="round"
          className="hidden opacity-40 sm:block"
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1, d: average }}
          transition={{ ...drawTransition, pathLength: { ...drawTransition.pathLength, delay: 0.35 } }}
        />

        {/* main price line */}
        <motion.path
          d={line}
          stroke="#E63946"
          strokeWidth={2}
          strokeLinecap="round"
          className="drop-shadow-[0_0_10px_rgb(214_40_40/0.45)]"
          initial={drawInitial}
          animate={{ pathLength: 1, d: line }}
          transition={drawTransition}
        />
      </svg>
    </div>
  );
}
