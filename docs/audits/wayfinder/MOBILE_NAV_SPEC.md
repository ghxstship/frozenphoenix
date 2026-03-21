# 🧭 WAYFINDER — Mobile Navigation Specification

**Prompt Code:** `FP-UX-WAYFINDER-001` · **Phase 7.2** · **Date:** 2026-03-21

---

## Current State Analysis

### What Exists

| Feature | Status | Implementation |
|---------|:------:|----------------|
| **Mobile sidebar drawer** | ✅ | Slide-out with backdrop overlay, focus trap, inert main content |
| **Hamburger menu toggle** | ✅ | `Menu` icon in topbar, triggers `setOpen(true)` |
| **Backdrop dismiss** | ✅ | Click overlay closes sidebar |
| **Escape key dismiss** | ✅ | `useEscapeKey` hook |
| **Auto-close on navigate** | ✅ | Sidebar closes when `pathname` changes |
| **Body scroll lock** | ✅ | `overflow: hidden` on body when drawer open |
| **Width** | ✅ | 280px (`SIDEBAR_WIDTH.mobile`) |
| **Focus management** | ✅ | `useFocusTrap` on mobile drawer |
| **Swipe-to-close** | ❌ | Not implemented |
| **Bottom tab bar** | ❌ | Not implemented |
| **Tab horizontal scroll** | ✅ | `overflow-x-auto scrollbar-hide` on TabBar |

### What's Missing

| Feature | Priority | Impact |
|---------|:--------:|--------|
| Bottom tab bar | P1 | Primary mobile nav — thumb-reachable, always visible |
| Swipe gesture on drawer | P2 | Expected mobile UX pattern |
| Condensed breadcrumbs | P2 | Full breadcrumb chain wastes mobile space |
| Mobile-optimized Quick Create | P3 | FAB pattern instead of dropdown |

---

## Recommended Mobile Navigation Architecture

### Primary Navigation: Bottom Tab Bar

```
┌──────────────────────────────────────────────────┐
│                                                    │
│                  [Page Content]                     │
│                                                    │
│                                                    │
├──────────────────────────────────────────────────┤
│  🏠        📋        📅        ✉️        ☰        │
│  Home     Tasks    Calendar  Messages   More      │
└──────────────────────────────────────────────────┘
```

#### Component Specification

```typescript
// src/components/layouts/mobile-tab-bar.tsx

interface MobileTabBarProps {
  className?: string;
}

interface MobileTab {
  id: string;
  label: string;
  icon: LucideIcon;
  activeIcon: LucideIcon;   // Filled variant for active state
  path: string;
  badge?: number;
}

const MOBILE_TABS: MobileTab[] = [
  { id: 'home',     label: 'Home',     icon: Home,         activeIcon: Home,         path: '/dashboard' },
  { id: 'tasks',    label: 'Tasks',    icon: CheckSquare,  activeIcon: CheckSquare,  path: '/home/tasks' },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays, activeIcon: CalendarDays, path: '/calendar' },
  { id: 'messages', label: 'Messages', icon: Mail,         activeIcon: Mail,         path: '/messages' },
  { id: 'more',     label: 'More',     icon: Menu,         activeIcon: Menu,         path: '#more' },
];
```

**Responsive Behavior:**
- Visible only at `< BREAKPOINTS.lg` (below 1024px)
- Fixed at bottom of viewport (`position: fixed; bottom: 0`)
- Height: 60px (adequate for thumb targets)
- Safe area padding: `padding-bottom: env(safe-area-inset-bottom)` for notched devices
- Z-index: `z-50` (above content, below modals)

**Touch Targets:**
- Each tab item: minimum 48×48px (WCAG 2.5.8)
- Centered icon (20px) + label (11px) stacked vertically
- Active state: filled icon + primary color + slight scale (1.05)

**"More" Tab:**
- Opens the existing sidebar drawer (reuses `setOpen(true)`)
- Shows full navigation in drawer format
- Badge count if any notification/approval items need attention

**ARIA:**
```html
<nav role="navigation" aria-label="Mobile navigation">
  <button role="tab" aria-selected="true" aria-label="Home">
  <button role="tab" aria-selected="false" aria-label="Tasks">
  <!-- ... -->
</nav>
```

---

### Secondary Navigation: Drawer (Existing, Enhanced)

**Current drawer remains as-is**, triggered by "More" tab or hamburger icon. Enhancements:

| Enhancement | Details |
|-------------|---------|
| **Swipe-to-close** | Detect `touchstart` / `touchmove` / `touchend` — if swipe-left velocity > threshold, close drawer |
| **Edge-swipe-to-open** | Detect right-swipe from left edge (within 20px) to open drawer |
| **Haptic feedback** | Vibrate briefly on open/close (via `navigator.vibrate(10)` if supported) |
| **Reduced motion** | All gestures work but skip animations when `prefers-reduced-motion` is set |

