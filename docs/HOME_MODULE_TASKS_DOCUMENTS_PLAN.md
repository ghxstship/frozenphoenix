# Home Module — Tasks & Documents Integration Plan

## Executive Summary

Add **Tasks** and **Documents** as top-level items in the Home navigation section, transforming Home from a passive overview module (Dashboard, Calendar, Messages, Insights) into an **action-oriented personal workspace**. Both features surface user-scoped views of existing domain entities — zero new DB tables required. Labels omit the "My" prefix for consistency with the rest of the IA (no item uses "My") — the Home section's placement already implies personal scope. Routes use `/home/tasks` and `/home/documents` to avoid collision with the domain pages at `/tasks` and `/documents`.

### Current Home Section (4 items + Insights children)

```
HOME
├── Dashboard        (/dashboard)
├── Calendar         (/calendar)
├── Messages         (/messages)
└── Insights         (/reports)
    ├── Forecasting
    ├── Scenarios
    ├── AI Reports
    ├── Saved Views
    └── Custom Dashboards
```

### Proposed Home Section (6 items + Insights children)

```
HOME
├── Dashboard        (/dashboard)       — existing
├── Tasks            (/home/tasks)      — NEW
├── Documents        (/home/documents)  — NEW
├── Calendar         (/calendar)        — existing
├── Messages         (/messages)        — existing
└── Insights         (/reports)         — existing (unchanged)
```

**Design rationale:** Tasks and Documents sit directly below Dashboard because they represent the user's _actionable work_ — the natural next click after seeing the command center. Calendar and Messages follow as time-aware and communication tools. Insights remains a nested child group. This ordering aligns with the IA v2 principle: "Tier 1 items are universal anchors" — every role has tasks and documents. The Home context makes the personal scope implicit, matching how Dashboard shows _your_ KPIs and Calendar shows _your_ schedule.

---

## 1. Audit of Existing Infrastructure

### 1.1 Tasks

| Layer                | Status                                                           | Location                                                                                                          |
| -------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **DB table**         | `tasks` — migration 001                                          | `assignee_id UUID REFERENCES profiles(id)`, status/priority/phase/due_date/fabrication_status/material_cost       |
| **DB table**         | `task_dependencies` — migration 001                              | task_id → depends_on_id                                                                                           |
| **Hook (list)**      | `useTasks(projectId?)`                                           | `src/lib/supabase/hooks.ts:253` — selects `*, task_dependencies(depends_on_id)`, filters by project_id            |
| **Hook (single)**    | `useTask(id)`                                                    | `src/lib/supabase/hooks-pages.ts`                                                                                 |
| **Mutations**        | `useCreateTask`, `useUpdateTask`, `useDeleteTask`                | `src/lib/supabase/hooks.ts`                                                                                       |
| **List page**        | `/tasks`                                                         | `src/app/(dashboard)/tasks/page.tsx` — 455 lines, list/table/board views, project filter, CSV import/export       |
| **Detail page**      | `/tasks/[id]`                                                    | `src/app/(dashboard)/tasks/[id]/page.tsx` — DetailLayout + RecordChatter, overview/subtasks/comments/chatter tabs |
| **Types**            | `Task`, `TaskStatus`, `TaskPriority`                             | `src/types/index.ts` + `src/types/production.ts`                                                                  |
| **SSOT config**      | `TASK_STATUS_MAP`, `TASK_PRIORITY_MAP`, `FABRICATION_STATUS_MAP` | `src/config/domain-config.ts`                                                                                     |
| **Create config**    | `CREATE_TASK_CONFIG`                                             | `src/config/create-entity-configs.ts`                                                                             |
| **Nav location**     | Production section                                               | `src/config/navigation.ts:345` — permission `tasks.read`                                                          |
| **RBAC**             | All 6 roles have `tasks.read`                                    | exec/director: CRUD+manage, pm: CRUD+delete, member: read+write, client: (none), collaborator: read               |
| **Dashboard widget** | "In Progress" card                                               | `src/app/(dashboard)/dashboard/page.tsx:296-319` — shows `status === "in_progress"` tasks                         |

