# Theme System Audit & Optimization Report

**Platform:** FrozenPhoenix / Playbook  
**Date:** 2026-02-26  
**Auditor:** Cascade  
**Scope:** Dark / Light / System theme — architecture, tokens, accessibility, SSR, performance, white-label readiness

---

## Executive Summary

The theming system has a **solid architectural foundation**: CSS custom properties in HSL, a Zustand-persisted store with cascading token overrides (org → project → user), a fully typed brand registry (`playbook`) with per-mode color palettes, and a Tailwind `@theme inline` bridge. Accessibility primitives (reduced motion, high contrast, keyboard focus rings) are present.

However, **critical gaps** prevent production readiness:

1. **Flash of Incorrect Theme (FOIT)** — `<html>` is server-rendered with `className="dark"` hardcoded; the `ThemeProvider` runs client-side via `useEffect`, causing a visible flash when the user's preference is `light` or `system`.
2. **Settings page theme toggle is disconnected** — `settings/page.tsx` uses local `useState` instead of `useThemeStore`, so toggling has zero effect.
3. **~45 hardcoded hex colors** in `production-config.ts` and **~65 raw Tailwind palette classes** (`text-white`, `bg-black`, `text-yellow-500`, `bg-blue-500`, etc.) across 27+ files bypass the token system entirely.
4. **Missing dark-mode variants** for `--warning`, `--success`, `--info` and their foregrounds in `.dark {}` — these tokens silently inherit from `:root` (light mode), producing broken contrast in dark mode.
5. **Brand colors never applied to DOM** — `BRAND_REGISTRY` colors exist in TypeScript but no code path injects them into CSS variables at runtime.

**Deployment Readiness Score: 4 / 10**

---

## 1. Current State Risk Assessment

### 1.1 Architecture Overview

| Layer               | Implementation                                           | Status             |
| ------------------- | -------------------------------------------------------- | ------------------ |
| CSS Variables       | HSL triplets in `:root` / `.dark`                        | ✅ Correct pattern |
| Tailwind Bridge     | `@theme inline` mapping `--color-*` → `hsl(var(--*))`    | ✅ Correct         |
| Theme Store         | Zustand + `persist` (localStorage key `pb-theme`)        | ✅ Good            |
| Cascading Overrides | `mergeTokens(org, project, user)` → `applyTokensToDOM()` | ✅ Well-designed   |
| Brand Registry      | `BrandConfig` with `light` + `dark` palettes per brand   | ✅ Typed           |
| SSR Hydration       | ❌ **Hard-coded `className="dark"` on `<html>`**         | 🔴 Critical        |
| System Preference   | `matchMedia("prefers-color-scheme")` listener            | ⚠️ Client-only     |
| Cross-tab Sync      | None                                                     | ⚠️ Missing         |
| Cookie Persistence  | None — localStorage only                                 | ⚠️ SSR-blind       |

### 1.2 Risk Matrix

| Risk                                           | Severity | Impact                                                               |
| ---------------------------------------------- | -------- | -------------------------------------------------------------------- |
| FOIT on first paint                            | **P0**   | Users see dark→light flash; breaks perceived quality                 |
| Settings toggle disconnected                   | **P0**   | Theme preference UI is completely non-functional                     |
| Missing dark-mode semantic tokens              | **P0**   | `--warning`, `--success`, `--info` inherit light values in dark mode |
| Brand palette never injected                   | **P1**   | Multi-tenant theming is declared but inoperative                     |
| 45 hardcoded hex colors                        | **P1**   | Colors don't respond to theme/brand switches                         |
| 65+ raw Tailwind palette classes               | **P1**   | `text-white`, `bg-black`, etc. break in light/dark transitions       |
| No cookie-based persistence                    | **P2**   | Server can't read theme before JS hydrates                           |
| No cross-tab sync                              | **P2**   | Theme change in one tab doesn't propagate                            |
| Print styles use `!important` hardcoded colors | **P3**   | Minor — print is a narrow use case                                   |

---

## 2. Hardcoded & Anti-Pattern Report

### 2.1 Hex Colors in Config (45 instances)

**File:** `src/config/production-config.ts`

All of `PRODUCTION_PHASE_CONFIG`, `DEPARTMENT_CONFIG`, `SHIPMENT_TYPE_CONFIG`, `INCIDENT_TYPE_CONFIG`, and `INCIDENT_SEVERITY_CONFIG` use hardcoded hex colors:

```
discovery: { label: "Discovery", order: 1, color: "#8B5CF6" },
production: { label: "Production", icon: FolderKanban, color: "#8B5CF6" },
```

These are consumed by components via `style={{ color: item.color }}` inline styles, completely bypassing the token system.

**Recommendation:** Replace hex values with semantic HSL token references or CSS variable names. Create a `DATA_VISUALIZATION_PALETTE` token set that resolves via CSS custom properties.

