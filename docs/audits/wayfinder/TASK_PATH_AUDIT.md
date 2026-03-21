# 🧭 WAYFINDER — Task Path Audit

**Prompt Code:** `FP-UX-WAYFINDER-001` · **Phase 2.1** · **Date:** 2026-03-21

---

## Scoring Legend

```
✅ PASS:  ≤ 2 clicks to destination, ≤ 2 cognitive decisions
🟡 WARN:  3 clicks OR 3 cognitive decisions
🔴 FAIL:  4+ clicks OR 4+ cognitive decisions
⚫ DEAD:  Task cannot be completed without guessing/hunting
```

---

## Entity Management

### Create a new event

| Field | Value |
|-------|-------|
| **Role** | pm, director, exec |
| **Starting point** | Dashboard |
| **Path** | (1) Click "+" Quick Create in topbar → (2) Click "New Event" |
| **Click count** | 2 |
| **Cognitive decisions** | 1 (scan Quick Create groups) |
| **Score** | ✅ PASS |

**Alternative:** Sidebar → Production (expand) → Events → "Create" button = 3 clicks 🟡

### View/edit an existing event

| Field | Value |
|-------|-------|
| **Role** | pm, director, exec |
| **Starting point** | Dashboard |
| **Path** | (1) Sidebar → Production (expand) → Events → (2) Click event row |
| **Click count** | 2 (expand section + click item = 1 conceptual nav, then click event) |
| **Cognitive decisions** | 2 (which section, then which event) |
| **Score** | ✅ PASS |

**With Command Palette:** ⌘K → type event name → Enter = 1 effective click ✅

### Search for a specific event by name

| Field | Value |
|-------|-------|
| **Role** | All with read access |
| **Path** | (1) ⌘K → (2) type name → (3) select result |
| **Click count** | 1 (open palette, select) |
| **Cognitive decisions** | 0 |
| **Score** | ✅ PASS |

### Duplicate an event

| Field | Value |
|-------|-------|
| **Role** | pm+ |
| **Path** | (1) Navigate to event → (2) Open action menu → (3) Click "Duplicate" |
| **Click count** | 3 (navigate + open menu + duplicate) |
| **Cognitive decisions** | 2 |
| **Score** | 🟡 WARN — action is behind a contextual menu |

### Archive/delete an event

| Field | Value |
|-------|-------|
| **Path** | (1) Navigate to event → (2) Open action menu → (3) Click "Archive"/"Delete" → (4) Confirm |
| **Click count** | 4 |
| **Score** | 🟡 WARN — destructive action confirmation adds one justified click |

---

## Team & Crew

### Invite a new team member

| Field | Value |
|-------|-------|
| **Role** | pm+, or invitations.write |
| **Path** | (1) "+" Quick Create → (2) "Invite Member" |
| **Click count** | 2 |
| **Score** | ✅ PASS |

### Assign crew to an event

| Field | Value |
|-------|-------|
| **Role** | pm+ |
| **Path** | (1) Navigate to event detail → (2) Select "Crew" tab → (3) Click "Assign" button → (4) Search/select crew |
| **Click count** | 4 |
| **Cognitive decisions** | 3 (which event, which tab, which crew member) |
| **Score** | 🔴 FAIL — too many steps for a core workflow |

**Recommendation:** Add inline "+" on crew tab with type-ahead popover to reduce to 2 clicks from event detail.

### View crew availability/schedule

| Field | Value |
|-------|-------|
| **Role** | pm+ |
| **Path** | (1) Sidebar → Workforce (expand) → Availability |
| **Click count** | 2 |
| **Score** | ✅ PASS |

### Change a team member's role

| Field | Value |
|-------|-------|
| **Path** | (1) Sidebar → Admin (expand) → Users → (2) Find user → (3) Click user → (4) Edit role |
| **Click count** | 4 |
| **Score** | 🔴 FAIL — Admin section too deep |

### Remove a team member

| Field | Value |
|-------|-------|
| **Path** | (1) Navigate to member → (2) Action menu → (3) Remove → (4) Confirm |
| **Click count** | 4 |
| **Score** | 🟡 WARN — justified by destructive nature |

---

## Production Operations

### Create a task

| Field | Value |
|-------|-------|
| **Path** | (1) "+" Quick Create → (2) "New Task" |
| **Click count** | 2 |
| **Score** | ✅ PASS |

### View all tasks assigned to me

| Field | Value |
|-------|-------|
| **Path** | (1) Sidebar → Home → Tasks (/home/tasks) |
| **Click count** | 1 |
| **Score** | ✅ PASS |

### Update task status

| Field | Value |
|-------|-------|
| **Path** | (1) Navigate to task list → (2) Click status field → (3) Select new status |
| **Click count** | 2–3 |
| **Score** | ✅ PASS (if inline editing) / 🟡 WARN (if via detail page) |

### View production calendar

| Field | Value |
|-------|-------|
| **Path** | (1) Sidebar → Home → Calendar |
| **Click count** | 1 |
| **Score** | ✅ PASS |