**Key gap for Home Tasks:** No `useMyTasks()` hook exists. Current `useTasks()` fetches all org tasks. The `assignee_id` column exists but is never filtered to `auth.uid()` on the client.

### 1.2 Documents

| Layer                | Status                                             | Location                                                                                                                                                      |
| -------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DB table**         | `documents` — migration 005                        | `owner_id`, `last_edited_by`, `shared_with_user_ids UUID[]`, `shared_with_team_ids UUID[]`, `is_public`, document_type enum, status enum, parent_id hierarchy |
| **DB table**         | `document_versions` — migration 005                | version_number, content snapshot, change_description                                                                                                          |
| **Hook (list)**      | `useDocuments(projectId?)`                         | `src/lib/supabase/hooks-pages.ts:505` — queries `vault_documents` table (NOTE: different table name)                                                          |
| **Mutations**        | None dedicated                                     | Would need `useCreateDocument`, `useUpdateDocument`                                                                                                           |
| **List page**        | `/documents`                                       | `src/app/(dashboard)/documents/page.tsx` — 340 lines, type/status filters, starred/recent sections, card grid                                                 |
| **Detail page**      | None                                               | Missing — no `/documents/[id]` route                                                                                                                          |
| **Types**            | Local `DocItem` interface in page                  | Not in canonical `src/types/`                                                                                                                                 |
| **SSOT config**      | `DOC_TYPE_LABELS`, `DOC_TYPE_ICONS` inline in page | Not in `domain-config.ts`                                                                                                                                     |
| **Create config**    | `CREATE_DOCUMENT_CONFIG`                           | `src/config/create-entity-configs.ts`                                                                                                                         |
| **Nav location**     | Creative & Docs section                            | `src/config/navigation.ts:630` — permission `documents.read`                                                                                                  |
| **RBAC**             | 5 of 6 roles have `documents.read`                 | exec/director/pm: read+write, member: read+write, client: read, collaborator: (none)                                                                          |
| **Dashboard widget** | None                                               | Dashboard has no documents widget                                                                                                                             |

**Key gap for Home Documents:** No `useMyDocuments()` hook. The `owner_id` and `shared_with_user_ids` columns exist in schema but are never filtered to current user. The `useDocuments()` hook queries `vault_documents` (not `documents`) — needs verification. Document types/labels are inline in the page, violating SSOT.

---

## 2. What "My" Means — User-Scoped Query Strategy

Both pages present a **personal workspace view** — not a filtered clone of the domain page.

### 2.1 My Tasks Scoping Rules

A task appears in My Tasks if ANY of:

1. `assignee_id = auth.uid()` — directly assigned
2. `tasks.project_id` IN projects where user is `manager_id` or in `project_members` — project ownership (exec/director/pm only, controlled by RBAC)

Default sort: **Due date ascending** (overdue first), then priority descending.

Default filters exposed:

- **Status**: All Active (default) | Backlog | To Do | In Progress | Review | Done
- **Priority**: All | Critical | High | Medium | Low
- **Time horizon**: Overdue | Today | This Week | This Month | All

### 2.2 My Documents Scoping Rules

A document appears in My Documents if ANY of:

1. `owner_id = auth.uid()` — user created it
2. `auth.uid() = ANY(shared_with_user_ids)` — explicitly shared
3. `is_public = true` AND user has `documents.read` — org-wide published docs (lower priority, separate "Shared with Me" section)

Default sort: **Updated at descending** (most recently touched first).

Default filters exposed:

- **Ownership**: My Documents (default) | Shared with Me | All
- **Type**: All | Document | Wiki | Meeting Notes | Specification | SoW | Template
- **Status**: All | Draft | Published | Pending Review

---

## 3. Navigation Changes

### 3.1 `src/config/navigation.ts`

Add two new items to the Home section between Dashboard and Calendar:

```typescript
// New import needed:
import { FileText, ListTodo } from "lucide-react";

// In navigationConfig[0] (Home section), items array:
{
    title: "My Tasks",
    path: "/my-tasks",
    icon: ListTodo,           // distinct from CheckSquare (used by /tasks)
    permission: "tasks.read",
},
{
    title: "My Documents",
    path: "/my-documents",
    icon: FileText,           // distinct from FolderOpen (used by /documents)
    permission: "documents.read",
},
```

