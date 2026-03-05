# Mock Data Migration Audit

## Summary

**Total mock data consumers:** 116 files across 4 categories  
**Demo data source files:** 10 (9 data modules + 1 lazy loader)  
**Supabase hooks already available:** ~95% coverage  
**Migration strategy:** Remove `isSupabaseConfigured` ternaries; replace mock fallback with empty-array defaults + loading/empty states

---

## Category A — Dual-Path Pages (60 files)

These pages already import Supabase hooks AND mock data, using the `isSupabaseConfigured && sbData ? transform(sbData) : MOCK_DATA` pattern.

**Migration:** Remove mock import, remove ternary, use hook data directly with `?? []` fallback.

| Page                             | Mock Source                      | Supabase Hook                             | Status    |
| -------------------------------- | -------------------------------- | ----------------------------------------- | --------- |
| dashboard/page.tsx               | demo-data (6 mocks)              | hooks.ts (6 hooks)                        | dual-path |
| deals/page.tsx                   | demo-data                        | useDeals                                  | dual-path |
| deals/[id]/page.tsx              | demo-data                        | useDeals                                  | dual-path |
| projects/[id]/page.tsx           | demo-data                        | useProject                                | dual-path |
| tasks/[id]/page.tsx              | demo-data                        | useTasks                                  | dual-path |
| crew/page.tsx                    | demo-data                        | useCrewMembers                            | dual-path |
| crew/[id]/page.tsx               | demo-data                        | useCrewMembers                            | dual-path |
| assets/page.tsx                  | demo-data                        | useAssets, useVehicles                    | dual-path |
| assets/[id]/page.tsx             | demo-data                        | useAssets                                 | dual-path |
| approvals/page.tsx               | demo-data                        | useApprovals                              | dual-path |
| reports/page.tsx                 | demo-data (5 mocks)              | hooks.ts (5 hooks)                        | dual-path |
| fleet/page.tsx                   | demo-data                        | useVehicles                               | dual-path |
| calendar/page.tsx                | demo-data                        | useCalendarEvents                         | dual-path |
| locations/page.tsx               | demo-data-production             | useLocations                              | dual-path |
| locations/[id]/page.tsx          | demo-data-production             | useLocations                              | dual-path |
| events/page.tsx                  | demo-data-production + demo-data | useEvents, useLocations, useProjects      | dual-path |
| events/[id]/page.tsx             | demo-data-production + demo-data | useEvents                                 | dual-path |
| activations/page.tsx             | demo-data-production + demo-data | useActivations, useLocations, useProjects | dual-path |
| activations/[id]/page.tsx        | demo-data-production + demo-data | useActivations                            | dual-path |
| incidents/page.tsx               | demo-data-production + demo-data | useIncidents, useLocations, useProjects   | dual-path |
| incidents/[id]/page.tsx          | demo-data-production + demo-data | useIncidents                              | dual-path |
| shipments/page.tsx               | demo-data-production             | useShipments                              | dual-path |
| shipments/[id]/page.tsx          | demo-data-production             | useShipments                              | dual-path |
| budgets/page.tsx                 | demo-data-production + demo-data | useBudgets                                | dual-path |
| budgets/[id]/page.tsx            | demo-data-production + demo-data | useBudgets                                | dual-path |
| campaigns/page.tsx               | demo-data-creative-brand         | useCampaigns                              | dual-path |
| campaigns/[id]/page.tsx          | demo-data-creative-brand         | useCampaigns                              | dual-path |
| briefs/page.tsx                  | demo-data-creative-brand         | useBriefs                                 | dual-path |
| briefs/[id]/page.tsx             | demo-data-creative-brand         | useBriefs                                 | dual-path |
| brand-guidelines/page.tsx        | demo-data-creative-brand         | useBrandGuidelines                        | dual-path |
| brand-kit/page.tsx               | demo-data-creative-brand         | useBrandKits                              | dual-path |
| creative-assets/page.tsx         | demo-data-creative-brand         | useDigitalAssets                          | dual-path |
| case-studies/page.tsx            | demo-data                        | useCaseStudies                            | dual-path |
| certifications/page.tsx          | demo-data-production             | useCertifications                         | dual-path |
| certifications/[id]/page.tsx     | demo-data-production             | useCertifications                         | dual-path |
| change-orders/page.tsx           | demo-data-production             | useChangeOrders                           | dual-path |
| change-orders/[id]/page.tsx      | demo-data-production             | useChangeOrders                           | dual-path |
| compliance-checklists/page.tsx   | demo-data-governance             | useComplianceChecklists                   | dual-path |
| clause-library/page.tsx          | demo-data-governance             | useClauseLibrary\*                        | dual-path |
| obligations/page.tsx             | demo-data-governance             | useContractObligations                    | dual-path |
| payment-approvals/page.tsx       | demo-data-governance             | useBudgetApprovals                        | dual-path |
| vendor-reviews/page.tsx          | demo-data-vendor-lifecycle       | useVendorReviews                          | dual-path |
| revenue/page.tsx                 | demo-data-crm-revenue            | useRevenueSchedules\*                     | dual-path |
| finance/page.tsx                 | demo-data                        | useInvoices, usePurchaseOrders            | dual-path |
| estimates/page.tsx               | demo-data-crm-revenue            | useEstimates                              | dual-path |
| estimates/[id]/page.tsx          | demo-data-crm-revenue            | useEstimates                              | dual-path |
| accounts/page.tsx                | demo-data-crm-revenue            | useCompanies                              | dual-path |
| insurance-policies/page.tsx      | demo-data-governance             | useInsurancePolicies\*                    | dual-path |
| insurance-policies/[id]/page.tsx | demo-data-governance             | useInsurancePolicies\*                    | dual-path |
| companies/page.tsx               | demo-data-crm-revenue            | useCompanies                              | dual-path |
| companies/[id]/page.tsx          | demo-data-crm-revenue            | useCompany                                | dual-path |
| dispatch/page.tsx                | demo-data                        | useShipments, useVehicles                 | dual-path |
| checklists/page.tsx              | demo-data-production             | useChecklists\*                           | dual-path |
| contracts/page.tsx               | demo-data-production             | useContracts\*                            | dual-path |
| digital-assets/page.tsx          | demo-data-creative-brand         | useDigitalAssets                          | dual-path |
| engineering-approvals/page.tsx   | demo-data-production             | useApprovals                              | dual-path |
| vendor-compliance/page.tsx       | demo-data-vendor-lifecycle       | useVendors                                | dual-path |
| (public)/page.tsx                | demo-data                        | useCaseStudies, usePublicTestimonials     | dual-path |
| budget-approvals/page.tsx        | demo-data-production             | useBudgets                                | dual-path |
| scheduling/page.tsx              | demo-data (+ inline MOCK_SHIFTS) | useShifts, useCrewMembers, useProjects    | dual-path |
| goods-receipts/page.tsx          | demo-data-production             | usePurchaseOrders                         | dual-path |