---

### Page-Level Tabs: Mobile Adaptation

#### ≤ 4 Tabs: Show All Horizontally

```
┌──────────────────────────────────────┐
│ [Overview]  [Crew]  [Budget]  [Docs] │
└──────────────────────────────────────┘
```

- All tabs visible
- Active tab has underline indicator
- Equal width distribution

#### 5+ Tabs: Horizontal Scroll with Indicators

```
┌──────────────────────────────────────┐
│ ◀ [Crew]  [Tasks]  [Schedule]  [Bu ▶ │
└──────────────────────────────────────┘
```

- Fade gradient on overflowing edges
- Active tab auto-scrolled into view on mount
- Momentum scrolling (`-webkit-overflow-scrolling: touch`)

**Existing implementation already handles this** via `overflow-x-auto scrollbar-hide`.

Enhancement: Add fade indicators to show overflow direction.

---

### Context Navigation: Mobile

| Feature | Mobile Behavior |
|---------|----------------|
| **Breadcrumbs** | Show only `parent > current` (not full chain). Truncate if > 30 characters |
| **Back button** | Always visible in header/toolbar: "← [Parent Label]" |
| **Command palette** | Accessible via search icon in header (same as desktop) |
| **Quick actions** | FAB (Floating Action Button) in bottom-right, 56×56px, above tab bar |

#### FAB Specification

```
When on a contextual page (e.g., Event list):

     ┌────────────────────────────────┐
     │        [Page Content]          │
     │                                │
     │                                │
     │                          ⊕     │
     │                        (FAB)   │
     ├────────────────────────────────┤
     │ 🏠   📋   📅   ✉️   ☰        │
     └────────────────────────────────┘
```

- Position: `fixed`, `bottom: 80px` (above tab bar), `right: 16px`
- Size: 56×56px, rounded-full
- Icon: `Plus` by default, changes based on context
- Action: Opens a mini quick-create menu relevant to current page
- Hide on scroll-down, show on scroll-up (reduces visual noise)
- Animation: Spring scale-in on mount, rotate 45° to "×" when open

---

### Entity Context: Mobile

When inside an entity detail (e.g., `/events/[id]`):

```
┌──────────────────────────────────────┐
│ ← Events    "MMW 2026"    ⋯ Actions │
├──────────────────────────────────────┤
│ [Overview] [Crew] [Tasks] [Budget ▶  │
├──────────────────────────────────────┤
│                                      │
│           [Tab Content]              │
│                                      │
├──────────────────────────────────────┤
│ 🏠   📋   📅   ✉️   ☰             │
└──────────────────────────────────────┘
```

- Entity tabs replace page-level content (scrollable horizontal)
- Bottom tab bar remains for global navigation
- "← [Parent]" back button in header for hierarchy nav
- Entity name in header (truncated to ~20 chars)
- Action menu (⋯) for entity-level actions

---

## Implementation Checklist

| # | Component | File | Priority | Effort |
|---|-----------|------|:--------:|:------:|
| 1 | `MobileTabBar` | `src/components/layouts/mobile-tab-bar.tsx` [NEW] | P1 | Medium |
| 2 | Layout integration | `src/app/(dashboard)/layout.tsx` [MODIFY] | P1 | Low |
| 3 | Tab bar fade indicators | `src/components/ui/tab-bar.tsx` [MODIFY] | P2 | Low |
| 4 | Swipe gesture handler | `src/hooks/use-swipe-gesture.ts` [NEW] | P2 | Medium |
| 5 | Drawer swipe integration | `src/components/layouts/sidebar.tsx` [MODIFY] | P2 | Low |
| 6 | Condensed breadcrumbs | `src/components/layouts/topbar.tsx` [MODIFY] | P2 | Low |
| 7 | Mobile FAB | `src/components/layouts/mobile-fab.tsx` [NEW] | P3 | Medium |
| 8 | Mobile back button | `src/components/layouts/topbar.tsx` [MODIFY] | P2 | Low |

---

## Breakpoint Strategy

| Breakpoint | Navigation Pattern |
|:----------:|-------------------|
| **≥ 1024px** (lg) | Full sidebar (expanded/collapsed) + topbar |
| **768–1023px** (md) | Collapsed sidebar (icon-only) + topbar + bottom tab bar |
| **< 768px** (sm) | No sidebar visible + topbar + bottom tab bar + "More" drawer |

**Transition behavior:**
- Bottom tab bar fades in at `< lg` breakpoint
- Sidebar auto-collapses at `md`, auto-hides at `sm`
- All transitions: 200ms ease-out, `prefers-reduced-motion` respected