**Icon selection rationale:**

- `ListTodo` (personal checklist) vs `CheckSquare` (domain tasks page) — visually distinct in collapsed sidebar
- `FileText` (individual document) vs `FolderOpen` (document library) — personal vs organizational

**Miller's Law check:** Home section grows from 4 → 6 top-level items (under the 7-item limit). With Insights' 5 children, total is 11 — but children are collapsed by default, so cognitive load stays within bounds.

### 3.2 Command Bar

No changes needed — `command-bar.tsx` already uses `flattenNavItems()` to discover all items including new ones.

### 3.3 Sidebar

No changes needed — `sidebar.tsx` already renders from `navigationConfig` with RBAC filtering.

### 3.4 Topbar Breadcrumbs

No changes needed — `topbar.tsx` derives breadcrumbs from navigation config.

---

## 4. New Hooks (3NF + SSOT Compliance)

### 4.1 `useMyTasks()` — `src/lib/supabase/hooks.ts`

```typescript
export function useMyTasks(filters?: {
  status?: TaskStatus | "all";
  priority?: TaskPriority | "all";
  horizon?: "overdue" | "today" | "week" | "month" | "all";
}) {
  const supabase = getSupabase();
  return useQuery({
    queryKey: ["my-tasks", filters],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from("tasks")
        .select("*, task_dependencies(depends_on_id), projects(id, name, client)")
        .eq("assignee_id", user.id)
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("priority", { ascending: true });

      // Apply filters...
      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters?.priority && filters.priority !== "all") {
        query = query.eq("priority", filters.priority);
      }
      // Horizon filters use .lte/.gte on due_date

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
```

**SSOT compliance:** Reuses the same `tasks` table and `task_dependencies` join as `useTasks()`. The only difference is the `assignee_id = user.id` filter. Project name is joined via FK (`projects(id, name, client)`) — no denormalized columns.

### 4.2 `useMyDocuments()` — `src/lib/supabase/hooks-pages.ts`

```typescript
export function useMyDocuments(filters?: {
  ownership?: "mine" | "shared" | "all";
  type?: DocType | "all";
  status?: DocStatus | "all";
}) {
  return useQuery({
    queryKey: ["my-documents", filters],
    queryFn: async () => {
      const {
        data: { user },
      } = await getSupabase().auth.getUser();
      if (!user) return [];

      let query = fromTable("documents")
        .select("*, profiles!owner_id(name)")
        .order("updated_at", { ascending: false });

      // Ownership scoping
      if (filters?.ownership === "mine" || !filters?.ownership) {
        query = query.eq("owner_id", user.id);
      } else if (filters?.ownership === "shared") {
        query = query.contains("shared_with_user_ids", [user.id]);
      }
      // "all" = no ownership filter (RLS handles org scoping)

      if (filters?.type && filters.type !== "all") {
        query = query.eq("document_type", filters.type);
      }
      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
```

**3NF note:** `owner_id` is a FK to `profiles(id)`. `shared_with_user_ids UUID[]` is denormalized but is the canonical sharing mechanism already in the schema — no new denormalization introduced. Owner name is resolved via join, not stored redundantly.

### 4.3 `useMyTaskCounts()` — lightweight stats hook for Dashboard

```typescript
export function useMyTaskCounts() {
  return useQuery({
    queryKey: ["my-task-counts"],
    queryFn: async () => {
      const {
        data: { user },
      } = await getSupabase().auth.getUser();
      if (!user) return { overdue: 0, today: 0, inProgress: 0, total: 0 };

      const { data, error } = await getSupabase()
        .from("tasks")
        .select("id, status, due_date")
        .eq("assignee_id", user.id)
        .neq("status", "done");
      if (error) throw error;

      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      return {
        overdue: data.filter((t) => t.due_date && t.due_date < todayStr).length,
        today: data.filter((t) => t.due_date === todayStr).length,
        inProgress: data.filter((t) => t.status === "in_progress").length,
        total: data.length,
      };
    },
    staleTime: 30_000, // 30s — dashboard widget doesn't need instant refresh
  });
}
```

