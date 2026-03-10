# UI Audit — Batch 2: Layout & Shell Components

**Audit Date:** 2025-01-XX
**Auditor:** Cascade AI
**Files Audited:** 12
**Interactive Elements Found:** 94
**Findings:** 18

---

## Scope

| # | File | Lines |
|---|------|-------|
| 1 | `src/components/layouts/sidebar.tsx` | 638 |
| 2 | `src/components/layouts/topbar.tsx` | 1076 |
| 3 | `src/components/layouts/page-shell.tsx` | 86 |
| 4 | `src/components/layouts/detail-layout.tsx` | 226 |
| 5 | `src/components/layouts/form-layout.tsx` | 155 |
| 6 | `src/components/layouts/split-layout.tsx` | 67 |
| 7 | `src/components/layouts/empty-state.tsx` | 73 |
| 8 | `src/components/layouts/loading-state.tsx` | 95 |
| 9 | `src/app/(dashboard)/layout.tsx` | 86 |
| 10 | `src/components/accessibility/skip-link.tsx` | 55 |
| 11 | `src/components/context-switcher/popover.tsx` | 318 |
| 12 | `src/components/context-switcher/org-switcher.tsx` | 93 |

---

## 1. Interactive Elements Inventory

### sidebar.tsx (638 lines)

| Line(s) | Element | Type | Handler / Wiring | A11y |
|---------|---------|------|-----------------|------|
| ~various | Sidebar container | `<aside>` | — | `role="complementary"`, `id="main-navigation"`, `aria-label` |
| ~various | Mobile drawer overlay | `<div>` | `onClick → setOpen(false)` | `aria-hidden="true"` |
| ~various | Sidebar close (mobile) | `<button>` | `onClick → setOpen(false)` | `aria-label="Close navigation"` |
| ~various | Search input | `<input>` | `onChange → setFilterQuery`, deferred | `aria-label`, `placeholder` |
| ~various | Clear search | `<button>` | `onClick → setFilterQuery("")` | `aria-label="Clear search"` |
| ~various | Nav items (each) | `<Link>` / `<button>` | `onClick` (expand children) | `aria-current="page"`, `aria-expanded` |
| ~various | Pin action (each item) | `<button>` | `onClick → togglePin` | CSS-only visibility on hover |
| ~various | Child expand/collapse | `<button>` | `onClick → toggle userClosed` | `aria-expanded`, chevron rotation |
| ~various | Collapse toggle | `<button>` | `onClick → setCollapsed` | `aria-label`, keyboard shortcut `[` |
| ~various | OrgSwitcher | component | — | Delegates to ContextSwitcherPopover |
| ~various | TeamSwitcher | component | — | Delegates to ContextSwitcherPopover |

### topbar.tsx (1076 lines)

| Line(s) | Element | Type | Handler / Wiring | A11y |
|---------|---------|------|-----------------|------|
| 898–903 | Header | `<header>` | — | `role="banner"` |
| 908–921 | Mobile menu toggle | `<button>` | `onClick → setOpen(true)` | `aria-label`, `aria-controls`, `aria-expanded` |
| 936–997 | Breadcrumb nav | `<nav>` | — | `aria-label="Breadcrumb"` |
| 940 | Breadcrumb list | `<ol>` | — | Semantic list |
| 949–972 | Ellipsis dropdown (collapsed crumbs) | `<DropdownMenu>` | `onClick → router.push` | `aria-label="Show collapsed breadcrumbs"` |
| 973–979 | Current page crumb | `<span>` | — | `aria-current="page"` |
| 981–989 | Breadcrumb links | `<Link>` | navigation | Focus ring |
| 996 | EntityBreadcrumb | component | — | Context-aware switcher crumbs |
| 1006–1020 | Command bar trigger | `<button>` | `onClick → openCommandBar` | `aria-label="Search or type a command"` |
| 1025–1031 | Mobile search trigger | `TopbarIconButton` | `onClick → openCommandBar` | `aria-label="Search"` |
| 1034 | ConnectionIndicator | component | — | Status indicator |
| 1038 | QuickCreateMenu | component | `userRole` prop | RBAC-filtered actions |
| 1042 | NotificationBell | component | — | Badge count |
| 1046 | MessagesMenu | component | — | — |
| 1051 | Settings link | `TopbarIconButton` | `href="/settings"` | `aria-label="Settings"` |
| 1056 | HelpMenu | component | — | — |
| 1061 | LocaleSwitcher | component | — | Locale selection |
| 1065 | ThemeSwitcher | component | — | Theme toggle |
| 1068 | OverflowMenu | component | — | Tablet/mobile overflow |
| 1071 | UserMenu | component | — | User profile dropdown |
| 1023 | Global actions nav | `<nav>` | — | `aria-label="Global actions"` |

