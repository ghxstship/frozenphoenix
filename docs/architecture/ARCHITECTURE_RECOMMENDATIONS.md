# Frozen Phoenix — Architecture Recommendations

## Executive Summary

This document identifies missing pages, layout patterns, data models, reports, templates, and enums needed to complete the Frozen Phoenix platform, maintaining **3NF** and **SSOT** principles.

---

## 1. Missing Pages

### 1.1 Detail/Edit Pages (Currently Missing)

All list pages exist but lack corresponding detail and edit views:

| Entity | List Page | Detail Page Needed | Edit Page Needed |
|--------|-----------|-------------------|------------------|
| Project | `/projects` | `/projects/[id]` | `/projects/[id]/edit` |
| Task | `/tasks` | `/tasks/[id]` | `/tasks/[id]/edit` |
| Deal | `/pipeline` | `/deals/[id]` | `/deals/[id]/edit` |
| Crew Member | `/crew` | `/crew/[id]` | `/crew/[id]/edit` |
| Asset | `/assets` | `/assets/[id]` | `/assets/[id]/edit` |
| Vehicle | `/fleet` | `/fleet/[id]` | `/fleet/[id]/edit` |
| Vendor | `/vendors` | `/vendors/[id]` | `/vendors/[id]/edit` |
| Approval | `/approvals` | `/approvals/[id]` | — (inline action) |
| Case Study | `/case-studies` | `/case-studies/[id]` | `/case-studies/[id]/edit` |
| SOP | `/sops` | `/sops/[id]` | `/sops/[id]/edit` |
| Document | `/vault` | `/vault/[id]` | — (metadata edit modal) |
| Brand Kit | `/brand-kit` | `/brand-kit/[id]` | `/brand-kit/[id]/edit` |
| Deck | `/decks` | `/decks/[id]` | `/decks/[id]/edit` |

### 1.2 Create/New Pages

| Entity | Create Page Needed |
|--------|-------------------|
| Project | `/projects/new` |
| Task | `/projects/[id]/tasks/new` |
| Deal | `/deals/new` |
| Crew Member | `/crew/new` |
| Asset | `/assets/new` |
| Vehicle | `/fleet/new` |
| Vendor | `/vendors/new` |
| Purchase Order | `/procurement/new` |
| Invoice | `/finance/new` |
| Case Study | `/case-studies/new` |
| SOP | `/sops/new` |
| Brand Kit | `/brand-kit/new` |
| Deck | `/decks/new` |
| Calendar Event | `/calendar/new` (or modal) |
| Shift | `/scheduling/new` (or modal) |

### 1.3 Specialized Views

| Page | Path | Purpose |
|------|------|---------|
| **Project Dashboard** | `/projects/[id]` | Single project overview with phases, tasks, budget, team |
| **Project Timeline** | `/projects/[id]/timeline` | Gantt-style phase/task timeline |
| **Project Budget** | `/projects/[id]/budget` | Detailed budget breakdown |
| **Project Documents** | `/projects/[id]/documents` | Project-scoped vault |
| **Project Approvals** | `/projects/[id]/approvals` | Project-scoped approvals |
| **Crew Profile** | `/crew/[id]` | Certifications, shift history, availability |
| **Vendor Profile** | `/vendors/[id]` | PO history, compliance docs, rating |
| **Reports Hub** | `/reports` | Centralized reporting dashboard |
| **Notifications Center** | `/notifications` | Full notification history |
| **Search Results** | `/search` | Global search results page |
| **Help/Support** | `/help` | Documentation and support |
| **Onboarding** | `/onboarding` | New user setup wizard |

### 1.4 Client Portal Pages (Future)

| Page | Path | Purpose |
|------|------|---------|
| **Client Dashboard** | `/client` | Client-facing project overview |
| **Client Approvals** | `/client/approvals` | Pending approvals for client |
| **Client Documents** | `/client/documents` | Shared documents |
| **Client Progress** | `/client/[projectId]` | Project progress view |

