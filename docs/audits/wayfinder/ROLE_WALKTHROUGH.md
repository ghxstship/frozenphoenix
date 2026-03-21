# 🧭 WAYFINDER — Role Walkthrough

**Prompt Code:** `FP-UX-WAYFINDER-001` · **Phase 5.1** · **Date:** 2026-03-21

---

> **Note:** Frozen Phoenix uses 6 RBAC roles (not 11). The permission matrix maps to the prompt's conceptual roles as follows:
> - `exec` → super_admin + org_admin
> - `director` → director + production_mgr
> - `pm` → project_manager + crew_lead
> - `member` → crew_member
> - `client` → client + viewer
> - `collaborator` → vendor + guest

---

## Role 1: `exec` — "Alex, Platform Administrator / Operations Director"

### Scenario 1: "I just logged in. What do I need to do right now?"
- ✅ Dashboard is first sidebar item, default entry point
- ✅ Dashboard surfaces KPIs, upcoming events, pending approvals
- 🟡 Dashboard may show too much data for an exec — no executive summary widget
- ✅ All features accessible from dashboard
- **Friction:** None — full access, all items visible

### Scenario 2: "I need to find a specific crew member quickly."
- ✅ ⌘K command palette: type crew name → navigate instantly (1 click)
- ✅ Sidebar → Workforce → Crew → search within list (2 clicks)
- ✅ Results scoped to accessible data (exec sees all)
- **Friction:** None

### Scenario 3: "I need to review financial reports across all projects."
1. Sidebar → Home → Insights (1 click to expand)
2. Click "Custom Dashboards" or "AI Reports" (1 click)
3. View cross-project data

- **Click count:** 2
- **Friction:** Minor — "Insights" label not immediately obvious for financial reporting

### Scenario 4: "Something unexpected happened — a vendor hasn't completed compliance."
1. Sidebar → Workforce → Vendor Compliance (2 clicks)
2. Filter for specific vendor
3. Or: ⌘K → "vendor compliance" → navigate

- ✅ Help accessible via topbar Help menu (2 clicks)
- ✅ Error messages include action guidance
- **Friction:** None

---

## Role 2: `director` — "Jordan, Operations Director / Morgan, Senior Producer"

### Scenario 1: "I just logged in."
- ✅ Same dashboard as exec
- ✅ All operational sections accessible
- 🟡 Sidebar shows ~110 items — same cognitive load concern as exec
- **Friction:** Information overload potential if sections are expanded

### Scenario 2: "I need to find an event's budget status."
1. Sidebar → Production → Events (2 clicks)
2. Click event → Budget tab (2 clicks)

- **Click count:** 4 total
- **Cognitive decisions:** 3 (which section, which event, which tab)
- **Score:** 🔴 FAIL for Two-Click Rule from dashboard
- **With ⌘K:** Type event name → arrive at detail → 1 tab click = 2 effective ✅

### Scenario 3: "I need to approve a pending purchase requisition."
1. Sidebar → Finance → Governance → Budget Approvals (3 clicks — nested)
2. Or: Home → Notifications → click approval notification

- **Friction:** Approvals are buried under Finance > Governance. Should be surfaced as a badge or dashboard widget.

### Scenario 4: "A crew member reported a safety incident."
1. Sidebar → Legal → Incidents (2 clicks)
2. Create new incident
- ✅ Or: ⌘K → "incident" → Quick Create

- **Friction:** None — adequately accessible

---

## Role 3: `pm` — "Casey, Production Manager / Taylor, Lead Technician"

### Scenario 1: "I just logged in."
- ✅ Dashboard shows project-level tasks/events/schedule
- ✅ Top 3 daily tasks: View tasks, Check schedule, Review crew assignments
- ✅ Tasks accessible from Home section (1 click)
- **Friction:** None — core workflow items are in always-expanded Home

### Scenario 2: "I need to assign a crew member to an event this week."
1. Sidebar → Production → Events (2 clicks)
2. Click event row (1 click + page load)
3. Click "Crew" tab (1 click)
4. Click "Assign" button (1 click)
5. Search/select crew member (2 clicks)
6. Confirm (1 click)

- **Click count:** 8
- **Cost:** ⚫ HOSTILE (22 cost score)
- **Friction:** This is the PM's most frequent task and it's punishingly expensive

### Scenario 3: "I need to check who's available next Tuesday."
1. Sidebar → Workforce → Availability (2 clicks)
2. Filter to date

- **Click count:** 3
- **Friction:** Acceptable with date picker

