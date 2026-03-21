# 🧭 WAYFINDER — Sidebar Cognitive Audit

**Prompt Code:** `FP-UX-WAYFINDER-001` · **Phase 3.1** · **Date:** 2026-03-21

---

## 1. Label Clarity Test

| Label | Predictable? | Industry Standard? | Form | Ambiguity Risk | Score |
|-------|:---:|:---:|------|----------------|:---:|
| Dashboard | ✅ | ✅ | Noun | None | 🟢 |
| Messages | ✅ | ✅ | Noun | None | 🟢 |
| Tasks | ✅ | ✅ | Noun | ⚠️ Appears in Home AND Production | 🟡 |
| Calendar | ✅ | ✅ | Noun | None | 🟢 |
| Notifications | ✅ | ✅ | Noun | None | 🟢 |
| Documents | ✅ | ✅ | Noun | ⚠️ Appears in Home AND Operations | 🟡 |
| Insights | 🟡 | Partial | Noun | Could mean analytics, AI, or reports | 🟡 |
| Pipeline | ✅ | ✅ | Noun | None for sales users | 🟢 |
| Leads | ✅ | ✅ | Noun | None | 🟢 |
| Opportunities | ✅ | ✅ | Noun | None | 🟢 |
| Deals | ✅ | ✅ | Noun | None | 🟢 |
| Contacts | ✅ | ✅ | Noun | Routes to /companies — label/route mismatch | 🟡 |
| Stakeholders | 🟡 | Partial | Noun | Overlaps with Contacts conceptually | 🟡 |
| Scopes of Work | ✅ | ✅ | Noun | None for industry users | 🟢 |
| Activations | 🟡 | Industry | Noun | Not obvious outside events/marketing | 🟡 |
| Bills of Materials | ✅ | ✅ | Noun | None for production users | 🟢 |
| Advancing | 🔴 | Industry | Gerund | **Opaque to outsiders** — event-industry jargon | 🔴 |
| Resilience | 🟡 | Partial | Noun | Unclear what "resilience targets" means | 🟡 |
| Workforce | 🟡 | ✅ | Noun | Section name AND item name — self-referential | 🟡 |
| Governance | 🟡 | Partial | Noun | Could mean legal, compliance, or finance | 🟡 |

### Grammatical Consistency
- ✅ All labels are **nouns** (no verb-form labels like "Create Event" in sidebar)
- 🟡 Mix of **singular** ("Calendar") and **plural** ("Tasks", "Events") — not consistently plural
- 🟡 "Scopes of Work" is multi-word while most labels are 1–2 words

### Key Issues
1. 🔴 **"Advancing"** — industry jargon, needs tooltip or rename to "Advances" or "Advance Orders"
2. 🟡 **"Contacts" routes to /companies** — label says one thing, URL says another
3. 🟡 **"Tasks" and "Documents" appear in two sections** — users may click the wrong one

---

## 2. Icon Clarity Test

| Issue | Details |
|-------|---------|
| **Consistent family?** | ✅ All icons from Lucide (consistent style, weight, sizing) |
| **Consistent sizing?** | ✅ All h-[18px] w-[18px] via `SidebarNavItem` |
| **Icons reinforce labels?** | ✅ Most icons match expectations (Calendar → CalendarDays, Crew → HardHat) |

### Duplicate Icon Issues

| Icon | Used By | Sections | Risk |
|------|---------|----------|------|
| `CalendarDays` | Calendar, Shifts, Availability, Financial Periods | Home, Workforce, Finance | 🔴 3+ identical icons in collapsed sidebar |
| `Star` | Creative Reviews, Vendor Reviews | Creative, Workforce | 🟡 Same icon, different sections |
| `CheckSquare` | Tasks (Home), Tasks (Production) | Home, Production | 🟡 Same icon for duplicate label |
| `ShoppingCart` | Advancing, Purchase Orders, Procurement | Production, Resources, Finance | 🟡 3 uses across sections |
| `Layers` | Bills of Materials, SOPs, Tags | Production, Admin | 🟡 3 uses |
| `LayoutTemplate` | Multiple "Templates" children | Several | 🟡 Acceptable for sub-items |
| `Target` | Opportunities, Resilience, Goals & OKRs, Milestones | Business, Ops, Workforce, Finance | 🟡 4 uses |
| `Mail` | Messages, Email | Home, Operations | 🟡 2 uses |
| `UserPlus` | Leads, Vendor Onboarding, Invitations | Business, Workforce, Admin | 🟡 3 uses |
| `Radio` | Command Dashboard, Comms | Live Ops (same section) | 🟡 |
| `Shield` | Insurance, Roles | Legal, Admin | 🟡 |

**Collapsed sidebar test:** When collapsed (icon-only mode), users will see 5+ identical `CalendarDays` icons for completely different pages. This is a **significant misclick risk**.

---

## 3. Grouping Logic Test