---

## 2. Page Layout Patterns

### 2.1 Standardized Layout Components Needed

```
src/components/layouts/
├── sidebar.tsx              ✅ Exists
├── topbar.tsx               ✅ Exists
├── page-shell.tsx           ❌ NEEDED — Standard page wrapper
├── detail-layout.tsx        ❌ NEEDED — Entity detail page layout
├── form-layout.tsx          ❌ NEEDED — Create/edit form layout
├── split-layout.tsx         ❌ NEEDED — List + detail split view
├── modal-layout.tsx         ❌ NEEDED — Standard modal wrapper
├── empty-state.tsx          ❌ NEEDED — Empty state component
├── loading-state.tsx        ❌ NEEDED — Loading skeleton
├── error-boundary.tsx       ❌ NEEDED — Error handling
└── breadcrumb.tsx           ❌ NEEDED — Breadcrumb navigation
```

### 2.2 Layout Pattern Definitions

#### **PageShell** — Standard Page Wrapper
```tsx
interface PageShellProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;      // Header action buttons
    tabs?: TabConfig[];             // Optional tab navigation
    breadcrumbs?: BreadcrumbItem[]; // Auto-generated if not provided
    children: React.ReactNode;
}
```

#### **DetailLayout** — Entity Detail Pages
```tsx
interface DetailLayoutProps {
    entity: string;                 // "project" | "vendor" | etc.
    id: string;
    title: string;
    subtitle?: string;
    status?: string;
    avatar?: React.ReactNode;
    actions?: React.ReactNode;
    tabs?: TabConfig[];
    sidebar?: React.ReactNode;      // Right sidebar for metadata
    children: React.ReactNode;
}
```

#### **FormLayout** — Create/Edit Forms
```tsx
interface FormLayoutProps {
    title: string;
    description?: string;
    onSubmit: () => void;
    onCancel: () => void;
    isSubmitting?: boolean;
    children: React.ReactNode;
}
```

#### **SplitLayout** — Master/Detail Views
```tsx
interface SplitLayoutProps {
    list: React.ReactNode;          // Left panel (list)
    detail: React.ReactNode;        // Right panel (detail)
    listWidth?: number;             // Default 320px
    showDetail?: boolean;           // Mobile toggle
}
```

### 2.3 Page Type Matrix

| Page Type | Layout | Header | Tabs | Sidebar | Actions |
|-----------|--------|--------|------|---------|---------|
| Dashboard | PageShell | Stats | No | No | Filters |
| List | PageShell | Title + Count | Optional | No | Create, Filter |
| Detail | DetailLayout | Entity Info | Yes | Metadata | Edit, Delete |
| Form | FormLayout | Title | No | No | Submit, Cancel |
| Calendar | PageShell | Date Nav | View Toggle | No | Create Event |
| Kanban | PageShell | Title | Status Columns | No | Create |
| Report | PageShell | Title | Date Range | Export | Download |

---

## 3. Missing Data Models & Types

### 3.1 New Types Needed