### page-shell.tsx (86 lines)

| Line(s) | Element | Type | Handler / Wiring | A11y |
|---------|---------|------|-----------------|------|
| — | PageHeader | component | `actions` slot | — |
| — | TabBar | component | `onValueChange` | ARIA tab pattern |
| — | Tab panel container | `<div>` | — | `role="tabpanel"`, `aria-labelledby`, `id` |

### detail-layout.tsx (226 lines)

| Line(s) | Element | Type | Handler / Wiring | A11y |
|---------|---------|------|-----------------|------|
| — | Back link | `<Link>` | navigation | `aria-label` |
| — | Status badge | `<StatusBadge>` | — | — |
| — | Action buttons | `Button[]` | via `actions` prop | — |
| — | Overflow menu trigger | `<button>` | `onClick → toggle menuOpen` | `aria-haspopup="menu"`, `aria-expanded` |
| — | Overflow menu items | `<button>` | `onClick` per item | `role="menuitem"` |
| — | TabBar | component | `onValueChange` | ARIA tab pattern |
| — | Messaging button | `<button>` | `onClick → toggle messaging` | `aria-label="Open messages"` |
| — | Keyboard handler (Escape) | `useEffect` | `document.keydown` | Closes overflow menu |
| — | Click outside handler | `useEffect` | `document.mousedown` | Closes overflow menu |

### form-layout.tsx (155 lines)

| Line(s) | Element | Type | Handler / Wiring | A11y |
|---------|---------|------|-----------------|------|
| 65–71 | Back link | `<Link>` | navigation | — |
| 82 | Form element | `<form>` | `onSubmit` prop | `ref` for programmatic submit |
| 49–60 | Cmd+S keyboard shortcut | `useEffect` | `document.keydown` → `requestSubmit` | — |
| 94–101 | Cancel button (callback) | `<Button>` | `onClick → onCancel` | `type="button"` |
| 103–110 | Cancel button (link) | `<Button asChild>` | `<Link>` to `backHref` | — |
| 112–118 | Submit button | `<Button>` | `type="submit"` | `disabled` when invalid or submitting |
| 89–90 | ⌘S hint | `<kbd>` | — | Hidden on mobile (`hidden sm:block`) |

### split-layout.tsx (67 lines)

| Line(s) | Element | Type | Handler / Wiring | A11y |
|---------|---------|------|-----------------|------|
| 26–37 | List panel | `<div>` | — | `role="region"`, `aria-label="List panel"` |
| 41–62 | Detail panel | `<div>` | — | `role="region"`, `aria-label="Detail panel"` |
| 48–57 | Back button (mobile) | `<button>` | `onClick → onBack` | `aria-label="Back to list"` |

### empty-state.tsx (73 lines)

| Line(s) | Element | Type | Handler / Wiring | A11y |
|---------|---------|------|-----------------|------|
| 34–70 | Container | `<div>` | — | `role="status"` |
| 59–61 | Secondary action | `<Button>` | `onClick` | — |
| 63–66 | Primary action | `<Button>` | `onClick` | — |

### loading-state.tsx (95 lines)

| Line(s) | Element | Type | Handler / Wiring | A11y |
|---------|---------|------|-----------------|------|
| 23 | Page loading | `<div>` | — | `role="status"`, `aria-busy="true"`, `aria-label` |
| 34 | SR-only text | `<span>` | — | `className="sr-only"` — "Loading..." |
| 41 | Card loading | `<div>` | — | `role="status"`, `aria-busy="true"` |
| 52 | List loading | `<div>` | — | `role="status"`, `aria-busy="true"` |
| 70 | Table loading | `<div>` | — | `role="status"`, `aria-busy="true"` |
| 93 | Skeleton | `<div>` | — | `aria-hidden="true"` |

### layout.tsx (86 lines — dashboard)

| Line(s) | Element | Type | Handler / Wiring | A11y |
|---------|---------|------|-----------------|------|
| — | SkipLinks | component | — | WCAG 2.4.1 skip navigation |
| — | ErrorBoundary | component | — | Catches render errors |
| — | Sidebar | component | — | See sidebar.tsx |
| — | Topbar | component | — | See topbar.tsx |
| — | Main content | `<main>` | — | `id="main-content"`, `role="main"` |
| — | Shell content | `<div>` | — | `id="shell-main-content"` (inert target for mobile drawer) |
| — | MessagingPanel | component | conditional render | — |

### skip-link.tsx (55 lines)

