# Comprehensive E2E Test Suite Plan

## Scope

**Every module, every workstream, every workflow** in the FrozenPhoenix platform — tested at the validation, state machine, config integrity, and API contract layers.

**Existing test coverage:** 19 test files, ~136 tests (rbac, state machines, validation, navigation, etc.)
**Target:** 30+ test files, ~1,500+ tests across all 16 workstreams

---

## Architecture

Each test file follows the same 5-layer pattern proven by the advancing-lifecycle test:

1. **Validation schemas** — every create/update/transition schema, every field boundary, every enum value
2. **State machines** — every transition (valid + invalid), terminal states, happy paths, error paths
3. **Config/SSOT integrity** — every enum has a map entry, every map is complete, no orphan values
4. **Business rules** — domain-specific constraints (e.g., budget can't exceed project limit, shift can't overlap)
5. **Lifecycle scenarios** — multi-step end-to-end flows combining validation + transitions + rules

---

## Test Files by Module (30 files)

### WS-01: Business & CRM (`business-crm-lifecycle.test.ts`)

| Phase                      | What                                                             |    Tests |
| -------------------------- | ---------------------------------------------------------------- | -------: |
| Lead validation            | Create/update lead, source enum, status enum                     |      ~12 |
| Lead state machine         | new→contacted→qualified→nurturing→converted/disqualified         |      ~15 |
| Opportunity validation     | Create/update, stage enum, value ranges                          |      ~10 |
| Opportunity state machine  | Full pipeline through won/lost                                   |      ~12 |
| Deal validation            | Create/update, stage transitions                                 |      ~10 |
| Deal state machine         | discovery→proposal→negotiation→closed_won/lost                   |      ~15 |
| Proposal state machine     | draft→internal_review→sent→negotiation→accepted/rejected/expired |      ~12 |
| Estimate validation        | Create, number generation, line items                            |       ~8 |
| Change order validation    | Create, impact fields, approval                                  |       ~8 |
| Company/contact validation | Required fields, email format                                    |       ~6 |
| Pipeline config integrity  | All stages, labels, variants in SSOT maps                        |      ~10 |
| E2E scenarios              | Lead→opportunity→deal→proposal→contract flow                     |      ~15 |
| **Subtotal**               |                                                                  | **~133** |

### WS-02: Production & Projects (`production-projects-lifecycle.test.ts`)

| Phase                       | What                                                         |    Tests |
| --------------------------- | ------------------------------------------------------------ | -------: |
| Project validation          | Create/update, phase enum, status enum                       |      ~12 |
| Project state machine       | planning→pre_production→production→post_production→completed |      ~15 |
| Task validation             | Create/update, status/priority enums                         |      ~10 |
| Task state machine          | backlog→todo→in_progress→review→done                         |      ~12 |
| SOW validation              | Create, deliverables, status transitions                     |      ~10 |
| SOW state machine           | draft→submitted→approved→active→completed/expired/superseded |      ~12 |
| Milestone validation        | Due dates, completion criteria                               |       ~6 |
| Activation state machine    | planning→setup→rehearsal→live→strike→completed/cancelled     |      ~12 |
| Schedule entry validation   | Date ranges, conflicts                                       |       ~6 |
| BOM/Work package validation | Quantity, dependencies                                       |       ~8 |
| Config integrity            | All project/task/SOW statuses in maps                        |      ~10 |
| E2E scenarios               | Project creation→task assignment→SOW→milestone→completion    |      ~12 |
| **Subtotal**                |                                                              | **~125** |

### WS-03: Approvals & Workflows (`approvals-workflows-lifecycle.test.ts`)

| Phase                           | What                                                   |   Tests |
| ------------------------------- | ------------------------------------------------------ | ------: |
| Approval validation             | Create, status transitions                             |      ~8 |
| Approval instance state machine | pending→approved/rejected/escalated                    |     ~10 |
| Workflow validation             | Create, step definitions                               |      ~8 |
| Checklist validation            | Create, item completion                                |      ~6 |
| Quality check validation        | Create, pass/fail criteria                             |      ~6 |
| QC gate validation              | Readiness criteria                                     |      ~6 |
| Automation rule validation      | Trigger/condition/action schemas                       |     ~10 |
| Config integrity                | Approval statuses, workflow types                      |      ~8 |
| E2E scenarios                   | Multi-step approval chain, escalation, rejection cycle |     ~10 |
| **Subtotal**                    |                                                        | **~72** |