### 2.2 Raw Tailwind Palette Classes (65+ instances across 27 files)

| Pattern                                                                          | Count | Files                                                                                                                                                                                |
| -------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `text-white`                                                                     | ~25   | topbar, sidebar, progress-bar, calendar, fleet, settings, signup, landing, forecasting, decks, resource-planner, templates, assets, crew, deals, projects, tasks, vendors, locations |
| `bg-black/50`                                                                    | 4     | dialog, command-bar, sidebar (overlays), toast                                                                                                                                       |
| `text-yellow-500` / `fill-yellow-500`                                            | 8     | workforce, documents, saved-views, landing, reviews                                                                                                                                  |
| `bg-blue-500`, `bg-violet-500`, `bg-rose-500`, `bg-orange-500`, `bg-emerald-500` | 5     | settings/appearance accent picker                                                                                                                                                    |
| `text-red-500`, `text-blue-500`, `text-amber-500`, `text-emerald-500`            | 8     | system-health                                                                                                                                                                        |
| `border-yellow-500`                                                              | 1     | forecasting                                                                                                                                                                          |
| `ring-red-500`                                                                   | 1     | resource-planner                                                                                                                                                                     |

### 2.3 `text-white` Anti-Pattern Analysis

Most `text-white` usage is on colored backgrounds (badges, avatars, status indicators). The correct pattern is `text-*-foreground` paired with the corresponding semantic background. For example:

- ❌ `bg-destructive text-white`
- ✅ `bg-destructive text-destructive-foreground`

The `text-white` pattern breaks when a brand defines `destructive-foreground` as non-white (e.g., dark text on a light-red destructive background).

### 2.4 Inline Style Violations (42 instances across 18 files)

Most are legitimate dynamic `width`/`left` styles for progress bars and charts. However, `brand-kit/page.tsx` and `brand-kit/[id]/page.tsx` use inline `style={{ backgroundColor: kit.primaryColor }}` with raw hex — acceptable for a brand preview component but should be documented as an exception.

### 2.5 Token Compliance Score

| Category                     | Token-Compliant | Hardcoded     | Score    |
| ---------------------------- | --------------- | ------------- | -------- |
| Semantic colors (CSS vars)   | 26 tokens       | 0             | **100%** |
| Component styling (Tailwind) | ~85%            | ~15%          | **85%**  |
| Config data colors           | 0%              | 100% (45 hex) | **0%**   |
| Overall weighted             | —               | —             | **68%**  |

---

## 3. Accessibility & Contrast Report

### 3.1 Contrast Ratio Analysis

Computed from the HSL values in `globals.css`:

#### Light Mode (`:root`)

| Pair                                      | Foreground HSL | Background HSL | Approx Ratio | WCAG AA (4.5:1) | WCAG AAA (7:1) |
| ----------------------------------------- | -------------- | -------------- | ------------ | --------------- | -------------- |
| `foreground` on `background`              | `220 30% 10%`  | `220 20% 97%`  | ~16.5:1      | ✅              | ✅             |
| `muted-foreground` on `background`        | `215 16% 47%`  | `220 20% 97%`  | ~5.2:1       | ✅              | ❌             |
| `primary-foreground` on `primary`         | `0 0% 100%`    | `220 70% 50%`  | ~5.8:1       | ✅              | ❌             |
| `accent-foreground` on `accent`           | `0 0% 100%`    | `31 97% 60%`   | ~2.8:1       | 🔴 **FAIL**     | 🔴             |
| `warning-foreground` on `warning`         | `0 0% 100%`    | `38 92% 50%`   | ~2.5:1       | 🔴 **FAIL**     | 🔴             |
| `destructive-foreground` on `destructive` | `0 0% 100%`    | `0 84% 60%`    | ~3.8:1       | 🔴 **FAIL**     | 🔴             |
| `success-foreground` on `success`         | `0 0% 100%`    | `152 69% 40%`  | ~3.2:1       | 🔴 **FAIL**     | 🔴             |
| `info-foreground` on `info`               | `0 0% 100%`    | `199 89% 48%`  | ~3.1:1       | 🔴 **FAIL**     | 🔴             |

#### Dark Mode (`.dark`)

| Pair                               | Approx Ratio | WCAG AA                     | Notes                             |
| ---------------------------------- | ------------ | --------------------------- | --------------------------------- |
| `foreground` on `background`       | ~15.2:1      | ✅                          | Good                              |
| `muted-foreground` on `background` | ~5.8:1       | ✅                          | Marginal                          |
| `primary-foreground` on `primary`  | ~5.5:1       | ✅                          | Adequate                          |
| `accent-foreground` on `accent`    | ~2.9:1       | 🔴 **FAIL**                 | Same issue                        |
| `warning` / `success` / `info`     | —            | ⚠️ **Inherited from :root** | Not defined in `.dark` — see §3.2 |