---

## 5. SSOT Extractions

### 5.1 Document Type Config → `domain-config.ts`

The inline `DOC_TYPE_LABELS` and `DOC_TYPE_ICONS` in `/documents/page.tsx` violate SSOT. Extract to `domain-config.ts`:

```typescript
// In src/config/domain-config.ts
export const DOCUMENT_TYPE_MAP: Record<string, { label: string; icon: string }> = {
  doc: { label: "Document", icon: "FileText" },
  wiki: { label: "Wiki", icon: "BookOpen" },
  meeting_notes: { label: "Meeting Notes", icon: "StickyNote" },
  specification: { label: "Specification", icon: "FileCode" },
  proposal_doc: { label: "Proposal", icon: "Presentation" },
  sow: { label: "Scope of Work", icon: "ScrollText" },
  template: { label: "Template", icon: "LayoutTemplate" },
};

export const DOCUMENT_STATUS_MAP: Record<string, { label: string; variant: string }> = {
  draft: { label: "Draft", variant: "ghost" },
  pending_review: { label: "Pending Review", variant: "warning" },
  published: { label: "Published", variant: "success" },
  archived: { label: "Archived", variant: "secondary" },
};
```

### 5.2 Document Types → `src/types/index.ts`

Add canonical type aliases (currently only local in documents page):

```typescript
export type DocumentType =
  | "doc"
  | "wiki"
  | "meeting_notes"
  | "specification"
  | "proposal_doc"
  | "sow"
  | "template";
export type DocumentStatus = "draft" | "pending_review" | "published" | "archived";
```

### 5.3 Consumers to Update

After extraction:

1. `/documents/page.tsx` — import from `domain-config.ts` + `types/index.ts` instead of inline
2. `/my-documents/page.tsx` — new page, imports from SSOT from day one
3. Dashboard document widget (new) — imports from SSOT

---

## 6. New Pages

### 6.1 `/my-tasks/page.tsx` — Personal Task Workspace

**Route:** `src/app/(dashboard)/my-tasks/page.tsx`

**UX differentiation from `/tasks`:**

| Aspect            | `/tasks` (Domain)                    | `/my-tasks` (Personal)                                    |
| ----------------- | ------------------------------------ | --------------------------------------------------------- |
| **Scope**         | All org tasks, filterable by project | Only tasks assigned to current user                       |
| **Primary sort**  | Created date (newest)                | Due date (soonest/overdue first)                          |
| **Key metric**    | Total task count                     | Overdue count + today's count                             |
| **Grouping**      | Project filter dropdown              | Time horizon groups (Overdue / Today / This Week / Later) |
| **Views**         | List + Table + Board                 | List + Board (no table — personal view is compact)        |
| **Empty state**   | "No tasks found"                     | "You're all caught up" (celebratory)                      |
| **Create action** | "New Task" (any project)             | "New Task" (pre-fills assignee to self)                   |
| **Quick actions** | CSV import/export                    | Mark complete, snooze, reassign                           |

**Layout structure:**

```
┌─────────────────────────────────────────────────┐
│ PageHeader: "My Tasks"                          │
│ "Your personal task queue across all projects"  │
│                                                 │
│ [Status filter] [Priority filter] [+ New Task]  │
├─────────────────────────────────────────────────┤
│ ⚠️ OVERDUE (3)                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ ☐ Design stage mockups    High  Project A   │ │
│ │ ☐ Review vendor quotes    Med   Project B   │ │
│ │ ☐ Submit permit app       Crit  Project A   │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ 📅 TODAY (2)                                    │
│ ┌─────────────────────────────────────────────┐ │
│ │ ☐ Finalize floor plan     Med   Project C   │ │
│ │ ☐ Update BOM quantities   Low   Project A   │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ 📆 THIS WEEK (5)                                │
│ └── ...                                         │
│                                                 │
│ 📋 LATER (12)                                   │
│ └── ... (collapsed by default)                  │
└─────────────────────────────────────────────────┘
```