### WS-04: Finance & Billing (`finance-billing-lifecycle.test.ts`)

| Phase                        | What                                                   |    Tests |
| ---------------------------- | ------------------------------------------------------ | -------: |
| Invoice validation           | Create/update, number, amounts, dates                  |      ~12 |
| Invoice state machine        | draft→sent→viewed→partial→paid/overdue/void            |      ~15 |
| Client invoice validation    | Create, retention_percent, terms                       |      ~10 |
| Payment validation           | Create, direction enum, method                         |       ~8 |
| Payment state machine        | pending→processing→completed/failed/refunded/cancelled |      ~12 |
| Credit note validation       | Create, amounts                                        |       ~6 |
| Budget validation            | Create, amounts, project link                          |       ~8 |
| Budget approval validation   | Threshold checks, chain                                |       ~6 |
| Expense validation           | Create, category enum, receipt                         |       ~8 |
| Expense state machine        | draft→submitted→approved/rejected→reimbursed           |      ~10 |
| Payroll validation           | Batch creation, amounts                                |       ~6 |
| Rate card validation         | Tiers, effective dates                                 |       ~6 |
| GL account validation        | Account codes                                          |       ~4 |
| Purchase order state machine | draft→issued→partial→received→closed                   |      ~12 |
| Recurring invoice validation | Schedule, next_date computation                        |       ~6 |
| Config integrity             | All financial statuses, currency formats               |      ~10 |
| E2E scenarios                | Budget→expense→invoice→payment→reconciliation          |      ~12 |
| **Subtotal**                 |                                                        | **~151** |

### WS-05: Workforce & Crew (`workforce-crew-lifecycle.test.ts`)

| Phase                            | What                                          |   Tests |
| -------------------------------- | --------------------------------------------- | ------: |
| Crew member validation           | Create/update, status, certifications         |     ~10 |
| Crew shift state machine         | scheduled→checked_in→active→completed/no_show |     ~10 |
| Time entry validation            | Create, hours, rates, overlap checks          |     ~10 |
| Time entry state machine         | draft→submitted→approved/rejected             |      ~8 |
| Time off request validation      | Create, date ranges, balance                  |      ~8 |
| Certification validation         | Create, expiry dates, issuing authority       |      ~8 |
| Resource booking validation      | Create, conflict detection                    |      ~8 |
| Worker classification validation | Create, pay rates                             |      ~6 |
| Worker compliance doc validation | Create, expiry                                |      ~6 |
| Config integrity                 | Shift statuses, time entry types              |      ~8 |
| E2E scenarios                    | Hire→certify→schedule→shift→timesheet→payroll |     ~12 |
| **Subtotal**                     |                                               | **~94** |

### WS-06: Vendors & Procurement (`vendors-procurement-lifecycle.test.ts`)

| Phase                           | What                                         |   Tests |
| ------------------------------- | -------------------------------------------- | ------: |
| Vendor validation               | Create/update, status, specialty             |     ~10 |
| Vendor state machine            | prospect→active→preferred→suspended/inactive |     ~12 |
| Work order validation           | Create, assignment, completion               |      ~8 |
| Purchase requisition validation | Create, approval chain                       |      ~6 |
| Purchase order validation       | Create, line items                           |      ~8 |
| Goods receipt validation        | Create, 3-way match                          |      ~6 |
| Vendor review validation        | Rating, criteria                             |      ~6 |
| Vendor compliance validation    | Doc types, expiry                            |      ~6 |
| Vendor onboarding validation    | Steps, requirements                          |      ~6 |
| Config integrity                | Vendor statuses, PO statuses                 |      ~8 |
| E2E scenarios                   | Vendor onboard→PO→receipt→invoice→payment    |     ~10 |
| **Subtotal**                    |                                              | **~86** |

