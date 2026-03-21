# 🧭 WAYFINDER — Restructure Specification

**Prompt Code:** `FP-UX-WAYFINDER-001` · **Phase 7.1** · **Date:** 2026-03-21

---

## Overview

This document provides component-level specifications for every navigation change recommended by the WAYFINDER audit. Changes are ordered by priority and grouped by the WAYFINDER restructuring pattern they implement.

---

## R1: Split Admin Section (Pattern 1 — Progressive Disclosure)

### Problem
Admin section has **18 top-level items** — more than double Miller's Law limit.

### Proposed Restructuring

**Before (1 section, 18 items):**
```
Admin (18 items)
├── Users, Invitations, Roles, Teams, Org Chart, People
├── Access Reviews, Audit Log, Knowledge Base, SOPs, Vault
├── Settings (+ 6 children), Tags, Integrations (+ 2), Credentials (+ 1)
├── Client Portal, Vendor Portal, System Health, Data Export
```

**After (2 sections, 9 items each):**
```
Admin (9 items)
├── Users
├── Invitations
├── Roles
├── Teams
├── Org Chart
├── People
├── Access Reviews
├── Audit Log
└── Settings (+ 6 children)

Platform (9 items)
├── Knowledge Base
├── SOPs
├── Vault
├── Tags
├── Integrations (+ 2 children)
├── Credentials (+ 1 child)
├── Client Portal
├── Vendor Portal
├── System Health
└── Data Export
```

### Implementation

#### [MODIFY] [navigation.ts](file:///Users/julianclarkson/Documents/FrozenPhoenix/src/config/navigation.ts)

Split the `Admin` NavSection into two: `Admin` (user/org management, settings) and `Platform` (infrastructure, integrations, portals, data).

**State Management:**
- No component changes — `navigation.ts` config drives rendering
- Both sections `defaultExpanded: false`

**URL Strategy:**
- No URL changes — all routes remain the same

---

## R2: Split Workforce Section (Pattern 1 — Progressive Disclosure)

### Problem
Workforce has **13 top-level items** mixing crew scheduling and vendor management.

### Proposed Restructuring

**After (2 sections):**
```
Crew & Scheduling (8 items)
├── Crew
├── Shifts
├── Availability
├── Resource Planner
├── Time Tracking (+ 3 children)
├── Time Off (+ 1 child)
├── Certifications
└── Workforce HR (+ 3 children)

Vendors (5 items)
├── Vendors
├── Vendor Onboarding
├── Vendor Compliance
├── Work Orders
└── Vendor Reviews
```

### Implementation

#### [MODIFY] [navigation.ts](file:///Users/julianclarkson/Documents/FrozenPhoenix/src/config/navigation.ts)

Split the `Workforce` NavSection into `Crew & Scheduling` and `Vendors`.

---

## R3: Entity Detail Sub-Navigation (Pattern 3 — Contextual Sidebar)

### Problem
Event and Project detail pages have 6 tabs — at the threshold for sidebar sub-navigation.

### Proposed Architecture

```
When user navigates to /events/[id]:

SIDEBAR MORPHS FROM:                     TO:
┌─────────────────────┐     ┌─────────────────────┐
│ Home                │     │ ← Back to Events    │
│ Business            │     │ Event: "MMW 2026"   │
│ Production ◄ active │     ├─────────────────────┤
│ Operations          │     │ Overview             │
│ Workforce           │     │ Crew                 │
│ ...                 │     │ Tasks                │
│                     │     │ Schedule             │
│                     │     │ Budget               │
│                     │     │ Documents            │
│                     │     │ Settings             │
└─────────────────────┘     └─────────────────────┘
```

### Component Specification

#### [NEW] EntitySidebarContext

```typescript
interface EntitySidebarProps {
  entityType: 'event' | 'project';
  entityId: string;
  entityName: string;
  backLabel: string;       // "← Back to Events"
  backPath: string;        // "/events"
  tabs: EntityTab[];
}

interface EntityTab {
  id: string;              // "crew", "budget", etc.
  label: string;
  icon: LucideIcon;
  path: string;            // "/events/[id]/crew"
  permission?: string;
}
```

**Responsive Behavior:**
- Desktop: Sidebar morphs to entity context (same width)
- Mobile: Bottom tab bar shows entity tabs; drawer shows global nav

**Animation:**
- Sidebar morph: 250ms slide transition
- Items cross-fade during transition

**ARIA:**
- `aria-label="Event navigation"` on contextual sidebar
- `aria-current="page"` on active entity tab
- "← Back to Events" has `role="link"`

**URL Strategy:**
```
/events/[id]           → Overview (default)
/events/[id]/crew      → Crew tab
/events/[id]/tasks     → Tasks tab
/events/[id]/schedule  → Schedule tab
/events/[id]/budget    → Budget tab
/events/[id]/documents → Documents tab
/events/[id]/settings  → Event settings
```

Each gets its own `page.tsx`, `loading.tsx`, and `error.tsx`.

