# 🧭 WAYFINDER — Sidebar Inventory

**Prompt Code:** `FP-UX-WAYFINDER-001` · **Phase 1.1** · **Date:** 2026-03-21

---

## Component Location

| File | Lines |
|------|-------|
| `src/config/navigation.ts` | 1,479 — all section/item definitions |
| `src/components/layouts/sidebar.tsx` | 682 — rendering, RBAC filtering, pinned items, search |
| `src/config/rbac.ts` | 794 — 6-tier permission matrix |
| `src/hooks/use-sidebar.ts` | — collapse, pin, filter state (Zustand) |

---

## Global Sidebar Structure (exec — Full View)

```
SIDEBAR STRUCTURE (exec role — all items visible):

┌─────────────────────────────────────────────────────┐
│ [OrgSwitcher]              [Collapse ◀]             │
│ [TeamSwitcher]                                      │
├─────────────────────────────────────────────────────┤
│ 🔍 Filter nav…                              [/]    │
├─────────────────────────────────────────────────────┤
│ ★ FAVORITES  (user-curated, pinnable)               │
│   └── (dynamic, max 7 per implementation)           │
├─────────────────────────────────────────────────────┤
│ ── HOME (expanded by default) ──                    │
│ ├── [LayoutDashboard] Dashboard        → /dashboard │
│ ├── [Mail]            Messages         → /messages  │
│ ├── [CheckSquare]     Tasks            → /home/tasks│
│ ├── [CalendarDays]    Calendar         → /calendar  │
│ ├── [Bell]            Notifications    → /notifications│
│ ├── [FileCheck]       Documents        → /home/documents│
│ └── [BarChart3]       Insights         → /reports   │
│     ├── [GanttChart]    Custom Dashboards → /dashboards│
│     ├── [TrendingUp]    Forecasting    → /forecasting│
│     ├── [LayoutList]    Saved Views    → /saved-views│
│     ├── [Brain]         AI Reports     → /reports/ai │
│     ├── [FlaskConical]  Scenarios      → /scenarios  │
│     └── [FilePenLine]   Report Builder → /report-definitions│
├─────────────────────────────────────────────────────┤
│ ── BUSINESS (collapsed by default) ──               │
│ ├── [Filter]       Pipeline       → /pipeline       │
│ ├── [UserPlus]     Leads          → /leads          │
│ ├── [Target]       Opportunities  → /opportunities  │
│ ├── [Handshake]    Deals          → /deals          │
│ │   ├── Proposals       → /proposals                │
│ │   ├── Estimates       → /estimates                │
│ │   ├── Change Orders   → /change-orders            │
│ │   ├── Upsell Events   → /upsell-events            │
│ │   ├── Upsell Triggers → /upsell-triggers          │
│ │   └── Lost Reasons    → /lost-reasons             │
│ ├── [Building2]    Accounts       → /accounts       │
│ ├── [ContactRound] Contacts       → /companies      │
│ └── [UsersRound]   Stakeholders   → /stakeholders   │
├─────────────────────────────────────────────────────┤
│ ── PRODUCTION (collapsed by default) ──             │
│ ├── [FolderKanban] Projects       → /projects       │
│ ├── [ScrollText]   Scopes of Work → /scopes-of-work │
│ ├── [Calendar]     Events         → /events         │
│ ├── [Sparkles]     Activations    → /activations    │
│ ├── [CheckSquare]  Tasks          → /tasks          │
│ ├── [GanttChart]   Schedule       → /scheduling     │
│ ├── [Layers]       Bills of Materials → /boms       │
│ ├── [MapPin]       Locations      → /locations      │
│ └── [ShoppingCart] Advancing      → /advancing      │
│     ├── Catalog        → /advancing/catalog          │
│     ├── New Advance    → /advancing/new              │
│     ├── Approval Queue → /advancing/queue            │
│     ├── Fulfillment    → /advancing/fulfillment      │
│     ├── Inventory      → /advancing/inventory        │
│     ├── Templates      → /advancing/templates        │
│     ├── Reports        → /advancing/reports          │
│     └── Status History → /advance-status-history     │
├─────────────────────────────────────────────────────┤
│ ── OPERATIONS (collapsed by default) ──             │
│ ├── [ShieldCheck]  Approvals      → /approvals      │
│ │   └── Workflows  → /approval-workflows             │
│ ├── [ListChecks]   Checklists     → /checklists     │
│ │   └── Templates  → /checklist-templates            │
│ ├── [Inbox]        Service Requests → /service-requests│
│ │   ├── SLA Dashboard   → /service-requests/sla     │
│ │   └── SLA Definitions → /sla-definitions           │
│ ├── [Workflow]     Workflows      → /workflows      │
│ ├── [Zap]          Automations    → /automations    │
│ ├── [SearchCheck]  Quality Checks → /quality-checks │
│ │   ├── Templates  → /quality-check-templates        │
│ │   └── Gates      → /qc-gates                       │
│ ├── [FolderOpen]   Documents      → /documents      │
│ │   ├── Call Sheets → /call-sheets                   │
│ │   ├── Tech Sheets → /tech-sheets                   │
│ │   └── Templates   → /templates                     │
│ ├── [Mail]         Email          → /email-messages  │
│ └── [Target]       Resilience     → /resilience-targets│
├─────────────────────────────────────────────────────┤
│ ── WORKFORCE (collapsed by default) ──              │
│ ├── [HardHat]      Crew           → /crew           │
│ ├── [CalendarDays] Shifts         → /shifts         │
│ ├── [CalendarDays] Availability   → /crew-availability│
│ ├── [BarChartHoriz]Resource Planner→ /resource-planner│
│ ├── [Timer]        Time Tracking  → /time-tracking  │
│ │   ├── Time Entries   → /time-entries               │
│ │   ├── Timesheets     → /timesheets                 │
│ │   └── Compliance     → /time-tracking/compliance   │
│ ├── [Palmtree]     Time Off       → /time-off       │
│ │   └── Requests   → /time-off-requests              │
│ ├── [BadgeCheck]   Certifications → /certifications │
│ ├── [UsersRound]   Workforce      → /workforce      │
│ │   ├── Onboarding/Offboarding → /workforce/onboarding│
│ │   ├── Performance Reviews → /workforce/reviews     │
│ │   └── Goals & OKRs → /workforce/goals              │
│ ├── [Store]        Vendors        → /vendors        │
│ ├── [Handshake]    Vendor Onboarding → /vendor-onboarding│
│ ├── [ShieldAlert]  Vendor Compliance → /vendor-compliance│
│ ├── [ClipboardChk] Work Orders    → /work-orders    │
│ └── [Star]         Vendor Reviews → /vendor-reviews │
├─────────────────────────────────────────────────────┤
│ ── RESOURCES (collapsed by default) ──              │
│ ├── [Package]      Assets         → /assets         │
│ │   ├── Asset Scanner    → /assets/scan              │
│ │   ├── Batch Scanner    → /assets/scan/batch        │
│ │   ├── Transfer Orders  → /transfer-orders          │
│ │   └── Maintenance      → /maintenance-schedules    │
│ ├── [Boxes]        Inventory      → /inventory      │
│ ├── [Warehouse]    Warehouses     → /warehouses     │
│ ├── [Car]          Fleet          → /fleet          │
│ ├── [Navigation]   Dispatch       → /dispatch       │
│ ├── [Truck]        Shipments      → /shipments      │
│ ├── [ShoppingCart] Purchase Orders→ /purchase-orders│
│ └── [Receipt]      Expense Reports→ /expense-reports│
├─────────────────────────────────────────────────────┤
│ ── CREATIVE (collapsed by default) ──               │
│ ├── [PenTool]      Briefs         → /briefs         │
│ ├── [SwatchBook]   Brand Kit      → /brand-kit      │
│ ├── [Palette]      Brand Guidelines→ /brand-guidelines│
│ ├── [Brush]        Creative Assets→ /creative-assets│
│ ├── [ImagePlus]    Digital Assets → /digital-assets │
│ ├── [Star]         Creative Reviews→ /creative-reviews│
│ ├── [Presentation] Decks          → /decks          │
│ └── [Megaphone]    Campaigns      → /campaigns      │
│     ├── Case Studies → /case-studies                 │
│     ├── Surveys      → /surveys                     │
│     └── Testimonials → /testimonials                │
├─────────────────────────────────────────────────────┤
│ ── FINANCE (collapsed by default) ──                │
│ ├── [Landmark]     Overview       → /finance        │
│ ├── [DollarSign]   Revenue        → /revenue        │
│ ├── [FileSheet]    Billing        → /invoices       │
│ │   ├── Client Invoices     → /client-invoices       │
│ │   ├── Payments            → /payments              │
│ │   ├── Recurring Invoices  → /recurring-invoices    │
│ │   └── Credit Notes        → /credit-notes          │
│ ├── [Receipt]      Expenses       → /expenses       │
│ ├── [PiggyBank]    Budgeting      → /budgets        │
│ │   ├── Milestones    → /milestones                  │
│ │   ├── Job Costing   → /job-costing                 │
│ │   └── Rate Cards    → /rate-cards                  │
│ ├── [TrendingUp]   Revenue Recognition → /finance/revenue-recognition│
│ ├── [Banknote]     Payroll Runs   → /payroll-batches│
│ ├── [ShoppingCart] Procurement    → /procurement    │
│ │   ├── Purchase Requisitions → /purchase-requisitions│
│ │   ├── Goods Receipts       → /goods-receipts       │
│ │   └── Vendor Risk          → /vendor-risk          │
│ ├── [CircleDollar] Governance     → /gl-accounts    │
│ │   ├── Budget Approvals  → /budget-approvals        │
│ │   └── Payment Approvals → /payment-approvals       │
│ └── [CalendarDays] Financial Periods → /financial-periods│
├─────────────────────────────────────────────────────┤
│ ── LEGAL (collapsed by default) ──                  │
│ ├── [FileSignature]Contracts      → /contracts      │
│ ├── [ClipboardMinus]Obligations   → /obligations    │
│ ├── [FileBadge]    Permits & Licenses → /permits    │
│ ├── [Shield]       Insurance      → /insurance-policies│
│ ├── [Fingerprint]  IP & Usage Rights → /ip-rights   │
│ ├── [AlertTriangle]Incidents      → /incidents      │
│ ├── [FileCheck]    Compliance Checklists → /compliance-checklists│
│ ├── [Wrench]       Engineering Approvals → /engineering-approvals│
│ └── [BookLock]     Clause Library → /clause-library │
├─────────────────────────────────────────────────────┤
│ ── ADMIN (collapsed by default) ──                  │
│ ├── [UsersRound]   Users          → /user-management│
│ ├── [UserPlus]     Invitations    → /user-management/invitations│
│ ├── [Shield]       Roles          → /roles          │
│ ├── [Users]        Teams          → /teams          │
│ ├── [GitBranch]    Org Chart      → /org-chart      │
│ ├── [UserCircle]   People         → /people         │
│ ├── [ShieldQ]      Access Reviews → /user-management/access-reviews│
│ ├── [KeyRound]     Audit Log      → /user-management/audit-log│
│ ├── [BookOpen]     Knowledge Base → /knowledge-base │
│ ├── [Layers]       SOPs           → /sops           │
│ ├── [Lock]         Vault          → /vault          │
│ ├── [Settings]     Settings       → /settings       │
│ │   ├── Security              → /settings/security  │
│ │   ├── Notification Prefs    → /settings/notifications│
│ │   ├── Email Integration     → /settings/email-integration│
│ │   ├── Custom Fields         → /settings/custom-fields│
│ │   ├── AI Copilot            → /settings/ai        │
│ │   └── Developer Portal      → /settings/developer │
│ ├── [Layers]       Tags           → /tags           │
│ ├── [Link2]        Integrations   → /integrations   │
│ │   ├── Sync Log       → /integrations/sync-log     │
│ │   └── Marketplace    → /integrations/marketplace  │
│ ├── [Ticket]       Credentials    → /credentials    │
│ │   └── Assignments → /credentials/assignments       │
│ ├── [Users]        Client Portal  → /client-portal  │
│ ├── [ScanBarcode]  Vendor Portal  → /vendor-portal  │
│ ├── [HeartPulse]   System Health  → /system-health  │
│ └── [Download]     Data Export    → /data-export    │
├─────────────────────────────────────────────────────┤
│ ── LIVE OPERATIONS (contextual — visible only      │
│    when navigating /live-ops/*) ──                   │
│ ├── [Radio]        Command Dashboard → /live-ops    │
│ ├── [Megaphone]    Run of Show    → /live-ops/run-of-show│
│ ├── [Gauge]        Readiness Gates→ /live-ops/readiness│
│ ├── [LayoutList]   Department Status → /live-ops/departments│
│ ├── [HardHat]      Live Crew      → /live-ops/crew  │
│ ├── [ScanBarcode]  Equipment      → /live-ops/equipment│
│ ├── [Radio]        Comms          → /live-ops/comms  │
│ ├── [Drama]        Front of House → /live-ops/foh   │
│ ├── [Ticket]       Credentials    → /live-ops/credentials│
│ ├── [QrCode]       Gate Scanner   → /live-ops/gate  │
│ ├── [Crown]        VIP Management → /live-ops/vip   │
│ ├── [AlertTriangle]Guest Incidents→ /live-ops/guest-incidents│
│ ├── [Thermometer]  Environment    → /live-ops/environment│
│ ├── [Landmark]     Financials     → /live-ops/financials│
│ ├── [ArrowLR]      Strike & Load-Out → /live-ops/strike│
│ ├── [ClipboardChk] Reconciliation → /live-ops/reconciliation│
│ └── [FileBarChart] Post-Event Reports → /live-ops/reports│
├─────────────────────────────────────────────────────┤
│ USER FOOTER                                         │
│ [Avatar] Display Name                    [Sign Out]│
│          Role                                       │
└─────────────────────────────────────────────────────┘
```