### 3.2 Missing Dark Mode Semantic Tokens (P0)

The `.dark` block in `globals.css` **does not define**:

- `--warning`
- `--warning-foreground`
- `--success`
- `--success-foreground`
- `--info`
- `--info-foreground`
- `--brand-primary`
- `--brand-secondary`
- `--brand-accent`

These inherit from `:root` (light mode), which means:

- Warning badges in dark mode use `38 92% 50%` (designed for light backgrounds) — reduced contrast
- Success/info follow the same pattern

**Required dark variants:**

```css
.dark {
  --warning: 38 92% 60%;
  --warning-foreground: 38 100% 10%;
  --success: 152 69% 50%;
  --success-foreground: 152 100% 10%;
  --info: 199 89% 55%;
  --info-foreground: 199 100% 10%;
}
```

### 3.3 Accent Color Contrast Failure

`--accent: 31 97% 60%` (orange) with `--accent-foreground: 0 0% 100%` (white) yields ~2.8:1 in both modes. This fails WCAG AA for normal text. Options:

1. Darken accent to `31 97% 42%` (ratio ~4.6:1)
2. Switch foreground to dark text: `31 100% 12%`
3. Use accent only for large text / decorative elements (AA large text requires 3:1)

### 3.4 Focus Ring Visibility

- ✅ `globals.css` defines `.keyboard-navigation *:focus-visible` with `2px solid hsl(var(--ring))`
- ✅ `design-tokens.ts` exports `FOCUS_RING` class string
- ⚠️ Not all interactive elements use `FOCUS_RING` — many buttons in page files use inline class strings without focus-visible styles
- ✅ High contrast mode overrides `--ring` to higher contrast value

### 3.5 Color-Only Meaning

- ⚠️ Status badges rely heavily on color. The `STATUS_VARIANTS` → `BadgeVariant` mapping provides color differentiation only. Badges should also display text labels (which they do) — but standalone status dots (e.g., `getStatusBgColor()`) lack text alternatives.

### 3.6 Reduced Motion

- ✅ `@media (prefers-reduced-motion: reduce)` kills all animations globally
- ✅ `.reduce-motion` class available for programmatic control
- ✅ `useMotion()` hook respects `prefers-reduced-motion`
- ✅ `spatial-card:hover` transform degrades gracefully (translateY only)

### 3.7 WCAG Compliance Summary

| Criterion                         | Status        | Risk                                               |
| --------------------------------- | ------------- | -------------------------------------------------- |
| 1.4.3 Contrast (Minimum) AA       | 🔴 5 failures | High — accent, warning, success, info, destructive |
| 1.4.6 Contrast (Enhanced) AAA     | 🔴 7 failures | Medium — muted-foreground also fails               |
| 1.4.11 Non-Text Contrast          | ✅ Pass       | Focus rings at 2px with high-contrast override     |
| 2.4.7 Focus Visible               | ⚠️ Partial    | Not universally applied                            |
| 2.3.3 Animation from Interactions | ✅ Pass       | Reduced motion fully supported                     |
| 1.4.1 Use of Color                | ⚠️ Partial    | Status dots lack text alternatives                 |

---

## 4. System Mode & Preference Handling

### 4.1 Preference Resolution Flow

```
┌─────────────────────────────────────────────┐
│ Server Render (layout.tsx)                  │
│ <html className="dark">  ← HARDCODED       │
└──────────────┬──────────────────────────────┘
               │ Hydration
               ▼
┌─────────────────────────────────────────────┐
│ ThemeProvider (client-side useEffect)        │
│ 1. Read Zustand store (localStorage)        │
│ 2. If "system" → matchMedia query           │
│ 3. html.classList.remove/add(resolved)      │
│ 4. Apply brand + token overrides            │
└─────────────────────────────────────────────┘
```

### 4.2 Flash of Incorrect Theme (P0)

**Root Cause:** `layout.tsx` line 29 renders `<html lang="en" className="dark">`. The `ThemeProvider` runs inside a `useEffect` (client-only), so:

1. Server sends HTML with `class="dark"`
2. Browser paints dark theme
3. JS hydrates, reads `pb-theme` from localStorage
4. If user preference is `"light"` → class changes to `"light"` → **visible flash**

**Fix:** Inject a blocking `<script>` in `<head>` that reads localStorage synchronously before first paint:

```html
<script>
  (function () {
    try {
      var s = JSON.parse(localStorage.getItem("pb-theme") || "{}");
      var m = s.state?.colorMode || "dark";
      if (m === "system") m = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      document.documentElement.className = m;
    } catch (e) {}
  })();
</script>
```

**Better long-term fix:** Store theme in a cookie, read it in middleware or `layout.tsx` server component, and render the correct class server-side. This eliminates flash even with JS disabled.