**State Management:**
- Entity sidebar context stored in URL path (not component state)
- Sidebar detects entity context from pathname regex: `/\/(events|projects)\/[^/]+\//`
- Global nav remains accessible via collapsed icon bar or hamburger menu

---

## R4: URL-Based Tab State

### Problem
Tab state is ephemeral — not reflected in URL, not bookmarkable, not shareable.

### Proposed Implementation

#### [MODIFY] [tab-bar.tsx](file:///Users/julianclarkson/Documents/FrozenPhoenix/src/components/ui/tab-bar.tsx)

Add optional `urlParam` prop to TabBar:

```typescript
interface TabBarProps {
  // ... existing props
  urlParam?: string;  // e.g., "tab" → syncs with ?tab=value in URL
}
```

**Behavior:**
- When `urlParam` is set, `onValueChange` updates URL search params via `useRouter`
- Initial value reads from `searchParams.get(urlParam)` ?? first tab
- URL updates use `router.replace()` (not `push`) to avoid cluttering history

**State Persistence:**
- Additionally persist to `localStorage` as fallback: `fp-tab-{page-key}: {tabId}`
- URL takes precedence over localStorage

---

## R5: Deduplicate Icons

### Problem
5+ icons duplicated across sections — confusing in collapsed sidebar mode.

### Implementation

#### [MODIFY] [navigation.ts](file:///Users/julianclarkson/Documents/FrozenPhoenix/src/config/navigation.ts)

| Item | Current Icon | Proposed Icon | Rationale |
|------|-------------|---------------|-----------|
| Shifts | `CalendarDays` | `Clock` | Time-oriented, distinct from Calendar |
| Availability | `CalendarDays` | `CalendarCheck` | Availability = confirmed calendar |
| Financial Periods | `CalendarDays` | `CalendarRange` | Date ranges, not daily calendar |
| Vendor Reviews | `Star` | `MessageSquareMore` | Reviews = feedback |
| Purchase Orders (Resources) | `ShoppingCart` | `ClipboardList` | Distinguish from Procurement |
| SOPs | `Layers` | `FileStack` or `BookMarked` | Distinguish from BOMs/Tags |

---

## R6: Rename Ambiguous Labels

#### [MODIFY] [navigation.ts](file:///Users/julianclarkson/Documents/FrozenPhoenix/src/config/navigation.ts)

| Current Label | Proposed Label | Rationale |
|--------------|---------------|-----------|
| Advancing | Advance Orders | Industry jargon → self-explanatory |
| Contacts → /companies | Companies | Align label with route |
| Tasks (Home) | My Tasks | Distinguish from Production Tasks |
| Documents (Home) | My Documents | Distinguish from Operations Documents |
| Insights | Analytics | More universally understood |
| Workforce (item within section) | HR | Avoid self-referential label |

---

## R7: Persist Section Collapse State

#### [MODIFY] [use-sidebar.ts](file:///Users/julianclarkson/Documents/FrozenPhoenix/src/hooks/use-sidebar.ts)

Add `expandedSections` to the Zustand store with `persist` middleware:

```typescript
interface SidebarState {
  // ... existing
  expandedSections: Record<string, boolean>;
  setExpandedSection: (title: string, expanded: boolean) => void;
}
```

Persist to `localStorage` under key `fp-sidebar-sections`.

#### [MODIFY] [sidebar.tsx](file:///Users/julianclarkson/Documents/FrozenPhoenix/src/components/layouts/sidebar.tsx)

Replace component-local `expandedSections` useState with Zustand store state.

---

## R8: Add Recent Items Section

#### [MODIFY] [use-sidebar.ts](file:///Users/julianclarkson/Documents/FrozenPhoenix/src/hooks/use-sidebar.ts)

Add `recentItems` to the Zustand store:

```typescript
interface RecentItem {
  path: string;
  title: string;
  icon: string;       // Lucide icon name
  entityType: string;  // "event", "crew", "task", etc.
  visitedAt: number;
}

interface SidebarState {
  recentItems: RecentItem[];
  addRecentItem: (item: Omit<RecentItem, 'visitedAt'>) => void;
}
```

**Rules:**
- Maximum 5 recent items
- Auto-expire after 7 days
- Displayed below Favorites, above sections
- Collapsible
- Entity type icon shown for quick scanning

---

## Priority Summary

| # | Change | Priority | Effort | Impact |
|---|--------|:--------:|:------:|:------:|
| R1 | Split Admin section | **P1** | Low | High — reduces 18→9 items |
| R2 | Split Workforce section | **P1** | Low | High — reduces 13→8+5 items |
| R3 | Entity detail sub-nav | **P1** | High | Critical — eliminates 6-tab pages, adds URL routing |
| R4 | URL-based tab state | **P1** | Medium | High — enables bookmarking/sharing |
| R5 | Deduplicate icons | **P2** | Low | Medium — reduces misclick risk |
| R6 | Rename labels | **P2** | Low | Medium — improves label clarity |
| R7 | Persist section state | **P2** | Low | Medium — eliminates reset frustration |
| R8 | Add recent items | **P3** | Medium | Medium — reduces repeated navigation |