| Line(s) | Element | Type | Handler / Wiring | A11y |
|---------|---------|------|-----------------|------|
| 20–38 | SkipLink | `<a>` | `href` anchor | `sr-only focus:not-sr-only`, WCAG 2.4.1 |
| 50 | Skip to main content | `<SkipLink>` | `href="#main-content"` | — |
| 51 | Skip to navigation | `<SkipLink>` | `href="#main-navigation"` | — |

### context-switcher/popover.tsx (318 lines)

| Line(s) | Element | Type | Handler / Wiring | A11y |
|---------|---------|------|-----------------|------|
| 163–178 | Trigger wrapper | `<div>` | `onClick/onKeyDown → openPopover` | `role="button"`, `tabIndex=0`, `aria-haspopup="listbox"`, `aria-expanded` |
| 197–223 | Search input | `<input>` | `onChange → setQuery` | `aria-label` |
| 210–219 | Clear search button | `<button>` | `onClick → setQuery("")` | `aria-label` |
| 227–281 | List | `<div>` | — | `role="listbox"`, `aria-label` |
| 259–277 | Option items | `<div>` | `onClick → handleSelect`, `onMouseEnter → setFocusIndex` | `role="option"`, `aria-selected` |
| 107–138 | Keyboard navigation | `handleKeyDown` | ArrowUp/Down/Enter/Escape | Full keyboard support |
| 287–300 | Create link | `<a>` | `onClick → onCreateClick` | — |
| 302–309 | View all link | `<a>` | `onClick → closePopover` | — |

### context-switcher/org-switcher.tsx (93 lines)

| Line(s) | Element | Type | Handler / Wiring | A11y |
|---------|---------|------|-----------------|------|
| 77–91 | ContextSwitcherPopover | component | `onSelect → switchOrg` | RBAC-gated `canCreate` |
| 36–55 | Trigger | `<div>` | — | Org initials avatar + name + chevron |

---

## 2. State Management

| Component | State Mechanism | Key State Variables |
|-----------|----------------|---------------------|
| **sidebar.tsx** | Zustand (`useSidebar`) — selector-based | `isOpen`, `isCollapsed`, `isMobile`, `filterQuery`, `pinnedItems` |
| **topbar.tsx** | React hooks + `useAuth` | `isScrolled`, `shrunkHeight`, `isMobile`, breadcrumbs derived from pathname + nav config |
| **page-shell.tsx** | Props only + `useId()` | Tab state via props; unique ID for ARIA |
| **detail-layout.tsx** | `useState` | `menuOpen` (overflow menu) |
| **form-layout.tsx** | Props + `useRef` | `formRef` for programmatic submit; `isSubmitting`, `isValid` via props |
| **split-layout.tsx** | Props only | `showDetail`, `onBack` via props |
| **empty-state.tsx** | Props only | — |
| **loading-state.tsx** | Props only | `variant`, `rows` |
| **layout.tsx** | Zustand (`useSidebar`) + `useMediaQuery` | `isCollapsed`, `isMobile`, `isOpen` |
| **popover.tsx** | `useState` | `open`, `query`, `focusIndex` |
| **org-switcher.tsx** | `useAuth` context | `memberships`, `activeOrg`, `switchOrg` |

---

## 3. Error Handling

| Component | Error Pattern |
|-----------|--------------|
| **layout.tsx** | `<ErrorBoundary>` wraps main content |
| **sidebar.tsx** | No explicit error handling; relies on upstream data |
| **topbar.tsx** | Breadcrumb generation has fallback ("Dashboard") |
| **form-layout.tsx** | `isValid`/`isSubmitting` disable submit; no error display in layout itself |
| **detail-layout.tsx** | No explicit error handling |
| **popover.tsx** | `isLoading` state shows spinner; `emptyMessage` for no results |

---

## 4. Findings

### Critical

| # | Component | Finding | Impact |
|---|-----------|---------|--------|
| C1 | `confirm-dialog.tsx` (used in layouts) | **No focus trap in confirm dialog** — Tab can escape the `alertdialog` to background content. `autoFocus` on confirm button helps but is insufficient for WCAG 2.4.3. | Users can interact with obscured content while modal is open | ✅ **REMEDIATED** — Component now uses `useFocusTrap`, `useFocusReturn`, and `useEscapeKey` hooks. See also Batch 3 C3. |

### High

| # | Component | Finding | Impact |
|---|-----------|---------|--------|
| H1 | `popover.tsx` | **No focus trap** — Open popover allows Tab to escape to page content behind it. Only Escape/click-outside close it. | Keyboard users may lose context |
| H2 | `detail-layout.tsx` | **Overflow menu has no `role="menu"`** — Menu items have `role="menuitem"` but the wrapping container lacks `role="menu"`. | Screen readers can't announce menu structure |
| H3 | `form-layout.tsx` | **Back link missing `aria-label`** — Generic "Back" text without context of destination. | Low-context for screen readers |
| H4 | `split-layout.tsx` | **Back button uses inline SVG without `role="img"` or `aria-hidden`** — SVG icon is decorative but not marked as such. | Potential screen reader noise |

