# 🧭 WAYFINDER — Two-Click Compliance Matrix

**Prompt Code:** `FP-UX-WAYFINDER-001` · **Phase 6.2** · **Date:** 2026-03-21

---

## Scoring Legend

```
1 ✅ — 1 click: Excellent
2 ✅ — 2 clicks: Compliant
3 🟡 — 3 clicks: Warning — needs optimization path
4 🔴 — 4+ clicks: Violation — must be restructured
N/R  — Not reachable without guessing
⌘K   — Reachable in 1 step via Command Palette
```

> **Note:** Click counts assume the user starts with all sections collapsed (default state), and the Home section expanded.

---

## Primary Navigation Matrix

| From ↓ \ To → | Dashboard | Events | Event Detail | Crew List | Tasks | Calendar | Messages | Budget | Settings | Help |
|----------------|:---------:|:------:|:----------:|:---------:|:-----:|:--------:|:--------:|:------:|:--------:|:----:|
| **Dashboard** | — | 2 ✅ | 3 🟡 | 2 ✅ | 1 ✅ | 1 ✅ | 1 ✅ | 2 ✅ | 2 ✅ | 2 ✅ |
| **Events List** | 1 ✅ | — | 1 ✅ | 2 ✅ | 1 ✅ | 1 ✅ | 1 ✅ | 2 ✅ | 2 ✅ | 2 ✅ |
| **Event Detail** | 1 ✅ | 1 ✅ | — | 2 ✅ | 1 ✅ | 1 ✅ | 1 ✅ | 1 ✅† | 2 ✅ | 2 ✅ |
| **Crew List** | 1 ✅ | 2 ✅ | 3 🟡 | — | 1 ✅ | 1 ✅ | 1 ✅ | 2 ✅ | 2 ✅ | 2 ✅ |
| **Tasks List** | 1 ✅ | 2 ✅ | 3 🟡 | 2 ✅ | — | 1 ✅ | 1 ✅ | 2 ✅ | 2 ✅ | 2 ✅ |
| **Calendar** | 1 ✅ | 2 ✅ | 3 🟡 | 2 ✅ | 1 ✅ | — | 1 ✅ | 2 ✅ | 2 ✅ | 2 ✅ |
| **Messages** | 1 ✅ | 2 ✅ | 3 🟡 | 2 ✅ | 1 ✅ | 1 ✅ | — | 2 ✅ | 2 ✅ | 2 ✅ |
| **Budget** | 1 ✅ | 2 ✅ | 3 🟡 | 2 ✅ | 1 ✅ | 1 ✅ | 1 ✅ | — | 2 ✅ | 2 ✅ |
| **Settings** | 1 ✅ | 2 ✅ | 3 🟡 | 2 ✅ | 1 ✅ | 1 ✅ | 1 ✅ | 2 ✅ | — | 2 ✅ |
| **Help** | 1 ✅ | 2 ✅ | 3 🟡 | 2 ✅ | 1 ✅ | 1 ✅ | 1 ✅ | 2 ✅ | 2 ✅ | — |

† *Budget is 1 click from Event Detail if event has budget tab*

---

## Breakdown: Click Paths

### 1-Click Paths (from any page)
All items in the **expanded Home section** are 1-click away from any page:
- **Dashboard** → `/dashboard`
- **Tasks** → `/home/tasks`
- **Calendar** → `/calendar`
- **Messages** → `/messages`
- **Notifications** → `/notifications`
- **Documents** → `/home/documents`

Also 1-click:
- **Help** → Topbar Help dropdown (no page load)

### 2-Click Paths (from any page)
Items in **collapsed sections** require 2 clicks (expand section + click item):
- **Events** → expand Production + click Events
- **Crew** → expand Workforce + click Crew
- **Budgets** → expand Finance + click Budgeting
- **Settings** → expand Admin + click Settings

### 3-Click Paths (the 🟡 WARN cells)
Reaching an **entity detail page** from a non-related context:
- Click 1: Expand section
- Click 2: Click list page
- Click 3: Click entity row

**This is the primary Two-Click Rule violation.** Navigating to a specific entity always requires 3 clicks when starting from an unrelated section.

---

## Command Palette Impact

When the Command Palette (⌘K) is functional, every cell in the matrix becomes **1 ✅**:

| Mechanism | Effective Clicks |
|-----------|:----:|
| Type entity name → press Enter | 1 |
| Type page name → press Enter | 1 |
| Type action name (e.g., "create event") → press Enter | 1 |

**With ⌘K, the matrix is 100% compliant.** Without it, 10 cells are at 3 🟡.

---

## Cross-Domain Navigation Matrix

| From ↓ \ To → | Finance Overview | Invoices | Contracts | Vendors | Approvals | Reports |
|----------------|:----:|:----:|:----:|:----:|:----:|:----:|
| **Event Detail** | 2 ✅ | 2 ✅ | 2 ✅ | 2 ✅ | 2 ✅ | 2 ✅ |
| **Crew Detail** | 2 ✅ | 2 ✅ | 2 ✅ | 2 ✅ | 2 ✅ | 2 ✅ |
| **Dashboard** | 2 ✅ | 2 ✅ | 2 ✅ | 2 ✅ | 2 ✅ | 2 ✅ |
| **Vendor Detail** | 2 ✅ | 2 ✅ | 2 ✅ | 1 ✅ | 2 ✅ | 2 ✅ |

**Assessment:** Cross-domain navigation is consistently 2 clicks (expand section + click item) from any page. Compliant.

---

## Nested Items Matrix

Items that require **expanding a parent** (3+ clicks without ⌘K):

| Item | Path | Clicks from Dashboard |
|------|------|:----:|
| Client Invoices | Finance → Billing → Client Invoices | 3 🟡 |
| Payments | Finance → Billing → Payments | 3 🟡 |
| Purchase Requisitions | Finance → Procurement → Purchase Reqs | 3 🟡 |
| Budget Approvals | Finance → Governance → Budget Approvals | 3 🟡 |
| SLA Definitions | Operations → Service Requests → SLA Defs | 3 🟡 |
| QC Gates | Operations → Quality Checks → Gates | 3 🟡 |
| Call Sheets | Operations → Documents → Call Sheets | 3 🟡 |
| Performance Reviews | Workforce → Workforce → Performance Reviews | 3 🟡 |
| Settings sub-pages | Admin → Settings → Security/Notifications/etc. | 3 🟡 |
| Integration sub-pages | Admin → Integrations → Sync Log / Marketplace | 3 🟡 |

**Total 🟡 cells:** ~12 nested items require 3 clicks

---

## Compliance Summary

| Score | Cell Count | Percentage |
|:-----:|:----------:|:----------:|
| 1 ✅ | ~60 | 50% |
| 2 ✅ | ~40 | 33% |
| 3 🟡 | ~22 | 18% |
| 4+ 🔴 | 0 | 0% |
| N/R ⚫ | 0 | 0% |

### Assessment

- **83% of navigation paths are ≤ 2 clicks** ✅
- **No paths require 4+ clicks** ✅
- **No unreachable destinations** ✅
- **Command Palette (⌘K) reduces all 🟡 to ✅** provided it is fully functional
- **12 nested child items** require 3 clicks — acceptable as these are lower-frequency items
- **Entity detail pages** (e.g., specific event) always require list → row click, adding an inherent extra step

### Key Recommendation
Ensure Command Palette is fully operational — it is the universal "1-click to anywhere" escape hatch that achieves 100% two-click compliance.
