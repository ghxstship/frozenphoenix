"use client";

/* ═══════════════════════════════════════════════════════════════
   MOTION LIBRARY — Canonical Motion System + Tree-shakeable Exports
   ═══════════════════════════════════════════════════════════════

   SSOT for all motion values across the codebase.

   All motion library imports must go through this file to:
   1. Enforce tree-shaking (named imports only)
   2. Centralize the dependency boundary
   3. Make migration painless if library changes
   4. Provide canonical motion tokens (durations, easings, presets)

   CSS custom properties (--duration-*, --ease-*) in globals.css
   mirror these values for CSS-driven animations.
   ═══════════════════════════════════════════════════════════════ */

export { motion, AnimatePresence, LayoutGroup } from "motion/react";
export { useSpring, useTransform, useScroll, useInView } from "motion/react";
export type { Transition, Variant, TargetAndTransition } from "motion/react";

// ─── Canonical Motion Tokens ───
// All JS-driven animation values MUST reference these tokens.
// Zero magic numbers in component files.

export const MOTION_TOKENS = {
    // Durations (seconds — motion library convention)
    duration: {
        instant: 0.1, // Micro-interactions (toggle, checkbox, icon swap)
        fast: 0.15, // Tooltips, dropdowns, hover states
        normal: 0.2, // Modals, drawers, cards, most UI
        slow: 0.3, // Page transitions, full-screen overlays
        decorative: 0.5, // Onboarding, empty states, celebratory moments
    },

    // Exit durations (faster than entrances — asymmetric timing)
    exitDuration: {
        fast: 0.1,
        normal: 0.15,
        slow: 0.25,
    },

    // Easings (cubic-bezier arrays for motion library)
    ease: {
        default: [0.25, 0.1, 0.25, 1] as const, // General purpose
        in: [0.4, 0, 1, 1] as const, // Elements exiting
        out: [0, 0, 0.2, 1] as const, // Elements entering
        inOut: [0.4, 0, 0.2, 1] as const, // Repositioning
        outExpo: [0.16, 1, 0.3, 1] as const, // Primary easing (matches --ease-out-expo)
        spring: [0.34, 1.56, 0.64, 1] as const, // Playful / emphasis
        gentleSpring: [0.25, 1, 0.5, 1] as const, // Gentle settle
        bounce: [0.68, -0.55, 0.27, 1.55] as const, // Celebratory only
    },

    // Semantic Transition Presets (ready to spread into motion components)
    preset: {
        // ─── Overlay / Backdrop ───
        overlay: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0.15 },
        },

        // ─── Fade ───
        fadeIn: { opacity: [0, 1], transition: { duration: 0.2, ease: [0, 0, 0.2, 1] as const } },
        fadeOut: { opacity: [1, 0], transition: { duration: 0.15, ease: [0.4, 0, 1, 1] as const } },

        // ─── Slide ───
        slideUp: {
            y: [8, 0],
            opacity: [0, 1],
            transition: { duration: 0.2, ease: [0, 0, 0.2, 1] as const },
        },
        slideDown: {
            y: [-8, 0],
            opacity: [0, 1],
            transition: { duration: 0.2, ease: [0, 0, 0.2, 1] as const },
        },

        // ─── Scale ───
        scaleIn: {
            scale: [0.95, 1],
            opacity: [0, 1],
            transition: { duration: 0.2, ease: [0, 0, 0.2, 1] as const },
        },
        scaleOut: {
            scale: [1, 0.95],
            opacity: [1, 0],
            transition: { duration: 0.15, ease: [0.4, 0, 1, 1] as const },
        },

        // ─── Modal ───
        modalEnter: {
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1 },
            transition: { duration: 0.2, ease: [0, 0, 0.2, 1] as const },
        },
        modalExit: {
            exit: { opacity: 0, scale: 0.98 },
            transition: { duration: 0.15, ease: [0.4, 0, 1, 1] as const },
        },

        // ─── Drawer / Slide Panel ───
        drawerEnter: {
            initial: { x: "100%" },
            animate: { x: "0%" },
            transition: { duration: 0.3, ease: [0, 0, 0.2, 1] as const },
        },
        drawerExit: {
            exit: { x: "100%" },
            transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const },
        },

        // ─── Collapse / Expand ───
        collapse: {
            exit: { height: 0, opacity: 0 },
            transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const },
        },
        expand: {
            initial: { height: 0, opacity: 0 },
            animate: { height: "auto", opacity: 1 },
            transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const },
        },

        // ─── Skeleton ───
        skeleton: {
            opacity: [0.4, 1, 0.4],
            transition: { duration: 1.5, ease: [0.4, 0, 0.2, 1] as const, repeat: Infinity },
        },

        // ─── Page ───
        pageEnter: {
            initial: { opacity: 0, y: 4 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.3, ease: [0, 0, 0.2, 1] as const },
        },
        pageExit: {
            exit: { opacity: 0 },
            transition: { duration: 0.15, ease: [0.4, 0, 1, 1] as const },
        },

        // ─── List Item ───
        listItem: {
            initial: { opacity: 0, y: 8, scale: 0.98 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, scale: 0.95 },
            enterTransition: { duration: 0.2, ease: [0.25, 1, 0.5, 1] as const },
            exitTransition: { duration: 0.12, ease: [0.4, 0, 1, 1] as const },
        },

        // ─── Layout ───
        layout: { duration: 0.25, ease: [0.25, 1, 0.5, 1] as const },
    },
} as const;
