# Unused Hooks Wiring Plan

**Generated:** 2025-03-17  
**Updated:** 2025-03-17 — Full per-hook audit complete  
**Status:** Planning — no code changes yet

---

## Key Finding

> **All 522 unused hooks map to existing pages. Zero orphans. Zero pages need creation.**
>
> The earlier estimate of ~30 "truly orphaned" hooks was wrong — caused by slug
> mismatches between hook API paths and actual page directory names. After manual
> cross-referencing every hook against its actual page, API route, and entity config,
> every single hook has a clear wiring target.
>
> **49 hooks have naming convention mismatches** that must be normalized so that
> hook API slugs consistently match page directory slugs.

---

## Inventory Summary

| Metric                                    | Count   |
| ----------------------------------------- | ------- |
| Total hooks across all `hooks-*.ts` files | 970     |
| Hooks consumed by pages/components        | 448     |
| **Unused hooks (no consumer)**            | **522** |

### Unused by Category

| Type                | Count | Purpose                                        |
| ------------------- | ----- | ---------------------------------------------- |
| `useCreate*`        | 180   | Create mutations for entities                  |
| `useUpdate*`        | 97    | Update mutations for entities                  |
| `useDelete*`        | 53    | Delete mutations for entities                  |
| Query / Specialized | 192   | List queries, detail queries, workflow actions |

### Unused by Hook File

| File                          | Unused | Description                                                                                   |
| ----------------------------- | ------ | --------------------------------------------------------------------------------------------- |
| `hooks-production.ts`         | 65     | Production tasks, milestones, BOMs, work packages, QC gates, schedules, specs                 |
| `hooks-assets-inventory.ts`   | 63     | Assets, kits, load plans, inventory audits, consumables, maintenance, storage, rentals        |
| `hooks-finance.ts`            | 54     | Invoices, payments, payroll, budgets, GL accounts, rate cards, depreciation, revenue          |
| `hooks-automation.ts`         | 37     | Automations, dashboards, custom fields, reports, SLA, bulk imports, export templates          |
| `hooks-admin.ts`              | 37     | Orgs, teams, activities, vendor comms, brands, checklists, risk assessments                   |
| `hooks-workforce.ts`          | 36     | Crew shifts, time entries, time off, certifications, worker profiles, vendor compliance       |
| `hooks-crm.ts`                | 33     | Leads, pipelines, case studies, testimonials, lost reasons, proposals, stakeholder projects   |
| `hooks-legal.ts`              | 31     | Contracts, insurance, IP rights, contract amendments, legal holds, RFQs, compliance           |
| `hooks-live-ops.ts`           | 30     | All 17 live-ops entities (FOH zones, comm channels, ROS cues, VIP, scan events, etc.)         |
| `hooks-documents.ts`          | 25     | Document templates/versions, brand guidelines/sections, briefs, creative reviews, KB articles |
| `hooks-core.ts`               | 22     | Milestones, calendar events, integrations, workflows, comments                                |
| `hooks-workflows.ts`          | 15     | Approval workflows/steps, call sheet crew, e-signatures, workflow instances                   |
| `hooks-sow.ts`                | 15     | SOW deliverables, invoice line items, invoice time entries, progress snapshots                |
| `hooks-feature-gaps.ts`       | 13     | Collaborators, catalog overrides, comm templates, project comm templates                      |
| `hooks-credentialing.ts`      | 13     | Credential types, pools, assignments, crew submissions                                        |
| `hooks-advancing.ts`          | 11     | Advance items, status transitions, advance templates                                          |
| `hooks-collaborators.ts`      | 8      | Collaborator invites, requirements                                                            |
| `hooks-approval-engine.ts`    | 5      | Initiate, escalate, cancel approval + approval decisions                                      |
| `hooks-messaging.ts`          | 3      | Mark read, update conversation                                                                |
| `hooks-external-sync.ts`      | 3      | Provider ticket map, sync conflict policy                                                     |
| `hooks-messaging-realtime.ts` | 2      | Typing indicator, presence                                                                    |
| `hooks-scanning.ts`           | 1      | Asset lookup                                                                                  |

---

## Architecture Context

### How hooks are consumed today

1. **`ListPageShell`** (223 pages) — Uses generic `useQuery` + `apiFetch` for list data and `apiDelete` for row/bulk delete. Does **NOT** consume named hooks. Create is handled by `CreateEntityDialog`.