```typescript
// ─── Time Tracking ───
export interface TimeEntry {
    id: string;
    projectId: string;
    taskId?: string;
    crewMemberId: string;
    date: string;
    hoursWorked: number;
    hourlyRate: number;
    totalCost: number;
    notes?: string;
    status: "pending" | "approved" | "rejected";
    approvedBy?: string;
}

// ─── Expenses ───
export interface Expense {
    id: string;
    projectId: string;
    category: ExpenseCategory;
    description: string;
    amount: number;
    receiptUrl?: string;
    submittedBy: string;
    submittedAt: string;
    status: "pending" | "approved" | "rejected" | "reimbursed";
    approvedBy?: string;
}

export type ExpenseCategory = 
    | "materials" | "labor" | "travel" | "equipment_rental" 
    | "shipping" | "permits" | "catering" | "misc";

// ─── Budget Line Items ───
export interface BudgetLineItem {
    id: string;
    projectId: string;
    category: BudgetCategory;
    description: string;
    estimatedAmount: number;
    actualAmount: number;
    variance: number;
    notes?: string;
}

export type BudgetCategory = 
    | "labor" | "materials" | "equipment" | "rentals" 
    | "travel" | "shipping" | "permits" | "contingency" | "overhead";

// ─── Milestones ───
export interface Milestone {
    id: string;
    projectId: string;
    name: string;
    description?: string;
    dueDate: string;
    completedAt?: string;
    status: "pending" | "in_progress" | "completed" | "overdue";
    deliverables: string[];
    approvalRequired: boolean;
    approvalId?: string;
}

// ─── Comments/Activity ───
export interface Comment {
    id: string;
    entityType: "project" | "task" | "approval" | "deal";
    entityId: string;
    authorId: string;
    authorName: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    mentions: string[];
    attachments: string[];
}

// ─── Activity Log ───
export interface ActivityLogEntry {
    id: string;
    entityType: string;
    entityId: string;
    action: ActivityAction;
    actorId: string;
    actorName: string;
    metadata: Record<string, unknown>;
    createdAt: string;
}

export type ActivityAction = 
    | "created" | "updated" | "deleted" | "status_changed" 
    | "assigned" | "commented" | "approved" | "rejected";

// ─── Reports ───
export interface ReportDefinition {
    id: string;
    name: string;
    type: ReportType;
    filters: ReportFilter[];
    columns: ReportColumn[];
    groupBy?: string;
    sortBy?: string;
    isTemplate: boolean;
    createdBy: string;
}

export type ReportType = 
    | "project_summary" | "budget_variance" | "crew_utilization" 
    | "vendor_spend" | "approval_timeline" | "pipeline_forecast";

// ─── Templates ───
export interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    phases: TemplatePhase[];
    defaultBudgetCategories: BudgetCategory[];
    defaultRoles: string[];
    createdBy: string;
}

export interface TemplatePhase {
    phase: ProjectPhase;
    defaultDurationDays: number;
    defaultTasks: TemplateTask[];
}

export interface TemplateTask {
    title: string;
    description?: string;
    priority: TaskPriority;
    estimatedHours?: number;
    dependencies: number[]; // Index references
}

// ─── Integrations ───
export interface Integration {
    id: string;
    type: IntegrationType;
    name: string;
    status: "active" | "inactive" | "error";
    config: Record<string, unknown>;
    lastSyncAt?: string;
}

export type IntegrationType = 
    | "quickbooks" | "xero" | "slack" | "google_calendar" 
    | "dropbox" | "google_drive" | "zapier";
```

### 3.2 Missing Enums to Add to Domain Config