### Access production documents

| Field | Value |
|-------|-------|
| **Path** | (1) Sidebar → Home → Documents (/home/documents) |
| **Click count** | 1 |
| **Score** | ✅ PASS |

---

## Financial

### View budget summary for an event

| Field | Value |
|-------|-------|
| **Path** | (1) Navigate to event detail → (2) Select "Budget" tab |
| **Click count** | 2 |
| **Score** | ✅ PASS |

### Create/send an invoice

| Field | Value |
|-------|-------|
| **Path** | (1) "+" Quick Create → (2) "New Invoice" |
| **Click count** | 2 |
| **Score** | ✅ PASS |

### Track expenses

| Field | Value |
|-------|-------|
| **Path** | (1) Sidebar → Finance (expand) → Expenses |
| **Click count** | 2 |
| **Score** | ✅ PASS |

### View financial reports

| Field | Value |
|-------|-------|
| **Path** | (1) Sidebar → Home → Insights (expand) → AI Reports or Custom Dashboards |
| **Click count** | 2 (expand Insights + click sub-item) |
| **Score** | ✅ PASS |

### Manage vendor payments

| Field | Value |
|-------|-------|
| **Path** | (1) Sidebar → Finance (expand) → Billing (expand) → Payments |
| **Click count** | 3 (expand Finance + expand Billing + click Payments) |
| **Score** | 🟡 WARN — nested under two levels |

---

## Settings & Account

### Update profile information

| Field | Value |
|-------|-------|
| **Path** | (1) Topbar → User menu → (2) "Profile" or "Settings" |
| **Click count** | 2 |
| **Score** | ✅ PASS |

### Change organization settings

| Field | Value |
|-------|-------|
| **Path** | (1) Sidebar → Admin (expand) → Settings |
| **Click count** | 2 |
| **Score** | ✅ PASS |

### Configure notification preferences

| Field | Value |
|-------|-------|
| **Path** | (1) Sidebar → Admin → Settings (expand) → Notification Preferences |
| **Click count** | 3 |
| **Score** | 🟡 WARN — nested behind both Admin section AND Settings children |

### Access help/support

| Field | Value |
|-------|-------|
| **Path** | (1) Topbar → Help menu → (2) "Contact support" |
| **Click count** | 2 |
| **Score** | ✅ PASS |

---

## Cross-Page Journey Analysis

### Event Lifecycle

```
Create Event → Configure Details → Assign Crew → Add Tasks → Track Progress → Close Out

Step 1: Quick Create + → New Event          = 2 clicks
Step 2: Fill form, save                      = 0 nav clicks (same page)
Step 3: Go to Crew tab on event detail       = 1 click (tab switch)
Step 4: Assign crew via modal                = 2 clicks (+ button, select)
Step 5: Go to Tasks tab                      = 1 click (tab switch)
Step 6: Add tasks                            = 2 clicks (+ button, fill & save)
Step 7: Monitor via Dashboard or Calendar    = 1 click (sidebar)
Step 8: Close out event via action menu      = 2 clicks (action menu, confirm)

Total clicks: ~11 for full lifecycle
Section switches: 1 (return to Dashboard at step 7)
Context preservation: ✅ Tabs keep user in event context
```

**Assessment:** 🟡 Generally good. Steps 3–6 stay within event context via tabs. Main friction: assigning crew requires navigating to a crew tab and using a modal rather than inline addition.

### Financial Cycle

```
Set Budget → Track Expenses → Invoice Client → Record Payment

Step 1: Event detail → Budget tab           = 2 clicks
Step 2: Sidebar → Finance → Expenses        = 2 clicks (section change ⚠️)
Step 3: Quick Create → New Invoice           = 2 clicks
Step 4: Finance → Billing → Payments         = 3 clicks

Total clicks: ~9
Section switches: 3 (event→finance→create→finance)
```

**Assessment:** 🔴 Financial workflow is fragmented across multiple sidebar sections. Budget is inside the event context but expenses, invoices, and payments require sidebar jumping. Bidirectional links (event → finances) are needed.

---

## Summary Scorecard

| Category | ✅ PASS | 🟡 WARN | 🔴 FAIL | ⚫ DEAD |
|----------|:-------:|:-------:|:-------:|:-------:|
| Entity Management | 3 | 2 | 0 | 0 |
| Team & Crew | 2 | 1 | 2 | 0 |
| Production Operations | 4 | 1 | 0 | 0 |
| Financial | 3 | 1 | 1 | 0 |
| Settings & Account | 3 | 1 | 0 | 0 |
| **TOTAL** | **15** | **6** | **3** | **0** |

### Top Priority Fixes

1. **Assign crew to event** → Add inline crew assignment from event detail (popover, not modal)
2. **Change member role** → Expose role change from user list (inline select, not via detail page)
3. **Financial workflow fragmentation** → Add inline financial summary to event detail with direct links
