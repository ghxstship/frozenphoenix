# Transition Registry — Frozen Phoenix

Full inventory of every animated element in the codebase with canonical status.

## Legend

| Status       | Meaning                                                                       |
| ------------ | ----------------------------------------------------------------------------- |
| ✅ canonical | Uses canonical motion tokens (CSS vars, `MOTION_TOKENS`, or `SPRING_PRESETS`) |
| ✅ native    | Uses Tailwind animate-in/out via Radix data-state — canonical by design       |

> [!TIP]
> Zero orphaned or hardcoded transitions remain. Every motion value traces back to `MOTION_TOKENS`, `SPRING_PRESETS`, or `--duration-*`/`--ease-*` CSS custom properties.

---

## Page-Level Transitions

| Component/Route     | Trigger      | Token                                  | Library                 | Status       |
| ------------------- | ------------ | -------------------------------------- | ----------------------- | ------------ |
| `PageTransition`    | Route change | `animate-slide-up` / `--ease-out-expo` | CSS                     | ✅ canonical |
| View Transition API | Theme toggle | `--ease-out-expo`                      | CSS `::view-transition` | ✅ canonical |

## Modal / Dialog / Sheet

| Component               | Trigger    | Token                          | Library          | Status       |
| ----------------------- | ---------- | ------------------------------ | ---------------- | ------------ |
| `Dialog` overlay        | Open/close | `animate-in/out` `fade-in-0`   | Radix + Tailwind | ✅ native    |
| `Dialog` content        | Open/close | `animate-in/out` `zoom-in-95`  | Radix + Tailwind | ✅ native    |
| `Sheet` overlay         | Open/close | `animate-in/out` `fade-in-0`   | Radix + Tailwind | ✅ native    |
| `Sheet` content         | Open/close | `animate-in/out` slide-in/out  | Radix + Tailwind | ✅ native    |
| `ConfirmDialog` overlay | Open/close | `MOTION_TOKENS.preset.overlay` | motion/react     | ✅ canonical |
| `ConfirmDialog` content | Open/close | `SPRING_PRESETS.snappy`        | motion/react     | ✅ canonical |
| `SlidePanel` overlay    | Open/close | `MOTION_TOKENS.preset.overlay` | motion/react     | ✅ canonical |
| `SlidePanel` content    | Open/close | `SPRING_PRESETS.gentle`        | motion/react     | ✅ canonical |
| `CommandBar` overlay    | Toggle     | `MOTION_TOKENS.preset.overlay` | motion/react     | ✅ canonical |
| `CommandBar` panel      | Toggle     | `SPRING_PRESETS.snappy`        | motion/react     | ✅ canonical |

## Popover / Tooltip / Dropdown

| Component      | Trigger     | Token                                | Library          | Status       |
| -------------- | ----------- | ------------------------------------ | ---------------- | ------------ |
| `Popover`      | Toggle      | `animate-in/out` `zoom-in-95`        | Radix + Tailwind | ✅ native    |
| `Tooltip`      | Hover/focus | `animate-in` `zoom-in-95`            | Radix + Tailwind | ✅ native    |
| `DropdownMenu` | Toggle      | `animate-scale-in` / `--ease-spring` | CSS class        | ✅ canonical |

## Toast / Notification

| Component          | Trigger      | Token                                 | Library      | Status       |
| ------------------ | ------------ | ------------------------------------- | ------------ | ------------ |
| `Toast` enter/exit | `addToast()` | `MOTION_TOKENS.preset.overlay`        | motion/react | ✅ canonical |
| `Toast` timer bar  | Auto-dismiss | `scaleX()` + `transform-origin: left` | CSS keyframe | ✅ canonical |
| `NotificationBell` | Toggle       | `animate-fade-in` / `--ease-out-expo` | CSS class    | ✅ canonical |

## Banner / Status

| Component                   | Trigger      | Token                   | Library      | Status       |
| --------------------------- | ------------ | ----------------------- | ------------ | ------------ |
| `NetworkStatus` offline     | Connectivity | `SPRING_PRESETS.snappy` | motion/react | ✅ canonical |
| `NetworkStatus` reconnected | Connectivity | `SPRING_PRESETS.snappy` | motion/react | ✅ canonical |

## Accordion / Tabs

| Component                   | Trigger    | Token                          | Library          | Status       |
| --------------------------- | ---------- | ------------------------------ | ---------------- | ------------ |
| `Accordion` expand/collapse | Toggle     | `animate-accordion-down/up`    | Radix + Tailwind | ✅ native    |
| `TabPanel` crossfade        | Tab change | `MOTION_TOKENS.preset.overlay` | motion/react     | ✅ canonical |

## List / Board / Layout Animations

| Component              | Trigger       | Token                           | Library      | Status       |
| ---------------------- | ------------- | ------------------------------- | ------------ | ------------ |
| `AnimatedListItem`     | Mount/unmount | `MOTION_TOKENS.preset.listItem` | motion/react | ✅ canonical |
| `LayoutTransitionItem` | Layout change | `MOTION_TOKENS.preset.layout`   | motion/react | ✅ canonical |
| `DataBoard` card       | DnD/reorder   | `SPRING_PRESETS.snappy`         | motion/react | ✅ canonical |

## FAB / Mobile

| Component            | Trigger       | Token                   | Library      | Status       |
| -------------------- | ------------- | ----------------------- | ------------ | ------------ |
| `MobileFab` button   | Scroll/toggle | `SPRING_PRESETS.bouncy` | motion/react | ✅ canonical |
| `MobileFab` actions  | Toggle        | `SPRING_PRESETS.bouncy` | motion/react | ✅ canonical |
| `MobileFab` backdrop | Toggle        | opacity fade            | motion/react | ✅ canonical |

## Loading / Skeleton States

| Component                   | Trigger     | Token                      | Library  | Status       |
| --------------------------- | ----------- | -------------------------- | -------- | ------------ |
| `animate-shimmer`           | Loading     | CSS keyframe (infinite)    | CSS      | ✅ canonical |
| `SkeletonCrossfade`         | Data loaded | `motion-safe:duration-200` | CSS      | ✅ canonical |
| `motion-safe:animate-pulse` | Loading     | Tailwind default           | Tailwind | ✅ canonical |

## Micro-Interactions

| Component            | Trigger      | Token                                   | Library      | Status       |
| -------------------- | ------------ | --------------------------------------- | ------------ | ------------ |
| Baseline interactive | hover/focus  | `--duration-fast` / `--ease-out-expo`   | CSS          | ✅ canonical |
| `spatial-card` hover | hover        | `--duration-normal` / `--ease-out-expo` | CSS          | ✅ canonical |
| `animate-badge-bump` | Count change | `--duration-normal` / `--ease-spring`   | CSS keyframe | ✅ canonical |

## Accessibility

| Feature                          | Implementation                    | Status       |
| -------------------------------- | --------------------------------- | ------------ |
| `prefers-reduced-motion: reduce` | Global `*` override (0.01ms)      | ✅ canonical |
| `motion-safe:` prefix            | All Tailwind animation classes    | ✅ canonical |
| `useReducedMotion()` hook        | `use-media-query.ts`              | ✅ canonical |
| `useMotion().shouldAnimate`      | Gate for motion/react components  | ✅ canonical |
| `[data-animation="off"]`         | Kill switch (all durations → 0ms) | ✅ canonical |
| `[data-animation="reduced"]`     | Slower, simpler animations        | ✅ canonical |
| `[data-animation="playful"]`     | Faster, bouncier animations       | ✅ canonical |