---

## Item Counts by Section

| Section | Top-Level Items | Child Items | Total | Default Expanded |
|---------|:-:|:-:|:-:|:-:|
| Home | 7 | 6 | 13 | ✅ Yes |
| Business | 7 | 6 | 13 | ❌ No |
| Production | 9 | 8 | 17 | ❌ No |
| Operations | 9 | 6 | 15 | ❌ No |
| Workforce | 13 | 6 | 19 | ❌ No |
| Resources | 8 | 4 | 12 | ❌ No |
| Creative | 8 | 3 | 11 | ❌ No |
| Finance | 10 | 8 | 18 | ❌ No |
| Legal | 9 | 0 | 9 | ❌ No |
| Admin | 18 | 8 | 26 | ❌ No |
| Live Ops | 17 | 0 | 17 | ✅ Yes (contextual) |
| **TOTAL** | **115** | **55** | **170** | — |

---

## RBAC Visibility Per Role

### exec (Executive)
- **Visible sections:** All 10 + Live Ops (contextual)
- **Visible top-level items:** All 115
- **Assessment:** Full access. All items visible.

### director (Director)
- **Visible sections:** All 10 + Live Ops
- **Approximate visible items:** ~110 (most items — a few manage-gated items may be hidden)
- **Assessment:** Nearly identical to exec

