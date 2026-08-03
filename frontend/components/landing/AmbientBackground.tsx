"use client";

import { motion } from "framer-motion";
import { NeuralNetwork } from "./NeuralNetwork";
import { Particles } from "./Particles";
import { useMouseParallax } from "./useMouseParallax";

/**
 * Layered ambient background: mint/deep-blue/soft-purple glows, the neural
 * network, and floating particles. Sits behind all page content.
 */
export function AmbientBackground() {
  const { x, y } = useMouseParallax(3, false);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* layered AI glow: mint + deep blue + soft purple */}
      <motion.div style={{ x, y }} className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(62%_46%_at_50%_-6%,rgb(52_211_153/0.12),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(42%_38%_at_10%_22%,rgb(59_130_246/0.07),transparent_72%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(48%_42%_at_90%_78%,rgb(167_139_250/0.09),transparent_72%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(30%_26%_at_18%_88%,rgb(52_211_153/0.05),transparent_70%)]" />
      </motion.div>

      <NeuralNetwork />
      <Particles />
    </div>
  );
}
