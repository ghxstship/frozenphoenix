# Context Switcher Architecture Plan

> **Goal:** Give users Vercel-style ability to switch Organizations, Teams, Clients, Projects, and Activations from the sidebar and topbar, integrated with breadcrumbs.

---

## 1. Current State Audit

### What Exists

| Layer | Status | Details |
|-------|--------|---------|
| **Org switching** | PARTIAL | `auth-context.tsx` exposes `memberships`, `activeOrg`, `switchOrg()`. Persisted to `localStorage`. |
| **Org UI** | BURIED | Org switcher is nested inside `UserMenu` dropdown (topbar, right side) — not discoverable. |
| **Breadcrumbs** | STATIC | Derived from `navigationConfig` SSOT — shows section/page path only. No entity context. |
| **Project context** | NONE | No global "active project" concept. Each page fetches its own project by route `[id]`. |
| **Activation context** | NONE | Same as projects — route-scoped only. |
| **Team context** | NONE | No `teams` table exists in DB. `organizations` is the only grouping entity. |
| **Client context** | NONE | `companies` table exists (with `company_type` = client/brand/agency/vendor/partner) but no global filter. |
| **Sidebar header** | LOGO ONLY | Shows brand logo + name + collapse toggle. No entity switchers. |

### DB Schema Available

| Entity | Table | Key Columns | Org-Scoped |
|--------|-------|-------------|------------|
| Organization | `organizations` | id, name, slug, logo_url | N/A (root) |
| Org Membership | `org_memberships` | user_id, organization_id, role, status, is_default_org | Yes |
| Project | `projects` | id, name, client, status, organization_id | Yes |
| Activation | `activations` | id, name, project_id, status, organization_id | Yes |
| Company (Client) | `companies` | id, name, company_type, status, organization_id | Yes |

### Missing DB Schema

| Entity | Status | Notes |
|--------|--------|-------|
| Teams | **MISSING** | No table. Need `teams` + `team_members` junction. |

---

## 2. Design Concept

### Vercel Model Adapted to FrozenPhoenix

Vercel uses a **two-segment switcher** in the topbar/sidebar header:

```
[ Org ▾ ] / [ Project ▾ ]
```

For FrozenPhoenix, we need a **hierarchical context chain**:

```
[ Org ▾ ] / [ Team ▾ ] / [ Client ▾ ] / [ Project ▾ ] / [ Activation ▾ ]
```

But showing all 5 at once creates cognitive overload. The solution is **progressive disclosure**:

### 2.1 Sidebar Header — Primary Context (Always Visible)

```
┌─────────────────────────────────────────┐
│ [Logo] Org Name ▾     [ ◯ Collapse ]   │
│         Team Name ▾                     │
├─────────────────────────────────────────┤
│ [🔍 Filter nav…]                        │
```

- **Org switcher** — Always visible. Popover with search, list of orgs, "Create Organization" action.
- **Team switcher** — Always visible below org. Shows "All Teams" by default. Popover with search + list.
- Switching org resets team/client/project/activation context.
- Switching team filters the sidebar nav (projects, crew, etc.) to team scope.

### 2.2 Topbar Breadcrumbs — Contextual Depth (Route-Aware)

The breadcrumb bar becomes **entity-aware**, not just nav-aware:

```
Current (nav-only):
  Production > Projects > Project Name

Proposed (entity-aware):
  Acme Corp ▾ > Summer Tour 2026 ▾ > Main Stage ▾ > Tasks
  [client]       [project]           [activation]    [page]
```

Rules:
- **On project pages** (`/projects/[id]/*`): Breadcrumb injects Client > Project before page segment.
- **On activation pages** (`/activations/[id]/*`): Breadcrumb injects Client > Project > Activation.
- **On client pages** (`/companies/[id]/*`): Breadcrumb injects Client.
- Each entity segment is a **clickable switcher** (popover with search + list) — not just a link.
- Clicking a breadcrumb entity switcher navigates to the same page type under the newly selected entity.

### 2.3 Switcher Popover Component (Shared Primitive)

All 5 entity types use the same `ContextSwitcherPopover` component:

```
┌─────────────────────────────────┐
│ 🔍 Find Project…          Esc  │
├─────────────────────────────────┤
│ ● Summer Tour 2026          ✓  │  ← active (checkmark)
│ ○ Winter Gala 2025              │
│ ○ Product Launch Q3             │
│ ○ Brand Activation NYC          │
│ ...                             │
├─────────────────────────────────┤
│ + Create Project                │
│ ⊞ View All Projects             │
└─────────────────────────────────┘
```

Features:
- **Search/filter** with keyboard navigation (↑↓ Enter Esc)
- **Active item** checkmark
- **Grouped** (e.g., orgs by plan tier, projects by status, activations by project)
- **Create action** (respects RBAC `write` permission)
- **View All action** (links to list page)
- **Keyboard shortcut** to open (configurable)
- **Empty state** with illustration
- **Loading state** with skeleton
- **ARIA**: `role="listbox"`, `aria-activedescendant`, `aria-label`
- **Virtualized list** for 50+ items (react-window or native)

---

## 3. Zustand Context Store

### New Store: `use-workspace-context.ts`

```typescript
interface WorkspaceContextState {
  // Active selections (persisted to localStorage per-user)
  activeTeamId: string | null;       // null = "All Teams"
  activeClientId: string | null;     // null = "All Clients"  
  activeProjectId: string | null;    // null = no project context
  activeActivationId: string | null; // null = no activation context

  // Setters (with cascade resets)
  setActiveTeam: (id: string | null) => void;      // resets client/project/activation
  setActiveClient: (id: string | null) => void;     // resets project/activation
  setActiveProject: (id: string | null) => void;    // resets activation
  setActiveActivation: (id: string | null) => void;
  clearAll: () => void;
}
```

**Cascade reset rules:**
- Switching **org** (via existing `switchOrg`) → resets team, client, project, activation
- Switching **team** → resets client, project, activation
- Switching **client** → resets project, activation
- Switching **project** → resets activation

**Persistence:** `zustand/persist` with key `fp-workspace-context-{orgId}` — scoped per org so context doesn't leak.

### Integration with Auth Context

- `switchOrg()` in `auth-context.tsx` triggers `clearAll()` on workspace context store.
- `useOrgId()` hook remains unchanged — still returns `activeOrg.organization_id`.

---

## 4. Data Layer — React Query Hooks

### 4.1 New Hooks Needed

| Hook | Query | Params | Notes |
|------|-------|--------|-------|
| `useTeams` | `teams` | `orgId` | New table |
| `useTeamMembers` | `team_members` | `teamId` | New junction table |
| `useClientsForSwitcher` | `companies` | `orgId`, `teamId?`, `company_type='client'` | Lightweight select: id, name, logo_url |
| `useProjectsForSwitcher` | `projects` | `orgId`, `clientId?`, `teamId?` | Lightweight: id, name, client, status |
| `useActivationsForSwitcher` | `activations` | `projectId` | Lightweight: id, name, type, status |

### 4.2 Lightweight Fetching Strategy

Switcher lists should be **always warm** (prefetched on layout mount) but **lightweight** (select only id + name + status + logo). Not full entity shapes.

```typescript
// Example: projects switcher query
const { data: projects } = useQuery({
  queryKey: ["projects-switcher", orgId, teamId, clientId],
  queryFn: () => supabase
    .from("projects")
    .select("id, name, client, status")
    .eq("organization_id", orgId)
    .order("updated_at", { ascending: false })
    .limit(100),
  staleTime: 30_000,  // 30s — switcher data doesn't need to be real-time
});
```

### 4.3 Filtering Behavior

When `activeProjectId` is set, all data hooks that support `project_id` filtering should use it:
- `useTasks(projectId)` — already supports this
- `useActivations(projectId)` — already supports this
- `useBudgets(projectId)`, `useEvents(projectId)`, etc.

This is **not** a global query middleware — each hook opts in by reading from the workspace context store.

---

## 5. DB Migration — Teams Table

### Migration: `056_teams.sql`