2. **`DetailPageShell`** (56 pages) — Uses generic `useQuery` + `apiGet` for single-record fetch. Receives `menuItems` from `useDetailCrud` which the `[id]/page.tsx` wires up with entity-specific `useUpdate*` and `useDelete*` hooks.

3. **`useDetailCrud`** — Accepts `useUpdateHook` and `useDeleteHook`, returns `handleUpdate`, `handleDelete`, `menuItems`, `isUpdating`, `isDeleting`. This is the standard pattern for detail page CRUD.

4. **Custom pages** — Some pages (time-tracking, settings, messaging) use specialized hooks directly.

### Why hooks are unused (corrected after full audit)

| Reason                                              | Count | Resolution                                                      |
| --------------------------------------------------- | ----- | --------------------------------------------------------------- |
| Detail page exists but doesn't wire `useDetailCrud` | 43    | Wire hooks into existing `[id]/page.tsx` via `useDetailCrud`    |
| List page exists, hooks not imported                | 319   | Wire into list page CRUD, create dialogs, or page-level queries |
| API route exists but no page (sub-entity)           | 15    | Wire as tabs on parent detail pages                             |
| Custom/specialized hooks not consumed               | 126   | Wire action buttons, tabs, queries into target pages            |
| Non-factory hooks with slug mismatches              | 49    | Normalize API path slugs to match page directories, then wire   |
| **Truly orphaned (no page, no API)**                | **0** | **None — every hook has a target**                              |

---

## Phase 0: Normalize Naming Conventions (PREREQUISITE)

**49 hooks have API path slugs that don't match their target page directory names.**
This is the root cause of the "can't tell if it's unused" problem. Fix the API paths in the
hook factory calls so that the query key and API path consistently match the page slug.

### Naming Convention Standard

| Layer               | Convention                                    | Example                 |
| ------------------- | --------------------------------------------- | ----------------------- |
| DB table            | `snake_case` plural                           | `organizations`         |
| Entity config key   | `snake_case` singular                         | `organization`          |
| API route directory | `/api/kebab-case-plural`                      | `/api/organizations`    |
| Page directory      | `kebab-case-plural`                           | `organizations/`        |
| Hook query key      | `snake_case` singular (matches entity config) | `"organization"`        |
| Hook list name      | `use` + PascalSingular + `s`                  | `useOrganizations`      |
| Hook detail name    | `use` + PascalSingular                        | `useOrganization`       |
| Hook CRUD names     | `useCreate/Update/Delete` + PascalSingular    | `useCreateOrganization` |

### Slug Mismatches to Fix

These hooks have API paths that point to slugs different from their actual page directories.
The API route itself may be correct, but the hook's query key and path must be normalized
so future tooling can automatically map `useXxx` → `/xxx` page.

| Hook API Slug (current) | Actual Page Slug           | Hooks Affected | Fix                                                                                                                       |
| ----------------------- | -------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `active-timers`         | `time-tracking`            | 3              | Rename API route or add alias; these are timer action hooks consumed by `time-tracking/page.tsx`                          |
| `activities`            | `activity-log`             | 2              | Align query key: `"activity_log"` → `/api/activity-log`                                                                   |
| `advance-templates`     | `advancing`                | 3              | Sub-entity of advancing; query key should use `"advance_template"` → `/api/advancing/templates` or keep as sub-entity tab |
| `bulk-imports`          | `settings`                 | 3              | Bulk import is a settings feature; wire into settings page directly                                                       |
| `catalog`               | `catalog-items`            | 1              | Rename API: `/api/catalog` → `/api/catalog-items`                                                                         |
| `department-statuses`   | `live-ops/departments`     | 2              | Sub-page; API stays, hooks wire into `live-ops/departments/page.tsx`                                                      |
| `export-templates`      | `templates`                | 3              | Wire into templates page; keep API as `/api/export-templates`                                                             |
| `fleet-vehicles`        | `fleet`                    | 2              | Rename page dir to `fleet-vehicles` OR rename API to `/api/fleet`                                                         |
| `guest-incidents`       | `live-ops/guest-incidents` | 2              | Sub-page of live-ops; API stays, hooks wire into nested page                                                              |
| `hr-certifications`     | `certifications`           | 4              | HR certs are sub-type; wire as tab on `certifications` page                                                               |
| `organization`          | `settings`                 | 2              | Org settings hooks; wire into settings page                                                                               |
| `pipelines`             | `deals`                    | 5              | CRM pipelines are sub-entity of deals; wire as tab/config on deals                                                        |
| `rights`                | `ip-rights`                | 5              | Rename API: `/api/rights` → `/api/ip-rights`                                                                              |
| `scanning`              | `scan-events`              | 1              | Rename: `/api/scanning` → `/api/scan-events`                                                                              |
| `storage-objects`       | `vault-documents`          | 4              | Rename API: `/api/storage-objects` → `/api/vault-documents`                                                               |
| `user-certifications`   | `certifications`           | 4              | Wire as tab on certifications page                                                                                        |
| `user-profiles`         | `user-management`          | 1              | Wire into user management page                                                                                            |
| `vip-guests`            | `vip-service-requests`     | 2              | Rename API: `/api/vip-guests` → `/api/vip-service-requests`                                                               |

