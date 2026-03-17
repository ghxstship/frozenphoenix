# Integrations & Automations Audit

> **Scope:** Native Integrations, Open API & Webhooks, Workflows & Automations
> **Date:** 2025-07-21
> **Status:** Full-stack codebase audit — DB → Edge Functions → API Routes → Hooks → UI

---

## Table of Contents

1. [Native Integrations](#1-native-integrations)
2. [Open API & Webhooks](#2-open-api--webhooks)
3. [Workflows & Automations](#3-workflows--automations)
4. [End-to-End Lifecycle Needs](#4-end-to-end-lifecycle-needs)
5. [Implementation Gap Matrix](#5-implementation-gap-matrix)
6. [Remediation Plan](#6-remediation-plan)
7. [Recommended SaaS Integration Apps](#7-recommended-saas-integration-apps)

---

## 1. Native Integrations

### 1.1 Current Implementation

FrozenPhoenix has **two integration systems** that exist in parallel:

#### A. Generic `integrations` Table (Migration 002)

- **File:** `supabase/migrations/002_extended_schema.sql:149-159`
- **Schema:** `integrations` — stores named connections with a `type` enum, `config` JSONB, and `status`
- **Supported types:** `quickbooks`, `xero`, `slack`, `google_calendar`, `dropbox`, `google_drive`, `zapier`
- **RLS:** Org-scoped read for members, manage for admins
- **UI:** No dedicated page consumes this table (the `/integrations` page uses `provider_connections` instead)
- **Hooks:** No dedicated hooks exist for the `integrations` table
- **Status:** **Schema-only, orphaned** — no UI, hooks, or API routes wire to it

#### B. `provider_connections` System (Migration 055)

- **File:** `supabase/migrations/055_external_sync_infrastructure.sql:16-39`
- **Schema:** `provider_connections` — stores provider credentials, webhook secrets, sync direction, rate limits, error tracking
- **Supported types:** `eventbrite`, `square`, `front_gate`, `intellitix`, `custom`
- **Supporting tables:** `provider_ticket_map`, `pos_transactions`, `pos_transaction_items`, `webhook_events`, `sync_events`, `sync_conflict_policies`
- **RLS:** Full org-scoped policies on all tables
- **UI:** `/integrations` page (`src/app/(dashboard)/integrations/page.tsx`) — uses `useProviderConnections` hook, has `CreateEntityDialog` for new connections
- **Hooks:** Full CRUD in `src/lib/supabase/hooks-external-sync.ts` — `useProviderConnections`, `useProviderConnection`, `useCreateProviderConnection`, `useUpdateProviderConnection`, `useDeleteProviderConnection`
- **Edge Functions:** `webhook-eventbrite`, `webhook-square`, `sync-outbound`, `webhook-replay`, `sync-pos-aggregate`
- **RBAC:** `provider_connections` (read/write/manage), `webhook_events` (read), `sync_events` (read), `sync_policies` (read/write/manage)
- **Navigation:** Admin > Integrations (with Sync Log child), gated by `provider_connections.read`
- **Status:** **Production-grade for event/POS providers** — fully wired DB→Edge Functions→hooks→UI

#### C. Domain Config

- **File:** `src/config/domain-config.ts:1801-1806`
- **`INTEGRATION_TYPE_MAP`** covers: `quickbooks`, `xero`, `slack`, `google_calendar`, `dropbox`, `google_drive`, `zapier`
- **Create config** (`src/config/create-entity-configs.ts:1846-1867`) — uses `INTEGRATION_TYPE_MAP` options but inserts into the orphaned `integrations` table, not `provider_connections`
- **Status:** **Misalignment** — the create form's select options don't match the provider types that have actual backend support

### 1.2 Layer Completeness

| Layer              | `integrations` (002) | `provider_connections` (055) |
| ------------------ | -------------------- | ---------------------------- |
| DB Schema          | ✅                   | ✅                           |
| RLS                | ✅                   | ✅                           |
| API Routes         | ❌                   | ✅ (via generic CRUD)        |
| Hooks              | ❌                   | ✅ Full CRUD                 |
| Edge Functions     | ❌                   | ✅ (5 functions)             |
| UI Page            | ❌                   | ✅ `/integrations`           |
| Create Dialog      | ⚠️ (wrong table)     | ✅                           |
| Detail/Edit View   | ❌                   | ❌                           |
| Sync Log UI        | —                    | ✅ `/integrations/sync-log`  |
| Conflict Policy UI | —                    | ❌                           |
| Provider Adapters  | —                    | ✅ Eventbrite, Square        |
| OAuth Flows        | ❌                   | ❌                           |

---

## 2. Open API & Webhooks

### 2.1 Current Implementation

#### A. Inbound Webhooks (Provider → FrozenPhoenix)

**Fully implemented pipeline:**

1. **Receive:** Edge Functions (`webhook-eventbrite`, `webhook-square`) accept POST requests
2. **Validate:** HMAC signature validation via provider-specific adapters (`_shared/provider-adapters/`)
3. **Deduplicate:** `computePayloadHash` + `isDuplicate` check against `webhook_events.payload_hash`
4. **Log:** `logWebhookEvent` inserts into `webhook_events` with status tracking
5. **Normalize:** Provider adapters transform payloads to internal schema
6. **Process:** Upsert into domain tables (`credential_assignments`, `pos_transactions`)
7. **Sync Audit:** `sync_events` table tracks direction, status, records processed/failed
8. **Error Handling:** Atomic `increment_connection_error_count` RPC (migration 087), auto-disables connections at 10 errors
9. **Replay:** `webhook-replay` Edge Function allows admin re-dispatch of failed events

**Key files:**

- `supabase/functions/webhook-eventbrite/index.ts` — Eventbrite ticket sync (203 lines)
- `supabase/functions/webhook-square/index.ts` — Square POS transaction sync (200 lines)
- `supabase/functions/webhook-replay/index.ts` — Admin replay of failed webhooks (204 lines)
- `supabase/functions/_shared/webhook-utils.ts` — Shared utilities
- `supabase/functions/_shared/sync-utils.ts` — Sync lifecycle, conflict resolution, batch processing (275 lines)

**Hooks:**

- `useWebhookEvents(connectionId?)` — paginated webhook event log
- `useSyncEvents(filters?)` — sync audit log with provider join

#### B. Outbound Sync (FrozenPhoenix → Provider)

- **File:** `supabase/functions/sync-outbound/index.ts`
- **Status:** **Scaffolded but placeholder** — the `pushToProvider()` function logs intent but makes no actual HTTP calls to provider APIs
- Has correct structure: verify connection → create sync event → iterate entities → finalize
- Comments indicate next steps: Eventbrite PATCH for check-in, Square POST for orders

#### C. Public Open API

- **OpenAPI spec:** `src/types/openapi.json` exists
- **Custom routes:** `src/lib/openapi/custom-routes.ts` references automation execution
- **Generic CRUD routes:** ~57 API route directories under `src/app/api/`
- **Auth:** `withApiHandler` wrapper with RBAC enforcement (`src/lib/api/with-api-handler.ts`)
- **Status:** Internal API routes exist for all entities; **no dedicated public API gateway, API key management, rate limiting, or developer portal**

### 2.2 Layer Completeness

| Layer                                | Inbound Webhooks                             | Outbound Sync  | Public API |
| ------------------------------------ | -------------------------------------------- | -------------- | ---------- |
| Edge Functions                       | ✅ (2 providers)                             | ⚠️ Placeholder | —          |
| Signature Validation                 | ✅                                           | —              | —          |
| Deduplication                        | ✅                                           | —              | —          |
| Audit Logging                        | ✅ (`webhook_events` + `sync_events`)        | ✅ (logs only) | ❌         |
| Error Recovery                       | ✅ (replay + auto-disable)                   | ❌             | —          |
| Conflict Resolution                  | ✅ (policy engine)                           | —              | —          |
| Rate Limiting                        | ⚠️ (`rate_limit_config` in DB, not enforced) | ❌             | ❌         |
| API Key Management                   | —                                            | —              | ❌         |
| Developer Portal                     | —                                            | —              | ❌         |
| Webhook Delivery (outbound webhooks) | —                                            | —              | ❌         |

---

## 3. Workflows & Automations

### 3.1 Approval Workflows

**Status: Production-grade — full server-side engine with API routes**

#### DB Schema (Migration 006)

- `approval_workflows` — templates with entity_type, escalation hours, delegation, versioning
- `approval_steps` — ordered steps with `step_type` enum (single/all/any/sequential), approver lists, conditions, escalation config
- `workflow_instances` — runtime instances tracking entity, current step, status (pending/in_progress/completed/cancelled/escalated)
- `workflow_step_approvals` — individual decisions per step per approver, delegation chain

#### Server Engine

- **File:** `src/lib/approval-engine.ts` (665 lines)
- **Functions:** `initiateWorkflow`, `recordDecision`, `escalateStep`, `cancelWorkflow`, `getInstanceStatus`
- **Step completion logic:** Correctly handles all 4 step types (single, any, all, sequential)
- **Delegation:** Full chain support (original marked delegated, new approval created for delegate)
- **Rejection handling:** Configurable `on_reject_action` per step — can halt or continue
- **Escalation:** Marks pending approvals as escalated, assigns to escalation target user/role

#### API Routes

- `POST /api/approval-engine/initiate` — create new instance
- `POST /api/approval-engine/decide` — record approve/reject/delegate
- `POST /api/approval-engine/escalate` — escalate step
- `POST /api/approval-engine/cancel` — cancel instance
- `GET /api/approval-engine/status/[instanceId]` — full status with steps/approvals

#### UI

- `/approval-workflows` — `ListPageShell` with `APPROVAL_WORKFLOWS_PAGE` config
- `/workflows` — separate `ListPageShell` with `WORKFLOWS_PAGE` config
- **Navigation:** Operations > Approvals > Workflows (`approvals.manage`), Operations > Workflows (`automations.read`)
- **Status:** List pages exist; **no detail view, visual step designer, or instance tracking UI**

### 3.2 Trigger-Action Automations

**Status: Engine implemented, UI exists, but no automatic trigger dispatch**

#### DB Schema (Migration 005 + 034)

- `automations` — definitions with entity_type, project scope, active/inactive, execution stats
- `automation_rules` — trigger/condition/action definitions with JSONB configs
- `automation_logs` — legacy execution log
- `automation_executions` — enhanced execution log with timing and action results
- **Trigger types:** `created`, `updated`, `status_changed`, `assigned`, `due_date_approaching`, `overdue`, `field_changed`, `time_logged`, `budget_threshold`, `scheduled`
- **Action types:** `send_notification`, `send_email`, `update_field`, `create_task`, `assign_user`, `move_stage`, `add_comment`, `webhook`, `slack_message`

#### Execution Engine

- **File:** `src/app/api/automations/execute/route.ts` (281 lines)
- **Capabilities:**
  - Fetches active automations matching `trigger_type` + `entity_type` + `organization_id`
  - Evaluates conditions (equals, not_equals, contains, greater_than, less_than, is_empty, is_not_empty)
  - Executes actions: `send_notification` (inserts into notifications), `update_field`, `create_task`, `assign_user`, `move_stage`
  - Creates `automation_executions` records with timing and results
  - Updates automation stats (`trigger_count`, `error_count`, `last_triggered_at`)
- **RBAC:** Protected by `automations.manage` permission
- **Missing:** `send_email` action is a no-op stub; `webhook` and `slack_message` actions not implemented

#### Trigger Dispatch

- **Status:** **CRITICAL GAP** — the execution engine exists at `POST /api/automations/execute`, but **nothing calls it automatically**
- No database triggers (pg_notify) fire on record creation/update
- No Supabase Realtime subscription dispatches automation checks
- No cron job handles `scheduled` or `due_date_approaching`/`overdue` triggers
- The engine is **request-only** — it works when manually invoked but has zero automatic activation

#### UI

- **File:** `src/app/(dashboard)/automations/page.tsx` (547 lines)
- **Features:** Builder tab (list of automations with trigger→action flow visualization), Logs tab (execution history)
- **Hooks:** `useAutomations` (list), `useCreateAutomation` (create), `useAutomationLogs` (read-only)
- **Explicit UI warning:** "Execution logs shown below are placeholder data. Live log streaming will be available once the automation engine is wired."
- `/automation-rules` — `ListPageShell` for individual rules
- `/automation-executions` — `ListPageShell` for execution history
- **Status:** Rich UI exists but cannot actually create/edit rules through a visual builder — **no rule detail/edit form**

### 3.3 Messaging Escalation Engine

- **File:** `supabase/functions/escalation-engine/index.ts` (201 lines)
- **Scope:** Cron-scheduled escalation of unacknowledged mandatory reads and unread critical messages
- **Actions:** DM reminders, manager notifications
- **Status:** Fully implemented edge function — operates independently from the automation engine

### 3.4 Layer Completeness

| Layer                      | Approval Workflows  | Automations            |
| -------------------------- | ------------------- | ---------------------- |
| DB Schema                  | ✅ 4 tables + enums | ✅ 4 tables + enums    |
| RLS                        | ✅                  | ✅                     |
| Server Engine              | ✅ (665 lines)      | ✅ (281 lines)         |
| API Routes                 | ✅ (5 routes)       | ✅ (execute route)     |
| Hooks                      | ✅ (list/create)    | ✅ (list/create/logs)  |
| UI — List                  | ✅                  | ✅ (rich builder page) |
| UI — Detail/Edit           | ❌                  | ❌                     |
| UI — Visual Designer       | ❌                  | ❌                     |
| UI — Instance Tracker      | ❌                  | ❌                     |
| Automatic Trigger Dispatch | — (API-initiated)   | ❌ **CRITICAL**        |
| Scheduled Execution        | ❌                  | ❌                     |
| Notification on Step       | ❌                  | ❌ (stub)              |
| Email Actions              | —                   | ❌ (stub)              |
| Webhook/Slack Actions      | —                   | ❌                     |
| Audit Trail                | ✅                  | ✅                     |

---

## 4. End-to-End Lifecycle Needs

### 4.1 Native Integration Lifecycle

| Stage              | Need                                             | Status                                |
| ------------------ | ------------------------------------------------ | ------------------------------------- |
| **Discovery**      | Marketplace/catalog of available integrations    | ❌                                    |
| **Setup**          | OAuth flow or API key entry with validation      | ❌ OAuth, ⚠️ key entry exists         |
| **Configuration**  | Field mapping, sync direction, conflict policies | ⚠️ DB schema exists, no UI            |
| **Testing**        | Test connection / send test webhook              | ❌                                    |
| **Activation**     | Enable/disable with confirmation                 | ✅ (`is_active` toggle)               |
| **Monitoring**     | Sync log, error rates, health dashboard          | ⚠️ Sync log page exists, no dashboard |
| **Error Recovery** | Webhook replay, manual resync, error alerts      | ✅ Replay, ❌ alerts                  |
| **Deactivation**   | Graceful disconnect, credential cleanup          | ⚠️ Delete exists, no graceful flow    |

### 4.2 Open API & Webhook Lifecycle

| Stage                    | Need                                           | Status                          |
| ------------------------ | ---------------------------------------------- | ------------------------------- |
| **API Key Provisioning** | Generate/rotate API keys per tenant            | ❌                              |
| **Documentation**        | OpenAPI spec + developer portal                | ⚠️ Spec exists, no portal       |
| **Webhook Registration** | Subscribe to events, specify URL + secret      | ❌ (outbound)                   |
| **Webhook Delivery**     | Deliver events to subscriber URLs with retries | ❌                              |
| **Rate Limiting**        | Per-tenant, per-endpoint throttling            | ❌ (config in DB, not enforced) |
| **Versioning**           | API version management                         | ❌                              |
| **Audit**                | Request/response logging, usage analytics      | ⚠️ Partial (webhook_events)     |

### 4.3 Workflow & Automation Lifecycle

| Stage              | Need                                             | Status                                        |
| ------------------ | ------------------------------------------------ | --------------------------------------------- |
| **Design**         | Visual builder for rules and approval chains     | ❌                                            |
| **Configuration**  | Trigger/condition/action selection with previews | ⚠️ DB schema, no UI builder                   |
| **Testing**        | Dry-run / simulation mode                        | ❌                                            |
| **Activation**     | Enable with version control                      | ⚠️ Status field, no versioning on automations |
| **Execution**      | Automatic trigger dispatch on data changes       | ❌ **CRITICAL**                               |
| **Monitoring**     | Execution dashboard, success rates, latency      | ⚠️ Logs tab exists with mock data             |
| **Error Handling** | Retry policies, dead-letter queue, alerting      | ❌                                            |
| **Auditing**       | Complete execution trace with before/after state | ⚠️ Execution records, no state snapshots      |

---

## 5. Implementation Gap Matrix

### 5.1 Critical Gaps (P0)

| #   | Gap                                          | Impact                                                         | Affected Area |
| --- | -------------------------------------------- | -------------------------------------------------------------- | ------------- |
| G1  | **No automatic automation trigger dispatch** | Automations never fire automatically — entire feature is inert | Automations   |
| G2  | **Outbound sync is a no-op placeholder**     | Cannot push data changes back to providers                     | Integrations  |
| G3  | **No outbound webhook delivery system**      | Cannot notify external systems of internal events              | Open API      |
| G4  | **`send_email` action is a stub**            | Email-based automation actions don't work                      | Automations   |

### 5.2 High Gaps (P1)

| #   | Gap                                                       | Impact                                                                  | Affected Area           |
| --- | --------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------- |
| G5  | **No OAuth flows for integrations**                       | Cannot connect to QuickBooks, Xero, Slack, Google Calendar              | Integrations            |
| G6  | **No visual automation/workflow builder**                 | Users cannot create or edit rules without DB access                     | Automations + Workflows |
| G7  | **No scheduled automation execution**                     | `due_date_approaching`, `overdue`, `scheduled` triggers never fire      | Automations             |
| G8  | **Two orphaned integration systems**                      | `integrations` table (002) is unused; create dialog targets wrong table | Integrations            |
| G9  | **No API key management**                                 | Cannot provision keys for external API consumers                        | Open API                |
| G10 | **`webhook` and `slack_message` actions not implemented** | Two declared action types are non-functional                            | Automations             |
| G11 | **No approval workflow notification dispatch**            | Approvers are not notified when assigned to a step                      | Workflows               |

### 5.3 Medium Gaps (P2)

| #   | Gap                                            | Impact                                                          | Affected Area |
| --- | ---------------------------------------------- | --------------------------------------------------------------- | ------------- |
| G12 | **No integration detail/edit view**            | Cannot view connection health or edit settings after creation   | Integrations  |
| G13 | **No conflict policy management UI**           | Sync conflict policies can only be set via DB                   | Integrations  |
| G14 | **No workflow instance tracking UI**           | Cannot view active approval instances or their progress         | Workflows     |
| G15 | **Rate limiting not enforced**                 | `rate_limit_config` stored in DB but not read by edge functions | Webhooks      |
| G16 | **No integration health dashboard**            | No aggregate view of sync health, error rates, throughput       | Integrations  |
| G17 | **No developer portal / API documentation UI** | OpenAPI spec exists but is not exposed as a browsable portal    | Open API      |
| G18 | **No automation dry-run / test mode**          | Cannot validate rules before activation                         | Automations   |

### 5.4 Low Gaps (P3)

| #   | Gap                                             | Impact                                                       | Affected Area |
| --- | ----------------------------------------------- | ------------------------------------------------------------ | ------------- |
| G19 | **No integration marketplace**                  | Users cannot browse and install integrations from a catalog  | Integrations  |
| G20 | **No automation versioning**                    | Approval workflows have `version` column; automations do not | Automations   |
| G21 | **No API versioning**                           | No path-based or header-based API version management         | Open API      |
| G22 | **No dead-letter queue for failed automations** | Failed automations are logged but not retried                | Automations   |

---

## 6. Remediation Plan

### Phase 1: Automation Engine Activation (Critical — Weeks 1-2)

**Goal:** Make the automation system actually fire automatically.

| Task                                                                                  | Gap | Effort | Files                          |
| ------------------------------------------------------------------------------------- | --- | ------ | ------------------------------ |
| Implement DB trigger → pg_notify on entity CRUD                                       | G1  | 2d     | New migration                  |
| Create Supabase Realtime listener or DB webhook that calls `/api/automations/execute` | G1  | 2d     | New edge function or API route |
| Implement cron-based scheduled trigger scanner                                        | G7  | 1d     | New edge function              |
| Implement `send_email` action using existing `src/lib/email/send.ts`                  | G4  | 0.5d   | `automations/execute/route.ts` |
| Add approval step notification dispatch                                               | G11 | 1d     | `approval-engine.ts`           |
| Wire `webhook` action (outbound HTTP POST)                                            | G10 | 0.5d   | `automations/execute/route.ts` |
| Wire `slack_message` action (Slack Incoming Webhook)                                  | G10 | 0.5d   | `automations/execute/route.ts` |

### Phase 2: Integration System Consolidation (High — Weeks 3-4)

**Goal:** Unify the two integration systems and add OAuth.

| Task                                                                                                                          | Gap | Effort | Files                                           |
| ----------------------------------------------------------------------------------------------------------------------------- | --- | ------ | ----------------------------------------------- |
| Deprecate `integrations` table (002); migrate domain config to use `provider_connections` types                               | G8  | 1d     | Migration, domain-config, create-entity-configs |
| Add new provider types to `provider_connections` CHECK constraint: `quickbooks`, `xero`, `slack`, `google_calendar`, `zapier` | G8  | 0.5d   | New migration                                   |
| Implement OAuth 2.0 flow for QuickBooks/Xero                                                                                  | G5  | 3d     | New API routes + edge functions                 |
| Implement OAuth for Slack + Google Calendar                                                                                   | G5  | 2d     | New API routes                                  |
| Implement outbound sync `pushToProvider()` for Eventbrite + Square                                                            | G2  | 2d     | `sync-outbound/index.ts`                        |
| Build integration detail/edit page with connection health                                                                     | G12 | 2d     | New page                                        |
| Build conflict policy management UI                                                                                           | G13 | 1d     | New page                                        |

### Phase 3: Visual Builders & Tracking UI (High — Weeks 5-7)

**Goal:** Enable non-technical users to design and monitor workflows.

| Task                                                                  | Gap | Effort | Files                          |
| --------------------------------------------------------------------- | --- | ------ | ------------------------------ |
| Build visual automation rule builder (trigger → conditions → actions) | G6  | 5d     | New component + page           |
| Build approval workflow step designer                                 | G6  | 3d     | New component + page           |
| Build workflow instance tracker with step progress visualization      | G14 | 2d     | New page                       |
| Build integration health dashboard                                    | G16 | 2d     | New page                       |
| Add automation dry-run mode                                           | G18 | 1d     | `automations/execute/route.ts` |

### Phase 4: Open API Platform (Medium — Weeks 8-10)

**Goal:** Enable external developers to consume the FrozenPhoenix API.

| Task                                                                          | Gap | Effort | Files                          |
| ----------------------------------------------------------------------------- | --- | ------ | ------------------------------ |
| Implement API key provisioning per tenant                                     | G9  | 2d     | New migration + API routes     |
| Implement outbound webhook delivery system (event subscriptions, retry queue) | G3  | 4d     | New migration + edge functions |
| Enforce rate limiting middleware                                              | G15 | 1d     | API middleware                 |
| Build developer portal (hosted OpenAPI spec browser)                          | G17 | 2d     | New page                       |
| Add API versioning (path-based: `/api/v1/`)                                   | G21 | 2d     | Middleware + route restructure |

### Phase 5: Polish (Low — Weeks 11-12)

| Task                                               | Gap | Effort | Files                     |
| -------------------------------------------------- | --- | ------ | ------------------------- |
| Build integration marketplace page                 | G19 | 2d     | New page                  |
| Add automation versioning column + diff viewer     | G20 | 1d     | Migration + UI            |
| Implement dead-letter queue for failed automations | G22 | 1d     | Migration + edge function |

---

## 7. Recommended SaaS Integration Apps

### 7.1 By Category

#### Finance & Accounting

| App                   | Priority       | Rationale                                                              |
| --------------------- | -------------- | ---------------------------------------------------------------------- |
| **QuickBooks Online** | P0             | #1 SMB accounting. Invoice sync, expense tracking, revenue recognition |
| **Xero**              | P1             | Strong in APAC/EU markets. Same scope as QuickBooks                    |
| **Stripe**            | P0             | Payment processing, subscription billing, invoicing                    |
| **Square**            | ✅ Implemented | POS transactions already syncing                                       |

#### Project Management & ERP

| App                  | Priority | Rationale                                             |
| -------------------- | -------- | ----------------------------------------------------- |
| **Asana**            | P1       | Task/project sync for clients using external PM tools |
| **Monday.com**       | P2       | Alternative PM platform — bidirectional task sync     |
| **Jira**             | P2       | Engineering teams using Jira for issue tracking       |
| **SAP Business One** | P3       | Enterprise ERP for large-scale production companies   |
| **NetSuite**         | P3       | Mid-market ERP — financials, inventory, CRM           |

#### Communications & Collaboration

| App                   | Priority | Rationale                                                            |
| --------------------- | -------- | -------------------------------------------------------------------- |
| **Slack**             | P0       | Channel notifications, approval alerts, status updates, bot commands |
| **Microsoft Teams**   | P1       | Enterprise alternative to Slack — same scope                         |
| **Google Workspace**  | P0       | Calendar sync, Drive for documents, Gmail for email threading        |
| **Twilio / SendGrid** | P0       | SMS + email delivery for notifications and automations               |

#### Ticketing & Event Management

| App                    | Priority       | Rationale                                   |
| ---------------------- | -------------- | ------------------------------------------- |
| **Eventbrite**         | ✅ Implemented | Ticket sync already operational             |
| **Front Gate Tickets** | P1             | Schema supports it; needs provider adapter  |
| **Intellitix**         | P1             | RFID/NFC credentialing — schema supports it |
| **Ticketmaster**       | P2             | Large venue/event ticketing                 |

#### CRM & Sales

| App            | Priority | Rationale                                                  |
| -------------- | -------- | ---------------------------------------------------------- |
| **HubSpot**    | P1       | CRM sync — deals, contacts, companies. Free tier available |
| **Salesforce** | P2       | Enterprise CRM. Complex but high-value for large orgs      |

#### HR & Workforce

| App          | Priority | Rationale                                                     |
| ------------ | -------- | ------------------------------------------------------------- |
| **Gusto**    | P1       | Payroll, benefits, time tracking for US-based crews           |
| **BambooHR** | P2       | HR management, onboarding, PTO tracking                       |
| **Deputy**   | P1       | Shift scheduling, time & attendance — event industry standard |

#### Document & Storage

| App              | Priority | Rationale                                              |
| ---------------- | -------- | ------------------------------------------------------ |
| **Google Drive** | P0       | Document storage, sharing, collaborative editing       |
| **Dropbox**      | P2       | File sync for creative assets and production documents |
| **DocuSign**     | P1       | E-signatures for contracts, vendor agreements, waivers |

#### Integration Platforms (iPaaS)

| App                   | Priority | Rationale                                                                     |
| --------------------- | -------- | ----------------------------------------------------------------------------- |
| **Zapier**            | P1       | 6,000+ app connections. Ideal for long-tail integrations users can self-serve |
| **Make (Integromat)** | P2       | More powerful workflow builder than Zapier. Visual automation                 |
| **n8n**               | P2       | Self-hosted alternative. Good for data-sensitive orgs                         |

### 7.2 Recommended Priority Tiers

**Tier 1 (Immediate — implement native):** Stripe, Slack, Google Workspace, Twilio/SendGrid, QuickBooks Online

**Tier 2 (Next quarter — implement native or via Zapier):** Xero, HubSpot, DocuSign, Deputy, Front Gate, Intellitix, Gusto

**Tier 3 (Via iPaaS — Zapier/Make connector):** Asana, Monday.com, Jira, Salesforce, BambooHR, Microsoft Teams

**Tier 4 (Enterprise roadmap):** SAP Business One, NetSuite, Ticketmaster, n8n (self-hosted option)

### 7.3 Architecture Recommendation

For **Tier 1-2** integrations, build native `provider_connections` adapters following the established pattern:

1. Provider adapter in `supabase/functions/_shared/provider-adapters/`
2. Webhook handler edge function (inbound)
3. Outbound sync implementation in `sync-outbound`
4. OAuth flow API routes

For **Tier 3-4** integrations, expose a **Zapier/Make integration app** by:

1. Publishing key entity CRUD as Zapier triggers + actions
2. Implementing outbound webhooks (Gap G3) as the event delivery mechanism
3. Providing API key management (Gap G9) for authentication

---

## Summary

| Area                    | Maturity                                                           | Critical Gap                                    |
| ----------------------- | ------------------------------------------------------------------ | ----------------------------------------------- |
| **Native Integrations** | 🟡 Partial — strong for Eventbrite/Square, orphaned generic system | Consolidate two systems, add OAuth              |
| **Inbound Webhooks**    | 🟢 Production-grade                                                | Enforce rate limiting                           |
| **Outbound Sync**       | 🔴 Placeholder only                                                | Implement actual provider API calls             |
| **Public Open API**     | 🔴 Internal only                                                   | API keys, rate limiting, developer portal       |
| **Approval Workflows**  | 🟢 Engine complete                                                 | UI for design + tracking, notification dispatch |
| **Automations**         | 🔴 Engine exists but never fires                                   | **Automatic trigger dispatch is P0**            |

**Highest-priority remediation:** Wire automatic trigger dispatch (G1) — this single gap renders the entire automation system non-functional despite having a working execution engine, full UI, and complete database schema.