## Category B — Inline-Only Mock Pages (21 files)

These pages define `const MOCK_*` arrays inline with NO external demo-data import AND no Supabase hook. Full wiring needed.

| Page                                  | Inline Mocks                              | Supabase Hook Available                          |
| ------------------------------------- | ----------------------------------------- | ------------------------------------------------ |
| surveys/page.tsx                      | MOCK_TEMPLATES, MOCK_RESPONSES            | useSurveyTemplates, useSurveyResponses           |
| settings/email-integration/page.tsx   | MOCK_EMAILS, MOCK_EMAIL_ACCOUNTS          | useEmailMessages                                 |
| settings/custom-fields/page.tsx       | MOCK_FIELD_DEFINITIONS                    | useCustomFieldDefinitions                        |
| reports/ai/page.tsx                   | MOCK_SAVED_REPORTS, MOCK_TEMPLATES        | useReportDefinitions                             |
| time-tracking/compliance/page.tsx     | MOCK_VIOLATIONS, MOCK_POLICY, MOCK_WEEKLY | useTimeTrackingPolicy, useTimeTrackingCompliance |
| finance/revenue-recognition/page.tsx  | MOCK_REV_ENTRIES, MOCK_DEFERRED           | useRevenueRecognitionEntries                     |
| service-requests/sla/page.tsx         | MOCK_SLA_POLICIES, MOCK_SLA_STATUS        | useSlaPolicies, useSlaStatus                     |
| projects/templates/page.tsx           | MOCK_TEMPLATES                            | useProjectTemplates\*                            |
| knowledge-base/collaborative/page.tsx | MOCK_DOCUMENTS, MOCK_PRESENCE             | useKnowledgeArticles                             |
| workforce/goals/page.tsx              | MOCK_GOALS                                | useGoals                                         |
| quality-checks/page.tsx               | MOCK_TEMPLATES                            | useQualityCheckTemplates, useQualityChecks       |
| proposals/new/page.tsx                | MOCK_SECTIONS, MOCK_TEMPLATES + more      | useProposals                                     |
| knowledge-base/[id]/page.tsx          | MOCK_ARTICLE, MOCK_VERSIONS, MOCK_LINKS   | useKnowledgeArticle                              |
| procurement/page.tsx                  | MOCK_PURCHASE_REQUISITIONS                | usePurchaseOrders                                |
| sops/page.tsx                         | inline SOP items                          | useSOPs                                          |
| vault/page.tsx                        | inline vault docs                         | useVaultDocuments                                |
| decks/page.tsx                        | inline deck items                         | useDecks                                         |
| brand-kit/page.tsx                    | inline brand-kit items                    | useBrandKits                                     |
| knowledge-base/page.tsx               | inline KB items                           | useKnowledgeArticles                             |
| leads/[id]/page.tsx                   | MOCK_LEAD, MOCK_ACTIVITIES                | useLead                                          |
| templates/[id]/page.tsx               | MOCK_TEMPLATE, MOCK_SECTIONS              | useProjectTemplates\*                            |