**Components reused:**

- `PageHeader` — existing
- `SegmentedControl` — existing (for list/board view toggle)
- `Badge` / `PriorityField` — existing field renderers
- `DataBoard` — existing (for board view, same `boardColumns` as tasks page)
- `CreateEntityDialog` + `CREATE_TASK_CONFIG` — existing
- `PermissionGate` — existing

**New shared component:** `TaskRow` — extracted from the inline `<tr>` in `/tasks/page.tsx` to be reused in both `/tasks` and `/my-tasks`. Accepts a `Task` + optional `Project` and renders the compact row. This prevents rendering logic duplication.

### 6.2 `/my-documents/page.tsx` — Personal Document Workspace

**Route:** `src/app/(dashboard)/my-documents/page.tsx`

**UX differentiation from `/documents`:**

| Aspect            | `/documents` (Library)                       | `/my-documents` (Personal)                   |
| ----------------- | -------------------------------------------- | -------------------------------------------- |
| **Scope**         | All org documents, filterable by type/status | User's own + shared-with-me                  |
| **Primary sort**  | Created date                                 | Last edited (most recent)                    |
| **Sections**      | Starred + Recent                             | My Drafts / Shared with Me / Recently Viewed |
| **Key metric**    | Total document count                         | Draft count + pending review count           |
| **Empty state**   | "No documents found"                         | "Start writing" (action-oriented)            |
| **Quick actions** | Type filter, status filter                   | Resume editing, share, publish               |

**Layout structure:**

```
┌─────────────────────────────────────────────────┐
│ PageHeader: "My Documents"                      │
│ "Your drafts, shared docs, and recent edits"    │
│                                                 │
│ [Ownership: Mine|Shared|All] [Type] [+ New Doc] │
├─────────────────────────────────────────────────┤
│ 📝 DRAFTS (3)                                   │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ │ DocCard  │ │ DocCard  │ │ DocCard  │         │
│ └──────────┘ └──────────┘ └──────────┘         │
│                                                 │
│ 👥 SHARED WITH ME (4)                           │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ...     │
│ │ DocCard  │ │ DocCard  │ │ DocCard  │         │
│ └──────────┘ └──────────┘ └──────────┘         │
│                                                 │
│ 🕐 RECENTLY EDITED (8)                          │
│ └── ... (list view, compact)                    │
└─────────────────────────────────────────────────┘
```

**Components reused:**

- `DocCard` — extract from `/documents/page.tsx` into `src/components/documents/doc-card.tsx` for reuse
- `PageHeader`, `SegmentedControl`, `SearchInput`, `Badge`, `StatusBadge`, `OverlineText` — all existing
- `CreateEntityDialog` + `CREATE_DOCUMENT_CONFIG` — existing
- `PermissionGate` — existing

---

## 7. Dashboard Enrichment

### 7.1 My Tasks Widget Enhancement

The current dashboard "In Progress" card (`dashboard/page.tsx:296-319`) shows all org tasks with `status === "in_progress"`. Replace with a user-scoped widget:

**Before:**

```
┌──────────────────────┐
│ In Progress          │
│ • Task A             │
│ • Task B             │
│ • Task C             │
└──────────────────────┘
```

**After:**

```
┌──────────────────────────────────┐
│ My Tasks                → View all │  ← links to /my-tasks
│                                    │
│ 🔴 3 overdue  ⏰ 2 due today     │  ← uses useMyTaskCounts()
│                                    │
│ ☐ Design stage mockups    ⚠️ -2d  │  ← overdue indicator
│ ☐ Review vendor quotes    📅 Today │
│ ☐ Submit permit app       📅 Today │
│ ☐ Finalize floor plan     📅 Thu   │
│                                    │
│ + 8 more tasks                     │
└──────────────────────────────────┘
```

**Data:** Uses `useMyTasks({ status: "all" })` (limit 5) + `useMyTaskCounts()` for the summary line.

### 7.2 New: My Documents Widget

Add a new card to the dashboard right column:

```
┌──────────────────────────────────┐
│ My Documents            → View all │  ← links to /my-documents
│                                    │
│ 📝 2 drafts  🔍 1 pending review  │
│                                    │
│ 📄 Q3 Event Brief        2h ago   │
│ 📄 Vendor SOW Draft      yesterday│
│ 📄 Brand Guidelines v2   3d ago   │
└──────────────────────────────────┘
```

**Data:** Uses `useMyDocuments({ ownership: "mine" })` (limit 3, sorted by `updated_at` descending).

---

## 8. Cross-Linking Strategy

### 8.1 My Tasks → Domain Pages

Every task row in My Tasks links to its detail page (`/tasks/[id]`), reusing the existing route. The project name in each row links to `/projects/[id]`.

### 8.2 My Documents → Domain Pages

Every document card links to its detail page (`/documents/[id]` — currently missing, tracked in DETAIL_PAGE_AUDIT.md as P1). Until the detail page exists, link to `/documents` with a query param: `/documents?highlight={id}`.

### 8.3 Dashboard → My Pages

- "My Tasks" widget "View all" → `/my-tasks`
- "My Documents" widget "View all" → `/my-documents`
- Each inline item → respective detail page

### 8.4 Domain Pages → My Pages

No back-links needed. The domain pages (`/tasks`, `/documents`) remain the organizational view. Users navigate to personal views via the Home nav section.

---

## 9. RBAC Implications

### 9.1 No New Permissions Required

Both My Tasks and My Documents use existing permissions:

- `tasks.read` — already granted to all 6 roles except `client`
- `documents.read` — already granted to 5 of 6 roles (not `collaborator`)

The `permission` field on the new nav items maps to these existing resources.

### 9.2 Role-Specific Behavior

| Role             | My Tasks                                                     | My Documents                   |
| ---------------- | ------------------------------------------------------------ | ------------------------------ |
| **exec**         | All assigned tasks (likely few — execs approve, not execute) | All owned + shared docs        |
| **director**     | Cross-project tasks assigned for review                      | All owned + shared docs        |
| **pm**           | Project tasks they're assigned to                            | All owned + shared docs        |
| **member**       | Their daily work tasks                                       | Owned docs + explicitly shared |
| **client**       | Hidden (no `tasks.read`)                                     | Read-only view of shared docs  |
| **collaborator** | Read-only view of assigned tasks                             | Hidden (no `documents.read`)   |

### 9.3 RLS Enforcement

No new RLS policies needed. Existing `tasks` and `documents` RLS policies already scope by `organization_id`. The client-side `assignee_id`/`owner_id` filter further narrows the result set. Server-side enforcement is handled by existing org-scoped RLS.

---

## 10. Component Extraction Plan

### 10.1 `TaskRow` → `src/components/tasks/task-row.tsx`

Extract from the inline `<tr>` rendering in `/tasks/page.tsx` (lines 364-441). Reused in:

- `/tasks/page.tsx` (list view)
- `/my-tasks/page.tsx` (time-horizon groups)
- `/dashboard/page.tsx` (My Tasks widget — compact variant)

Props: `task: Task`, `project?: Project`, `variant?: "default" | "compact"`, `onNavigate?: (id: string) => void`

### 10.2 `DocCard` → `src/components/documents/doc-card.tsx`

Extract from `/documents/page.tsx` (lines 268-339). Reused in:

- `/documents/page.tsx` (starred + recent grids)
- `/my-documents/page.tsx` (drafts + shared grids)
- `/dashboard/page.tsx` (My Documents widget — compact variant)

Props: `doc: DocItem`, `formatTime: (d: string) => string`, `variant?: "default" | "compact"`

### 10.3 `TimeHorizonGroup` → `src/components/tasks/time-horizon-group.tsx`

New component for grouping tasks by temporal urgency. Used exclusively in `/my-tasks/page.tsx`.

Props: `label: string`, `icon: LucideIcon`, `tasks: Task[]`, `projects: Project[]`, `defaultCollapsed?: boolean`, `variant?: "danger" | "warning" | "default"`

---

## 11. Implementation Phases

