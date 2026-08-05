"use client";

import { motion } from "framer-motion";
import { NeuralNetwork } from "./NeuralNetwork";
import { Particles } from "./Particles";
import { useMouseParallax } from "./useMouseParallax";

/**
 * Layered ambient background: soft red glows, neural network, and particles.
 * Sits behind all page content.
 */
export function AmbientBackground() {
  const { x, y } = useMouseParallax(3, false);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div style={{ x, y }} className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(62%_46%_at_50%_-6%,rgb(214_40_40/0.14),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(42%_38%_at_10%_22%,rgb(230_57_70/0.06),transparent_72%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(48%_42%_at_90%_78%,rgb(214_40_40/0.08),transparent_72%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(30%_26%_at_18%_88%,rgb(214_40_40/0.04),transparent_70%)]" />
      </motion.div>

      <NeuralNetwork />
      <Particles />
    </div>
  );
}