```sql
-- Teams within an organization
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, slug)
);

CREATE INDEX idx_teams_org ON teams(organization_id);

-- Team membership junction
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('lead', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- Link projects to teams (optional — project can exist without team)
ALTER TABLE projects ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
CREATE INDEX idx_projects_team ON projects(team_id);

-- Replace free-text client column with two company FKs
ALTER TABLE projects ADD COLUMN client_company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN organizer_company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
CREATE INDEX idx_projects_client_company ON projects(client_company_id);
CREATE INDEX idx_projects_organizer_company ON projects(organizer_company_id);
ALTER TABLE projects DROP COLUMN IF EXISTS client;

-- Link companies to teams (optional)
ALTER TABLE companies ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
CREATE INDEX idx_companies_team ON companies(team_id);

-- RLS policies
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY teams_read ON teams FOR SELECT
    USING (organization_id = ANY(get_user_org_ids()));

CREATE POLICY teams_write ON teams FOR ALL
    USING (organization_id = ANY(get_user_admin_org_ids()));

CREATE POLICY team_members_read ON team_members FOR SELECT
    USING (team_id IN (
        SELECT id FROM teams WHERE organization_id = ANY(get_user_org_ids())
    ));

CREATE POLICY team_members_write ON team_members FOR ALL
    USING (team_id IN (
        SELECT id FROM teams WHERE organization_id = ANY(get_user_admin_org_ids())
    ));
```

---

## 6. Component Architecture

### 6.1 New Components

| Component | Path | Purpose |
|-----------|------|---------|
| `ContextSwitcherPopover` | `src/components/context-switcher/popover.tsx` | Shared popover primitive (search + list + create + view all) |
| `OrgSwitcher` | `src/components/context-switcher/org-switcher.tsx` | Org-specific switcher (sidebar header) |
| `TeamSwitcher` | `src/components/context-switcher/team-switcher.tsx` | Team-specific switcher (sidebar header) |
| `ClientSwitcher` | `src/components/context-switcher/client-switcher.tsx` | Client-specific switcher (breadcrumbs) |
| `ProjectSwitcher` | `src/components/context-switcher/project-switcher.tsx` | Project-specific switcher (breadcrumbs) |
| `ActivationSwitcher` | `src/components/context-switcher/activation-switcher.tsx` | Activation-specific switcher (breadcrumbs) |
| `EntityBreadcrumb` | `src/components/context-switcher/entity-breadcrumb.tsx` | Breadcrumb segment that renders a switcher on click |
| `index.ts` | `src/components/context-switcher/index.ts` | Barrel export |

### 6.2 ContextSwitcherPopover API

```typescript
interface ContextSwitcherPopoverProps<T extends { id: string; name: string }> {
  items: T[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onClear?: () => void;            // "All X" option
  clearLabel?: string;              // e.g., "All Teams"
  searchPlaceholder?: string;
  createLabel?: string;             // e.g., "Create Team"
  createHref?: string;
  viewAllLabel?: string;            // e.g., "View All Projects"
  viewAllHref?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  renderItem?: (item: T) => React.ReactNode;
  groupBy?: (item: T) => string;   // group key extractor
  trigger: React.ReactNode;         // the button/element that opens the popover
  side?: "bottom" | "right";
  align?: "start" | "center" | "end";
  width?: number | string;
  canCreate?: boolean;              // RBAC gate
}
```

### 6.3 Component Hierarchy

```
DashboardLayout
├── Sidebar
│   ├── SidebarHeader
│   │   ├── OrgSwitcher ← ContextSwitcherPopover<OrgMembership>
│   │   └── TeamSwitcher ← ContextSwitcherPopover<Team>
│   ├── Search
│   └── NavSections (filtered by team/project context)
│
├── Topbar
│   ├── Left: EntityAwareBreadcrumbs
│   │   ├── SectionBadge
│   │   ├── ClientSwitcher (when on client/project/activation pages)
│   │   ├── ProjectSwitcher (when on project/activation pages)
│   │   ├── ActivationSwitcher (when on activation pages)
│   │   └── PageLabel
│   ├── Center: CommandBar
│   └── Right: Actions + UserMenu
```

---

## 7. Modified Files

### 7.1 Sidebar Changes (`src/components/layouts/sidebar.tsx`)

**Before:** Logo + brand name + collapse toggle in header.

**After:** Replace logo area with stacked OrgSwitcher + TeamSwitcher:

```
┌──────────────────────────────────────┐
│ [🏢] GHXSTSHIP ▾        [◀ Collapse]│
│      Production Team ▾               │
├──────────────────────────────────────┤
│ [🔍 Filter nav…]                     │
├──────────────────────────────────────┤
```

- When sidebar is **collapsed**: Show org avatar only (tooltip on hover shows org name). Team is hidden.
- When sidebar is **mobile**: Show full org + team switchers.
- Org switcher reads from `useAuth().memberships` + `activeOrg` + `switchOrg`.
- Team switcher reads from `useTeams(orgId)` + workspace context store.

### 7.2 Topbar Breadcrumb Changes (`src/components/layouts/topbar.tsx`)

**Before:** Static nav-derived breadcrumbs: `Section > Page > Subpage`

**After:** Entity-aware breadcrumbs with switcher popovers:

**Route detection logic:**
```typescript
function detectEntityContext(pathname: string): EntityContext | null {
  // /projects/[id]/* → { type: "project", id }
  // /activations/[id]/* → { type: "activation", id }
  // /companies/[id]/* → { type: "client", id }
  // /events/[id]/* → { type: "event", id }
  const patterns = [
    { pattern: /^\/projects\/([^/]+)/, type: "project" },
    { pattern: /^\/activations\/([^/]+)/, type: "activation" },
    { pattern: /^\/companies\/([^/]+)/, type: "client" },
  ];
  // ...
}
```

**Breadcrumb composition:**
| Route | Breadcrumb Segments |
|-------|-------------------|
| `/projects` | Production > Projects |
| `/projects/[id]` | `Client ▾` > `Project ▾` > Overview |
| `/projects/[id]/tasks` | `Client ▾` > `Project ▾` > Tasks |
| `/activations/[id]` | `Client ▾` > `Project ▾` > `Activation ▾` > Overview |
| `/companies/[id]` | Sales & CRM > `Client ▾` > Overview |
| `/pipeline` | Sales & CRM > Pipeline |
| `/dashboard` | Home > Dashboard |

Each `▾` segment is an `EntityBreadcrumb` component that opens a `ContextSwitcherPopover` on click.

### 7.3 Auth Context Changes (`src/lib/supabase/auth-context.tsx`)

- Add `organizations` field to `OrgMembership` type — ensure it includes `logo_url`.
- On `switchOrg()`, dispatch event or call workspace context `clearAll()`.
- Expose org `logo_url` for sidebar avatar rendering.

### 7.4 Command Bar Integration (`src/components/command-bar.tsx`)

Add context-switching commands:
- "Switch Organization" → opens org switcher
- "Switch Team" → opens team switcher
- "Switch Project" → opens project switcher
- "Switch Client" → opens client switcher

### 7.5 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘⇧O` | Open org switcher |
| `⌘⇧T` | Open team switcher |
| `⌘⇧P` | Open project switcher (when on project pages) |
| `⌘⇧C` | Open client switcher (when on client pages) |

---

## 8. RBAC Integration

| Entity | View Switcher | Create Action | Switch To |
|--------|--------------|---------------|-----------|
| Organization | All users | `exec` only | All users (via org_memberships) |
| Team | All org members | `exec`, `director`, `pm` | All team members |
| Client | All org members | `exec`, `director`, `pm` | All with `companies.read` |
| Project | All org members | `exec`, `director`, `pm` | Members of project via `project_members` or org-wide |
| Activation | All project members | `exec`, `director`, `pm` | All with `activations.read` |

---

## 9. Data Flow Diagram

```
User clicks "Switch Project" in breadcrumb
  ↓
ContextSwitcherPopover opens
  ↓
useProjectsForSwitcher(orgId, teamId?, clientId?) fires
  ↓
User selects "Winter Gala 2025"
  ↓
workspaceContext.setActiveProject("uuid-xxx")
  ↓
Cascade: activeActivationId → null
  ↓
URL navigates: /projects/uuid-xxx (same subpage)
  ↓
Breadcrumbs re-derive from new route + entity data
  ↓
All project-scoped hooks re-fetch with new projectId
```

---

## 10. Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Priority: Critical — unblocks all other phases**