**Total: 18 slug pairs, 49 hooks affected.**

After Phase 0, every hook's API slug will match its page directory, making future
unused-hook detection trivially automatable.

---

## Phase 1: Wire 13 Existing Detail Pages (0-hook pages)

These detail `[id]/page.tsx` files exist but import zero supabase hooks. Each needs `useDetailCrud` wiring at minimum (useUpdate + useDelete → menuItems).

| Page                         | Hooks to wire                                                                                                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `approval-workflows/[id]`    | `useUpdateApprovalWorkflow`, `useDeleteApprovalWorkflow` + tabs: `useApprovalSteps`, `useCreateApprovalStep`, `useWorkflowInstances`, `useWorkflowStepApprovals` |
| `brand-guidelines/[id]`      | `useUpdateBrandGuideline`, `useDeleteBrandGuideline` + tab: `useBrandGuidelineSections`                                                                          |
| `brand-kit/[id]`             | `useUpdateBrandKit`, `useDeleteBrandKit`                                                                                                                         |
| `campaigns/[id]`             | `useUpdateCampaign`, `useDeleteCampaign`                                                                                                                         |
| `compliance-checklists/[id]` | `useUpdateComplianceChecklist`, `useDeleteComplianceChecklist`                                                                                                   |
| `dispatch/[id]`              | `useUpdateDispatchRecord`, `useDeleteDispatchRecord`                                                                                                             |
| `insurance-policies/[id]`    | `useUpdateInsurancePolicy`, `useDeleteInsurancePolicy` + tab: `useInsuranceRequirements` + action: `useRequestCoi`                                               |
| `integrations/[id]`          | `useUpdateIntegration`, `useDeleteIntegration` + tab: `useProviderTicketMap` + action: `useUpdateSyncConflictPolicy`                                             |
| `live-ops/[id]`              | Wire live-ops entity hooks based on entity type                                                                                                                  |
| `purchase-requisitions/[id]` | `useUpdatePurchaseRequisition`, `useDeletePurchaseRequisition`                                                                                                   |
| `recurring-invoices/[id]`    | `useUpdateRecurringInvoice`, `useDeleteRecurringInvoice`                                                                                                         |
| `service-requests/[id]`      | `useUpdateServiceRequest`, `useDeleteServiceRequest`                                                                                                             |
| `templates/[id]`             | `useUpdateProjectTemplate`, `useDeleteProjectTemplate` + `useExportTemplates`, `useCreateExportTemplate`, `useUpdateExportTemplate`                              |

**Hooks consumed:** ~55

---

## Phase 2: Wire Sub-Entity Hooks into Parent Detail Tabs

These parent detail pages exist but don't yet render related-entity tab sections.