```typescript
// Add to @/config/domain-config.ts

// ─── Expense Categories ───
export const EXPENSE_CATEGORIES: EnumConfig<ExpenseCategory>[] = [
    { value: "materials", label: "Materials", variant: "default" },
    { value: "labor", label: "Labor", variant: "info" },
    { value: "travel", label: "Travel", variant: "secondary" },
    { value: "equipment_rental", label: "Equipment Rental", variant: "warning" },
    { value: "shipping", label: "Shipping", variant: "ghost" },
    { value: "permits", label: "Permits", variant: "success" },
    { value: "catering", label: "Catering", variant: "ghost" },
    { value: "misc", label: "Miscellaneous", variant: "ghost" },
];

// ─── Budget Categories ───
export const BUDGET_CATEGORIES: EnumConfig<BudgetCategory>[] = [
    { value: "labor", label: "Labor", variant: "info" },
    { value: "materials", label: "Materials", variant: "default" },
    { value: "equipment", label: "Equipment", variant: "secondary" },
    { value: "rentals", label: "Rentals", variant: "warning" },
    { value: "travel", label: "Travel", variant: "ghost" },
    { value: "shipping", label: "Shipping", variant: "ghost" },
    { value: "permits", label: "Permits", variant: "success" },
    { value: "contingency", label: "Contingency", variant: "warning" },
    { value: "overhead", label: "Overhead", variant: "ghost" },
];

// ─── Milestone Status ───
export const MILESTONE_STATUSES: EnumConfig<MilestoneStatus>[] = [
    { value: "pending", label: "Pending", variant: "ghost" },
    { value: "in_progress", label: "In Progress", variant: "info" },
    { value: "completed", label: "Completed", variant: "success" },
    { value: "overdue", label: "Overdue", variant: "destructive" },
];

// ─── Time Entry Status ───
export const TIME_ENTRY_STATUSES: EnumConfig<TimeEntryStatus>[] = [
    { value: "pending", label: "Pending", variant: "warning" },
    { value: "approved", label: "Approved", variant: "success" },
    { value: "rejected", label: "Rejected", variant: "destructive" },
];

// ─── Report Types ───
export const REPORT_TYPES: EnumConfig<ReportType>[] = [
    { value: "project_summary", label: "Project Summary", variant: "default" },
    { value: "budget_variance", label: "Budget Variance", variant: "warning" },
    { value: "crew_utilization", label: "Crew Utilization", variant: "info" },
    { value: "vendor_spend", label: "Vendor Spend", variant: "secondary" },
    { value: "approval_timeline", label: "Approval Timeline", variant: "ghost" },
    { value: "pipeline_forecast", label: "Pipeline Forecast", variant: "success" },
];

// ─── Activity Actions ───
export const ACTIVITY_ACTIONS: EnumConfig<ActivityAction>[] = [
    { value: "created", label: "Created", variant: "success" },
    { value: "updated", label: "Updated", variant: "info" },
    { value: "deleted", label: "Deleted", variant: "destructive" },
    { value: "status_changed", label: "Status Changed", variant: "warning" },
    { value: "assigned", label: "Assigned", variant: "info" },
    { value: "commented", label: "Commented", variant: "ghost" },
    { value: "approved", label: "Approved", variant: "success" },
    { value: "rejected", label: "Rejected", variant: "destructive" },
];
```

---

## 4. Reports & Analytics

### 4.1 Standard Reports Needed

| Report | Description | Data Sources |
|--------|-------------|--------------|
| **Project Summary** | Overview of all projects with status, budget, timeline | Projects, Tasks, Budget |
| **Budget Variance** | Planned vs actual by category | BudgetLineItems, Expenses |
| **Crew Utilization** | Hours worked, availability, cost | Shifts, TimeEntries, Crew |
| **Vendor Spend** | Spend by vendor with PO/Invoice matching | POs, Invoices, Vendors |
| **Approval Timeline** | Approval cycle times, bottlenecks | Approvals |
| **Pipeline Forecast** | Weighted pipeline value by stage | Deals |
| **Asset Inventory** | Asset status, location, condition | Assets |
| **Certification Expiry** | Upcoming cert expirations | Certifications |
| **COI Compliance** | Vendor insurance status | Vendors |
| **Project Profitability** | Revenue vs cost by project | Projects, Budget, Invoices |

### 4.2 Dashboard Widgets Needed

| Widget | Type | Data |
|--------|------|------|
| **Pipeline Value** | Stat Card | Sum of weighted deal values |
| **Active Projects** | Stat Card | Count of active projects |
| **Overdue Approvals** | Stat Card + List | Count + list of overdue |
| **Budget Health** | Progress Bar | Aggregate budget utilization |
| **Upcoming Deadlines** | Timeline | Next 7 days milestones |
| **Crew Availability** | Chart | Available vs assigned |
| **Recent Activity** | Feed | Activity log entries |
| **Expiring Items** | Alert List | Certs, COIs, rentals |

---

## 5. Templates System

### 5.1 Project Templates

Pre-configured project templates for common event types:

