# 🧭 WAYFINDER — Tab Cognitive Audit

**Prompt Code:** `FP-UX-WAYFINDER-001` · **Phase 3.2** · **Date:** 2026-03-21

---

## Tab Count Assessment (By Shell Type)

### ListPageShell Pages (Config-Driven)

Most list pages have 3–5 tabs for status filtering (e.g., "All", "Active", "Draft", "Archived").

| Tab Pattern | Typical Count | Score |
|-------------|:----:|:----:|
| Status filters (All / Active / Draft / Archived) | 3–4 | 🟢 IDEAL |
| Status filters + view toggles | 4–5 | 🟡 ACCEPTABLE |
| Extended status states | 5–6 | 🟡 ACCEPTABLE (verge) |

**Assessment:** ✅ List page tab counts are well-controlled.

### DetailPageShell Pages (Entity Facets)

Detail pages use tabs to show entity facets:

| Entity Type | Expected Tabs | Score |
|-------------|:----:|:----:|
| Event Detail | Overview, Crew, Tasks, Schedule, Budget, Documents | 6 | 🟡 ACCEPTABLE (approaching limit) |
| Project Detail | Overview, Events, Tasks, Budget, Documents, Team | 6 | 🟡 ACCEPTABLE |
| Crew Member Detail | Overview, Schedule, Time Tracking, Certifications, Documents | 5 | 🟡 ACCEPTABLE |
| Vendor Detail | Overview, Work Orders, Compliance, Documents, Reviews | 5 | 🟡 ACCEPTABLE |
| Invoice Detail | Overview, Line Items, Payments, Activity | 4 | 🟢 IDEAL |
| Asset Detail | Overview, Maintenance, Transfer History, Documents | 4 | 🟢 IDEAL |

**Assessment:** 🟡 Detail pages are at 4–6 tabs. Event and Project detail are at the threshold where sidebar sub-navigation should be considered.

### OperationalDashboardShell Pages

| Dashboard | Expected Tabs | Score |
|-----------|:----:|:----:|
| Main Dashboard | Overview, Activity | 2 | 🟢 IDEAL |
| Finance Overview | Summary, Charts | 2 | 🟢 IDEAL |

**Assessment:** ✅ Dashboard tabs are minimal and well-scoped.

### SettingsPageShell

| Page | Expected Tabs | Score |
|------|:----:|:----:|
| Settings | Uses `_tabs/` route-level pattern | — | N/A (sub-routes, not tabs) |

**Assessment:** ✅ Settings correctly uses route-level navigation, not client-side tabs.

---

## Tab Label Quality

| Check | Status | Details |
|-------|:------:|---------|
| Single words or short phrases? | ✅ | Most labels are 1–2 words max |
| Parallel in form? | ✅ | "Overview", "Crew", "Budget" — consistent nouns |
| Avoid redundancy with page title? | 🟡 | Event detail → "Overview" tab is fine; no "Event Overview" |
| Nouns not verbs? | ✅ | All tab labels are noun-form content categories |
| Leftmost tab = most frequent? | ✅ | "Overview" or "All" is always default/left |

---

## Tab Content Coherence

| Check | Status | Details |
|-------|:------:|---------|
| Each tab = single content type? | ✅ | Tabs use config-driven content, well-scoped |
| Content exhaustive per topic? | 🟡 | Some entity data spans tabs (e.g., crew assignments visible in both Crew tab and Schedule tab) |
| Tabs independent? | ✅ | Each tab is self-contained; no sequential dependency |
| Junk drawer tabs? | ❌ None | No "Other" or "Misc" tabs found |
| Underweight tabs? | 🟡 | Possible on some entity types where a tab may have very few items |

---

## Tab vs. Alternative Assessment

### Candidates for Replacement

| Page | Current Pattern | Recommended Pattern | Rationale |
|------|----------------|---------------------|-----------|
| **Event Detail (6 tabs)** | Tabs: Overview / Crew / Tasks / Schedule / Budget / Documents | **Sidebar sub-nav** (Pattern 2) | 6 tabs is the threshold; sidebar sub-nav gives each facet its own URL and loading state |
| **Project Detail (6 tabs)** | Tabs: similar to Event | **Sidebar sub-nav** (Pattern 2) | Same rationale — entity has enough facets to warrant full sub-routes |
| **List pages (status filters)** | Tabs: All / Active / Draft / Archived | **Segmented control** (Pattern 4) | These aren't content categories — they're filter states. An inline toggle is more appropriate |
| **Dashboard (2 tabs)** | Tabs: Overview / Activity | **Keep as tabs** or merge | 2 tabs is fine, but if "Activity" is just a feed, consider making it a collapsible section |

---

## Flagged Issues Summary

| # | Severity | Finding |
|---|----------|---------|
| 1 | 🔴 FAIL | **Tab state not in URL** — no `?tab=crew` or `/event/[id]/crew` URL strategy. Tabs are ephemeral client state. |
| 2 | 🟡 WARN | **Event and Project detail have 6 tabs** — at the threshold for sidebar sub-nav (Pattern 2 from WAYFINDER spec). |
| 3 | 🟡 WARN | **List page status tabs are filter controls, not content categories** — better suited as segmented control or toolbar toggle. |
| 4 | 🟡 WARN | **Tab persistence missing across navigation** — returning to a page resets to default tab. |
| 5 | ⚠️ NOTE | **Settings uses route-level `_tabs/`** — this is the correct pattern but not applied consistently. Entity details should follow the same URL-based approach. |
| 6 | ⚠️ NOTE | **Tab labels are well-formed** — all nouns, parallel structure, appropriate defaults. No issues here. |

---

## Recommendations

| # | Priority | Recommendation |
|---|----------|----------------|
| 1 | P1 | **Convert Event/Project detail tabs to sidebar sub-navigation** — `/events/[id]/crew`, `/events/[id]/budget`, etc. Each facet gets its own URL, loading state, and error boundary. |
| 2 | P1 | **Add `?tab=` URL parameter** for all remaining tab bars — tab state must survive page reload and link sharing. |
| 3 | P2 | **Replace list page status tabs with segmented controls** — these are view filters, not content navigation. |
| 4 | P2 | **Persist last-active tab** per page in `localStorage` — e.g., `fp-tabs-events-detail: "crew"`. |
| 5 | P3 | **Monitor tab counts** as features are added — enforce ≤ 5 tabs per page as a design system rule. |
