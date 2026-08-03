import type { Transition, Variants } from "framer-motion";

/* ------------------------------------------------------------------ */
/* Shared easings                                                      */
/* ------------------------------------------------------------------ */

export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_CINEMATIC: [number, number, number, number] = [
  0.32, 0.72, 0, 1,
];

/* ------------------------------------------------------------------ */
/* Entrances                                                           */
/* ------------------------------------------------------------------ */

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3, ease: EASE_OUT } },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: EASE_OUT } },
};

/* ------------------------------------------------------------------ */
/* Stagger                                                             */
/* ------------------------------------------------------------------ */

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

export const staggerItem: Variants = fadeUp;

/* ------------------------------------------------------------------ */
/* Page transition (< 350ms)                                           */
/* ------------------------------------------------------------------ */

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: EASE_OUT },
  },
};

/* ------------------------------------------------------------------ */
/* Overlays                                                            */
/* ------------------------------------------------------------------ */

export const backdropMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
} as const;

export const drawerMotion = {
  initial: { x: "100%" },
  animate: { x: 0 },
  exit: { x: "100%" },
  transition: { duration: 0.28, ease: EASE_OUT },
} as const;

export const modalMotion = {
  initial: { opacity: 0, scale: 0.96, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 10 },
  transition: { duration: 0.2, ease: EASE_OUT },
} as const;

export const sidebarSlideTransition: Transition = {
  duration: 0.3,
  ease: EASE_OUT,
};

export const activePillTransition = (reduced: boolean): Transition =>
  reduced ? { duration: 0.12 } : { duration: 0.25, ease: EASE_OUT };