### Phase 1: Foundation (Day 1-2)

| Step | File                                     | Change                                                    |
| ---- | ---------------------------------------- | --------------------------------------------------------- |
| 1a   | `src/types/index.ts`                     | Add `DocumentType` + `DocumentStatus` type aliases        |
| 1b   | `src/config/domain-config.ts`            | Add `DOCUMENT_TYPE_MAP` + `DOCUMENT_STATUS_MAP`           |
| 1c   | `src/app/(dashboard)/documents/page.tsx` | Refactor: import types/config from SSOT instead of inline |
| 1d   | `src/lib/supabase/hooks.ts`              | Add `useMyTasks()` + `useMyTaskCounts()` hooks            |
| 1e   | `src/lib/supabase/hooks-pages.ts`        | Add `useMyDocuments()` hook                               |
| 1f   | `src/lib/supabase/index.ts`              | Export new hooks from barrel                              |

### Phase 2: Component Extraction (Day 2-3)

| Step | File                                          | Change                                                 |
| ---- | --------------------------------------------- | ------------------------------------------------------ |
| 2a   | `src/components/tasks/task-row.tsx`           | Extract `TaskRow` from `/tasks/page.tsx` inline `<tr>` |
| 2b   | `src/components/tasks/index.ts`               | Barrel export                                          |
| 2c   | `src/components/documents/doc-card.tsx`       | Extract `DocCard` from `/documents/page.tsx`           |
| 2d   | `src/components/documents/index.ts`           | Barrel export                                          |
| 2e   | `src/app/(dashboard)/tasks/page.tsx`          | Refactor list view to use `TaskRow`                    |
| 2f   | `src/app/(dashboard)/documents/page.tsx`      | Refactor to use extracted `DocCard`                    |
| 2g   | `src/components/tasks/time-horizon-group.tsx` | New `TimeHorizonGroup` component                       |

### Phase 3: New Pages (Day 3-5)

| Step | File                                        | Change                                                      |
| ---- | ------------------------------------------- | ----------------------------------------------------------- |
| 3a   | `src/app/(dashboard)/my-tasks/page.tsx`     | New My Tasks page (time-horizon grouped list + board views) |
| 3b   | `src/app/(dashboard)/my-documents/page.tsx` | New My Documents page (ownership-sectioned card grid)       |
| 3c   | `src/config/navigation.ts`                  | Add My Tasks + My Documents to Home section                 |

### Phase 4: Dashboard Integration (Day 5-6)

| Step | File                                     | Change                                                                                   |
| ---- | ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| 4a   | `src/app/(dashboard)/dashboard/page.tsx` | Replace "In Progress" card with "My Tasks" widget using `useMyTasks` + `useMyTaskCounts` |
| 4b   | `src/app/(dashboard)/dashboard/page.tsx` | Add "My Documents" widget card using `useMyDocuments`                                    |

### Phase 5: Polish & Verification (Day 6-7)

| Step | Action                                                                                         |
| ---- | ---------------------------------------------------------------------------------------------- |
| 5a   | `tsc --noEmit` — zero errors                                                                   |
| 5b   | `eslint` — zero errors                                                                         |
| 5c   | Verify RBAC: client role sees no My Tasks nav item; collaborator sees no My Documents nav item |
| 5d   | Verify command bar discovers both new pages via `flattenNavItems()`                            |
| 5e   | Verify sidebar renders both items in Home section with correct icons                           |
| 5f   | Verify Dashboard widgets link to correct pages                                                 |
| 5g   | Verify breadcrumbs render correctly for `/my-tasks` and `/my-documents`                        |

---

## 12. Files Changed Summary

### New Files (7)

| File                                          | Purpose                         |
| --------------------------------------------- | ------------------------------- |
| `src/app/(dashboard)/my-tasks/page.tsx`       | My Tasks page                   |
| `src/app/(dashboard)/my-documents/page.tsx`   | My Documents page               |
| `src/components/tasks/task-row.tsx`           | Shared task row component       |
| `src/components/tasks/time-horizon-group.tsx` | Time-horizon grouping component |
| `src/components/tasks/index.ts`               | Barrel export                   |
| `src/components/documents/doc-card.tsx`       | Shared document card component  |
| `src/components/documents/index.ts`           | Barrel export                   |