1. **DB Migration** — `056_teams.sql` (teams + team_members + ALTER projects/companies + drop client text column)
2. **Zustand Store** — `src/hooks/use-workspace-context.ts` with cascade resets + persistence
3. **Shared Primitive** — `ContextSwitcherPopover` component with full a11y
4. **Switcher Hooks** — Lightweight React Query hooks for all 5 entities
5. **Types** — `src/types/workspace-context.ts` (Team, TeamMember, SwitcherItem)
6. **i18n** — `src/lib/i18n/context-switcher-strings.ts`

### Phase 2: Sidebar Integration (Week 2-3)

**Priority: High — primary user-facing change**

1. **OrgSwitcher** — Extract from UserMenu, place in sidebar header
2. **TeamSwitcher** — New component in sidebar header below org
3. **Sidebar header rewrite** — Replace logo area with org/team switchers
4. **Collapsed state** — Org avatar only, popover on click
5. **Mobile state** — Full org + team in mobile drawer
6. **Auth context wiring** — `switchOrg()` resets workspace context

### Phase 3: Breadcrumb Integration (Week 3-4)

**Priority: High — entity-aware navigation**

1. **Entity detection** — `detectEntityContext(pathname)` utility
2. **EntityBreadcrumb** — Clickable breadcrumb segment with switcher popover
3. **Client/Project/Activation switchers** — Route-scoped switchers
4. **Breadcrumb composition** — Replace static crumbs with entity-aware chain
5. **Navigation on switch** — Navigating to equivalent page under new entity
6. **Mobile breadcrumbs** — Compact entity display on small screens

### Phase 4: Command Bar & Polish (Week 4-5)

**Priority: Medium — discoverability + keyboard users**

1. **Command bar commands** — "Switch Org/Team/Project/Client" actions
2. **Keyboard shortcuts** — ⌘⇧O, ⌘⇧T, ⌘⇧P, ⌘⇧C
3. **Recents** — Track recently switched entities in localStorage
4. **Nav filtering** — When team is selected, filter nav items to team-scoped data
5. **Telemetry** — Track switcher usage for UX optimization
6. **Transitions** — Smooth popover open/close animations

### Phase 5: Deep Integration (Week 5-6)

**Priority: Medium — data scoping**

1. **Hook integration** — Opt-in workspace context reading in data hooks
2. **List page filtering** — Projects page auto-filters by activeTeamId/activeClientId
3. **Dashboard scoping** — Dashboard metrics respect active project/team/client
4. **Empty states** — "No projects in this team" messages
5. **URL sync** — Optional query param sync for deep-linking (`?team=xxx`)
6. **Realtime** — Re-subscribe to correct channels on context switch

---

## 11. Accessibility Requirements

| Requirement | Implementation |
|-------------|---------------|
| Keyboard navigation | ↑↓ to move, Enter to select, Esc to close, Tab to focus search |
| Screen reader | `role="listbox"` + `aria-activedescendant` + `aria-label` |
| Focus management | Return focus to trigger on close, trap focus in popover |
| Live region | Announce selection changes via `aria-live="polite"` |
| Motion | Popover respects `prefers-reduced-motion` |
| Touch targets | Min 44×44px for all interactive elements |
| Color contrast | All text meets WCAG 2.2 AA (4.5:1 body, 3:1 large) |

---

## 12. Performance Budget

| Metric | Target |
|--------|--------|
| Switcher open time | < 100ms (data already cached) |
| Search response | < 50ms (client-side filter) |
| Context switch navigation | < 200ms (optimistic, React Query cache) |
| Switcher list items | Virtualize at > 50 items |
| Initial data fetch | < 500ms for all switcher lists combined |
| Bundle impact | < 5KB gzipped for all new components |

---

## 13. Resolved Decisions

1. **Team granularity** — **RESOLVED: Lightweight.** Teams are name + members + optional description/avatar. No budgets, permissions, or settings on the team entity. Extend later if needed.

2. **Cross-team projects** — **RESOLVED: No.** Single `team_id` FK on `projects`, nullable. Unassigned projects are visible to all org members.

3. **Client ↔ Project link** — **RESOLVED: Two FKs, no backward compat.** Drop the free-text `client` column from `projects`. Add two nullable FKs:
   - `client_company_id UUID REFERENCES companies(id)` — the client commissioning the project
   - `organizer_company_id UUID REFERENCES companies(id)` — the event organizer (may differ from client, e.g., an agency using the platform for a client that is not the event organizer but is participating)
   This enforces referential integrity and supports the common case where the client and organizer are distinct entities.