### Medium

| # | Component | Finding | Impact |
|---|-----------|---------|--------|
| M1 | `sidebar.tsx` | **Mobile drawer doesn't explicitly set `aria-modal="true"`** — Body scroll lock + `inert` on shell content are present, but the drawer itself lacks the `aria-modal` attribute. | Some screen readers may not announce modality |
| M2 | `topbar.tsx` | **EntityBreadcrumb switchers don't collapse gracefully on very small screens** — `hidden sm:flex` on breadcrumb nav but entity crumbs render inside it without additional breakpoint guards. | Potential overflow on small screens |
| M3 | `detail-layout.tsx` | **Keyboard navigation on overflow menu is incomplete** — Escape closes menu, but no ArrowUp/ArrowDown between menu items. | Reduced keyboard usability |
| M4 | `popover.tsx` | **Hardcoded `id="select-listbox"` concern** — While this is in `popover.tsx` not `select.tsx`, the pattern of hardcoded IDs risks collisions if multiple instances render. | Potential ARIA `id` conflicts |
| M5 | `form-layout.tsx` | **`collapsible` and `defaultOpen` props on `FormSection` are declared but not implemented** — Props are in the interface but the component body ignores them. | Dead code / unimplemented feature |
| M6 | `empty-state.tsx` | **Action buttons lack accessible names beyond their labels** — If labels are short (e.g., "Create"), screen readers lack context for *what* is being created. | Reduced context for assistive tech |

### Low

| # | Component | Finding | Impact |
|---|-----------|---------|--------|
| L1 | `loading-state.tsx` | **Shimmer animation class `animate-shimmer` assumed** — Class is not a standard Tailwind utility; must be defined in `globals.css`. If missing, loading states show static blocks. | Silent visual regression risk |
| L2 | `skip-link.tsx` | **Skip link uses `transition-none`** — Intentional to prevent animation flash, but could be controlled via `motion-reduce:` instead for consistency. | Minor consistency gap |
| L3 | `topbar.tsx` | **Scroll shrink effect uses `useCallback` with `requestAnimationFrame` but no throttle** — High-frequency scroll events could cause layout thrashing on low-power devices. | Performance concern on older hardware |
| L4 | `org-switcher.tsx` | **Single-org fallback renders non-interactive identical UI** — When user has exactly 1 org and can't create, the trigger renders without any interactive cue, which is correct UX but could benefit from a tooltip explaining why it's not switchable. | Minor UX clarity |
| L5 | `context-switcher/popover.tsx` | **`role="dialog"` on popover but content is a listbox** — The popover has `role="dialog"` wrapping a `role="listbox"`. While technically valid (dialog containing listbox), some screen readers may over-announce. | Minor ARIA verbosity |
| L6 | `form-layout.tsx` | **Cmd+S shortcut not discoverable for screen reader users** — Hint is visually present via `<kbd>` but hidden on small screens and not announced. | Discoverability gap |

---

## 5. Summary

| Metric | Count |
|--------|-------|
| **Files audited** | 12 |
| **Interactive elements** | 94 |
| **Critical findings** | 1 |
| **High findings** | 4 |
| **Medium findings** | 6 |
| **Low findings** | 6 |
| **Total findings** | 17 |

### Strengths
- **Excellent ARIA landmark structure** — `role="banner"`, `role="complementary"`, `role="main"`, `aria-label` on nav regions
- **Skip links** implemented per WCAG 2.4.1
- **Zustand selector-based subscriptions** prevent unnecessary re-renders
- **Mobile drawer modality** — scroll lock + `inert` on shell content
- **Keyboard shortcut support** — `[` for sidebar collapse, `Cmd+S` for form submit, `Cmd+K` for command bar
- **Loading states** have proper `role="status"` + `aria-busy` + `sr-only` text
- **Tab components** use full ARIA tab pattern with arrow key navigation

### Key Recommendations
1. **Add focus traps** to `ConfirmDialogProvider` and `ContextSwitcherPopover`
2. **Add `role="menu"` container** to detail-layout overflow menu
3. **Implement `collapsible`/`defaultOpen`** on `FormSection` or remove from interface
4. **Add `aria-modal="true"`** to sidebar mobile drawer
5. **Add ArrowUp/ArrowDown keyboard navigation** to detail-layout overflow menu