### WS-07: Assets & Logistics (`assets-logistics-lifecycle.test.ts`)

| Phase                          | What                                            |    Tests |
| ------------------------------ | ----------------------------------------------- | -------: |
| Asset validation               | Create/update, condition enum, barcode          |      ~10 |
| Asset state machine            | available→assigned→deployed→maintenance→retired |      ~12 |
| Shipment validation            | Create, tracking, dates                         |       ~8 |
| Shipment state machine         | pending→picked_up→in_transit→delivered/returned |      ~12 |
| Vehicle validation             | Create, fleet management                        |       ~6 |
| Warehouse validation           | Create, zones, locations                        |       ~6 |
| Kit validation                 | Create, components                              |       ~6 |
| Load plan validation           | Create, weight/volume                           |       ~6 |
| Inventory audit validation     | Create, variance                                |       ~6 |
| Rental agreement state machine | draft→active→extended→returned/terminated       |      ~10 |
| Transfer order validation      | Create, source/destination                      |       ~6 |
| Config integrity               | Asset conditions, shipment statuses             |       ~8 |
| E2E scenarios                  | Procure→warehouse→kit→deploy→return→audit       |      ~12 |
| **Subtotal**                   |                                                 | **~108** |

### WS-08: Messaging & Communications (`messaging-comms-lifecycle.test.ts`)

| Phase                       | What                                      |   Tests |
| --------------------------- | ----------------------------------------- | ------: |
| Conversation validation     | Create, type enum, members                |      ~8 |
| Message validation          | Create, priority, mentions                |      ~8 |
| Reaction validation         | Toggle, emoji                             |      ~4 |
| Pin/unpin validation        | Toggle                                    |      ~4 |
| Read receipt validation     | Mark read                                 |      ~4 |
| Mandatory read validation   | Acknowledge                               |      ~4 |
| Channel template validation | Create, variables                         |      ~6 |
| Escalation rule validation  | Create, conditions                        |      ~6 |
| Search validation           | Query, filters                            |      ~4 |
| Export validation           | Format, date range                        |      ~4 |
| Config integrity            | Message priorities, conversation types    |      ~6 |
| E2E scenarios               | Create DM→send→react→thread→search→export |     ~10 |
| **Subtotal**                |                                           | **~68** |

### WS-09: Live Operations (`live-ops-lifecycle.test.ts`)

| Phase                              | What                                                          |    Tests |
| ---------------------------------- | ------------------------------------------------------------- | -------: |
| Live event state machine           | pre_event→doors_open→showtime→post_show→strike→reconciliation |      ~15 |
| ROS cue state machine              | pending→standby→go→complete/hold                              |      ~12 |
| Readiness gate state machine       | blocked→in_progress→ready/waived                              |      ~10 |
| FOH zone validation                | Create, capacity, occupancy                                   |       ~6 |
| Environmental reading validation   | Create, thresholds                                            |       ~6 |
| VIP guest validation               | Create, tier, zone access                                     |       ~6 |
| Guest incident validation          | Create, severity                                              |       ~6 |
| Strike sequence validation         | Create, order, dependencies                                   |       ~6 |
| Department status validation       | Create, readiness level                                       |       ~6 |
| Live financial snapshot validation | Revenue, expenses                                             |       ~4 |
| Config integrity                   | All live-ops statuses, department types                       |      ~10 |
| E2E scenarios                      | Setup→doors→show→cue execution→strike→reconciliation          |      ~15 |
| **Subtotal**                       |                                                               | **~102** |

### WS-10: Integrations & Sync (`integrations-sync-lifecycle.test.ts`)

