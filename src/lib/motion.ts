"use client";

/* ═══════════════════════════════════════════════════════════════
   MOTION LIBRARY — Tree-shakeable barrel re-export
   ═══════════════════════════════════════════════════════════════
   
   All motion library imports must go through this file to:
   1. Enforce tree-shaking (named imports only)
   2. Centralize the dependency boundary
   3. Make migration painless if library changes
   ═══════════════════════════════════════════════════════════════ */

export { motion, AnimatePresence, LayoutGroup } from "motion/react";
export { useSpring, useTransform, useScroll, useInView } from "motion/react";
export type { Transition, Variant, TargetAndTransition } from "motion/react";