## Category C — Detail Page Chatter (29 files)

These detail `[id]` pages import `makeMockActivity` / `makeMockComments` from `mock-chatter-data.ts`.

**Migration:** Replace with `useRecordComments` + `useRecordActivityLog` from `hooks-feature-gaps.ts`.

All 29 detail pages: assets/[id], brand-kit/[id], briefs/[id], call-sheets/[id], campaigns/[id], certifications/[id], change-orders/[id], companies/[id], contracts/[id], creative-assets/[id], crew/[id], deals/[id], decks/[id], digital-assets/[id], estimates/[id], events/[id], expenses/[id], incidents/[id], insurance-policies/[id], invoices/[id], locations/[id], opportunities/[id], permits/[id], proposals/[id], recurring-invoices/[id], scopes-of-work/[id], service-requests/[id], tasks/[id], tech-sheets/[id], vendors/[id], work-orders/[id]

## Category D — Demo Data Source Files (10 files)

To be deleted after all consumers are migrated:

1. `src/lib/demo-data.ts` — MOCK_DEALS, MOCK_PROJECTS, MOCK_TASKS, MOCK_CREW, MOCK_ASSETS, MOCK_VEHICLES, MOCK_VENDORS, MOCK_POS, MOCK_INVOICES, MOCK_APPROVALS, MOCK_NOTIFICATIONS, MOCK_CASE_STUDIES, MOCK_STAKEHOLDERS, DEAL_STAGES
2. `src/lib/demo-data-production.ts` — Production entities (activations, events, locations, incidents, etc.)
3. `src/lib/demo-data-creative-brand.ts` — Campaigns, brand kits, briefs, creative assets
4. `src/lib/demo-data-crm-revenue.ts` — Revenue schedules, estimates, opportunities, companies
5. `src/lib/demo-data-governance.ts` — Compliance checklists, contract obligations, insurance, payment approvals
6. `src/lib/demo-data-vendor-lifecycle.ts` — Vendor reviews, onboarding, compliance
7. `src/lib/demo-data-user-lifecycle.ts` — User lifecycle data
8. `src/lib/demo-data-workforce.ts` — Workforce data
9. `src/lib/demo-data-lazy.ts` — Lazy loader for above modules
10. `src/lib/mock-chatter-data.ts` — makeMockActivity, makeMockComments

---

## Migration Strategy

### Phase 1 — Dual-Path Pages (Category A)

For each page:

1. Remove `MOCK_*` import from `demo-data*`
2. Remove `isSupabaseConfigured` import
3. Replace `isSupabaseConfigured && sbData ? transform(sbData) : MOCK_DATA` with `sbData ?? []`
4. Add proper loading skeleton + empty state
5. Remove manual snake_case → camelCase transforms where Supabase types can be used directly

### Phase 2 — Inline-Only Mock Pages (Category B)

For each page:

1. Import the corresponding Supabase hook
2. Replace inline `const MOCK_*` with hook data
3. Add loading + empty states

### Phase 3 — Detail Page Chatter (Category C)

For each detail page:

1. Replace `makeMockActivity(entityType)` with `useRecordActivityLog(entityType, id)`
2. Replace `makeMockComments()` with `useRecordComments(entityType, id)`
3. Remove `mock-chatter-data` import

### Phase 4 — Cleanup

1. Delete all 10 demo data source files
2. Delete `use-supabase-or-mock.ts`
3. Remove `isSupabaseConfigured` export from `client.ts` (or keep for runtime detection only)
4. Verify zero remaining `MOCK_` references in `/src/app/`

---

## Risk Assessment

- **Empty database:** Pages will show empty states instead of fake data. This is correct production behavior.
- **Type mismatches:** Some pages have manual `snake_case → camelCase` transforms that can be simplified by using Supabase types directly, but this must be done carefully to avoid breaking existing consumers.
- **Bundle size reduction:** Removing ~3000+ lines of demo data will meaningfully reduce the JS bundle.
