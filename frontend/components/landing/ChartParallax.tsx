"use client";

import { motion } from "framer-motion";
import { MarketChart } from "./MarketChart";
import { useMouseParallax } from "./useMouseParallax";

/** Wraps the hero market chart with a restrained (≤5px) pointer parallax. */
export function ChartParallax() {
  const { x, y } = useMouseParallax(5);

  return (
    <motion.div
      style={{ x, y }}
      className="absolute inset-0 z-0 flex items-center justify-center"
    >
      <MarketChart className="aspect-[3/1] w-[min(1200px,94vw)] opacity-70 sm:opacity-80" />
    </motion.div>
  );
}
