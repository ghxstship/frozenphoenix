# Orphaned Route Audit

> Generated: 2026-03-14 | Routes: 382 | Nav paths: 144 | Orphaned: 163

---

## 1. Classification Summary

| Classification       | Count   |
| -------------------- | ------- |
| **NAVIGABLE**        | 144     |
| **DISCOVERABLE**     | 57      |
| **DEEP-LINKED ONLY** | 6       |
| **ORPHANED**         | 163     |
| **Non-dashboard**    | 12      |
| **Total**            | **382** |

---

## 2. NAVIGABLE Routes (144)

All paths in `src/config/navigation.ts` `navigationConfig` array — sidebar, command bar, breadcrumbs.

Sections: Home (6), Business (6+3 children), Production (8+7 children), Operations (7+3 children), Workforce (11+3 children), Resources (6+2 children), Creative (7+3 children), Finance (8+7 children), Legal (9), Admin (20+1 child), Live Operations (17 contextual).

---

## 3. DISCOVERABLE Routes (57)

Reachable via ListPageShell row click, create button, or programmatic nav from a NAVIGABLE parent.

All `[id]` detail pages whose parent list page is NAVIGABLE, plus `/new`, `/edit` sub-routes reachable via create/edit buttons:

- 44 detail `[id]` pages (parent list is navigable)
- 8 `/new` pages (create buttons on list pages)
- 2 `/edit` pages (`/projects/[id]/edit`, `/templates/[id]/edit`)
- `/settings/security` (linked from topbar + settings page)
- `/brand-kit/[id]` (programmatic card click)
- `/invoices/[id]` (programmatic from list)

---

## 4. DEEP-LINKED ONLY (6)

| Route                        | Mechanism                                           |
| ---------------------------- | --------------------------------------------------- |
| `/auth/mfa-setup`            | `router.push` from settings — intentional           |
| `/auth/mfa-verify`           | Middleware redirect — intentional                   |
| `/auth/reset-password`       | Email link — intentional                            |
| `/invite/[token]`            | Email link — intentional                            |
| `/onboarding/claim-username` | No inbound links found — **possible bug**           |
| `/projects/templates`        | No inbound links — shadowed by `/project-templates` |

---

## 5. ORPHANED Routes (163)

### 5.1 Duplicates of Navigable Routes — DEPRECATE (22)

Delete these pages; they duplicate routes already in nav.

| Route                  | Duplicate Of                          |
| ---------------------- | ------------------------------------- |
| `/activities`          | `/activity-log`                       |
| `/advance-templates`   | `/advancing/templates`                |
| `/brand-kits`          | `/brand-kit`                          |
| `/calendar-events`     | `/calendar` (raw data)                |
| `/comments`            | Internal data, not user-facing        |
| `/contacts`            | `/companies` (nav label = "Contacts") |
| `/conversations`       | `/messages`                           |
| `/custom-fields`       | `/settings/custom-fields`             |
| `/domain-events`       | Internal system data                  |
| `/goals`               | `/workforce/goals`                    |
| `/guest-incidents`     | `/live-ops/guest-incidents`           |
| `/invitations`         | `/user-management/invitations`        |
| `/knowledge-articles`  | `/knowledge-base`                     |
| `/login-audit-log`     | `/user-management/audit-log`          |
| `/post-event-reports`  | `/live-ops/reports`                   |
| `/production-advances` | `/advancing`                          |
| `/profiles`            | `/people` + `/workforce`              |
| `/reviews`             | `/workforce/reviews`                  |
| `/rights`              | `/ip-rights`                          |
| `/storage-objects`     | Internal data                         |
| `/team-members`        | `/teams`                              |
| `/vip-guests`          | `/live-ops/vip`                       |

### 5.2 Sub-entity Data — CONSOLIDATE into Parent (18)

These should appear as tabs/sections on parent detail pages, not standalone routes.