| Template | Phases | Default Tasks | Budget Categories |
|----------|--------|---------------|-------------------|
| **Trade Show Booth** | Pre-prod → Fab → Logistics → Load-in → Show → Strike | Design, Fabrication, Graphics, Install | Materials, Labor, Shipping |
| **Festival Stage** | Full 7-phase | Structural, Rigging, AV, Lighting | All categories |
| **Pop-Up Retail** | Pre-prod → Fab → Load-in → Show → Strike | Design, Build, Graphics, Install | Materials, Labor, Permits |
| **Corporate Event** | Pre-prod → Logistics → Load-in → Show → Strike | Planning, AV Setup, Decor | Rentals, Labor, Catering |
| **Brand Activation** | Full 7-phase | Concept, Build, Interactive, Install | All categories |

### 5.2 Document Templates

| Template | Type | Use Case |
|----------|------|----------|
| **Project Charter** | PDF | Project kickoff document |
| **Budget Estimate** | Excel/PDF | Client-facing budget |
| **Change Order** | PDF | Scope change documentation |
| **Site Survey** | Form | Pre-load-in site assessment |
| **Daily Report** | Form | On-site daily status |
| **Punch List** | Checklist | Final walkthrough items |
| **Wrap Report** | PDF | Post-project summary |

### 5.3 Deck Templates

| Template | Type | Auto-populated Data |
|----------|------|---------------------|
| **Pitch Deck** | Pitch | Company info, case studies, capabilities |
| **Project Kickoff** | Progress | Project details, timeline, team |
| **Weekly Status** | Progress | Tasks completed, upcoming, blockers |
| **Client Review** | Progress | Deliverables, approvals needed |
| **Wrap Deck** | Wrap | Metrics, photos, testimonials |

---

## 6. Form Components Needed

### 6.1 Standard Form Fields

```
src/components/ui/form/
├── form-field.tsx           # Wrapper with label, error, description
├── text-input.tsx           # Standard text input
├── textarea.tsx             # Multi-line text
├── select.tsx               # Dropdown select
├── multi-select.tsx         # Multi-value select
├── date-picker.tsx          # Date selection
├── date-range-picker.tsx    # Date range
├── time-picker.tsx          # Time selection
├── currency-input.tsx       # Money input with formatting
├── percentage-input.tsx     # Percentage input
├── file-upload.tsx          # File upload with preview
├── image-upload.tsx         # Image upload with crop
├── color-picker.tsx         # Color selection
├── rich-text-editor.tsx     # WYSIWYG editor
├── checkbox.tsx             # Single checkbox
├── checkbox-group.tsx       # Multiple checkboxes
├── radio-group.tsx          # Radio buttons
├── switch.tsx               # Toggle switch
├── slider.tsx               # Range slider
├── combobox.tsx             # Searchable select
├── tag-input.tsx            # Tag/chip input
└── phone-input.tsx          # Phone number with formatting
```

### 6.2 Entity-Specific Form Components

```
src/components/forms/
├── project-form.tsx         # Create/edit project
├── task-form.tsx            # Create/edit task
├── deal-form.tsx            # Create/edit deal
├── crew-form.tsx            # Create/edit crew member
├── vendor-form.tsx          # Create/edit vendor
├── asset-form.tsx           # Create/edit asset
├── vehicle-form.tsx         # Create/edit vehicle
├── po-form.tsx              # Create/edit purchase order
├── invoice-form.tsx         # Create/edit invoice
├── approval-form.tsx        # Request approval
├── shift-form.tsx           # Create/edit shift
├── event-form.tsx           # Create/edit calendar event
├── document-upload-form.tsx # Upload document
├── brand-kit-form.tsx       # Create/edit brand kit
├── sop-form.tsx             # Create/edit SOP
└── user-form.tsx            # Create/edit user
```

---

## 7. Database Schema Additions

### 7.1 New Tables Needed