### 4.3 Settings Page Disconnected (P0)

`src/app/(dashboard)/settings/page.tsx` line 38:

```tsx
const [theme, setTheme] = useState<"light" | "dark" | "system">("dark");
```

This is local state. It never calls `useThemeStore().setColorMode()`. The entire appearance panel is non-functional.

### 4.4 System Preference Live Sync

- ✅ `ThemeProvider` listens for `matchMedia("prefers-color-scheme").change` when `colorMode === "system"`
- ✅ Correctly updates `resolvedMode` and DOM class
- ❌ Does not re-apply brand token overrides on system change (only updates class)

### 4.5 Cross-Tab Synchronization

- ❌ **Missing.** Zustand's `persist` middleware does not emit cross-tab events by default.
- **Fix:** Add `storage` event listener or use Zustand's `partialize` with `BroadcastChannel`.

### 4.6 JS-Disabled Fallback

- With JS disabled, the page renders with `class="dark"` permanently. No `<noscript>` or CSS-only fallback for system preference.
- **Fix:** Use `@media (prefers-color-scheme: light)` in CSS as a no-JS fallback.

### 4.7 Bug Risk Summary

| Bug                                         | Probability              | Impact                               |
| ------------------------------------------- | ------------------------ | ------------------------------------ |
| Flash of wrong theme                        | **100%** (deterministic) | High — every light-mode user sees it |
| Settings toggle does nothing                | **100%** (deterministic) | High — broken feature                |
| Warning/success/info wrong contrast in dark | **100%**                 | Medium — readability degradation     |
| Brand colors not applied                    | **100%**                 | Medium — multi-tenant broken         |
| Cross-tab desync                            | Moderate                 | Low — minor annoyance                |

---

## 5. Performance & Stability

### 5.1 Theme Switch Re-render Behavior

- ✅ Token application uses `document.documentElement.style.setProperty()` — zero React re-render for CSS variable changes
- ✅ Class toggle (`classList.add/remove`) is a single DOM operation
- ⚠️ `useThemeStore()` on line 237 of `theme-provider.tsx` subscribes to the **entire store** — any store change triggers context re-render of all consumers. Should use individual selectors.
- ⚠️ `useMemo` dependencies include all store methods (`setColorMode`, etc.) — these are stable references from Zustand, so no unnecessary re-renders in practice, but the pattern is fragile.

### 5.2 Layout Shift During Toggle

- ⚠️ The `spatial-card:hover` `translateY(-1px)` and shadow transitions can cause minor layout shifts during theme changes if a card is hovered at the moment of switch. Negligible impact.
- ✅ No width/height changes between themes — no CLS.

### 5.3 Memory Leaks

- ✅ `matchMedia` listener is properly cleaned up via `useEffect` return
- ✅ No interval timers in theme logic
- ⚠️ `clearCustomTokensFromDOM()` iterates all 15 variables on every theme change — micro-optimization possible but not necessary

### 5.4 CSS Specificity Conflicts

- ⚠️ `globals.css` uses `!important` in reduced-motion and print styles — acceptable for these use cases
- ⚠️ `body:not(.keyboard-navigation) *:focus { outline: none; }` — overly broad selector, may conflict with component-level focus styles
- ✅ No conflicting specificity between `:root` and `.dark` (same specificity level, cascade order correct)

### 5.5 Hydration Mismatches

- 🔴 **Guaranteed mismatch** when user's stored preference differs from the hardcoded `"dark"` class. React will warn about className mismatch between server and client.
- **Fix:** The blocking script (§4.2) or cookie-based approach eliminates this.

### 5.6 Performance Impact Score: **7 / 10**

Theme switching itself is well-optimized (CSS variable injection, no component re-renders). Deductions for hydration mismatch and overly-broad store subscription.

---

## 6. Token System Optimization

### 6.1 Current Token Taxonomy

**CSS Layer (globals.css):**

| Category        | Tokens                                                                                                    | Status                |
| --------------- | --------------------------------------------------------------------------------------------------------- | --------------------- |
| Brand colors    | `--brand-primary`, `--brand-secondary`, `--brand-accent`                                                  | ⚠️ Defined but unused |
| Semantic colors | `--primary`, `--secondary`, `--accent`, `--destructive`, `--warning`, `--success`, `--info` + foregrounds | ✅                    |
| Surface colors  | `--background`, `--card`, `--popover` + foregrounds                                                       | ✅                    |
| UI chrome       | `--border`, `--input`, `--ring`, `--muted` + foreground                                                   | ✅                    |
| Sidebar         | 8 tokens (`--sidebar-*`)                                                                                  | ✅                    |
| Radius          | `--radius` (base) + computed sm/md/lg/xl/2xl                                                              | ✅                    |
| Shadows         | `--shadow-xs` through `--shadow-xl`                                                                       | ✅                    |
| Glass           | `--glass-bg`, `--glass-border`, `--glass-blur`, `--glass-saturate`                                        | ✅                    |
| Animation       | `--ease-spring`, `--ease-out-expo`, `--duration-*`                                                        | ✅                    |