| Route                       | Merge Into                          |
| --------------------------- | ----------------------------------- |
| `/comm-channels`            | `/live-ops/comms`                   |
| `/vip-service-requests`     | `/live-ops/vip` tab                 |
| `/compliance`               | `/compliance-checklists`            |
| `/account-health-scores`    | `/accounts` tab/widget              |
| `/contract-amendments`      | `/contracts/[id]` tab               |
| `/contract-obligations`     | `/contracts/[id]` or `/obligations` |
| `/production-checklists`    | `/checklists` (filter)              |
| `/production-expenses`      | `/expenses` (filter)                |
| `/production-sops`          | `/sops` (filter)                    |
| `/production-tasks`         | `/tasks` (filter)                   |
| `/production-time-entries`  | `/time-tracking` (filter)           |
| `/production-milestones`    | `/projects/[id]` tab                |
| `/production-runs`          | `/projects/[id]` tab                |
| `/production-verticals`     | `/projects` filter                  |
| `/production-advance-items` | `/advancing/[id]` tab               |
| `/production-budget-lines`  | `/budgets/[id]` tab                 |
| `/worker-reviews`           | `/workforce/reviews`                |
| `/worker-profiles`          | `/workforce`                        |

### 5.3 GATE — Keep Hidden (4)

| Route                        | Reason                                             |
| ---------------------------- | -------------------------------------------------- |
| `/feature-flags`             | Internal debug — gate behind `admin.feature_flags` |
| `/onboarding/claim-username` | Unwired onboarding step — gate behind flow flag    |
| `/projects/templates`        | Shadowed by `/project-templates` — pick one        |
| `/storage-objects`           | Internal admin — gate behind `admin.storage`       |

### 5.4 NEST — Add as Child in Existing Nav Parent (23)

| Route                           | Parent           | Label           |
| ------------------------------- | ---------------- | --------------- |
| `/service-requests/sla`         | Service Requests | SLA Dashboard   |
| `/time-tracking/compliance`     | Time Tracking    | Compliance      |
| `/settings/org-security`        | Settings         | Org Security    |
| `/knowledge-base/collaborative` | Knowledge Base   | Collaborative   |
| `/advance-status-history`       | Advancing        | Status History  |
| `/approval-workflows`           | Approvals        | Workflows       |
| `/checklist-templates`          | Checklists       | Templates       |
| `/quality-check-templates`      | Quality Checks   | Templates       |
| `/qc-gates`                     | Quality Checks   | Gates           |
| `/sla-definitions`              | Service Requests | Definitions     |
| `/report-definitions`           | Insights         | Report Builder  |
| `/invoice-templates`            | Billing          | Templates       |
| `/survey-templates`             | Surveys          | Templates       |
| `/brief-templates`              | Briefs           | Templates       |
| `/provider-connections`         | Integrations     | Connections     |
| `/role-change-log`              | User Management  | Role Changes    |
| `/temporary-access-grants`      | User Management  | Temp Access     |
| `/command-positions`            | Live Ops         | Positions       |
| `/lost-reasons`                 | Deals            | Lost Reasons    |
| `/upsell-events`                | Deals            | Upsell Events   |
| `/upsell-triggers`              | Deals            | Upsell Triggers |
| `/expense-reports`              | Expenses         | Reports         |
| `/depreciation-schedules`       | Assets           | Depreciation    |

### 5.5 INTEGRATE — Add to Nav Section (34)

| Route                      | Section                   | Label              |
| -------------------------- | ------------------------- | ------------------ |
| `/purchase-orders`         | Finance > Procurement     | Purchase Orders    |
| `/rfqs`                    | Finance > Procurement     | RFQs               |
| `/payroll-batches`         | Finance                   | Payroll            |
| `/pos-transactions`        | Finance                   | POS Transactions   |
| `/revenue-schedules`       | Finance                   | Revenue Schedules  |
| `/consumables`             | Resources                 | Consumables        |
| `/kits`                    | Resources                 | Kits               |
| `/load-plans`              | Resources                 | Load Plans         |
| `/maintenance-records`     | Resources                 | Maintenance        |
| `/maintenance-schedules`   | Resources                 | Schedules          |
| `/space-bookings`          | Resources                 | Space Bookings     |
| `/rental-agreements`       | Legal                     | Rental Agreements  |
| `/legal-holds`             | Legal                     | Legal Holds        |
| `/e-signatures`            | Legal                     | E-Signatures       |
| `/risk-assessments`        | Legal                     | Risk Assessments   |
| `/compliance-requirements` | Legal                     | Requirements       |
| `/brands`                  | Creative                  | Brands             |
| `/creative-reviews`        | Creative                  | Reviews            |
| `/notifications`           | Home                      | Notifications      |
| `/organizations`           | Admin                     | Organizations      |
| `/activity-log`            | Admin                     | Activity Log       |
| `/access-audit-log`        | Admin                     | Access Audit       |
| `/boms`                    | Production                | Bills of Materials |
| `/stakeholders`            | Business                  | Stakeholders       |
| `/shifts`                  | Workforce                 | Shifts             |
| `/crew-availability`       | Workforce                 | Availability       |
| `/crew-shifts`             | Workforce                 | Crew Shifts        |
| `/insurance-requirements`  | Legal                     | Ins. Requirements  |
| `/engagement-terms`        | Legal                     | Engagement Terms   |
| `/email-messages`          | Operations                | Email              |
| `/resilience-targets`      | Operations                | Resilience         |
| `/timesheets`              | Workforce                 | Timesheets         |
| `/time-entries`            | Workforce > Time Tracking | Time Entries       |
| `/time-off-requests`       | Workforce > Time Off      | Requests           |

