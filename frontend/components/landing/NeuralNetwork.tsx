"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { mulberry32 } from "@/lib/utils/random";
import { useMouseParallax } from "./useMouseParallax";

/* ------------------------------------------------------------------ */
/* Deterministic network topology                                      */
/* ------------------------------------------------------------------ */

const W = 1440;
const H = 900;
const MAX_EDGE_LEN = 340;
const PULSE_COUNT = 5;

interface NeuralNode {
  x: number;
  y: number;
  r: number;
  accent: boolean;
}

type Edge = readonly [number, number];

function generateNetwork(seed: number): { nodes: NeuralNode[]; edges: Edge[] } {
  const rand = mulberry32(seed);
  const cols = 7;
  const rows = 4;
  const nodes: NeuralNode[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      // Keep the center calmer so the network never fights the hero copy.
      const nearCenter = col >= 2 && col <= 4 && row >= 1 && row <= 2;
      if (rand() > (nearCenter ? 0.3 : 0.62)) continue;
      nodes.push({
        x: ((col + 0.5) / cols) * W + (rand() - 0.5) * (W / cols) * 0.7,
        y: ((row + 0.5) / rows) * H + (rand() - 0.5) * (H / rows) * 0.7,
        r: 1.6 + rand() * 1.8,
        accent: rand() < 0.35,
      });
    }
  }

  const edges: Edge[] = [];
  const seen = new Set<string>();
  nodes.forEach((node, i) => {
    const nearest = nodes
      .map((other, j) => ({
        j,
        d: (other.x - node.x) ** 2 + (other.y - node.y) ** 2,
      }))
      .filter((entry) => entry.j !== i)
      .sort((a, b) => a.d - b.d);

    for (const { j, d } of nearest.slice(0, 2)) {
      if (d > MAX_EDGE_LEN * MAX_EDGE_LEN) continue;
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push([i, j] as const);
    }
  });

  return { nodes, edges };
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function NeuralNetwork() {
  const reduceMotion = useReducedMotion();
  const { x, y } = useMouseParallax(7);

  const { nodes, edges } = useMemo(() => generateNetwork(0x51e77e), []);

  // Longest edges host the traveling light pulses.
  const pulseEdges = useMemo(() => {
    return [...edges]
      .sort((a, b) => {
        const la =
          (nodes[a[0]].x - nodes[a[1]].x) ** 2 +
          (nodes[a[0]].y - nodes[a[1]].y) ** 2;
        const lb =
          (nodes[b[0]].x - nodes[b[1]].x) ** 2 +
          (nodes[b[0]].y - nodes[b[1]].y) ** 2;
        return lb - la;
      })
      .slice(0, PULSE_COUNT);
  }, [nodes, edges]);

  return (
    <motion.div
      style={{ x, y }}
      className="absolute inset-0 opacity-60 [mask-image:radial-gradient(78%_72%_at_50%_45%,black_55%,transparent)]"
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {/* connections with a slow, staggered breathing pulse */}
        {edges.map(([a, b], i) => {
          const from = nodes[a];
          const to = nodes[b];
          const accent = from.accent || to.accent;
          return (
            <line
              key={`e${a}-${b}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={accent ? "#E63946" : "#D62828"}
              strokeWidth={1}
              style={{
                strokeOpacity: 0.1,
                animation: reduceMotion
                  ? undefined
                  : `nn-edge-pulse 7.5s ease-in-out ${i * 0.42}s infinite`,
              }}
            />
          );
        })}

        {/* lights traveling along connections (SMIL, browser-driven) */}
        {!reduceMotion &&
          pulseEdges.map(([a, b], i) => {
            const from = nodes[a];
            const to = nodes[b];
            return (
              <circle
                key={`pulse-${a}-${b}`}
                r={2.2}
                fill={nodes[a].accent || nodes[b].accent ? "#E63946" : "#D62828"}
                opacity={0.85}
              >
                <animateMotion
                  dur="6.5s"
                  begin={`${i * 4.2}s`}
                  repeatCount="indefinite"
                  path={`M ${from.x.toFixed(1)} ${from.y.toFixed(1)} L ${to.x.toFixed(1)} ${to.y.toFixed(1)}`}
                />
              </circle>
            );
          })}

        {/* nodes with halo glow */}
        {nodes.map((node, i) => {
          const color = node.accent ? "#E63946" : "#D62828";
          return (
            <g
              key={`n${i}`}
              style={{
                opacity: reduceMotion ? 0.55 : undefined,
                animation: reduceMotion
                  ? undefined
                  : `nn-node-breathe ${5 + (i % 4)}s ease-in-out ${i * 0.6}s infinite`,
              }}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={node.r * 3.2}
                fill={color}
                opacity={0.14}
                className="blur-[3px]"
              />
              <circle cx={node.x} cy={node.y} r={node.r} fill={color} />
            </g>
          );
        })}
      </svg>
    </motion.div>
  );
}