**TypeScript Layer (design-tokens.ts):**

| Category            | Tokens                                                 | Status |
| ------------------- | ------------------------------------------------------ | ------ |
| `SEMANTIC_COLORS`   | 7 color intents with bg/text/border/foreground classes | ✅     |
| `SPACING`           | 8 scale values                                         | ✅     |
| `RADIUS`            | 7 variants                                             | ✅     |
| `SHADOWS`           | 6 depths                                               | ✅     |
| `TYPOGRAPHY`        | 10 scale entries                                       | ✅     |
| `Z_INDEX`           | 10 layers                                              | ✅     |
| `ANIMATIONS`        | Duration + easing + presets                            | ✅     |
| `LAYOUT`            | Sidebar + topbar + container dimensions                | ✅     |
| `COMPONENT_SIZES`   | 5 scale entries (xs–xl)                                | ✅     |
| `CONTRAST_VARIANTS` | Default + high                                         | ✅     |
| `FOCUS_RING`        | Shared class string                                    | ✅     |
| `GRID`              | Column + gap presets                                   | ✅     |

### 6.2 Missing Tokens

| Token                           | Purpose                                                            | Priority |
| ------------------------------- | ------------------------------------------------------------------ | -------- |
| `--surface-elevated`            | Cards, popovers (distinct from `--card`)                           | P1       |
| `--surface-overlay`             | Modal/dialog overlays (currently `bg-black/50`)                    | P1       |
| `--surface-sunken`              | Inset areas, code blocks                                           | P2       |
| `--skeleton`                    | Loading skeleton color                                             | P2       |
| `--chart-1` through `--chart-8` | Data visualization palette                                         | P1       |
| `--focus-ring`                  | Dedicated focus ring color (currently aliases `--ring`)            | P2       |
| `--disabled-opacity`            | Standard opacity for disabled elements                             | P2       |
| `--overlay-opacity`             | Standard backdrop opacity                                          | P2       |
| `--text-on-color`               | Generic foreground for colored backgrounds (replaces `text-white`) | P1       |

### 6.3 Recommended Token Naming Standard

```
--{category}-{element}-{variant}-{state}

Categories: color, surface, text, border, shadow, radius, spacing, motion
Elements: primary, secondary, accent, destructive, warning, success, info, muted
Variants: foreground, hover, active, disabled
States: (reserved for future interactive token states)
```

Current naming is already close to this pattern. Main gap is the missing elevation/surface layer distinction.

### 6.4 Data Visualization Token Strategy

Replace all 45 hardcoded hex values in `production-config.ts` with CSS variable references:

```css
:root {
  --chart-1: 220 70% 50%; /* Blue */
  --chart-2: 262 83% 58%; /* Purple */
  --chart-3: 31 97% 60%; /* Orange */
  --chart-4: 152 69% 40%; /* Green */
  --chart-5: 0 84% 60%; /* Red */
  --chart-6: 199 89% 48%; /* Cyan */
  --chart-7: 340 75% 55%; /* Pink */
  --chart-8: 45 93% 47%; /* Amber */
}

.dark {
  --chart-1: 220 70% 65%;
  --chart-2: 262 83% 68%;
  /* ... adjusted for dark backgrounds */
}
```

Then in TypeScript:

```ts
color: "hsl(var(--chart-1))";
```

### 6.5 Brand Accent Token Strategy

The `BRAND_REGISTRY` already defines full light/dark palettes per brand. The missing piece is **runtime injection**. When `brandId` changes, `ThemeProvider` must:

1. Look up `BRAND_REGISTRY[brandId]`
2. Read the `colors[resolvedMode]` palette
3. Call `applyTokensToDOM()` with the brand palette as the base layer (before org/project/user overrides)

### 6.6 White-Label Scalability Assessment

| Capability                              | Status                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------ |
| Per-brand color palettes (light + dark) | ✅ Defined, ❌ not injected                                                    |
| Per-brand typography                    | ✅ Typed, ❌ not loaded at runtime                                             |
| Per-brand assets (logo, favicon, OG)    | ✅ Defined, ⚠️ partially wired                                                 |
| Per-tenant runtime override             | ✅ Architecture exists (org/project/user tokens)                               |
| Zero brand leakage                      | ⚠️ `brandConfig` in `brand.ts` still used by some pages alongside new registry |
| Feature flags per brand                 | ✅ `features.enableDarkMode` etc. in `BrandConfig`                             |

### 6.7 Governance Model