### pm (Project Manager)
- **Visible sections:** All 10 + Live Ops
- **Approximate visible items:** ~105
- **Assessment:** Broad access, some finance governance items hidden

### member (Team Member)
- **Visible sections:** Home (limited), Production (read-mostly), Workforce (own), some Operations, some Legal
- **Approximate visible items:** ~35–45
- **Assessment:** Heavily filtered. Many sections appear empty or with 1–2 items.

### client (Client)
- **Visible sections:** Home (limited), some Production, some Creative, some Legal
- **Approximate visible items:** ~15–20
- **Assessment:** Portal-like experience. Many sections hidden entirely.

### collaborator (External Partner)
- **Visible sections:** Home (dashboard only), some Operations, Vendor Portal
- **Approximate visible items:** ~10–15
- **Assessment:** Most restricted. Minimal navigation surface.

---

## Sidebar Behaviors

| Feature | Status | Details |
|---------|--------|---------|
| Collapsible (desktop) | ✅ | Icon-only mode at 60px; expanded at 260px |
| Mobile drawer | ✅ | Slide-out with overlay, focus trap, inert main content |
| Section expand/collapse | ✅ | Per-section toggle, state persisted in component |
| Child expand/collapse | ✅ | Chevron toggle per parent item |
| Pinned favorites | ✅ | Star/pin icons, max 7 enforced by store, persisted |
| Inline search/filter | ✅ | "/" shortcut, matches title/path/child titles |
| Active state indicator | ✅ | Left accent bar (3px), bg highlight, text color change |
| Badge/count support | ✅ | Badge prop on NavItem, displayed as pill |
| Tooltips (collapsed) | ✅ | Item title shown via Tooltip on hover |
| RBAC filtering | ✅ | `getNavigationSectionsForRole()` — items hidden, not disabled |
| Tier gating | ✅ | `minTier` prop filters items below org pricing tier |
| Contextual sections | ✅ | Live Ops visible only on /live-ops/* routes |
| Escape key handling | ✅ | Closes mobile drawer on Escape |
| Scroll to active | ✅ | `scrollIntoView` on mount for active item |
| Keyboard nav | Partial | "/" for search, no arrow-key sidebar nav |

---

## Flagged Issues

| # | Severity | Finding |
|---|----------|---------|
| 1 | 🔴 FAIL | **Admin section has 18 top-level items** — far exceeds Miller's Law (7±2). Users cannot scan this. |
| 2 | 🔴 FAIL | **Workforce section has 13 top-level items** — needs sub-grouping into "Crew & Scheduling" vs "Vendors". |
| 3 | 🟡 WARN | **Live Ops has 17 items** — acceptable because it's contextual, but still benefits from sub-grouping. |
| 4 | 🟡 WARN | **Finance has 10 top-level items** — at the upper bound; "Procurement" and "Governance" children help. |
| 5 | 🟡 WARN | **Duplicate icons**: `CalendarDays` used for Calendar, Shifts, and Availability in different sections. |
| 6 | 🟡 WARN | **Duplicate icons**: `Star` used for Creative Reviews and Vendor Reviews. |
| 7 | 🟡 WARN | **"Tasks" appears in both Home and Production** — potential confusion, different paths (/home/tasks vs /tasks). |
| 8 | 🟡 WARN | **"Documents" appears in Home and Operations** — different paths (/home/documents vs /documents). |
| 9 | 🟡 WARN | **Section collapse state not persisted** across page navigation — resets to defaults from `navigationConfig`. |
| 10 | ⚠️ NOTE | For `member` role, many sections have only 1–2 items — sections with single items should be promoted. |