| Phase                           | What                                |   Tests |
| ------------------------------- | ----------------------------------- | ------: |
| Provider connection validation  | Create, OAuth fields, status        |      ~8 |
| Webhook subscription validation | Create, URL, secret, events         |      ~8 |
| Webhook delivery validation     | Payload, signature, retry           |      ~6 |
| Sync event validation           | Create, direction, status           |      ~6 |
| Conflict policy validation      | Create, per-field rules             |      ~6 |
| API key validation              | Create, scopes, expiry              |      ~6 |
| Dead letter validation          | Create, retry count                 |      ~4 |
| Integration catalog integrity   | All 23+ provider types              |      ~8 |
| Config integrity                | Sync statuses, provider types       |      ~6 |
| E2E scenarios                   | Connect→sync→webhook→conflict→retry |     ~10 |
| **Subtotal**                    |                                     | **~68** |

### WS-11: Creative & Brand (`creative-brand-lifecycle.test.ts`)

| Phase                      | What                                            |   Tests |
| -------------------------- | ----------------------------------------------- | ------: |
| Campaign validation        | Create/update, status, dates                    |      ~8 |
| Campaign state machine     | draft→planned→active→paused→completed/cancelled |     ~12 |
| Brief validation           | Create, deliverables                            |      ~6 |
| Creative review validation | Create, feedback, approval                      |      ~6 |
| Digital asset validation   | Create, metadata, versions                      |      ~6 |
| Brand guideline validation | Create, sections                                |      ~6 |
| Brand kit validation       | Create, logo/color/font                         |      ~6 |
| Deck validation            | Create, slides                                  |      ~4 |
| Survey template validation | Create, questions                               |      ~6 |
| Case study validation      | Create, metrics                                 |      ~6 |
| Config integrity           | Campaign statuses, brief types                  |      ~8 |
| E2E scenarios              | Brief→review→approve→publish→campaign→measure   |     ~10 |
| **Subtotal**               |                                                 | **~84** |

### WS-12: Legal & Compliance (`legal-compliance-lifecycle.test.ts`)

| Phase                           | What                                                           |    Tests |
| ------------------------------- | -------------------------------------------------------------- | -------: |
| Contract validation             | Create/update, type, dates                                     |      ~10 |
| Contract state machine          | draft→negotiation→pending_signature→active→expired/terminated  |      ~15 |
| Permit validation               | Create, jurisdiction                                           |       ~6 |
| Permit state machine            | draft→submitted→under_review→approved/rejected/expired/revoked |      ~12 |
| Insurance policy validation     | Create, coverage, limits                                       |       ~8 |
| IP rights validation            | Create, grant type, territory                                  |       ~6 |
| Incident validation             | Create, severity, resolution                                   |       ~8 |
| Incident state machine          | reported→investigating→contained→resolved/escalated            |      ~12 |
| Compliance checklist validation | Create, items                                                  |       ~6 |
| Engineering approval validation | Create, PE stamp                                               |       ~6 |
| Change order state machine      | draft→submitted→approved/rejected                              |       ~8 |
| Clause library validation       | Create, jurisdiction                                           |       ~4 |
| Config integrity                | Contract types, incident severities                            |       ~8 |
| E2E scenarios                   | Contract→insurance→permit→incident→resolution                  |      ~10 |
| **Subtotal**                    |                                                                | **~119** |

### WS-13: Auth & Identity (`auth-identity-lifecycle.test.ts`)

| Phase                         | What                                      |   Tests |
| ----------------------------- | ----------------------------------------- | ------: |
| Login validation              | Email, password rules                     |      ~8 |
| Signup validation             | Email, password strength, username        |     ~10 |
| Organization validation       | Create, slug, currency                    |      ~8 |
| Invitation validation         | Create, roles, email format               |     ~10 |
| Password reset validation     | Email format                              |      ~4 |
| MFA validation                | TOTP code format                          |      ~6 |
| Profile update validation     | Display name, avatar                      |      ~6 |
| Ownership transfer validation | Confirmation text                         |      ~6 |
| Onboarding step validation    | Step completion                           |      ~6 |
| Auth string i18n integrity    | All keys present, no missing              |      ~8 |
| Config integrity              | 6-tier RBAC roles, permission levels      |     ~10 |
| E2E scenarios                 | Signup→onboard→invite→accept→MFA→settings |     ~12 |
| **Subtotal**                  |                                           | **~94** |