| Rule                                             | Enforcement                                                                |
| ------------------------------------------------ | -------------------------------------------------------------------------- |
| All colors via CSS variables                     | Lint rule: ban hex/rgb in `.tsx` files (eslint-plugin-no-hardcoded-colors) |
| All spacing via tokens                           | Lint rule: ban arbitrary Tailwind values for spacing                       |
| New tokens require `design-tokens.ts` entry      | Code review gate                                                           |
| Brand configs require both light + dark palettes | TypeScript enforced via `BrandColorPalette` required fields                |
| Token removals require deprecation period        | Append-only registry with version tracking                                 |

---

## 7. Architecture Improvements

### 7.1 Eliminate FOIT (P0)

**Option A — Blocking Script (quick fix):**

Add to `layout.tsx` `<head>`:

```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `
  (function(){try{var s=JSON.parse(localStorage.getItem('pb-theme')||'{}');
  var m=s.state?.colorMode||'dark';
  if(m==='system')m=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
  document.documentElement.className=m;}catch(e){}})();
`,
  }}
/>
```

Remove `className="dark"` from `<html>` (set via script).

**Option B — Cookie-Based (enterprise-grade):**

1. On theme change, set `document.cookie = 'pb-theme=' + resolvedMode`
2. In middleware, read cookie and set `x-theme` response header
3. In `layout.tsx`, read from `cookies()` and render correct class

### 7.2 Wire Settings Page to Theme Store (P0)

Replace local `useState` with `useThemeStore`:

```tsx
const { colorMode, setColorMode } = useTheme();
```

### 7.3 Add Missing Dark Semantic Tokens (P0)

Add `--warning`, `--success`, `--info` and foregrounds to `.dark {}` in `globals.css`.

### 7.4 Wire Brand Registry to ThemeProvider (P1)

In the `useEffect` that applies brand:

```tsx
import { getBrand } from "@/config/brands";

// Inside useEffect:
const brand = getBrand(brandId as BrandId);
if (brand) {
  const palette = brand.colors[resolved];
  applyTokensToDOM(palette); // Apply brand as base layer
}
// Then apply org → project → user overrides on top
```

### 7.5 Replace `text-white` Pattern (P1)

Systematically replace:

- `text-white` → `text-primary-foreground` (on primary bg) or `text-destructive-foreground` (on destructive bg), etc.
- `bg-black/50` → `bg-foreground/50` or new `--surface-overlay` token

### 7.6 Create Chart Token Layer (P1)

Add `--chart-1` through `--chart-8` to both `:root` and `.dark`.

### 7.7 Cross-Tab Sync (P2)

Add to `ThemeProvider`:

```tsx
useEffect(() => {
  const handler = (e: StorageEvent) => {
    if (e.key === "pb-theme" && e.newValue) {
      const parsed = JSON.parse(e.newValue);
      if (parsed.state?.colorMode) {
        useThemeStore.getState().setColorMode(parsed.state.colorMode);
      }
    }
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}, []);
```

### 7.8 No-JS Fallback (P3)

Add to `globals.css`:

```css
@media (prefers-color-scheme: light) {
  html:not(.dark):not(.light) {
    /* light mode defaults when no JS has run */
  }
}
```

---

## 8. Component Theme Inconsistency Matrix

| Component           | Dark ✅ | Light ✅ | System ✅ | Brand-Safe | Notes                                                                     |
| ------------------- | ------- | -------- | --------- | ---------- | ------------------------------------------------------------------------- |
| Sidebar             | ✅      | ✅       | ✅        | ✅         | Uses `--sidebar-*` tokens correctly                                       |
| Topbar              | ⚠️      | ⚠️       | ⚠️        | ❌         | `text-white` on notification badge                                        |
| Command Bar         | ✅      | ✅       | ✅        | ⚠️         | `bg-black/50` overlay                                                     |
| Dialog              | ✅      | ✅       | ✅        | ⚠️         | `bg-black/50` overlay                                                     |
| Toast               | ✅      | ✅       | ✅        | ⚠️         | `bg-black/5` timer bar (light-only)                                       |
| Badge               | ✅      | ✅       | ✅        | ✅         | Fully token-driven via `cva`                                              |
| Button              | ✅      | ✅       | ✅        | ✅         | Fully token-driven                                                        |
| Card                | ✅      | ✅       | ✅        | ✅         | Uses `--card` / `--card-foreground`                                       |
| Input               | ✅      | ✅       | ✅        | ✅         | Uses `--input`, `--border`                                                |
| Progress Bar        | ⚠️      | ⚠️       | ⚠️        | ❌         | `text-white` inside bar                                                   |
| Calendar            | ⚠️      | ⚠️       | ⚠️        | ❌         | `text-white` on event chips                                               |
| Fleet               | ⚠️      | ⚠️       | ⚠️        | ❌         | `text-white` on vehicle avatars                                           |
| Resource Planner    | ⚠️      | ⚠️       | ⚠️        | ❌         | `text-white` on crew avatars + `ring-red-500`                             |
| Forecasting         | ⚠️      | ⚠️       | ⚠️        | ❌         | `text-white` + `border-yellow-500`                                        |
| System Health       | ❌      | ❌       | ❌        | ❌         | Raw `text-red-500`, `text-blue-500`, `text-amber-500`, `text-emerald-500` |
| Settings/Appearance | ✅      | ✅       | ✅        | ❌         | `bg-blue-500` etc. for accent picker (decorative — acceptable)            |
| Decks               | ❌      | ❌       | ❌        | ❌         | 22 `text-white`/`bg-white` instances                                      |
| Landing Page        | ⚠️      | ⚠️       | ⚠️        | ❌         | `text-white` on logo, `text-yellow-500` on stars                          |
| Data Export         | ⚠️      | ⚠️       | ⚠️        | ❌         | Raw palette classes                                                       |