```sql
-- Time Entries
CREATE TABLE time_entries (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    task_id UUID REFERENCES tasks(id),
    crew_member_id UUID REFERENCES crew_members(id),
    date DATE NOT NULL,
    hours_worked NUMERIC NOT NULL,
    hourly_rate NUMERIC NOT NULL,
    total_cost NUMERIC GENERATED ALWAYS AS (hours_worked * hourly_rate) STORED,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    approved_by UUID REFERENCES profiles(id),
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses
CREATE TABLE expenses (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    receipt_url TEXT,
    submitted_by UUID REFERENCES profiles(id),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending',
    approved_by UUID REFERENCES profiles(id),
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budget Line Items
CREATE TABLE budget_line_items (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    estimated_amount NUMERIC NOT NULL DEFAULT 0,
    actual_amount NUMERIC NOT NULL DEFAULT 0,
    variance NUMERIC GENERATED ALWAYS AS (actual_amount - estimated_amount) STORED,
    notes TEXT,
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Milestones
CREATE TABLE milestones (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    name TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    completed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending',
    approval_required BOOLEAN DEFAULT false,
    approval_id UUID REFERENCES approvals(id),
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
CREATE TABLE comments (
    id UUID PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    author_id UUID REFERENCES profiles(id),
    content TEXT NOT NULL,
    mentions UUID[],
    attachments TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Activity Log
CREATE TABLE activity_log (
    id UUID PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    actor_id UUID REFERENCES profiles(id),
    metadata JSONB,
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Templates
CREATE TABLE project_templates (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    phases JSONB NOT NULL,
    default_budget_categories TEXT[],
    default_roles TEXT[],
    created_by UUID REFERENCES profiles(id),
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Report Definitions
CREATE TABLE report_definitions (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    filters JSONB,
    columns JSONB,
    group_by TEXT,
    sort_by TEXT,
    is_template BOOLEAN DEFAULT false,
    created_by UUID REFERENCES profiles(id),
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Integrations
CREATE TABLE integrations (
    id UUID PRIMARY KEY,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'inactive',
    config JSONB,
    last_sync_at TIMESTAMPTZ,
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. Implementation Priority

### Phase 1: Core CRUD (Week 1-2)
1. Create `PageShell`, `DetailLayout`, `FormLayout` components
2. Add detail pages for Project, Task, Deal
3. Add create/edit forms for Project, Task, Deal
4. Implement Comments component

### Phase 2: Financial (Week 3-4)
1. Add TimeEntry, Expense, BudgetLineItem types and tables
2. Create time tracking UI
3. Create expense submission UI
4. Build budget detail view

### Phase 3: Reporting (Week 5-6)
1. Add Report types and definitions
2. Build Reports hub page
3. Implement standard reports
4. Add dashboard widgets

### Phase 4: Templates (Week 7-8)
1. Add ProjectTemplate types and tables
2. Build template management UI
3. Implement "create from template" flow
4. Add document templates

### Phase 5: Polish (Week 9-10)
1. Add remaining detail/edit pages
2. Implement activity log
3. Add notifications center
4. Build search results page
5. Client portal (if needed)

---

## 9. SSOT/3NF Compliance Checklist

### ✅ Already Compliant
- [x] Design tokens in `@/config/design-tokens.ts`
- [x] UI variants in `@/config/ui-variants.ts`
- [x] Domain enums in `@/config/domain-config.ts`
- [x] Brand config in `@/config/brand.ts`
- [x] Navigation in `@/config/navigation.ts`
- [x] RBAC in `@/config/rbac.ts`
- [x] Types in `@/types/index.ts`

### ❌ Needs Work
- [ ] Consolidate hardcoded status/variant mappings in pages
- [ ] Use `StatusBadge` component instead of inline Badge + variant
- [ ] Extract repeated form validation schemas to shared location
- [ ] Create shared table column definitions
- [ ] Centralize date/currency formatting (already in utils, ensure usage)

### 📋 New SSOT Files Needed
- [ ] `@/config/form-schemas.ts` — Zod schemas for all entities
- [ ] `@/config/table-columns.ts` — Column definitions for data tables
- [ ] `@/config/report-definitions.ts` — Standard report configs
- [ ] `@/config/template-definitions.ts` — Project template configs