| Parent Detail Page        | Sub-entity hooks to wire as tabs                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets/[id]`             | `useAssetAssignments`, `useAssetAssignment`, `useAssetVersions`, `useAssetVersion`, `useAssetTags`, `useMaintenanceRecords`, `useMaintenanceRecord`, `useDepreciationSchedules`, `useDepreciationSchedule`, `useAssetLookup`                                                                                                                                                                                                                                      |
| `contracts/[id]`          | `useContractAmendments`, `useContractAmendment`, `useESignatures`, `useCreateESignature`, `useIssueContract`                                                                                                                                                                                                                                                                                                                                                      |
| `projects/[id]`           | `useProjectAssignments`, `useProjectAssignment`, `useStakeholderProjects`, `useProjectCommTemplates`, `useUpdateCommTemplate`                                                                                                                                                                                                                                                                                                                                     |
| `invoices/[id]`           | `useInvoiceLineItems`, `useCreateInvoiceLineItem`, `useUpdateInvoiceLineItem`, `useDeleteInvoiceLineItem`, `useInvoiceTimeEntries`, `useCreateInvoiceTimeEntry`, `useClientInvoiceAging`, `useGenerateInvoiceFromTime`                                                                                                                                                                                                                                            |
| `scopes-of-work/[id]`     | `useSOWDeliverables`, `useSOWDeliverable`, `useCreateSOWDeliverable`, `useUpdateSOWDeliverable`, `useDeleteSOWDeliverable`, `useSOWChangeLog`, `useDeliverableProgressSnapshots`, `useCreateDeliverableProgressSnapshot`, `useSOWDeliverableSummary`, `useInviteCollaborator`, `useCollaboratorRequirements`, `useUpdateCollaborator`                                                                                                                             |
| `leads/[id]`              | `useConvertLeadToDeal`, `useLeadPipelineStats`, `useCreateLeadActivity`                                                                                                                                                                                                                                                                                                                                                                                           |
| `knowledge-base/[id]`     | `useKnowledgeArticles`, `useKnowledgeArticle`, `useCreateKnowledgeArticle`, `useUpdateKnowledgeArticle`, `useArticleLinks`, `useLinkArticle`                                                                                                                                                                                                                                                                                                                      |
| `call-sheets/[id]`        | `useCallSheetCrew`, `useCreateCallSheet`                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `automations/[id]`        | `useAutomationWithRules`                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `approval-workflows/[id]` | `useApprovalSteps`, `useCreateApprovalStep`, `useWorkflowInstances`, `useCreateWorkflowInstance`, `useUpdateWorkflowInstance`, `useWorkflowStepApprovals`                                                                                                                                                                                                                                                                                                         |
| `budgets/[id]`            | `useProductionBudgetLines`, `useProductionBudgetLine`, `useBudgetApproval`                                                                                                                                                                                                                                                                                                                                                                                        |
| `certifications/[id]`     | `useHrCertifications`, `useHrCertification`, `useCreateHrCertification`, `useUpdateHrCertification`, `useUserCertifications`, `useCreateUserCertification`, `useUpdateUserCertification`, `useDeleteUserCertification`                                                                                                                                                                                                                                            |
| `deals/[id]`              | `usePipelines`, `usePipeline`, `useCreatePipeline`, `useUpdatePipeline`, `useDeletePipeline`, `useLostReasons`                                                                                                                                                                                                                                                                                                                                                    |
| `briefs/[id]`             | `useBriefTemplates`                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `documents/[id]`          | `useDocumentVersions`, `useMyDocuments`                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `creative-assets/[id]`    | `useCreativeReviews`                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `rate-cards/[id]`         | `useRateCardWithItems`, `useCreateRateCardItem`                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `proposals/[id]`          | `useProposalWithItems`, `useCreateProposalItem`                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `reviews/page`            | `useReviewCycles`, `useReviewFeedback`                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `advancing/[id]`          | `useAdvanceStatusTransition`, `useAdvanceItemStatusTransition`, `useDeleteAdvance`, `useDeleteAdvanceItem`, `useCreateAdvanceItem`, `useCreateAdvanceTemplate`, `useUpdateAdvanceTemplate`, `useDeleteAdvanceTemplate`                                                                                                                                                                                                                                            |
| `production-runs/[id]`    | `useProductionTasks`, `useProductionTask`, `useProductionMilestones`, `useProductionMilestone`, `useProductionExpenses`, `useProductionExpense`, `useProductionBudgetLines`, `useProductionBudgetLine`, `useProductionTimeEntries`, `useProductionTimeEntry`, `useProductionChecklists`, `useProductionChecklist`, `useProductionSOPs`, `useProductionSOP`, `useCreateProductionSOP`, `useUpdateProductionSOP`, `useProductionVerticals`, `useProductionVertical` |

**Hooks consumed:** ~130

---

## Phase 3: Wire Specialized / Workflow / Action Hooks into Pages

| Hook(s)                                                                                                               | Target Page                                | Action                              |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------------------- |
| `useStartTimer`, `useStopTimer`, `useActiveTimer`                                                                     | `time-tracking/page.tsx`                   | Wire timer controls                 |
| `useApproveTimeOffRequest`, `useRejectTimeOffRequest`                                                                 | `time-off-requests/[id]` or list           | Wire approve/reject actions         |
| `useGenerateInvoiceFromTime`                                                                                          | `invoices/page.tsx`                        | Wire "Generate Invoice" action      |
| `useConvertLeadToDeal`                                                                                                | `leads/[id]`                               | Wire "Convert to Deal" action       |
| `useInitiateApproval`, `useApprovalDecision`, `useEscalateApproval`, `useCancelApproval`, `useApprovalInstanceStatus` | `approvals/[id]`                           | Wire approval engine actions        |
| `useMarkRead`, `useUpdateConversation`, `usePinnedMessages`                                                           | `messages/page.tsx`                        | Wire conversation actions           |
| `useTypingIndicator`, `usePresence`                                                                                   | messaging components                       | Wire real-time features             |
| `useIssueContract`                                                                                                    | `contracts/[id]`                           | Wire "Issue Contract" action        |
| `useRequestCoi`                                                                                                       | `insurance-policies/[id]`                  | Wire "Request COI" action           |
| `useUpsertCustomFieldValue`, `useCustomFieldValues`, `useCustomFields`, `useCreateCustomField`                        | `custom-fields/page.tsx`                   | Wire custom field management        |
| `useUpsertTimeTrackingPolicy`                                                                                         | `time-tracking-policies`                   | Wire policy management              |
| `useBulkImportJob`, `useBulkImportJobs`, `useCreateBulkImportJob`                                                     | `settings`                                 | Wire bulk import UI                 |
| `useProviderTicketMap`, `useUpdateSyncConflictPolicy`, `useCreateProviderConnection`                                  | `integrations/[id]`                        | Wire sync config                    |
| `useOrganization`, `useUpdateOrganization`                                                                            | `settings`                                 | Wire org settings                   |
| `useTeamDetail`, `useCreateTeam`, `useUpdateTeam`, `useDeleteTeam`, `useAddTeamMember`, `useRemoveTeamMember`         | `teams`                                    | Wire team management                |
| `useCreateActivity`, `useUpdateActivity`, `useActivityLog`, `useActivityLogRecent`                                    | `activity-log`                             | Wire activity log                   |
| `useCreateDepartmentStatus`, `useUpdateDepartmentStatus`                                                              | `live-ops/departments`                     | Wire dept status CRUD               |
| `useCreateGuestIncident`, `useUpdateGuestIncident`                                                                    | `live-ops/guest-incidents`                 | Wire incident CRUD                  |
| `useCreateVipGuest`, `useUpdateVipGuest`                                                                              | `vip-service-requests`                     | Wire VIP guest CRUD                 |
| `useComments`                                                                                                         | Global `entity-comments-section` component | Wire into shared comments component |
| `useDashboardWithWidgets`, `useDashboards`, `useDashboardWidgets`                                                     | `dashboards`                               | Wire dashboard builder              |
| `useReportDefinitions`                                                                                                | `reports`                                  | Wire report definitions             |

**Hooks consumed:** ~60

---

## Phase 4: Wire Remaining List-Page CRUD Hooks

319 factory hooks belong to entities that have list pages. `ListPageShell` uses generic
`apiFetch`/`apiDelete` and doesn't consume named hooks. These hooks become active consumers
when detail pages or page-level features import them.

The remaining ~277 hooks (522 − 55 − 130 − 60 = 277) are factory CRUD hooks attached
to entities that have list pages but where `ListPageShell` uses generic `apiFetch`/`apiDelete`
instead of named hooks. These hooks will be consumed when:

- Detail pages are added for list-only entities (the detail page imports `useUpdate*`, `useDelete*` via `useDetailCrud`)
- Create dialogs are migrated from generic `apiCreate` to named `useCreate*` hooks
- Page-level queries are migrated from generic `useQuery` to named `useEntityList` hooks

This phase is the largest volume (277 hooks) but lowest urgency since the list pages
already function via the generic `ListPageShell` pattern. These hooks should be wired
incrementally as detail pages are built.

**Hooks consumed:** ~277 (incremental, as detail pages are created)

---

## Execution Order & Estimated Effort

| Phase | Description                                       | Hooks Consumed    | Files Changed                  | Effort                                        |
| ----- | ------------------------------------------------- | ----------------- | ------------------------------ | --------------------------------------------- |
| **0** | Normalize 18 slug mismatches (49 hooks)           | 0 (renaming only) | ~12 hook files + ~6 API routes | Small — rename API paths and query keys       |
| **1** | Wire 13 existing 0-hook detail pages              | ~55               | 13                             | Small — add imports + `useDetailCrud` call    |
| **2** | Wire sub-entity hooks into parent detail tabs     | ~130              | ~21 detail pages               | Medium — add tab components with list queries |
| **3** | Wire specialized/workflow/action hooks            | ~60               | ~22 pages + components         | Medium — add action buttons + mutation calls  |
| **4** | Wire remaining list-page CRUD hooks (incremental) | ~277              | Ongoing                        | Large — migrate as detail pages are built     |
|       | **Total**                                         | **522**           | **~70+ files**                 |                                               |

**Zero hooks will be removed.** Every hook has a verified target page.

---

## Rules

1. **No shortcuts** — every hook wired must use proper `useDetailCrud` or direct consumption pattern
2. **No stubs** — every detail page created must be a real, functional page with `DetailPageShell`
3. **No removal of hooks** — every hook has a verified target; none are orphaned
4. **No backwards-compat shims** — all wiring uses the current factory pattern
5. **Naming convention enforced** — after Phase 0, every hook API slug matches its page directory
6. **tsc + eslint clean** after every phase

---

## Phase 1 Detailed: 13 Detail Pages to Wire

Each page below needs:

```tsx
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useUpdate<Entity>, useDelete<Entity> } from "@/lib/supabase";