### WS-14: Settings & RBAC (`settings-rbac-lifecycle.test.ts`)

| Phase                       | What                                                     |    Tests |
| --------------------------- | -------------------------------------------------------- | -------: |
| RBAC permission matrix      | All 6 roles × all resources × all actions                |      ~30 |
| Role hierarchy validation   | exec > director > pm > member > client > collaborator    |      ~10 |
| Field visibility masks      | Financial, PII, operational per role                     |      ~12 |
| Permission guard logic      | Default level, fallbacks, gate components                |       ~8 |
| Feature flag validation     | Create, targeting rules                                  |       ~6 |
| Setting validation          | Create, scope, value types                               |       ~6 |
| Tier entitlement validation | All 6 tiers, all module flags                            |      ~12 |
| Kill switch validation      | 48hr external access revocation                          |       ~4 |
| Nav filtering               | Each role sees correct items                             |      ~12 |
| Config integrity            | PERMISSION_MATRIX completeness                           |      ~10 |
| E2E scenarios               | Role assignment→permission check→field mask→feature gate |      ~10 |
| **Subtotal**                |                                                          | **~120** |

### WS-15: Advancing & Catalog (`advancing-lifecycle.test.ts` — DONE ✅)

| Phase        | What                                          |   Tests |
| ------------ | --------------------------------------------- | ------: |
| All phases   | Validation, state machines, config, scenarios | **119** |
| **Subtotal** |                                               | **119** |

### WS-16: Credentialing & Ticketing (`credentialing-ticketing-lifecycle.test.ts`)

| Phase                               | What                                          |   Tests |
| ----------------------------------- | --------------------------------------------- | ------: |
| Credential type validation          | Create, category enum                         |      ~6 |
| Credential pool validation          | Create, capacity, allocation                  |      ~8 |
| Credential assignment validation    | Create, status transitions                    |     ~10 |
| Credential assignment state machine | unassigned→assigned→activated→revoked/expired |     ~10 |
| Scan event validation               | Create, direction, timestamp                  |      ~6 |
| Bulk import validation              | CSV format, field mapping                     |      ~6 |
| Export template validation          | Create, format, fields                        |      ~6 |
| Gate scan validation                | Scan→validate→admit/deny                      |      ~8 |
| Config integrity                    | Credential categories, assignment statuses    |      ~8 |
| E2E scenarios                       | Create type→allocate pool→assign→scan→revoke  |     ~10 |
| **Subtotal**                        |                                               | **~78** |

---

## Summary

| #   | Workstream                 | File                                        | Est. Tests |
| --- | -------------------------- | ------------------------------------------- | ---------: |
| 01  | Business & CRM             | `business-crm-lifecycle.test.ts`            |       ~133 |
| 02  | Production & Projects      | `production-projects-lifecycle.test.ts`     |       ~125 |
| 03  | Approvals & Workflows      | `approvals-workflows-lifecycle.test.ts`     |        ~72 |
| 04  | Finance & Billing          | `finance-billing-lifecycle.test.ts`         |       ~151 |
| 05  | Workforce & Crew           | `workforce-crew-lifecycle.test.ts`          |        ~94 |
| 06  | Vendors & Procurement      | `vendors-procurement-lifecycle.test.ts`     |        ~86 |
| 07  | Assets & Logistics         | `assets-logistics-lifecycle.test.ts`        |       ~108 |
| 08  | Messaging & Communications | `messaging-comms-lifecycle.test.ts`         |        ~68 |
| 09  | Live Operations            | `live-ops-lifecycle.test.ts`                |       ~102 |
| 10  | Integrations & Sync        | `integrations-sync-lifecycle.test.ts`       |        ~68 |
| 11  | Creative & Brand           | `creative-brand-lifecycle.test.ts`          |        ~84 |
| 12  | Legal & Compliance         | `legal-compliance-lifecycle.test.ts`        |       ~119 |
| 13  | Auth & Identity            | `auth-identity-lifecycle.test.ts`           |        ~94 |
| 14  | Settings & RBAC            | `settings-rbac-lifecycle.test.ts`           |       ~120 |
| 15  | Advancing & Catalog        | `advancing-lifecycle.test.ts` ✅            |        119 |
| 16  | Credentialing & Ticketing  | `credentialing-ticketing-lifecycle.test.ts` |        ~78 |
|     | **TOTAL**                  | **16 files**                                | **~1,621** |