### 5.6 PROMOTE — Elevate to Persistent Nav (4)

| Route                     | Target                      |
| ------------------------- | --------------------------- |
| `/settings/security`      | Admin > Settings child      |
| `/inventory-audits`       | Resources > Inventory child |
| `/inventory-reservations` | Resources > Inventory child |
| `/compliance-templates`   | Legal > Compliance child    |

### 5.7 Remaining Sub-entity Orphans — DEPRECATE as Standalone (62)

These are raw database table pages that should only exist as tabs/sections within parent detail pages. They do not warrant standalone nav entries. **Do not add to nav.** Either:

- (a) Wire as tab content in parent detail pages, or
- (b) Delete the standalone page once tab is implemented.

Full list:

`/approval-steps`, `/asset-assignments`, `/asset-tags`, `/asset-versions`, `/automation-executions`, `/automation-logs`, `/automation-rules`, `/brand-guideline-sections`, `/budget-line-items`, `/campaign-assets`, `/campaign-channels`, `/campaign-kpis`, `/catalog-categories`, `/catalog-items`, `/channel-templates`, `/compliance-templates` (if promoted), `/consumable-usage`, `/credential-assignments`, `/credential-inventory-pools`, `/credential-types`, `/custom-field-definitions`, `/dashboard-widgets`, `/data-export-requests`, `/document-versions`, `/engagement-terms` (if integrated), `/environmental-readings`, `/equipment-check-ins`, `/foh-zone-readings`, `/foh-zones`, `/insurance-requirements` (if integrated), `/inventory-audits` (if promoted), `/inventory-reservations` (if promoted), `/job-cost-entries`, `/live-crew-assignments`, `/live-event-instances`, `/live-financial-snapshots`, `/load-plans` (if integrated), `/logistics-events`, `/milestone-s`, `/payroll-batches` (if integrated), `/readiness-gates`, `/rental-agreements` (if integrated), `/resource-bookings`, `/revenue-recognition-entries`, `/review-cycles`, `/ros-cues`, `/scan-events`, `/schedule-entries`, `/service-health-checks`, `/shifts` (if integrated), `/sla-policies`, `/sla-tracking`, `/space-bookings` (if integrated), `/stakeholder-projects`, `/strike-sequences`, `/survey-responses`, `/sync-events`, `/technical-specs`, `/time-tracking-policies`, `/vault-documents`, `/vendor-communications`, `/vendor-compliance-documents`, `/worker-classifications`, `/worker-compliance-docs`, `/worker-offboarding-runs`, `/worker-onboarding-runs`, `/work-packages`

---

## 6. Structural Issues

| Issue                                                                           | Severity |
| ------------------------------------------------------------------------------- | -------- |
| Admin section has 20 items — needs sub-grouping                                 | High     |
| Workforce section has 11 items — exceeds Miller's Law                           | Medium   |
| 163 orphans (43% of routes) — auto-generated DB table pages                     | Critical |
| Broken links: `/legal/terms`, `/legal/privacy`, `/privacy` — no pages           | High     |
| Duplicate routes (22 pairs identified)                                          | Medium   |
| Inconsistent sub-route patterns (advancing has full tree, automations has none) | Medium   |
| `/onboarding/claim-username` has no inbound links                               | Medium   |

### 6.1 Admin Section Restructure Recommendation