### State Coverage Gaps

| State            | Covered            | Missing                                                   |
| ---------------- | ------------------ | --------------------------------------------------------- |
| Hover            | ✅ Most components | Some page-level buttons lack hover states                 |
| Focus            | ⚠️ Partial         | Not all custom buttons use `FOCUS_RING`                   |
| Active/Pressed   | ❌                 | No `active:` variants defined system-wide                 |
| Disabled         | ⚠️                 | Disabled inputs styled, but no `--disabled-opacity` token |
| Loading/Skeleton | ⚠️                 | `animate-shimmer` exists but no skeleton token color      |
| Error            | ✅                 | Destructive variant covers this                           |
| Empty            | ✅                 | Muted foreground pattern used                             |

---

## 9. Deployment Readiness Score

| Criterion                  | Weight   | Score | Weighted      |
| -------------------------- | -------- | ----- | ------------- |
| Token architecture         | 15%      | 8/10  | 1.20          |
| Dark/Light coverage        | 15%      | 5/10  | 0.75          |
| SSR/Hydration safety       | 15%      | 2/10  | 0.30          |
| Accessibility (contrast)   | 15%      | 3/10  | 0.45          |
| Brand/multi-tenant         | 10%      | 3/10  | 0.30          |
| Hardcoded color compliance | 10%      | 4/10  | 0.40          |
| Performance                | 10%      | 7/10  | 0.70          |
| Settings UI functional     | 10%      | 0/10  | 0.00          |
| **Total**                  | **100%** | —     | **4.10 / 10** |

**Deployment Readiness: 4 / 10 — Not Ready**

---

## 10. P0 / P1 / P2 Optimization Roadmap

### Phase 1 — P0 Critical Fixes (Week 1)

| #   | Task                                                                              | Effort | Files               |
| --- | --------------------------------------------------------------------------------- | ------ | ------------------- |
| 1.1 | Inject blocking theme script in `layout.tsx`, remove hardcoded `className="dark"` | 1h     | `layout.tsx`        |
| 1.2 | Wire settings appearance tab to `useThemeStore`                                   | 1h     | `settings/page.tsx` |
| 1.3 | Add `--warning`, `--success`, `--info` + foregrounds to `.dark {}`                | 30m    | `globals.css`       |
| 1.4 | Fix accent contrast: darken `--accent` or switch foreground to dark               | 30m    | `globals.css`       |
| 1.5 | Fix `--destructive` contrast in light mode (darken to `0 84% 48%`)                | 15m    | `globals.css`       |

### Phase 2 — P1 Token Compliance (Week 2–3)

| #   | Task                                                                                       | Effort | Files                        |
| --- | ------------------------------------------------------------------------------------------ | ------ | ---------------------------- |
| 2.1 | Replace all `text-white` with semantic `text-*-foreground` across 27 files                 | 4h     | 27 page/component files      |
| 2.2 | Replace `bg-black/50` overlays with `bg-foreground/50` or `--surface-overlay`              | 1h     | dialog, command-bar, sidebar |
| 2.3 | Add `--chart-1` through `--chart-8` to `globals.css` (both modes)                          | 1h     | `globals.css`                |
| 2.4 | Migrate `production-config.ts` hex colors to `hsl(var(--chart-N))`                         | 2h     | `production-config.ts`       |
| 2.5 | Wire `BRAND_REGISTRY` color injection into `ThemeProvider`                                 | 2h     | `theme-provider.tsx`         |
| 2.6 | Replace raw palette classes (`text-yellow-500`, `text-red-500`, etc.) with semantic tokens | 2h     | 8 files                      |
| 2.7 | Add `--surface-elevated`, `--surface-overlay`, `--skeleton` tokens                         | 1h     | `globals.css`                |
| 2.8 | Deprecate `src/config/brand.ts` (legacy) in favor of `brands/index.ts` registry            | 1h     | `brand.ts` + consumers       |