---

## Execution Order (Priority)

### Sprint 1 — Core Business (Weeks 1–2)

1. ✅ WS-15: Advancing & Catalog (DONE — 119 tests)
2. WS-02: Production & Projects (~125 tests)
3. WS-01: Business & CRM (~133 tests)
4. WS-04: Finance & Billing (~151 tests)

### Sprint 2 — Operations (Weeks 3–4)

5. WS-03: Approvals & Workflows (~72 tests)
6. WS-12: Legal & Compliance (~119 tests)
7. WS-05: Workforce & Crew (~94 tests)
8. WS-06: Vendors & Procurement (~86 tests)

### Sprint 3 — Infrastructure (Weeks 5–6)

9. WS-13: Auth & Identity (~94 tests)
10. WS-14: Settings & RBAC (~120 tests)
11. WS-07: Assets & Logistics (~108 tests)
12. WS-09: Live Operations (~102 tests)

### Sprint 4 — Support & Extensions (Weeks 7–8)

13. WS-08: Messaging & Communications (~68 tests)
14. WS-10: Integrations & Sync (~68 tests)
15. WS-11: Creative & Brand (~84 tests)
16. WS-16: Credentialing & Ticketing (~78 tests)

---

## Test Infrastructure Requirements

### Already In Place

- **Vitest** with jsdom environment, `@testing-library/jest-dom`
- **Path aliases** (`@/` → `src/`)
- **Existing patterns** in 19 test files (validation, RBAC, state machine, navigation tests)

### Per-Test-File Pattern

```typescript
import { describe, expect, it } from "vitest";
// 1. Import validation schemas from @/lib/validation/*
// 2. Import state machines from @/lib/state-machines/*
// 3. Import SSOT config maps from @/config/*
// 4. Import types from @/types

// Helpers: valid payload factories, UUID constants

describe("Phase N: <Category>", () => {
  // Validation boundary tests
  // State machine transition tests (valid + invalid)
  // Config integrity assertions
  // Multi-step lifecycle scenarios
});
```

### Naming Convention

- File: `src/__tests__/lib/<workstream>-lifecycle.test.ts`
- Describe blocks: `Phase N: <Category>`
- Scenario blocks: `Scenario A/B/C: <Description>`
- Individual tests: imperative sentence (e.g., "rejects negative quantity")

### Quality Gate Integration

Each test file maps to a quality criterion in `quality-gate.config.ts`:

- `automated.test.<workstream>`: passes when all tests in the file pass
- CI pipeline runs all test files in parallel
- Merge blocked if any test fails

---

## Dependencies Between Workstreams

```
WS-13 Auth ──────┐
WS-14 RBAC ──────┤
                  ├──→ WS-01 CRM ──→ WS-04 Finance
                  ├──→ WS-02 Production ──→ WS-15 Advancing ✅
                  ├──→ WS-05 Workforce ──→ WS-06 Vendors
                  ├──→ WS-03 Approvals
                  ├──→ WS-07 Assets ──→ WS-09 Live Ops
                  ├──→ WS-08 Messaging
                  ├──→ WS-10 Integrations
                  ├──→ WS-11 Creative
                  ├──→ WS-12 Legal
                  └──→ WS-16 Credentialing
```

Auth + RBAC are foundational. All other workstreams depend on them for permission checks but can be tested independently at the validation/state-machine layer.

---

## Metrics & Acceptance Criteria

- **Minimum 1,500 tests** across 16 files
- **100% state machine coverage**: every declared transition tested (valid + invalid)
- **100% validation schema coverage**: every field, every enum value, every boundary
- **100% config map completeness**: every enum has a map entry, no orphan values
- **Zero test failures** at merge time
- **< 30s total test runtime** (vitest parallel execution)
