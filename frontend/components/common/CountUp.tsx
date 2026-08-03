"use client";

import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { EASE_OUT } from "@/lib/motion/presets";

interface CountUpProps {
  value: number;
  format: (value: number) => string;
  duration?: number;
  className?: string;
}

/** Animates a real numeric value from 0 using the provided formatter. */
export function CountUp({
  value,
  format,
  duration = 1.1,
  className,
}: CountUpProps) {
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const text = useTransform(motionValue, (v) => format(v));

  useEffect(() => {
    if (reduceMotion) {
      motionValue.set(value);
      return undefined;
    }
    const controls = animate(motionValue, value, {
      duration,
      ease: EASE_OUT,
    });
    return () => controls.stop();
  }, [value, reduceMotion, duration, motionValue]);

  return <motion.span className={className}>{text}</motion.span>;
}
