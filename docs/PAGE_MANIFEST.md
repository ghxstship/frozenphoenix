# PAGE_MANIFEST.md — Frozen Phoenix Route Inventory

**Generated:** 2026-03-21 | **Protocol:** ANTIGRAVITY FP-INFRA-001
**Total Pages:** 226 | **Dashboard Routes:** 168 | **Public Routes:** 8 | **Auth Routes:** 3 | **Special Routes:** 3 | **API Routes:** 136

---

## Architecture Overview

| Layer | Strategy | Count |
|-------|----------|-------|
| **Dashboard pages** | SSR (auth-gated, `'use client'` layout wraps Server Component pages that delegate to `_client.tsx`) | 168 |
| **Public pages** | SSG-eligible (landing, legal, login, signup) | 8 |
| **Auth pages** | SSR (MFA, password reset) | 3 |
| **Special routes** | SSR (invite, portal, sign token routes) | 3 |
| **API routes** | Edge/Node (136 route handlers) | 136 |

### Layout Chain
```
Root Layout (Server Component)
├── fonts: Geist + Geist_Mono via next/font/google
├── providers: <Providers> wrapper
├── (dashboard)/layout.tsx — 'use client' (Sidebar, Topbar, Copilot, Messaging)
│   └── All 168 dashboard pages
├── (public)/page.tsx — Landing page
│   ├── login, signup, forgot-password
│   ├── legal/privacy, legal/terms
│   └── org/[slug], u/[username]
├── auth/ — MFA setup/verify, reset-password
├── invite/[token], portal/[token], sign/[token]
└── API routes (/api/*)
```

---

## Dashboard Routes (168 pages)

### Rendering Strategy: All SSR (Dynamic)
All dashboard pages require authentication and user-specific data via Supabase hooks in `_client.tsx` components.