4. **Activation ↔ Project** — **RESOLVED: Scoped to active project.** When a project is selected in the workspace context, the activation switcher only shows activations under that project. When no project is selected, activations are hidden from the switcher.

5. **Default team** — **RESOLVED: Yes.** A "General" team is seeded via trigger on `organizations` INSERT. All org members are implicitly in "General" if they have no other team assignment.

---

## 14. Files Created / Modified Summary

### New Files (11)
| File | Type |
|------|------|
| `supabase/migrations/056_teams.sql` | Migration |
| `src/hooks/use-workspace-context.ts` | Zustand store |
| `src/types/workspace-context.ts` | Types |
| `src/components/context-switcher/popover.tsx` | Shared primitive |
| `src/components/context-switcher/org-switcher.tsx` | Org switcher |
| `src/components/context-switcher/team-switcher.tsx` | Team switcher |
| `src/components/context-switcher/client-switcher.tsx` | Client switcher |
| `src/components/context-switcher/project-switcher.tsx` | Project switcher |
| `src/components/context-switcher/activation-switcher.tsx` | Activation switcher |
| `src/components/context-switcher/entity-breadcrumb.tsx` | Breadcrumb segment |
| `src/components/context-switcher/index.ts` | Barrel export |
| `src/lib/supabase/hooks-switcher.ts` | Lightweight data hooks |
| `src/lib/i18n/context-switcher-strings.ts` | i18n strings |

### Modified Files (8)
| File | Changes |
|------|---------|
| `src/components/layouts/sidebar.tsx` | Replace logo header with OrgSwitcher + TeamSwitcher |
| `src/components/layouts/topbar.tsx` | Entity-aware breadcrumbs with switcher popovers |
| `src/lib/supabase/auth-context.tsx` | Expose logo_url, wire switchOrg → clearAll |
| `src/hooks/use-sidebar.ts` | No changes needed (already clean) |
| `src/components/command-bar.tsx` | Add "Switch X" commands |
| `src/config/rbac.ts` | Add `teams` resource permissions |
| `src/config/navigation.ts` | Add Teams nav item in Admin section |
| `src/lib/supabase/index.ts` | Export new hooks |

---

## 15. Visual Reference

### Sidebar Header (Expanded)
```
┌─────────────────────────────────────┐
│ [🏢] GHXSTSHIP        Pro   [▾] [◀]│
│       Production Team         [▾]   │
├─────────────────────────────────────┤
│ [🔍 Filter nav…                 / ] │
├─────────────────────────────────────┤
│ ★ Favorites                         │
│   Dashboard                         │
│   Pipeline                          │
│ ─────────────────────────────────── │
│ HOME                            [▾] │
│   Dashboard                         │
│   Calendar                          │
│   ...                               │
```

### Sidebar Header (Collapsed)
```
┌──────┐
│ [🏢] │  ← Org avatar, click to open full switcher
│ [▶]  │
├──────┤
│  ≡   │
│  📅  │
│  ...  │
```

### Topbar Breadcrumbs (Project Detail Page)
```
┌─────────────────────────────────────────────────────────────────────────┐
│ [≡] [Dev] [Production] Acme Corp ▾ > Summer Tour 2026 ▾ > Tasks       │
│                                        [🔍] Search...  [⌘K]  [+] ... │
└─────────────────────────────────────────────────────────────────────────┘
```

### Org Switcher Popover
```
┌──────────────────────────────────┐
│ 🔍 Find Organization…      Esc  │
├──────────────────────────────────┤
│ [🏢] GHXSTSHIP        Pro   ✓  │
│ [🏢] Acme Events                │
│ [🏢] Test Sandbox               │
│                                  │
│      ┌──────────────────────┐   │
│      │ 👥                   │   │
│      │ Organizations you    │   │
│      │ create and join      │   │
│      │ appear here.         │   │
│      └──────────────────────┘   │
├──────────────────────────────────┤
│ + Create Organization            │
└──────────────────────────────────┘
```