// Inside component:
const { menuItems } = useDetailCrud({
    entityId: id,
    entityLabel: "<Entity Name>",
    listPath: "/<entity-slug>",
    useUpdateHook: useUpdate<Entity>,
    useDeleteHook: useDelete<Entity>,
});

// Pass to DetailPageShell:
<DetailPageShell config={config} id={id} menuItems={menuItems} />
```

### 1. approval-workflows/[id]/page.tsx

- Wire: `useUpdateApprovalWorkflow`, `useDeleteApprovalWorkflow`
- Tabs: `useApprovalSteps` (list), `useCreateApprovalStep`, `useWorkflowInstances`

### 2. brand-guidelines/[id]/page.tsx

- Wire: `useUpdateBrandGuideline`, `useDeleteBrandGuideline`
- Tabs: `useBrandGuidelineSections`

### 3. brand-kit/[id]/page.tsx

- Wire: `useUpdateBrandKit`, `useDeleteBrandKit`

### 4. campaigns/[id]/page.tsx

- Wire: `useUpdateCampaign`, `useDeleteCampaign`

### 5. compliance-checklists/[id]/page.tsx

- Wire: `useUpdateComplianceChecklist`, `useDeleteComplianceChecklist`

### 6. dispatch/[id]/page.tsx

- Wire: `useUpdateDispatchRecord`, `useDeleteDispatchRecord`

### 7. insurance-policies/[id]/page.tsx

- Wire: `useUpdateInsurancePolicy`, `useDeleteInsurancePolicy`
- Tabs: `useInsuranceRequirements`
- Actions: `useRequestCoi`

### 8. integrations/[id]/page.tsx

- Wire: `useUpdateIntegration`, `useDeleteIntegration`
- Tabs: `useProviderTicketMap`
- Actions: `useUpdateSyncConflictPolicy`

### 9. live-ops/[id]/page.tsx

- Wire: generic live-ops CRUD hooks based on entity type

### 10. purchase-requisitions/[id]/page.tsx

- Wire: `useUpdatePurchaseRequisition`, `useDeletePurchaseRequisition`

### 11. recurring-invoices/[id]/page.tsx

- Wire: `useUpdateRecurringInvoice`, `useDeleteRecurringInvoice`

### 12. service-requests/[id]/page.tsx

- Wire: `useUpdateServiceRequest`, `useDeleteServiceRequest`

### 13. templates/[id]/page.tsx

- Wire: `useUpdateProjectTemplate`, `useDeleteProjectTemplate`
