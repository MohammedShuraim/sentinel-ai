"use client";

import { useMemo, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { mulberry32 } from "@/lib/utils/random";
import { cn } from "@/lib/utils/cn";
import { useMouseParallax } from "./useMouseParallax";

const COUNT = 16;

interface Particle {
  x: number;
  y: number;
  size: number;
  purple: boolean;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
  blur: boolean;
}

function generateParticles(): Particle[] {
  const rand = mulberry32(0x9a7c1e);
  return Array.from({ length: COUNT }, () => ({
    x: 4 + rand() * 92,
    y: 8 + rand() * 84,
    size: 2 + rand() * 3,
    purple: rand() < 0.3,
    duration: 16 + rand() * 10,
    delay: -rand() * 26,
    drift: 36 + rand() * 34,
    opacity: 0.25 + rand() * 0.3,
    blur: rand() < 0.4,
  }));
}

export function Particles() {
  const reduceMotion = useReducedMotion();
  const { x, y } = useMouseParallax(9);
  const particles = useMemo(generateParticles, []);

  return (
    <motion.div style={{ x, y }} className="absolute inset-0 overflow-hidden">
      {particles.map((p, i) => {
        const color = p.purple ? "#a78bfa" : "#34d399";
        const glow = p.purple
          ? "rgb(167 139 250 / 0.5)"
          : "rgb(52 211 153 / 0.5)";
        const style = {
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: p.size,
          height: p.size,
          backgroundColor: color,
          boxShadow: `0 0 ${p.size * 3}px ${glow}`,
          "--particle-o": p.opacity,
          "--particle-d": `${p.drift}px`,
          opacity: reduceMotion ? p.opacity * 0.7 : 0,
          animation: reduceMotion
            ? "none"
            : `particle-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
        } as CSSProperties;
        return (
          <span
            key={i}
            style={style}
            className={cn("absolute rounded-full", p.blur && "blur-[1.5px]")}
          />
        );
      })}
    </motion.div>
  );
}