### Phase 3 — P2 Enterprise Hardening (Week 4–5)

| #   | Task                                                                       | Effort | Files                                               |
| --- | -------------------------------------------------------------------------- | ------ | --------------------------------------------------- |
| 3.1 | Implement cookie-based theme persistence for true SSR safety               | 3h     | `middleware.ts`, `layout.tsx`, `theme-provider.tsx` |
| 3.2 | Add cross-tab theme synchronization via `storage` event                    | 1h     | `theme-provider.tsx`                                |
| 3.3 | Add no-JS fallback via `prefers-color-scheme` media query                  | 30m    | `globals.css`                                       |
| 3.4 | Create ESLint rule: ban hardcoded hex/rgb in `.tsx`                        | 2h     | ESLint config                                       |
| 3.5 | Add `--disabled-opacity`, `--overlay-opacity` tokens                       | 30m    | `globals.css`, `design-tokens.ts`                   |
| 3.6 | Universal `FOCUS_RING` application audit — ensure all interactive elements | 2h     | All component files                                 |
| 3.7 | Add `active:` press state variants to button/interactive design tokens     | 1h     | Button + design tokens                              |
| 3.8 | Load brand fonts dynamically via `next/font` per `brandId`                 | 2h     | `layout.tsx`, `theme-provider.tsx`                  |
| 3.9 | Add forced-colors mode support (`@media (forced-colors: active)`)          | 1h     | `globals.css`                                       |

### Phase 4 — P3 Polish (Week 6)

| #   | Task                                                                     | Effort | Files                             |
| --- | ------------------------------------------------------------------------ | ------ | --------------------------------- |
| 4.1 | Print stylesheet theme-awareness (use `--foreground` instead of `black`) | 30m    | `globals.css`                     |
| 4.2 | Add theme transition animation (smooth color crossfade on toggle)        | 1h     | `globals.css`                     |
| 4.3 | Add density token system (compact/default/comfortable) per settings UI   | 3h     | New tokens + settings integration |
| 4.4 | Automated visual regression testing for both themes                      | 3h     | Playwright config                 |
| 4.5 | Document token governance in `QUALITY_STANDARDS.md`                      | 1h     | Docs                              |

---

## Appendix A: File Impact Summary

| File                                         | Issues                                                         | Priority |
| -------------------------------------------- | -------------------------------------------------------------- | -------- |
| `src/app/layout.tsx`                         | Hardcoded `dark` class, missing blocking script                | P0       |
| `src/app/globals.css`                        | Missing dark semantic tokens, contrast failures                | P0       |
| `src/app/(dashboard)/settings/page.tsx`      | Disconnected theme toggle                                      | P0       |
| `src/components/theme-provider.tsx`          | No brand injection, no cross-tab sync, full-store subscription | P1       |
| `src/config/production-config.ts`            | 45 hardcoded hex colors                                        | P1       |
| `src/app/(dashboard)/decks/[id]/page.tsx`    | 22 raw color references                                        | P1       |
| `src/app/(dashboard)/system-health/page.tsx` | Raw palette classes                                            | P1       |
| `src/components/ui/toast.tsx`                | `bg-black/5`                                                   | P2       |
| `src/components/ui/dialog.tsx`               | `bg-black/50`                                                  | P2       |
| `src/components/command-bar.tsx`             | `bg-black/50`                                                  | P2       |
| `src/components/layouts/sidebar.tsx`         | `bg-black/50`                                                  | P2       |
| `src/config/brand.ts`                        | Legacy — should be deprecated                                  | P2       |

## Appendix B: Recommended Quality Gate Criteria

Add to `quality-standards-registry.ts`:

| ID          | Description                                                                        | Check Type         | Threshold     |
| ----------- | ---------------------------------------------------------------------------------- | ------------------ | ------------- |
| `theme-001` | No hardcoded hex in TSX/TS files (except brand-kit preview)                        | Automated          | 0 violations  |
| `theme-002` | No raw Tailwind palette classes (`text-white`, `bg-black`, `text-{color}-{shade}`) | Automated          | 0 violations  |
| `theme-003` | All CSS variables defined in both `:root` and `.dark`                              | Automated          | 100% parity   |
| `theme-004` | All semantic foreground/background pairs meet 4.5:1 contrast                       | Semi-automated     | WCAG AA       |
| `theme-005` | No `className="dark"` or `className="light"` hardcoded in server components        | Automated          | 0 violations  |
| `theme-006` | All interactive elements include focus-visible styles                              | Semi-automated     | 100% coverage |
| `theme-007` | Brand registry colors injected at runtime                                          | Manual attestation | —             |
| `theme-008` | No FOIT on first paint (lighthouse or visual test)                                 | Semi-automated     | 0ms flash     |