| # | Route | Page Type | Has `_client.tsx` | Has `loading.tsx` | Has `error.tsx` | Perf |
|---|-------|-----------|:-:|:-:|:-:|:-:|
| 1 | `/accounts/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 2 | `/activations` | List | ✅ | ❌ | ❌ | 🟡 |
| 3 | `/activations/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 4 | `/advance-status-history/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 5 | `/advancing/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 6 | `/advancing/catalog` | List | ✅ | ❌ | ❌ | 🟡 |
| 7 | `/advancing/fulfillment` | List | ✅ | ❌ | ❌ | 🟡 |
| 8 | `/advancing/inventory` | List | ✅ | ❌ | ❌ | 🟡 |
| 9 | `/advancing/new` | Form | ✅ | ❌ | ❌ | 🟡 |
| 10 | `/advancing/queue` | List | ✅ | ❌ | ❌ | 🟡 |
| 11 | `/advancing/reports` | List | ✅ | ❌ | ❌ | 🟡 |
| 12 | `/advancing/templates` | List | ✅ | ❌ | ❌ | 🟡 |
| 13 | `/approval-workflows/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 14 | `/approvals` | List | ✅ | ❌ | ❌ | 🟡 |
| 15 | `/approvals/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 16 | `/assets/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 17 | `/assets/new` | Form | ✅ | ❌ | ❌ | 🟡 |
| 18 | `/assets/scan` | Interactive | ✅ | ❌ | ❌ | 🟡 |
| 19 | `/assets/scan/batch` | Interactive | ✅ | ❌ | ❌ | 🟡 |
| 20 | `/automations` | List | ✅ | ❌ | ❌ | 🟡 |
| 21 | `/automations/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 22 | `/boms/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 23 | `/brand-guidelines/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 24 | `/brand-kit/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 25 | `/briefs/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 26 | `/budget-approvals/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 27 | `/budgets/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 28 | `/calendar` | Interactive | ✅ | ❌ | ❌ | 🟡 |
| 29 | `/call-sheets/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 30 | `/campaigns/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 31 | `/case-studies/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 32 | `/certifications/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 33 | `/change-orders/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 34 | `/checklist-templates/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 35 | `/checklists/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 36 | `/clause-library/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 37 | `/client-invoices/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 38 | `/client-portal` | Dashboard | ✅ | ❌ | ❌ | 🟡 |
| 39 | `/companies/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 40 | `/compliance` | Dashboard | ✅ | ❌ | ❌ | 🟡 |
| 41 | `/compliance-checklists/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 42 | `/contacts/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 43 | `/contracts/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 44 | `/contracts/new` | Form | ✅ | ❌ | ❌ | 🟡 |
| 45 | `/creative-assets/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 46 | `/creative-reviews/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 47 | `/credentials/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 48 | `/credentials/assignments` | List | ✅ | ❌ | ❌ | 🟡 |
| 49 | `/credit-notes/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 50 | `/crew/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 51 | `/crew/new` | Form | ✅ | ❌ | ❌ | 🟡 |
| 52 | `/crew-availability/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 53 | `/dashboard` | Dashboard | ✅ | ❌ | ❌ | 🟡 |
| 54 | `/dashboards` | List | ✅ | ❌ | ❌ | 🟡 |
| 55 | `/data-export` | Interactive | ✅ | ❌ | ❌ | 🟡 |
| 56 | `/deals` | List | ✅ | ❌ | ❌ | 🟡 |
| 57 | `/deals/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 58 | `/decks` | List | ✅ | ❌ | ❌ | 🟡 |
| 59 | `/decks/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 60 | `/digital-assets/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 61 | `/dispatch/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 62 | `/documents/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 63 | `/email-messages/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 64 | `/engineering-approvals/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 65 | `/estimates/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 66 | `/events/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 67 | `/expense-reports/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 68 | `/expenses/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 69 | `/finance` | Dashboard | ✅ | ❌ | ❌ | 🟡 |
| 70 | `/finance/revenue-recognition` | Dashboard | ✅ | ❌ | ❌ | 🟡 |
| 71 | `/financial-periods/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 72 | `/fleet/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 73 | `/forecasting` | Dashboard | ✅ | ❌ | ❌ | 🟡 |
| 74 | `/gl-accounts/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 75 | `/goods-receipts/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 76 | `/home/documents` | List | ✅ | ✅ | ❌ | 🟢 |
| 77 | `/home/tasks` | List | ✅ | ✅ | ❌ | 🟢 |
| 78 | `/incidents/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 79 | `/insurance-policies/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 80 | `/integrations/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 81 | `/integrations/marketplace` | List | ✅ | ❌ | ❌ | 🟡 |
| 82 | `/integrations/sync-log` | List | ✅ | ❌ | ❌ | 🟡 |
| 83 | `/inventory/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 84 | `/invoices/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 85 | `/invoices/new` | Form | ✅ | ❌ | ❌ | 🟡 |
| 86 | `/ip-rights/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 87 | `/job-costing/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 88 | `/knowledge-base/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 89 | `/knowledge-base/collaborative` | Interactive | ✅ | ❌ | ❌ | 🟡 |
| 90 | `/leads/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 91 | `/live-ops` | Dashboard | ✅ | ❌ | ❌ | 🟡 |
| 92 | `/live-ops/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 93 | `/live-ops/comms` | Dashboard | ✅ | ❌ | ❌ | 🟡 |
| 94 | `/live-ops/credentials` | List | ✅ | ❌ | ❌ | 🟡 |
| 95 | `/live-ops/crew` | List | ✅ | ❌ | ❌ | 🟡 |
| 96 | `/live-ops/departments` | List | ✅ | ❌ | ❌ | 🟡 |
| 97 | `/live-ops/environment` | Dashboard | ✅ | ❌ | ❌ | 🟡 |
| 98 | `/live-ops/equipment` | List | ✅ | ❌ | ❌ | 🟡 |
| 99 | `/live-ops/financials` | Dashboard | ✅ | ❌ | ❌ | 🟡 |
| 100 | `/live-ops/foh` | Dashboard | ✅ | ❌ | ❌ | 🟡 |
| 101 | `/live-ops/gate` | Dashboard | ✅ | ❌ | ❌ | 🟡 |
| 102 | `/live-ops/guest-incidents` | List | ✅ | ❌ | ❌ | 🟡 |
| 103 | `/live-ops/readiness` | Dashboard | ✅ | ❌ | ❌ | 🟡 |
| 104 | `/live-ops/reconciliation` | Dashboard | ✅ | ❌ | ❌ | 🟡 |
| 105 | `/live-ops/reports` | List | ✅ | ❌ | ❌ | 🟡 |
| 106 | `/live-ops/run-of-show` | Interactive | ✅ | ❌ | ❌ | 🟡 |
| 107 | `/live-ops/strike` | Dashboard | ✅ | ❌ | ❌ | 🟡 |
| 108 | `/live-ops/vip` | Dashboard | ✅ | ❌ | ❌ | 🟡 |
| 109 | `/locations/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 110 | `/lost-reasons/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 111 | `/maintenance-schedules/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 112 | `/messages` | Interactive | ✅ | ❌ | ❌ | 🟡 |
| 113 | `/milestones/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 114 | `/notifications/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 115 | `/obligations/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 116 | `/onboarding/billing` | Form | ✅ | ❌ | ❌ | 🟡 |
| 117 | `/onboarding/claim-username` | Form | ✅ | ❌ | ❌ | 🟡 |
| 118 | `/onboarding/complete` | Info | ✅ | ❌ | ❌ | 🟡 |
| 119 | `/onboarding/invite-team` | Form | ✅ | ❌ | ❌ | 🟡 |
| 120 | `/onboarding/org-setup` | Form | ✅ | ❌ | ❌ | 🟡 |
| 121 | `/opportunities/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 122 | `/org-chart` | Interactive | ✅ | ❌ | ❌ | 🟡 |
| 123 | `/payment-approvals/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 124 | `/payments/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 125 | `/payroll-batches/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 126 | `/people/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 127 | `/permits/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 128 | `/pipeline/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 129 | `/pipeline/new` | Form | ✅ | ❌ | ❌ | 🟡 |
| 130 | `/procurement` | List | ✅ | ❌ | ❌ | 🟡 |
| 131 | `/procurement/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 132 | `/projects` | List | ✅ | ❌ | ❌ | 🟡 |
| 133 | `/projects/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 134 | `/projects/[id]/edit` | Form | ✅ | ❌ | ❌ | 🟡 |
| 135 | `/projects/new` | Form | ✅ | ❌ | ❌ | 🟡 |
| 136 | `/projects/templates` | List | ✅ | ❌ | ❌ | 🟡 |
| 137 | `/proposals/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 138 | `/proposals/new` | Form | ✅ | ❌ | ❌ | 🟡 |
| 139 | `/purchase-orders/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 140 | `/purchase-requisitions/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 141 | `/qc-gates/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 142 | `/quality-check-templates/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 143 | `/quality-checks/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 144 | `/rate-cards/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 145 | `/recurring-invoices/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 146 | `/report-definitions/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 147 | `/reports` | Dashboard | ✅ | ❌ | ❌ | 🟡 |
| 148 | `/reports/ai` | Interactive | ✅ | ❌ | ❌ | 🟡 |
| 149 | `/resilience-targets/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 150 | `/resource-planner` | Interactive | ✅ | ❌ | ❌ | 🟡 |
| 151 | `/revenue/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 152 | `/roles` | List | ✅ | ❌ | ❌ | 🟡 |
| 153 | `/saved-views/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 154 | `/scenarios` | List | ✅ | ❌ | ❌ | 🟡 |
| 155 | `/scheduling` | Interactive | ✅ | ❌ | ❌ | 🟡 |
| 156 | `/scopes-of-work/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 157 | `/service-requests/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 158 | `/service-requests/sla` | Dashboard | ✅ | ❌ | ❌ | 🟡 |
| 159 | `/settings` | Settings | ✅ | ❌ | ❌ | 🟡 |
| 160 | `/settings/ai` | Settings | ✅ | ❌ | ❌ | 🟡 |
| 161 | `/settings/custom-fields` | Settings | ✅ | ❌ | ❌ | 🟡 |
| 162 | `/settings/developer` | Settings | ✅ | ❌ | ❌ | 🟡 |
| 163 | `/settings/email-integration` | Settings | ✅ | ❌ | ❌ | 🟡 |
| 164 | `/settings/notifications` | Settings | ✅ | ❌ | ❌ | 🟡 |
| 165 | `/settings/org-security` | Settings | ✅ | ❌ | ❌ | 🟡 |
| 166 | `/settings/security` | Settings | ✅ | ❌ | ❌ | 🟡 |
| 167 | `/shifts/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 168 | `/shipments/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 169 | `/sla-definitions/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 170 | `/sops/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 171 | `/stakeholders/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 172 | `/surveys` | List | ✅ | ❌ | ❌ | 🟡 |
| 173 | `/surveys/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 174 | `/system-health` | Dashboard | ✅ | ❌ | ❌ | 🟡 |
| 175 | `/tags/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 176 | `/tasks` | List | ✅ | ❌ | ❌ | 🟡 |
| 177 | `/tasks/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 178 | `/teams/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 179 | `/tech-sheets/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 180 | `/templates/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 181 | `/templates/[id]/edit` | Form | ✅ | ❌ | ❌ | 🟡 |
| 182 | `/testimonials/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 183 | `/time-entries/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 184 | `/time-off/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 185 | `/time-off-requests/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 186 | `/time-tracking` | Interactive | ✅ | ❌ | ❌ | 🟡 |
| 187 | `/time-tracking/compliance` | Dashboard | ✅ | ❌ | ❌ | 🟡 |
| 188 | `/timesheets/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 189 | `/transfer-orders/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 190 | `/upsell-events/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 191 | `/upsell-triggers/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 192 | `/user-management/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 193 | `/user-management/access-reviews` | List | ✅ | ❌ | ❌ | 🟡 |
| 194 | `/user-management/audit-log` | List | ✅ | ❌ | ❌ | 🟡 |
| 195 | `/user-management/invitations` | List | ✅ | ❌ | ❌ | 🟡 |
| 196 | `/vault/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 197 | `/vendor-compliance` | Dashboard | ✅ | ❌ | ❌ | 🟡 |
| 198 | `/vendor-onboarding/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 199 | `/vendor-portal` | Dashboard | ✅ | ❌ | ❌ | 🟡 |
| 200 | `/vendor-reviews/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 201 | `/vendor-risk/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 202 | `/vendors` | List | ✅ | ❌ | ❌ | 🟡 |
| 203 | `/vendors/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 204 | `/vendors/new` | Form | ✅ | ❌ | ❌ | 🟡 |
| 205 | `/warehouses/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 206 | `/work-orders/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 207 | `/workflows/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 208 | `/workforce/[id]` | Detail | ✅ | ❌ | ❌ | 🟡 |
| 209 | `/workforce/goals` | List | ✅ | ❌ | ❌ | 🟡 |
| 210 | `/workforce/onboarding` | List | ✅ | ❌ | ❌ | 🟡 |
| 211 | `/workforce/reviews` | List | ✅ | ❌ | ❌ | 🟡 |

> **Note:** Routes marked 🟡 are "Acceptable" because the architecture is sound (Server Component page → Client Component) but lack `loading.tsx` and `error.tsx`, which would upgrade them to 🟢 with proper Suspense streaming.

---

## Public Routes (8 pages)

| # | Route | Page Type | Rendering | Has `loading.tsx` | Has `error.tsx` | Perf |
|---|-------|-----------|-----------|:-:|:-:|:-:|
| 1 | `/` (root) | Redirect | SSR | ❌ | ❌ | 🟢 |
| 2 | `/(public)` | Landing | CSR | ❌ | ❌ | 🟡 |
| 3 | `/(public)/login` | Auth | CSR | ❌ | ❌ | 🟡 |
| 4 | `/(public)/signup` | Auth | CSR | ❌ | ❌ | 🟡 |
| 5 | `/(public)/forgot-password` | Auth | CSR | ❌ | ❌ | 🟡 |
| 6 | `/(public)/legal/privacy` | Static | SSG-eligible | ❌ | ❌ | 🟡 |
| 7 | `/(public)/legal/terms` | Static | SSG-eligible | ❌ | ❌ | 🟡 |
| 8 | `/(public)/org/[slug]` | Public Profile | SSR/ISR | ❌ | ❌ | 🟡 |
| 9 | `/(public)/u/[username]` | Public Profile | SSR/ISR | ❌ | ❌ | 🟡 |

---

## Auth & Special Routes (6 pages)

| Route | Type | Rendering | Perf |
|-------|------|-----------|:-:|
| `/auth/mfa-setup` | Auth | SSR | 🟡 |
| `/auth/mfa-verify` | Auth | SSR | 🟡 |
| `/auth/reset-password` | Auth | SSR | 🟡 |
| `/invite/[token]` | Token | SSR | 🟡 |
| `/portal/[token]` | Token | SSR | 🟡 |
| `/sign/[token]` | Token | SSR | 🟡 |

---

## Summary

| Metric | Count |
|--------|-------|
| Total pages | **226** |
| Pages with `loading.tsx` | **3** (1.3%) |
| Pages with `error.tsx` | **2** (group-level only) |
| Pages with `_client.tsx` | **210** (93%) |
| API route handlers | **136** |
| 🟢 Fast pages | **2** |
| 🟡 Acceptable pages | **224** |
| 🔴 Slow pages | **0** |
| ⚫ Critical pages | **0** |

**Primary remediation:** Add `loading.tsx` (Suspense skeleton) and `error.tsx` (error boundary) to every route to achieve 🟢 across all pages.