### Modified Files (7)

| File                                     | Change                                                                |
| ---------------------------------------- | --------------------------------------------------------------------- |
| `src/config/navigation.ts`               | +2 nav items in Home section, +2 icon imports                         |
| `src/config/domain-config.ts`            | +`DOCUMENT_TYPE_MAP` + `DOCUMENT_STATUS_MAP`                          |
| `src/types/index.ts`                     | +`DocumentType` + `DocumentStatus` type aliases                       |
| `src/lib/supabase/hooks.ts`              | +`useMyTasks()` + `useMyTaskCounts()`                                 |
| `src/lib/supabase/hooks-pages.ts`        | +`useMyDocuments()`                                                   |
| `src/lib/supabase/index.ts`              | +barrel exports for new hooks                                         |
| `src/app/(dashboard)/dashboard/page.tsx` | Replace "In Progress" → "My Tasks" widget + add "My Documents" widget |

### Refactored Files (2)

| File                                     | Change                                           |
| ---------------------------------------- | ------------------------------------------------ |
| `src/app/(dashboard)/tasks/page.tsx`     | Extract `TaskRow` → import from shared component |
| `src/app/(dashboard)/documents/page.tsx` | Extract `DocCard` + import SSOT types/config     |

---

## 13. Non-Goals (Explicit Exclusions)

1. **No new DB tables or migrations** — all queries use existing `tasks` and `documents` tables
2. **No new RBAC resources** — reuses `tasks.read` and `documents.read`
3. **No changes to `/tasks` or `/documents` domain pages** beyond component extraction refactors
4. **No `/documents/[id]` detail page** — tracked separately in DETAIL_PAGE_AUDIT.md
5. **No real-time subscriptions** — My Tasks/Documents use standard React Query polling with `staleTime`
6. **No `recently_viewed` tracking table** — "Recently Edited" in My Documents uses `updated_at` sort, not a separate view-tracking mechanism (avoids new schema)
7. **No drag-and-drop reordering** — tasks respect due-date + priority sort, not manual order

---

## 14. Risk Assessment

| Risk                                                              | Likelihood | Impact | Mitigation                                                                                                                               |
| ----------------------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `vault_documents` vs `documents` table mismatch in `useDocuments` | Medium     | High   | Verify which table the `documents` page actually queries; `useMyDocuments` will query the canonical `documents` table from migration 005 |
| Empty My Tasks for exec users (execs rarely assigned)             | Medium     | Low    | Show helpful empty state: "No tasks assigned to you. View all team tasks →" with link to `/tasks`                                        |
| My Documents shows nothing for new users                          | High       | Medium | Show onboarding empty state: "Create your first document" with prominent create button                                                   |
| Performance: My Tasks queries all user tasks (no pagination)      | Low        | Medium | Add `.limit(50)` to initial query; add "Load more" pattern if needed                                                                     |
| Icon conflict in collapsed sidebar                                | Low        | Low    | `ListTodo` and `FileText` are visually distinct from existing `CheckSquare` and `FolderOpen` — verified in Lucide icon set               |

---

## 15. Success Criteria

1. **Home section contains 6 items:** Dashboard, My Tasks, My Documents, Calendar, Messages, Insights
2. **My Tasks shows only the current user's assigned tasks**, grouped by time horizon
3. **My Documents shows only the current user's owned/shared documents**, sectioned by ownership
4. **Dashboard "My Tasks" widget** shows overdue count + next 5 due items with links
5. **Dashboard "My Documents" widget** shows draft count + 3 most recently edited
6. **Zero SSOT violations:** Document types/statuses defined once in `domain-config.ts`
7. **Zero 3NF violations:** No new denormalized columns; all joins via FK
8. **Zero new DB migrations:** All features built on existing schema
9. **TypeScript 0 errors, ESLint 0 errors** after all changes
10. **RBAC correctly hides** My Tasks from `client` role, My Documents from `collaborator` role