### Scenario 4: "The client is asking about event progress. I need help."
1. Topbar → Help → Contact support (2 clicks)
- ✅ Accessible
- **Friction:** None

---

## Role 4: `member` — "Jamie, A/V Technician"

### Scenario 1: "I just logged in."
- ✅ Dashboard accessible
- ✅ Home → Tasks shows assigned work
- 🟡 Sidebar may still show sections with only 1–2 items (Operations with just Approvals + Checklists)
- **Friction:** Sections with very few items feel sparse — should be hidden or consolidated

### Scenario 2: "I need to find my schedule for this week."
1. Sidebar → Home → Calendar (1 click)
- ✅ Direct access
- **Friction:** None

### Scenario 3: "I need to log my hours for today."
1. Sidebar → Workforce → Time Tracking (2 clicks)
2. Click "New Entry" or inline time entry

- **Click count:** 3
- **Friction:** Minor — could be surfaced on dashboard as a quick action

### Scenario 4: "I can't access a page I need."
- 🟡 RBAC hides items — member sees no error, just a shorter sidebar
- ✅ If they navigate via URL to an unauthorized page, error boundary handles it
- 🟡 No contextual message like "Ask your PM for access"
- **Friction:** Silent permission denial can be confusing

---

## Role 5: `client` — "Riley, Brand Marketing Manager / Sam, Executive Stakeholder"

### Scenario 1: "I just logged in."
- ✅ Dashboard accessible
- 🟡 Dashboard may show widgets that are empty for clients (no tasks, no crew)
- 🟡 Sidebar shows ~15–20 items — acceptable density
- **Friction:** Dashboard not tailored for client persona

### Scenario 2: "I need to view the progress of my event."
1. Sidebar → Production → Events (2 clicks — if Production section visible)
2. Click event

- **Click count:** 3
- **Friction:** "Production" section label may confuse clients — they think in terms of "My Events"
- **Recommendation:** Client role should see a "My Events" label, not "Production"

### Scenario 3: "I need to review and approve a creative deliverable."
1. Sidebar → Creative → Creative Reviews (2 clicks)
2. Click review item
3. Approve/reject

- **Click count:** 4
- **Friction:** Acceptable

### Scenario 4: "I want to see my invoices."
1. Sidebar → Finance → Billing → Client Invoices (3 clicks — nested)
- **Friction:** 🟡 Client must navigate Finance > Billing > Client Invoices — too much nesting for their most needed financial view

---

## Role 6: `collaborator` — "Pat, Vendor Account Manager"

### Scenario 1: "I just logged in."
- ✅ Dashboard accessible
- 🟡 Very limited sidebar (~10–15 items)
- 🟡 Many irrelevant sections may still show (with 1 item each)
- **Friction:** Sparse sidebar may look broken — needs consolidation

### Scenario 2: "I need to view my work orders."
1. Sidebar → Look for Work Orders (which section?)
- **Friction:** Collaborator may not know which section Work Orders lives in
- ✅ Accessible via sidebar search ("/")

### Scenario 3: "I need to upload compliance documents."
1. Sidebar → Vendor Compliance (if visible)
2. Upload documents

- **Friction:** Minimal — direct sidebar access

### Scenario 4: "I'm locked out or can't access something."
- 🟡 No contextual help for collaborators
- 🟡 Help menu available but support may not be tailored
- 🔴 After 48 hours post load-out, `shouldRevokeAccess()` silently blocks access — no messaging

---

## Summary: Friction Points by Role

| Role | Scenario 1 | Scenario 2 | Scenario 3 | Scenario 4 |
|------|:----------:|:----------:|:----------:|:----------:|
| exec | 🟢 | 🟢 | 🟡 | 🟢 |
| director | 🟡 | 🔴 | 🔴 | 🟢 |
| pm | 🟢 | ⚫ | 🟡 | 🟢 |
| member | 🟡 | 🟢 | 🟡 | 🟡 |
| client | 🟡 | 🟡 | 🟡 | 🟡 |
| collaborator | 🟡 | 🟡 | 🟢 | 🔴 |

### Top Friction Areas

1. **PM crew assignment workflow** — highest-frequency task, highest friction (⚫ HOSTILE)
2. **Director approval discovery** — approvals buried under Finance > Governance
3. **Client navigation mental model** — "Production" label confusing for clients
4. **Collaborator access revocation** — no user-facing messaging when access expires
5. **Single-item sections for member/client** — sparse sidebar feels broken
