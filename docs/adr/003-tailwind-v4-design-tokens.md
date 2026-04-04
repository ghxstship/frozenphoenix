# ADR-003: Tailwind v4 CSS-First Design Tokens

**Date:** 2025-03-01
**Status:** Accepted

## Context

The UI requires a consistent design system with semantic color tokens, motion presets, and responsive utilities. Tailwind v3's JavaScript config approach was migrated to v4's CSS-first paradigm.

## Decision

Use **Tailwind CSS v4** with CSS-first configuration:

- **Design Tokens:** All colors, spacing, radii, shadows, and z-index values defined as CSS custom properties in `src/app/globals.css`.
- **Semantic Colors:** HSL-based tokens (`--primary`, `--secondary`, `--destructive`, `--success`, etc.) with automatic dark mode support.
- **Motion Presets:** Canonical motion system in `src/lib/motion.ts` with `motion-safe:` utility classes for `prefers-reduced-motion` compliance.
- **Z-Index Scale:** Canonical custom properties (`--z-dropdown`, `--z-overlay`, `--z-modal`, `--z-toast`) — no hardcoded z-index values in components.
- **Single Methodology:** ALL styling via Tailwind utility classes. No CSS modules, no inline `style={}`, no `<style>` tags alongside Tailwind.

## Consequences

**Positive:**

- CSS custom properties enable runtime theme switching without JavaScript
- HSL-based color system allows programmatic lightness/saturation adjustments
- Motion presets ensure consistent, accessible animations platform-wide
- Single methodology eliminates style conflicts and specificity wars

**Negative:**

- v4 migration broke some v3 arbitrary value patterns (required migration to canonical classes)
- CSS-first config is less familiar to developers accustomed to `tailwind.config.js`
- Some vendor components (Radix UI) require custom CSS for deep theming
