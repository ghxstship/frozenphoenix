# Motion & Animation Strategy

> **Purpose:** Define a comprehensive, phased animation system that makes FrozenPhoenix feel premium and alive — without compromising performance, accessibility, or bundle size.
>
> **Date:** 2026-03-03
> **Scope:** All UI surfaces — shell, pages, components, overlays, data visualization, public marketing.

---

## Table of Contents

1. [Current State Audit](#1-current-state-audit)
2. [Design Principles](#2-design-principles)
3. [Animation Taxonomy](#3-animation-taxonomy)
4. [Performance Budget](#4-performance-budget)
5. [Accessibility Contract](#5-accessibility-contract)
6. [Technology Recommendation](#6-technology-recommendation)
7. [Token System Expansion](#7-token-system-expansion)
8. [Component Catalog](#8-component-catalog)
9. [Integration Points](#9-integration-points)
10. [Implementation Phases](#10-implementation-phases)
11. [Quality Gate Criteria](#11-quality-gate-criteria)
12. [Anti-Patterns](#12-anti-patterns)

---

## 1. Current State Audit

### 1.1 Existing Infrastructure (Strong)

| Asset                                 | Location                              | Status                                                                                |
| ------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------- |
| `MOTION_SCALE` (6 durations)          | `config/design-tokens.ts`             | ✅ Defined, used in `useMotion()`                                                     |
| `STAGGER_SCALE` (4 intervals)         | `config/design-tokens.ts`             | ✅ Defined, used in `StaggerContainer`                                                |
| `ANIMATIONS.preset` (6 named classes) | `config/design-tokens.ts`             | ✅ Defined                                                                            |
| `TRANSITIONS` (5 property presets)    | `config/design-tokens.ts`             | ✅ Defined                                                                            |
| CSS custom properties                 | `globals.css :root`                   | ✅ `--ease-spring`, `--ease-out-expo`, `--duration-fast/normal/slow`                  |
| CSS keyframes (8)                     | `globals.css`                         | ✅ fadeIn, slideUp, slideDown, scaleIn, shimmer, pulseGlow, accordionDown/Up          |
| `useMotion()` hook                    | `hooks/use-motion.ts`                 | ✅ Reduced-motion aware, provides `shouldAnimate`, `getTransition`, `getStaggerDelay` |
| `useReducedMotion()`                  | `hooks/use-media-query.ts`            | ✅ Media query listener                                                               |
| `AccessibilityProvider`               | `components/accessibility/`           | ✅ Sets `.reduce-motion` class on `<html>`                                            |
| `prefers-reduced-motion` kill switch  | `globals.css`                         | ✅ `animation-duration: 0.01ms !important` on all elements                            |
| `StaggerContainer` / `StaggerItem`    | `components/ui/stagger-container.tsx` | ✅ Wraps children with staggered delay                                                |
| `.spatial-card` hover lift            | `globals.css`                         | ✅ `translateY(-1px)` + shadow elevation                                              |
| `.glass` backdrop blur                | `globals.css`                         | ✅ Glassmorphism utility                                                              |
| `.glow-primary`                       | `globals.css`                         | ✅ Box-shadow glow effect                                                             |

### 1.2 Current Usage Across Codebase

| Pattern              | Usage Count         | Where                                                             |
| -------------------- | ------------------- | ----------------------------------------------------------------- |
| `animate-fade-in`    | ~80+ pages          | Applied via `PageShell`, `DetailLayout`, `MetricCard`, `StatCard` |
| `animate-scale-in`   | ~5                  | `DetailLayout` menu, `ConfirmDialog`, `CommandBar`                |
| `animate-slide-down` | ~3                  | `NetworkStatus` banners                                           |
| `animate-slide-up`   | ~2                  | `StaggerContainer` default, `TabPanel`                            |
| `spatial-card`       | ~7                  | `MetricCard`, `StatCard`, `Card`, pipeline/tasks/org-chart        |
| `glass`              | ~6                  | Public landing page elements                                      |
| `transition-colors`  | Widespread          | Buttons, links, sidebar items, tab buttons                        |
| `StaggerContainer`   | 0 direct page usage | Only used internally by page-shell grid wrapping                  |

### 1.3 Gaps Identified

| #   | Gap                                            | Impact                                                                                   | Complexity |
| --- | ---------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------- |
| G1  | **No page/route transitions**                  | High — route changes feel like hard cuts                                                 | Medium     |
| G2  | **No exit animations**                         | High — dialogs, toasts, panels vanish instantly                                          | Medium     |
| G3  | **No layout animations**                       | High — sidebar collapse/expand, panel resize are CSS jumps                               | Low        |
| G4  | **No tab content transitions**                 | Medium — tab panels swap without crossfade                                               | Low        |
| G5  | **No micro-interactions**                      | High — buttons, toggles, checkboxes, switches lack tactile feedback                      | Medium     |
| G6  | **No skeleton→content choreography**           | Medium — data loads pop in without crossfade                                             | Low        |
| G7  | **No scroll-driven effects**                   | Medium — no progressive reveal, sticky transitions, parallax                             | Medium     |
| G8  | **No number/counter animation**                | Low — metric values appear static                                                        | Low        |
| G9  | **No spring physics**                          | Medium — `--ease-spring` exists but isn't a real spring; no velocity-aware interpolation | Medium     |
| G10 | **Stagger underused**                          | Medium — `StaggerContainer` exists but grids/lists don't use it                          | Low        |
| G11 | **No gesture-driven animation**                | Low — drag, swipe, pinch not supported                                                   | High       |
| G12 | **Command bar lacks backdrop blur transition** | Low — opens/closes with basic scale-in                                                   | Low        |
| G13 | **No theme transition choreography**           | Low — `html.theme-transition` exists but is coarse                                       | Low        |
| G14 | **SegmentedControl has no sliding indicator**  | Medium — selection state is a color swap, not a sliding pill                             | Low        |

---

## 2. Design Principles

### 2.1 Purpose-Driven Motion

Every animation must serve exactly one of these purposes:

| Purpose         | Description                                 | Example                                   |
| --------------- | ------------------------------------------- | ----------------------------------------- |
| **Orientation** | Help users understand spatial relationships | Page transitions, sidebar collapse        |
| **Feedback**    | Confirm an action was received              | Button press scale, checkbox tick         |
| **Continuity**  | Maintain context during state changes       | Tab crossfade, accordion expand           |
| **Focus**       | Direct attention to what matters            | Notification entrance, metric highlight   |
| **Delight**     | Create emotional resonance (sparingly)      | First-load stagger, achievement animation |

**Rule:** Decorative-only animation is forbidden. If removing an animation harms comprehension, it's functional. If not, it's decorative.

### 2.2 The 3-Layer Model

```
Layer 1: CSS Transitions (property interpolation)
├── Hover states, color changes, shadow shifts
├── Zero JS overhead, GPU-compositable
└── Used for: 90% of interactive feedback

Layer 2: CSS Keyframe Animations (entrance/choreography)
├── Fade-in, slide-up, stagger sequences
├── Zero JS overhead, declarative
└── Used for: Page entrance, data load, attention

Layer 3: JS-Driven Animation (layout/physics/exit)
├── Layout shifts, exit animations, spring physics, gestures
├── Requires animation library, has JS cost
└── Used for: 10% of cases where CSS can't express intent
```

**Principle:** Always start at Layer 1. Move to Layer 2 only when needed. Move to Layer 3 only when Layer 2 is insufficient.

### 2.3 The FLIP Principle

For layout animations, always prefer the **FLIP** (First, Last, Invert, Play) technique:

1. Capture the element's **First** position
2. Apply the change to get the **Last** position
3. **Invert** — transform the element back to where it was
4. **Play** — remove the transform with a transition

This ensures layout changes animate at 60fps because only `transform` and `opacity` are animated.

### 2.4 Content-First, Motion-Second

- Content must be usable with zero animation (reduced-motion baseline)
- Animation enhances but never gates functionality
- No content hidden behind scroll-triggered reveals (progressive enhancement only: content visible by default, animation adds polish)

---

## 3. Animation Taxonomy

### 3.1 Entrance Animations

| Name                    | CSS Class                | Duration                    | Easing            | Use Case                               |
| ----------------------- | ------------------------ | --------------------------- | ----------------- | -------------------------------------- |
| Fade In                 | `animate-fade-in`        | `--duration-normal` (250ms) | `--ease-out-expo` | Default page/section entrance          |
| Slide Up                | `animate-slide-up`       | `--duration-slow` (400ms)   | `--ease-out-expo` | Card grids, staggered lists            |
| Slide Down              | `animate-slide-down`     | `--duration-slow` (400ms)   | `--ease-out-expo` | Toast/banner entrance from top         |
| Scale In                | `animate-scale-in`       | `--duration-normal` (250ms) | `--ease-spring`   | Dialogs, popovers, menus               |
| **NEW: Slide In Right** | `animate-slide-in-right` | `--duration-normal`         | `--ease-out-expo` | Panel reveals, drawer entrance         |
| **NEW: Blur In**        | `animate-blur-in`        | `--duration-normal`         | `--ease-out-expo` | Premium content reveals, hero sections |

### 3.2 Exit Animations (NEW — requires AnimatePresence or View Transitions)

| Name           | CSS Class                | Duration                  | Easing    | Use Case                      |
| -------------- | ------------------------ | ------------------------- | --------- | ----------------------------- |
| Fade Out       | `animate-fade-out`       | `--duration-fast` (150ms) | `ease-in` | Default exit                  |
| Scale Out      | `animate-scale-out`      | `--duration-fast`         | `ease-in` | Dialog/popover dismiss        |
| Slide Out Down | `animate-slide-out-down` | `--duration-fast`         | `ease-in` | Toast dismiss                 |
| Slide Out Left | `animate-slide-out-left` | `--duration-fast`         | `ease-in` | Page transition (forward nav) |

### 3.3 Micro-Interactions

| Trigger           | Animation                                  | Duration | Technique                                     |
| ----------------- | ------------------------------------------ | -------- | --------------------------------------------- |
| Button press      | `scale(0.97)` → `scale(1)`                 | 100ms    | CSS `:active`                                 |
| Button hover      | Shadow lift + subtle glow                  | 200ms    | CSS `transition-shadow`                       |
| Toggle switch     | Thumb slides with spring easing            | 200ms    | CSS `transition-transform`                    |
| Checkbox tick     | SVG path draw                              | 200ms    | CSS `stroke-dashoffset` animation             |
| Link hover        | Underline slides in from left              | 200ms    | CSS `background-size` transition              |
| Icon button hover | Gentle rotation or scale pulse             | 200ms    | CSS `transition-transform`                    |
| Card hover        | `translateY(-2px)` + shadow-md → shadow-lg | 250ms    | Existing `spatial-card` (already implemented) |

### 3.4 Layout Animations

| Element                 | Animation                              | Technique                                                 |
| ----------------------- | -------------------------------------- | --------------------------------------------------------- |
| Sidebar collapse/expand | Width + content crossfade              | CSS `transition-[width]` + opacity on labels              |
| Tab panel switch        | Crossfade (fade-out old + fade-in new) | `motion` `AnimatePresence` or View Transitions            |
| Accordion expand        | Height auto-animate                    | Existing CSS keyframes (already implemented)              |
| Detail panel sidebar    | Slide + fade from right                | CSS `transition-[transform,opacity]`                      |
| Command bar open        | Scale-in + backdrop blur ramp          | CSS keyframe + backdrop-filter transition                 |
| SegmentedControl pill   | Sliding background indicator           | CSS `transform: translateX()` with `transition-transform` |

### 3.5 Data & Loading

| Pattern            | Animation                                     | Technique                                             |
| ------------------ | --------------------------------------------- | ----------------------------------------------------- |
| Skeleton shimmer   | Gradient sweep                                | Existing `animate-shimmer`                            |
| Skeleton → content | Crossfade (skeleton fades, content slides up) | CSS class swap with `animate-fade-in`                 |
| Number counter     | Count-up from 0 to value                      | `requestAnimationFrame` + `useMotion().shouldAnimate` |
| Chart reveal       | Bars/lines grow from baseline                 | SVG `stroke-dashoffset` or bar `scaleY`               |
| Progress bar fill  | Width transition                              | CSS `transition-[width]`                              |
| Sparkline draw     | Polyline path animation                       | SVG `stroke-dashoffset`                               |

### 3.6 Scroll-Driven (Progressive Enhancement)

| Pattern              | Animation                                      | Technique                                                                  |
| -------------------- | ---------------------------------------------- | -------------------------------------------------------------------------- |
| Reveal on scroll     | Elements fade/slide in when entering viewport  | `IntersectionObserver` + CSS class toggle                                  |
| Sticky header shrink | Topbar compresses when scrolled past threshold | CSS `transition-[height,padding]` triggered by scroll class                |
| Parallax backgrounds | Subtle depth layering on marketing page        | CSS `scroll-timeline` (modern browsers) or `transform: translateY(calc())` |
| Progress indicator   | Scroll progress bar at top of page             | CSS `scroll-timeline` or JS scroll listener                                |

---

## 4. Performance Budget

### 4.1 Hard Limits

| Metric                         | Budget                              | Rationale                                                                    |
| ------------------------------ | ----------------------------------- | ---------------------------------------------------------------------------- |
| **Animation library bundle**   | ≤ 20KB gzipped                      | Must not regress Lighthouse Performance score                                |
| **Main thread blocking**       | ≤ 5ms per animation frame           | 60fps = 16.67ms/frame; animation logic must stay under 5ms to leave headroom |
| **Composited properties only** | `transform`, `opacity`, `filter`    | Avoid `width`, `height`, `top`, `left` animations (trigger layout)           |
| **Will-change usage**          | Only on actively animating elements | Remove `will-change` after animation completes; never apply globally         |
| **Animation duration cap**     | ≤ 600ms (xl scale)                  | Longer animations feel sluggish in productivity software                     |
| **Stagger cap**                | ≤ 12 items visible                  | Beyond 12, stagger is imperceptible and wastes time                          |
| **Concurrent animations**      | ≤ 3 independent animation tracks    | More than 3 simultaneous animations create visual chaos                      |

### 4.2 Compositing Rules

```
✅ FAST (GPU-composited, no reflow):
   transform: translate(), scale(), rotate()
   opacity
   filter: blur(), brightness()
   clip-path (on promoted layers)

⚠️  CAUTION (may trigger repaint):
   background-color
   box-shadow
   border-color
   color

❌ SLOW (triggers layout reflow — never animate):
   width, height
   padding, margin
   top, left, right, bottom
   font-size
   border-width
```

**Exception:** `height` animation is acceptable for accordion/collapse using the `accordionDown`/`accordionUp` keyframes (already implemented) because Radix handles the measured height via `--radix-accordion-content-height`.

### 4.3 Measurement

| Tool                               | What to Measure                    | Threshold                                 |
| ---------------------------------- | ---------------------------------- | ----------------------------------------- |
| Chrome DevTools → Performance tab  | Frame rate during animations       | ≥ 55fps (target 60fps)                    |
| Chrome DevTools → Layers panel     | Composited layer count             | ≤ 10 promoted layers at any time          |
| Lighthouse Performance             | Score impact of animation library  | ≤ 2 point regression from baseline        |
| `PerformanceObserver` (long tasks) | Animation-triggered long tasks     | 0 long tasks (> 50ms) caused by animation |
| Bundle analyzer                    | Animation library tree-shaken size | ≤ 20KB gzipped                            |

---

## 5. Accessibility Contract

### 5.1 WCAG 2.2 Compliance Matrix

| WCAG SC                               | Requirement                                                        | Implementation                                                                 |
| ------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| **2.3.1 Three Flashes**               | No content flashes more than 3× per second                         | All animations use easing curves, no strobing effects                          |
| **2.3.3 Animation from Interactions** | Users can disable motion                                           | `prefers-reduced-motion` kill switch (already implemented)                     |
| **1.4.13 Content on Hover/Focus**     | Hover-triggered content must be dismissible, hoverable, persistent | Tooltips already comply; ensure animated popovers do too                       |
| **2.2.1 Timing Adjustable**           | Auto-advancing content must be pausable                            | Toast auto-dismiss has timer bar; must add pause-on-hover                      |
| **2.5.1 Pointer Gestures**            | Multi-point gestures have single-pointer alternatives              | All gesture-driven animations must have button/keyboard fallbacks              |
| **4.1.2 Name, Role, Value**           | Animated state changes announced to screen readers                 | Use `aria-live` regions for data updates; don't rely on visual animation alone |

### 5.2 Reduced Motion Behavior

When `prefers-reduced-motion: reduce` is active:

| Category            | Full Motion                   | Reduced Motion                          |
| ------------------- | ----------------------------- | --------------------------------------- |
| Entrance animations | Slide/scale/blur + fade       | Instant appear (opacity 1)              |
| Exit animations     | Slide/scale out + fade        | Instant disappear                       |
| Page transitions    | Crossfade                     | Instant swap                            |
| Micro-interactions  | Scale/rotate feedback         | Color-only feedback (no transform)      |
| Layout animations   | Smooth width/position changes | Instant layout change                   |
| Hover effects       | Shadow lift + glow            | Color change only                       |
| Scroll-driven       | Parallax, progressive reveal  | Static positioning, all content visible |
| Loading shimmer     | Gradient animation            | Static skeleton color                   |
| Number counters     | Count-up animation            | Instant final value                     |
| Stagger             | Cascading delays              | All items appear simultaneously         |

### 5.3 Implementation Rules

1. **CSS kill switch** (already in place): `globals.css` `@media (prefers-reduced-motion: reduce)` sets `animation-duration: 0.01ms !important` and `transition-duration: 0.01ms !important`
2. **JS guard**: All JS-driven animations must check `useMotion().shouldAnimate` before starting
3. **`motion-safe:` prefix**: Use Tailwind's `motion-safe:` variant for animation classes that should be stripped in reduced-motion mode (already used in `TabPanel`)
4. **No information loss**: Any information conveyed by animation must also be conveyed by a non-animated means (color, text, icon, aria-live)

---

## 6. Technology Recommendation

### 6.1 Decision Matrix

| Criterion         | CSS-Only                | `motion` (v11)          | `framer-motion` (v11) | GSAP              |
| ----------------- | ----------------------- | ----------------------- | --------------------- | ----------------- |
| Bundle size       | 0 KB                    | ~18 KB gzipped          | ~35 KB gzipped        | ~25 KB gzipped    |
| Exit animations   | ❌ No `AnimatePresence` | ✅ `AnimatePresence`    | ✅ `AnimatePresence`  | ⚠️ Manual         |
| Layout animations | ❌ No FLIP              | ✅ `layout` prop        | ✅ `layout` prop      | ⚠️ Manual FLIP    |
| Spring physics    | ❌ Cubic-bezier only    | ✅ Real springs         | ✅ Real springs       | ⚠️ Plugin         |
| Gesture support   | ❌                      | ✅ `drag`, `whileHover` | ✅ Full suite         | ❌                |
| Reduced-motion    | ✅ CSS media query      | ✅ Automatic            | ✅ Automatic          | ❌ Manual         |
| Server components | ✅                      | ⚠️ Client-only          | ⚠️ Client-only        | ⚠️ Client-only    |
| Tree-shaking      | N/A                     | ✅ Excellent            | ⚠️ Moderate           | ❌ Monolithic     |
| React 19 compat   | N/A                     | ✅                      | ✅                    | ⚠️                |
| Learning curve    | Low                     | Low                     | Medium                | High              |
| License           | N/A                     | MIT                     | MIT                   | Paid (commercial) |

### 6.2 Recommendation: Hybrid (CSS-first + `motion` for Layer 3)

**Strategy:**

- **90% CSS** — transitions, keyframes, `motion-safe:` classes (already in place, expand)
- **10% `motion`** — exit animations (`AnimatePresence`), layout animations (`layout` prop), spring physics (`spring` transition), gesture-driven interactions

**Why `motion` over `framer-motion`:**

- `motion` is the official successor to `framer-motion` (same team, Matt Perry)
- Tree-shakes to ~18KB vs ~35KB
- Identical API for the features we need
- Better ESM support, React 19 compatible

**Install:**

```bash
npm install motion
```

**Usage boundary:** `motion` components should only wrap:

- Elements that need **exit animations** (dialogs, toasts, drawers, route transitions)
- Elements that need **layout animation** (sidebar collapse, segmented control indicator, tab underline)
- Elements that need **spring physics** (drag-to-reorder, gesture-driven interactions)

Everything else stays pure CSS.

### 6.3 Import Strategy (Bundle Safety)

```typescript
// ✅ GOOD — tree-shakeable named imports
import { motion, AnimatePresence } from "motion/react";

// ❌ BAD — pulls entire library
import motion from "motion";
```

Create a barrel re-export to enforce consistent imports:

```typescript
// src/lib/motion.ts
"use client";
export { motion, AnimatePresence, LayoutGroup } from "motion/react";
export { useSpring, useTransform, useScroll } from "motion/react";
```

---

## 7. Token System Expansion

### 7.1 New CSS Custom Properties

Add to `globals.css :root`:

```css
/* Entrance timing */
--duration-instant: 0ms;
--duration-micro: 100ms; /* micro-interactions: press, toggle */

/* Exit timing (asymmetric — exits should be faster than entrances) */
--duration-exit-fast: 100ms;
--duration-exit-normal: 150ms;

/* Spring easing (for CSS fallback when motion library isn't used) */
--ease-spring-gentle: cubic-bezier(0.25, 1, 0.5, 1);
--ease-spring-bouncy: cubic-bezier(0.34, 1.56, 0.64, 1); /* existing --ease-spring */
--ease-decelerate: cubic-bezier(0, 0, 0.2, 1);
--ease-accelerate: cubic-bezier(0.4, 0, 1, 1);

/* Scroll-driven */
--parallax-factor: 0.15;
```

### 7.2 New Design Token Exports

Add to `config/design-tokens.ts`:

```typescript
// ─── Spring Configs (for motion library) ───
export const SPRING_PRESETS = {
  snappy: { stiffness: 500, damping: 30, mass: 1 }, // Micro-interactions
  gentle: { stiffness: 200, damping: 20, mass: 1 }, // Layout animations
  bouncy: { stiffness: 300, damping: 15, mass: 1 }, // Playful entrance
  heavy: { stiffness: 150, damping: 25, mass: 2 }, // Large element movement
} as const;

export type SpringPresetToken = keyof typeof SPRING_PRESETS;

// ─── Exit Duration Scale ───
export const EXIT_SCALE = {
  fast: 100,
  normal: 150,
  slow: 250,
} as const;

export type ExitScaleToken = keyof typeof EXIT_SCALE;

// ─── Scroll Reveal Threshold ───
export const SCROLL_REVEAL = {
  threshold: 0.15, // 15% visible before triggering
  rootMargin: "-40px", // Start slightly before viewport edge
  staggerInterval: 80, // ms between staggered items
} as const;
```

### 7.3 New CSS Keyframes

Add to `globals.css`:

```css
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes blurIn {
  from {
    opacity: 0;
    filter: blur(8px);
  }
  to {
    opacity: 1;
    filter: blur(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes scaleOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

@keyframes slideOutDown {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(8px);
  }
}

@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes checkmarkDraw {
  from {
    stroke-dashoffset: 24;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes progressFill {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(var(--progress, 1));
  }
}

@keyframes pulseSubtle {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
```

---

## 8. Component Catalog

### 8.1 New Primitives to Build

| Component           | Purpose                                                                 | Layer | Library                                            |
| ------------------- | ----------------------------------------------------------------------- | ----- | -------------------------------------------------- |
| `AnimatedPresence`  | Wrapper for exit animations on conditionally rendered elements          | 3     | `motion` `AnimatePresence`                         |
| `PageTransition`    | Route-level crossfade/slide for dashboard pages                         | 3     | `motion` `AnimatePresence` + Next.js `usePathname` |
| `MotionCard`        | Card with hover lift + entrance animation + optional layout animation   | 1+3   | CSS + `motion` `layout`                            |
| `SlidePanel`        | Animated panel that slides in/out from right (detail sidebars, drawers) | 2+3   | CSS keyframes + `motion` exit                      |
| `ScrollReveal`      | `IntersectionObserver`-based reveal wrapper                             | 2     | CSS + vanilla JS                                   |
| `NumberTicker`      | Animated count-up for metric values                                     | 2     | `requestAnimationFrame` + `useMotion`              |
| `SlidingIndicator`  | Animated background pill for `SegmentedControl` and `TabBar` underline  | 1     | CSS `transform` transition                         |
| `SkeletonCrossfade` | Crossfade from skeleton placeholder to loaded content                   | 2     | CSS keyframe                                       |
| `PressableButton`   | Button with `scale(0.97)` active state + optional spring release        | 1     | CSS `:active`                                      |
| `AnimatedCheckbox`  | Checkbox with SVG checkmark draw animation                              | 2     | CSS `stroke-dashoffset`                            |
| `ToastWithExit`     | Toast that animates in AND out (currently only animates in)             | 3     | `motion` `AnimatePresence`                         |

### 8.2 Existing Components to Enhance

| Component                 | Enhancement                                                               | Effort |
| ------------------------- | ------------------------------------------------------------------------- | ------ |
| `PageShell`               | Replace `animate-fade-in` with `PageTransition` for route-level animation | Medium |
| `DetailLayout`            | Add `animate-fade-in` → `PageTransition`; add sidebar slide-in            | Medium |
| `TabBar`                  | Add `SlidingIndicator` for underline/pill variant                         | Low    |
| `TabPanel`                | Wrap in `AnimatePresence` for crossfade between panels                    | Low    |
| `SegmentedControl`        | Add `SlidingIndicator` for active option background                       | Low    |
| `ConfirmDialog`           | Add exit animation via `AnimatePresence` (currently vanishes)             | Low    |
| `CommandBar`              | Add backdrop blur ramp + exit animation                                   | Low    |
| `NetworkStatus` banners   | Add exit animation (currently vanishes when dismissed)                    | Low    |
| `MetricCard` / `StatCard` | Add `NumberTicker` for value display + stagger on grid                    | Low    |
| `Sidebar`                 | Smooth label fade during collapse/expand transition                       | Low    |
| `Topbar`                  | Sticky shrink behavior on scroll                                          | Low    |
| Buttons (all)             | Add `PressableButton` active state                                        | Low    |

---

## 9. Integration Points

### 9.1 Dashboard Shell (`(dashboard)/layout.tsx`)

**Current:** `<Suspense>{children}</Suspense>` — children swap instantly on route change.

**Proposed:** Wrap `{children}` with `PageTransition` keyed on `pathname`:

```tsx
<AnimatePresence mode="wait">
  <PageTransition key={pathname}>
    <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
  </PageTransition>
</AnimatePresence>
```

**Reduced-motion fallback:** `PageTransition` renders a plain `<div>` when `shouldAnimate` is false.

### 9.2 Tab System (`TabBar` + `TabPanel`)

**Current:** `TabPanel` returns `null` when not active — no exit animation possible.

**Proposed:**

1. `TabBar` underline: Add a `SlidingIndicator` div that `transform: translateX()` to the active tab's position (measure with `getBoundingClientRect` + `ResizeObserver`)
2. `TabPanel` content: Wrap all panels in `AnimatePresence mode="wait"` so outgoing panel fades out before incoming fades in

### 9.3 Dialogs & Overlays

**Current:** `ConfirmDialog` renders conditionally (`{state.open && ...}`) — no exit animation.

**Proposed:** Wrap dialog in `AnimatePresence`:

```tsx
<AnimatePresence>
  {state.open && (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", ...SPRING_PRESETS.snappy }}
    >
      {/* dialog content */}
    </motion.div>
  )}
</AnimatePresence>
```

### 9.4 Sidebar Collapse

**Current:** `transition-[margin-inline-start] duration-300` on shell content; sidebar width changes via CSS variable.

**Proposed enhancements:**

- Nav item labels: `opacity` + `transform: translateX(-8px)` transition during collapse (labels slide left and fade as sidebar narrows)
- Section titles: Same fade treatment
- Icons: Remain static (anchor point)
- This is all achievable with pure CSS transitions (Layer 1)

### 9.5 Data Loading Choreography

**Current pattern across pages:**

```tsx
if (isLoading) return <Skeleton />;
return <DataContent />;
```

**Proposed pattern:**

```tsx
<SkeletonCrossfade isLoading={isLoading} skeleton={<Skeleton />}>
  <DataContent />
</SkeletonCrossfade>
```

`SkeletonCrossfade` crossfades the skeleton out while fading content in, preventing the jarring pop-in.

### 9.6 Metric Grids

**Current:** `MetricCard` has `animate-fade-in` but all cards appear simultaneously.

**Proposed:** Wrap metric grids in `StaggerContainer`:

```tsx
<StaggerContainer stagger="tight" animation="slide-up" className="grid grid-cols-4 gap-4">
  <MetricCard ... />
  <MetricCard ... />
  <MetricCard ... />
  <MetricCard ... />
</StaggerContainer>
```

Add `NumberTicker` to `MetricCard` value display for count-up animation on first render.

---

## 10. Implementation Phases

### Phase 1 — Foundation (Week 1-2)

**Goal:** Expand token system, add CSS-only micro-interactions, install `motion`.

| Task                                                                  | Type       | Files                      |
| --------------------------------------------------------------------- | ---------- | -------------------------- |
| Install `motion` library                                              | Dependency | `package.json`             |
| Create `src/lib/motion.ts` barrel export                              | New file   | `lib/motion.ts`            |
| Add new CSS custom properties (§7.1)                                  | Edit       | `globals.css`              |
| Add new keyframes (§7.3)                                              | Edit       | `globals.css`              |
| Add `SPRING_PRESETS`, `EXIT_SCALE`, `SCROLL_REVEAL` tokens (§7.2)     | Edit       | `config/design-tokens.ts`  |
| Expand `useMotion()` with spring config helpers                       | Edit       | `hooks/use-motion.ts`      |
| Add `motion-safe:` and `motion-reduce:` variants to animation classes | Edit       | `globals.css`              |
| Add CSS `:active` press state to `Button` component                   | Edit       | `components/ui/button.tsx` |
| Add CSS hover micro-interactions to icon buttons                      | Edit       | `globals.css`              |

**Verification:** TypeScript exit 0, ESLint exit 0, Lighthouse Performance score unchanged.

### Phase 2 — Exit Animations & Layout (Week 3-4)

**Goal:** Add exit animations to overlays, sliding indicators to tabs/segments.

| Task                                                   | Type          | Files                                 |
| ------------------------------------------------------ | ------------- | ------------------------------------- |
| Build `SlidingIndicator` for `TabBar` underline        | New primitive | `components/ui/sliding-indicator.tsx` |
| Integrate `SlidingIndicator` into `TabBar`             | Edit          | `components/ui/tab-bar.tsx`           |
| Integrate `SlidingIndicator` into `SegmentedControl`   | Edit          | `components/ui/segmented-control.tsx` |
| Add `AnimatePresence` to `ConfirmDialog`               | Edit          | `components/ui/confirm-dialog.tsx`    |
| Add `AnimatePresence` to `CommandBar`                  | Edit          | `components/command-bar.tsx`          |
| Add exit animation to `NetworkStatus` banners          | Edit          | `components/network-status.tsx`       |
| Build `SlidePanel` primitive for animated drawers      | New primitive | `components/ui/slide-panel.tsx`       |
| Add exit animation to `TabPanel` via `AnimatePresence` | Edit          | `components/ui/tab-bar.tsx`           |

**Verification:** All overlays animate in AND out. Tab/segment indicators slide smoothly. Reduced-motion: instant swap.

### Phase 3 — Page Transitions & Data Choreography (Week 5-6)

**Goal:** Route transitions, skeleton crossfades, number tickers.

| Task                                                    | Type          | Files                                            |
| ------------------------------------------------------- | ------------- | ------------------------------------------------ |
| Build `PageTransition` component                        | New primitive | `components/ui/page-transition.tsx`              |
| Integrate `PageTransition` into dashboard layout        | Edit          | `app/(dashboard)/layout.tsx`                     |
| Build `SkeletonCrossfade` component                     | New primitive | `components/ui/skeleton-crossfade.tsx`           |
| Build `NumberTicker` component                          | New primitive | `components/ui/number-ticker.tsx`                |
| Integrate `NumberTicker` into `MetricCard` / `StatCard` | Edit          | `components/ui/metric-card.tsx`, `stat-card.tsx` |
| Add `StaggerContainer` to dashboard metric grids        | Edit          | `app/(dashboard)/dashboard/page.tsx`             |
| Add sidebar label fade animation during collapse        | Edit          | `components/layouts/sidebar.tsx`                 |

**Verification:** Route changes have crossfade. Skeleton→content is smooth. Metrics count up. Sidebar labels fade gracefully.

### Phase 4 — Scroll Effects & Polish (Week 7-8)

**Goal:** Scroll-driven reveals, topbar shrink, public page polish, gesture foundations.

| Task                                                                 | Type          | Files                                 |
| -------------------------------------------------------------------- | ------------- | ------------------------------------- |
| Build `ScrollReveal` component                                       | New primitive | `components/ui/scroll-reveal.tsx`     |
| Add scroll-driven topbar shrink                                      | Edit          | `components/layouts/topbar.tsx`       |
| Enhance public landing page with stagger + blur-in + parallax        | Edit          | `app/(public)/page.tsx`               |
| Add `AnimatedCheckbox` SVG draw                                      | New primitive | `components/ui/animated-checkbox.tsx` |
| Add chart reveal animations (bar grow, line draw)                    | Edit          | Chart components                      |
| Theme transition choreography polish                                 | Edit          | `globals.css`, `theme-provider.tsx`   |
| Audit all pages for stagger opportunity (metric grids, card layouts) | Sweep         | Multiple dashboard pages              |
| Add toast exit animation                                             | Edit          | Toast component                       |

**Verification:** Scroll reveals work with `IntersectionObserver`. Topbar shrinks on scroll. Public page feels premium. All animations respect reduced-motion.

### Phase 5 — Advanced (Week 9-10, optional)

| Task                                         | Type                | Notes                                     |
| -------------------------------------------- | ------------------- | ----------------------------------------- |
| Drag-to-reorder in task lists / Kanban       | `motion` `Reorder`  | Only if Kanban feature is built           |
| Shared layout animations (list→detail morph) | `motion` `layoutId` | High-impact but complex                   |
| View Transitions API for cross-document nav  | Native browser      | Progressive enhancement, Chrome/Edge only |
| Lottie/Rive for onboarding illustrations     | New dependency      | Only for marketing/onboarding             |

---

## 11. Quality Gate Criteria

### 11.1 Automated Checks

| Criterion                 | Check                                                | Threshold                                                           |
| ------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------- |
| Bundle size               | `motion` gzipped size in bundle analyzer             | ≤ 20KB                                                              |
| Lighthouse Performance    | CI Lighthouse audit                                  | ≥ 90 (no regression from baseline)                                  |
| Reduced-motion compliance | Puppeteer test with `prefers-reduced-motion: reduce` | Zero visible animations                                             |
| Animation duration        | ESLint custom rule                                   | No duration > 600ms                                                 |
| Compositing               | ESLint custom rule                                   | No `animate-*` class on `width`, `height`, `top`, `left` properties |

### 11.2 Manual Attestations

| Criterion                       | Attestor           | Frequency         |
| ------------------------------- | ------------------ | ----------------- |
| 60fps on mid-tier device        | QA Engineer        | Per release       |
| Screen reader compatibility     | Accessibility Lead | Per phase         |
| Reduced-motion full walkthrough | Accessibility Lead | Per phase         |
| No decorative-only animations   | Design Lead        | Per phase         |
| Motion sickness review          | External tester    | Phase 3 + Phase 4 |

### 11.3 ESLint Rules (Proposed)

```
no-animate-layout-properties: error    // Ban animation of width/height/top/left
max-animation-duration: [error, 600]   // Cap at 600ms
require-motion-safe: warn              // Warn if animation class used without motion-safe: prefix
require-exit-animation: warn           // Warn if AnimatePresence-eligible component lacks exit
```

---

## 12. Anti-Patterns

### 12.1 Forbidden Patterns

| Anti-Pattern                              | Why                                                       | Alternative                                                     |
| ----------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------- |
| **Animate `width`/`height` directly**     | Triggers layout reflow every frame                        | Use `transform: scaleX/Y()` or `clip-path`                      |
| **`will-change` on static elements**      | Wastes GPU memory, causes compositing overhead            | Only apply during active animation                              |
| **Animation duration > 600ms**            | Feels sluggish in productivity software                   | Use spring with fast settle time instead                        |
| **Decorative-only animation**             | Violates purpose-driven principle                         | Remove or add functional purpose                                |
| **Stagger > 12 items**                    | Delays content visibility; user waits for items to appear | Cap stagger at 12, rest appear instantly                        |
| **Animation blocking interaction**        | User can't click during animation                         | All animations must be non-blocking; use `pointer-events: auto` |
| **Parallax in dashboard**                 | Distracting in productivity context                       | Parallax is only for public/marketing pages                     |
| **Auto-playing animation loops**          | Distracting, power-draining, accessibility risk           | Only pulse/shimmer for loading indicators; all else one-shot    |
| **Importing full `motion` library**       | Bundle bloat                                              | Use named imports from `motion/react`                           |
| **JS animation for hover states**         | Unnecessary overhead                                      | CSS transitions are sufficient for hover                        |
| **`setTimeout` for animation sequencing** | Fragile, doesn't respect reduced-motion                   | Use CSS `animation-delay` or `motion` `staggerChildren`         |

### 12.2 Code Review Checklist

For every PR that adds or modifies animation:

- [ ] Animation serves one of the 5 purposes (Orientation, Feedback, Continuity, Focus, Delight)
- [ ] Uses composited properties only (`transform`, `opacity`, `filter`)
- [ ] Duration ≤ 600ms
- [ ] Has reduced-motion fallback (CSS `motion-safe:` or JS `shouldAnimate` guard)
- [ ] Exit animation exists if element is conditionally rendered
- [ ] No layout thrashing (no reading + writing layout in same frame)
- [ ] `will-change` removed after animation completes
- [ ] Screen reader announcement for state changes conveyed by animation
- [ ] Tested at 60fps on mid-tier device
- [ ] Bundle impact assessed (no new imports from heavyweight libraries)

---

## Appendix A: Quick Reference — When to Use What

```
Question: "How should I animate this?"

Is it a hover/focus/active state?
  → CSS transition (Layer 1)

Is it an entrance animation?
  → CSS keyframe with motion-safe: prefix (Layer 2)

Does it need an EXIT animation?
  → motion AnimatePresence (Layer 3)

Is it a layout position change?
  → motion layout prop (Layer 3)

Is it scroll-driven?
  → IntersectionObserver + CSS class toggle (Layer 1+2)

Is it a number/counter?
  → requestAnimationFrame + useMotion guard (Layer 2)

Is it gesture-driven (drag, swipe)?
  → motion drag/gesture props (Layer 3)

Is it a spring with velocity?
  → motion spring transition (Layer 3)

None of the above?
  → Don't animate it.
```

## Appendix B: File Change Map

| File                                       | Phase | Change Type                                         |
| ------------------------------------------ | ----- | --------------------------------------------------- |
| `package.json`                             | 1     | Add `motion` dependency                             |
| `src/lib/motion.ts`                        | 1     | New — barrel re-export                              |
| `src/app/globals.css`                      | 1     | Add CSS properties, keyframes, micro-interactions   |
| `src/config/design-tokens.ts`              | 1     | Add `SPRING_PRESETS`, `EXIT_SCALE`, `SCROLL_REVEAL` |
| `src/hooks/use-motion.ts`                  | 1     | Expand with spring helpers                          |
| `src/components/ui/button.tsx`             | 1     | Add `:active` press state                           |
| `src/components/ui/sliding-indicator.tsx`  | 2     | New primitive                                       |
| `src/components/ui/tab-bar.tsx`            | 2     | Add sliding indicator + exit animation on TabPanel  |
| `src/components/ui/segmented-control.tsx`  | 2     | Add sliding indicator                               |
| `src/components/ui/confirm-dialog.tsx`     | 2     | Add AnimatePresence exit                            |
| `src/components/command-bar.tsx`           | 2     | Add AnimatePresence exit                            |
| `src/components/network-status.tsx`        | 2     | Add AnimatePresence exit                            |
| `src/components/ui/slide-panel.tsx`        | 2     | New primitive                                       |
| `src/components/ui/page-transition.tsx`    | 3     | New primitive                                       |
| `src/app/(dashboard)/layout.tsx`           | 3     | Integrate PageTransition                            |
| `src/components/ui/skeleton-crossfade.tsx` | 3     | New primitive                                       |
| `src/components/ui/number-ticker.tsx`      | 3     | New primitive                                       |
| `src/components/ui/metric-card.tsx`        | 3     | Integrate NumberTicker                              |
| `src/components/ui/stat-card.tsx`          | 3     | Integrate NumberTicker                              |
| `src/app/(dashboard)/dashboard/page.tsx`   | 3     | Add StaggerContainer to metric grids                |
| `src/components/layouts/sidebar.tsx`       | 3     | Add label fade on collapse                          |
| `src/components/ui/scroll-reveal.tsx`      | 4     | New primitive                                       |
| `src/components/layouts/topbar.tsx`        | 4     | Add scroll-driven shrink                            |
| `src/app/(public)/page.tsx`                | 4     | Enhanced entrance choreography                      |
| `src/components/ui/animated-checkbox.tsx`  | 4     | New primitive                                       |
| Toast component                            | 4     | Add exit animation                                  |

---

_This document is the SSOT for all motion/animation decisions. No animation should be added to the codebase that isn't covered by or consistent with this strategy._