```
Admin (restructured)
├── User Management (group)
│   ├── Users                /user-management
│   ├── Invitations          /user-management/invitations
│   ├── Access Reviews       /user-management/access-reviews
│   ├── Audit Log            /user-management/audit-log
│   ├── Role Change Log      /role-change-log        ← NEW
│   └── Temp Access          /temporary-access-grants ← NEW
├── Organization (group)
│   ├── People               /people
│   ├── Org Chart            /org-chart
│   ├── Teams                /teams
│   ├── Organizations        /organizations          ← NEW
│   └── Roles                /roles
├── Knowledge (group)
│   ├── Knowledge Base       /knowledge-base
│   │   └── Collaborative    /knowledge-base/collaborative ← NEW
│   ├── SOPs                 /sops
│   └── Vault                /vault
├── System (group)
│   ├── Settings             /settings
│   │   ├── Custom Fields    /settings/custom-fields
│   │   ├── Email Integration /settings/email-integration
│   │   ├── Org Security     /settings/org-security  ← NEW
│   │   └── Security         /settings/security      ← PROMOTED
│   ├── Integrations         /integrations
│   │   ├── Sync Log         /integrations/sync-log
│   │   └── Connections      /provider-connections    ← NEW
│   ├── System Health        /system-health
│   ├── Data Export           /data-export
│   ├── Activity Log         /activity-log           ← NEW
│   └── Access Audit         /access-audit-log       ← NEW
└── Portals (group)
    ├── Credentials          /credentials
    │   └── Assignments      /credentials/assignments
    ├── Client Portal        /client-portal
    └── Vendor Portal        /vendor-portal
```

---

## 7. Implementation Spec

### Phase 1: Critical (Broken Links + High-Value Orphans)

| File                                  | Change                                                                                        | Deps |
| ------------------------------------- | --------------------------------------------------------------------------------------------- | ---- |
| `src/components/auth/auth-layout.tsx` | Fix `/legal/terms` and `/legal/privacy` links — either create pages or point to external URLs | None |
| `src/components/cookie-consent.tsx`   | Fix `/privacy` link                                                                           | None |
| `src/config/navigation.ts`            | Add 23 NEST children entries to existing nav items                                            | None |
| `src/config/navigation.ts`            | Add `/notifications` to Home section                                                          | None |
| `src/config/navigation.ts`            | Add `/purchase-orders`, `/rfqs` to Procurement children                                       | None |
| `src/config/navigation.ts`            | Add `/settings/security`, `/settings/org-security` to Settings children                       | None |

### Phase 2: Structural (Nav Integration + IA Cleanup)

| File                       | Change                                                                         | Deps    |
| -------------------------- | ------------------------------------------------------------------------------ | ------- |
| `src/config/navigation.ts` | Add 34 INTEGRATE items to their respective sections                            | Phase 1 |
| `src/config/navigation.ts` | Add 4 PROMOTE items as children                                                | Phase 1 |
| `src/config/navigation.ts` | Restructure Admin into sub-groups (User Mgmt, Org, Knowledge, System, Portals) | Phase 1 |
| `src/config/navigation.ts` | Group Workforce vendor items under a "Vendor Management" parent                | Phase 1 |

### Phase 3: Cleanup (Deprecation + Duplicate Removal)

| Action                                                  | Files                            | Count |
| ------------------------------------------------------- | -------------------------------- | ----- |
| Delete duplicate pages                                  | 22 page.tsx files listed in §5.1 | 22    |
| Add feature flag gates                                  | 4 pages listed in §5.3           | 4     |
| Audit remaining 62 sub-entity pages for tab integration | 62 page.tsx files listed in §5.7 | 62    |

### Dependency Chain

1. **Phase 1** — no dependencies; all changes are additive to `navigation.ts`
2. **Phase 2** — depends on Phase 1 nav items being in place
3. **Phase 3** — depends on Phase 2; don't delete pages until nav alternatives exist

---

## Appendix: Broken Link Targets

| Link Target      | Source File                               | Fix                                         |
| ---------------- | ----------------------------------------- | ------------------------------------------- |
| `/legal/terms`   | `src/components/auth/auth-layout.tsx:97`  | Create page or use external URL             |
| `/legal/privacy` | `src/components/auth/auth-layout.tsx:101` | Create page or use external URL             |
| `/privacy`       | `src/components/cookie-consent.tsx:95`    | Create page or redirect to `/legal/privacy` |
