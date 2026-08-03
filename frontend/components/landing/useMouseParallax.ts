"use client";

import { useEffect } from "react";
import {
  useMotionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from "framer-motion";

interface ParallaxOffset {
  x: MotionValue<number>;
  y: MotionValue<number>;
}

/**
 * Subtle pointer parallax. Motion is capped at ±strength px and smoothed
 * with a stiff spring so background layers drift instead of snapping.
 * Reduced-motion users never attach the listener; offsets stay at rest.
 */
export function useMouseParallax(
  strength = 8,
  invert = true,
): ParallaxOffset {
  const reduceMotion = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 60, damping: 24, mass: 0.9 });
  const y = useSpring(my, { stiffness: 60, damping: 24, mass: 0.9 });

  useEffect(() => {
    if (reduceMotion) return undefined;

    let raf = 0;
    const onMove = (event: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const nx = (event.clientX / window.innerWidth - 0.5) * 2;
        const ny = (event.clientY / window.innerHeight - 0.5) * 2;
        const dir = invert ? -1 : 1;
        mx.set(nx * strength * dir);
        my.set(ny * strength * dir);
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduceMotion, invert, strength, mx, my]);

  return { x, y };
}