| Section | Grouping Principle | Obvious? | Items Out of Place? |
|---------|-------------------|:--------:|---------------------|
| Home | Universal daily-use items | ✅ | ⚠️ "Insights" nests 6 sub-items — could be its own section |
| Business | Sales/CRM pipeline | ✅ | ⚠️ "Contacts" → routes to /companies |
| Production | Project/event lifecycle | ✅ | ⚠️ "Tasks" overlaps with Home |
| Operations | Process governance | ✅ | ⚠️ "Email" feels misplaced — more of a Home item |
| Workforce | People + vendors | 🟡 | 🔴 Vendors should be a separate sub-group |
| Resources | Physical assets + logistics | ✅ | ⚠️ "Purchase Orders" and "Expense Reports" feel financial |
| Creative | Branding + content | ✅ | Good coherence |
| Finance | Money management | ✅ | ⚠️ "Procurement" could be in Resources |
| Legal | Contracts + compliance | ✅ | Good coherence |
| Admin | Platform administration | 🔴 | **Junk drawer** — 18 items mixing user mgmt, knowledge, portals, system config |
| Live Ops | In-event operations | ✅ | Contextual, well-scoped |

### Group Labels
- ✅ All sections have explicit text labels (shown as section headers)
- ✅ Section headers are clickable to expand/collapse (not navigation targets)

### Order Assessment
- ✅ Home (most frequent) is first
- ✅ Primary operational sections follow (Business, Production)
- ✅ Utility/admin sections at bottom
- 🟡 "Workforce" between "Operations" and "Resources" could be reordered for better workflow gravity

---

## 4. Visual Hierarchy Test

| Criterion | Status | Details |
|-----------|:------:|---------|
| Primary vs secondary distinguishable? | ✅ | Section headers are uppercase, smaller, muted color |
| Active item clearly highlighted? | ✅ | Left accent bar (3px, primary color) + background highlight + text color change |
| Sub-items visually subordinate? | ✅ | Indented (paddingLeft: 2rem for depth=1) |
| Adequate section spacing? | ✅ | mb-0.5 between sections |
| Sidebar scrolls? | ✅ | `overflow-y-auto` on nav container with `scrollbar-hide` |
| Items below fold? | 🔴 | For exec role with all sections expanded: **~100+ items would be below fold** |
| Scroll obvious? | 🟡 | `scrollbar-hide` hides the scrollbar — no visual overflow indicator |
| Hidden items important? | ✅ | Lower sections (Admin, Finance, Legal) contain important items |
| Width appropriate? | ✅ | 260px expanded, 60px collapsed — within ideal range |

---

## 5. Information Density Score

### By Role (Top-Level Items Visible Without Collapsing)

| Role | Visible Top-Level | Density Score |
|------|:-:|:-:|
| **exec** (Home section expanded) | 7 | 🟢 OPTIMAL |
| **exec** (all sections expanded) | ~115 | ⚫ HOSTILE |
| **director** | ~110 (same as exec) | ⚫ HOSTILE (if expanded) |
| **pm** | ~105 | ⚫ HOSTILE (if expanded) |
| **member** | ~35–45 | 🔴 OVERLOADED (if expanded) |
| **client** | ~15–20 | 🟡 ELEVATED |
| **collaborator** | ~10–15 | 🟢 OPTIMAL |

### Mitigating Factors
- ✅ Only "Home" section is expanded by default — initial visible items = **7** (optimal)
- ✅ Other sections collapsed by default — progressive disclosure works
- ✅ Sidebar search ("/" shortcut) allows instant filtering
- ✅ Pinned favorites provide quick access without section expansion

### But…
- 🔴 Users who expand a section like "Admin" (18 items) or "Workforce" (13 items) experience instant cognitive overload
- 🟡 No visual distinction between sections that are collapsed by default vs user-expanded
- 🟡 Section collapse state resets on component remount (not persisted to localStorage)

---

## Recommendations

| # | Priority | Recommendation |
|---|----------|----------------|
| 1 | P1 | **Split Admin section** into "Admin" (Users, Roles, Teams, Org Chart) and "Platform" (Integrations, System Health, Data Export, Portals) |
| 2 | P1 | **Split Workforce** into "Crew" (Crew, Shifts, Availability, Time Tracking, Certs) and "Vendors" (Vendors, Vendor Onboarding, Compliance, WOs, Reviews) |
| 3 | P1 | **Deduplicate icons** — replace one of the CalendarDays instances with Clock, replace one ShoppingCart with Layers3 |
| 4 | P1 | **Rename "Advancing"** to "Advances" or "Advance Orders" with a tooltip explaining the function |
| 5 | P2 | **Persist section collapse state** to localStorage via the Zustand sidebar store |
| 6 | P2 | **Add overflow indicator** when sidebar content exceeds viewport — subtle fade or scroll hint at bottom |
| 7 | P2 | **Reconcile "Tasks" and "Documents"** — Home versions should be "My Tasks" and "My Documents" to distinguish |
| 8 | P3 | **Fix "Contacts" route** — label says "Contacts" but routes to /companies. Align label or route. |
