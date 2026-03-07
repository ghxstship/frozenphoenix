# Ticketing, Credentialing & POS Integration — Implementation Plan

**Date:** 2025-01-27
**Source:** `docs/TICKETING_POS_INTEGRATION_AUDIT.md`
**Platform:** COMPVSS (FrozenPhoenix) — Next.js 15 + Supabase
**Estimated Duration:** 10 weeks (4 phases)

---

## Table of Contents

1. [Overview & Objectives](#overview--objectives)
2. [Architecture Principles](#architecture-principles)
3. [Phase 1: Schema Foundation (Weeks 1–2)](#phase-1-schema-foundation-weeks-12)
4. [Phase 2: Core Hooks & API Routes (Weeks 3–4)](#phase-2-core-hooks--api-routes-weeks-34)
5. [Phase 3: UI Views & Navigation (Weeks 5–7)](#phase-3-ui-views--navigation-weeks-57)
6. [Phase 4: Edge Functions & Sync Workers (Weeks 8–10)](#phase-4-edge-functions--sync-workers-weeks-810)
7. [Cross-Cutting Concerns](#cross-cutting-concerns)
8. [Testing Strategy](#testing-strategy)
9. [Rollback Strategy](#rollback-strategy)
10. [Dependency Map](#dependency-map)
11. [Risk Register](#risk-register)
12. [Acceptance Criteria](#acceptance-criteria)

---

## Overview & Objectives

This plan implements two workstreams identified in the audit:

- **Workstream A** — Internal ticketing and credentialing inventory management
- **Workstream B** — Two-way synchronization with external ticketing providers and POS systems

### Success Metrics

| Metric | Target |
|--------|--------|
| Credential types definable per org | ≥ 11 categories (artist, vip, crew, media, vendor, GA, production, security, medical, hospitality, sponsor) |
| Assignment lifecycle completeness | 7 states (requested → approved → issued → checked_in → checked_out → revoked → expired) |
| Bulk import throughput | ≥ 1,000 assignments per CSV/XLSX upload |
| Gate scan response time | < 200ms end-to-end (scan → validation → UI feedback) |
| Webhook processing latency | < 5s from receipt to normalized record insertion |
| Sync conflict resolution | 100% deterministic per declared policy |
| Zero breaking changes | 0 ALTER TABLE on existing tables |
| RBAC coverage | All 13 new resources mapped to all 6 tiers |

---

## Architecture Principles

All implementation must comply with:

1. **3NF + SSOT** — No redundant data. Every entity has exactly one authoritative schema.
2. **Org-scoped RLS** — Every new table has `organization_id` + RLS policies using `org_memberships`.
3. **RBAC enforcement** — All new resources added to `src/config/rbac.ts` per the 6-tier matrix in the audit.
4. **Idempotency** — All webhook receivers and sync workers must be idempotent (dedup via `payload_hash`).
5. **Immutable audit trails** — `credential_scan_log`, `webhook_events`, `sync_events` are append-only.
6. **No new top-level nav sections** — All UI pages integrate into existing IA sections (Production, Live Operations, Admin, Finance).
7. **Declarative configuration** — Conflict resolution policies, export templates, and provider mappings are table-driven, not hardcoded.
8. **Event-driven** — All state changes emit events. Sync workers subscribe via `pg_notify` or Supabase Realtime.

---

## Phase 1: Schema Foundation (Weeks 1–2)

**Goal:** All new tables, enums, indexes, RLS policies, and TypeScript types are in place. No application logic yet.

### 1.1 Migration: `041_credentialing_ticketing.sql`

**Complexity:** M | **Depends on:** Nothing

Creates the core credentialing domain:

**Enums:**
- `credential_category` — 11 values: `artist`, `vip`, `crew`, `media`, `vendor`, `general_admission`, `production`, `security`, `medical`, `hospitality`, `sponsor`
- `credential_assignment_status` — 7 values: `requested`, `approved`, `issued`, `checked_in`, `checked_out`, `revoked`, `expired`
- `bulk_job_status` — 6 values: `pending`, `validating`, `processing`, `completed`, `failed`, `cancelled`

**Tables:**

| Table | Purpose | Key FKs |
|-------|---------|---------|
| `credential_types` | Defines credential/pass categories per org | `organizations` |
| `credential_inventory_pools` | Finite inventory per credential type per event | `credential_types`, `events`, `live_event_instances`, `organizations` |
| `credential_assignments` | Assigns credentials to contacts with full lifecycle | `credential_types`, `credential_inventory_pools`, `profiles`, `crew_members`, `vip_guests`, `vendors`, `organizations` |
| `credential_scan_log` | Immutable scan event log (check-in, check-out, verify) | `credential_assignments`, `foh_zones`, `profiles`, `organizations` |

**Indexes (per table):**
- `credential_types`: `(organization_id)`, `(category)`
- `credential_inventory_pools`: `(organization_id, event_id)`, `(credential_type_id)`
- `credential_assignments`: `(organization_id, pool_id)`, `(status)`, `(barcode_value)` UNIQUE, `(rfid_tag)` UNIQUE WHERE NOT NULL
- `credential_scan_log`: `(assignment_id, scanned_at)`, `(zone_id)`

**Triggers:**
- `credential_assignments` INSERT/UPDATE → decrement/increment `credential_inventory_pools.allocated_count`
- `credential_assignments` status change to `checked_in` → insert into `credential_scan_log`

**RLS policies:** Org-scoped SELECT/INSERT/UPDATE on all 4 tables (same pattern as audit Section A.5).

**Validation checklist:**
- [ ] All columns atomic (3NF)
- [ ] No derived/redundant data persisted (except `allocated_count` on pools — justified for performance, maintained by trigger)
- [ ] All FKs use `ON DELETE SET NULL` for cross-domain references, `ON DELETE CASCADE` for `organization_id`
- [ ] `credential_scan_log` has no UPDATE/DELETE policies (immutable)

### 1.2 Migration: `042_bulk_export_infrastructure.sql`

**Complexity:** S | **Depends on:** Nothing

**Tables:**

| Table | Purpose | Key FKs |
|-------|---------|---------|
| `bulk_import_jobs` | Tracks CSV/XLSX import jobs with row counts and error details | `organizations`, `profiles` |
| `export_templates` | Configurable export formats per provider (column mapping, format, branding) | `organizations` |

**Key columns on `bulk_import_jobs`:**
- `entity_type TEXT NOT NULL` — what's being imported (e.g., `credential_assignments`)
- `file_name TEXT NOT NULL`, `file_size_bytes INTEGER`
- `status bulk_job_status NOT NULL DEFAULT 'pending'`
- `total_rows INTEGER`, `processed_rows INTEGER`, `error_rows INTEGER`
- `error_details JSONB` — array of `{ row: number, field: string, message: string }`
- `result_summary JSONB` — post-processing stats

**Key columns on `export_templates`:**
- `name TEXT NOT NULL`
- `entity_type TEXT NOT NULL` — what's being exported
- `format TEXT NOT NULL CHECK (format IN ('csv', 'xlsx', 'pdf', 'json'))`
- `column_mapping JSONB NOT NULL` — `{ source_field: string, target_header: string, transform?: string }[]`
- `provider_key TEXT` — optional provider-specific template (e.g., `eventbrite`, `front_gate`)
- `include_branding BOOLEAN DEFAULT false`
- `is_default BOOLEAN DEFAULT false`

**RLS:** Org-scoped on both tables.

### 1.3 Migration: `043_external_sync_infrastructure.sql`

**Complexity:** M | **Depends on:** Nothing

Creates the external sync domain:

**Tables:**

| Table | Purpose | Key FKs |
|-------|---------|---------|
| `provider_connections` | Provider credentials + config per org/event | `organizations`, `events` |
| `provider_ticket_map` | Maps provider ticket IDs to COMPVSS credential assignments | `provider_connections`, `credential_assignments`, `organizations` |
| `pos_transactions` | Normalized POS transaction records from any provider | `provider_connections`, `events`, `live_event_instances`, `foh_zones`, `vendors`, `organizations` |
| `pos_transaction_items` | Line items within POS transactions | `pos_transactions` |
| `webhook_events` | Inbound webhook receipt log with idempotency + retry tracking | `provider_connections`, `organizations` |
| `sync_events` | Bidirectional sync audit log | `provider_connections`, `organizations` |
| `sync_conflict_policies` | Declarative per-field conflict resolution rules | `provider_connections`, `organizations` |

**Critical indexes:**
- `webhook_events`: `(payload_hash)` UNIQUE — idempotency dedup
- `webhook_events`: `(status, next_retry_at)` — retry queue query
- `pos_transactions`: `(provider_transaction_id, connection_id)` UNIQUE — dedup
- `sync_events`: `(connection_id, created_at DESC)` — sync log timeline

**RLS:** Org-scoped on all 7 tables. `provider_connections` credential columns (`api_key`, `api_secret`, `webhook_secret`) require additional app-level restriction to `exec`/`director` via RBAC (not RLS — column-level masking).

### 1.4 RLS Policies + Triggers

**Complexity:** S | **Depends on:** 1.1, 1.2, 1.3

- Enable RLS on all 13 new tables
- Create org-scoped SELECT/INSERT/UPDATE policies
- `credential_scan_log`: SELECT + INSERT only (no UPDATE/DELETE — immutable)
- `webhook_events`: SELECT + INSERT only (no UPDATE except status/retry fields — controlled by Edge Functions via service role)
- `sync_events`: SELECT + INSERT only (immutable audit log)
- Pool allocation trigger on `credential_assignments`
- `updated_at` trigger on all mutable tables

### 1.5 Regenerate `database.types.ts`

**Complexity:** S | **Depends on:** 1.4

```bash
npx supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

**Verification:** Confirm all 13 new tables and 3 new enums appear in the generated types.

### 1.6 TypeScript Types

**Complexity:** S | **Depends on:** 1.5

Create two new type files that provide domain-specific interfaces on top of the generated DB types:

**`src/types/credentialing.ts`:**
- `CredentialCategory` (union type from enum)
- `CredentialAssignmentStatus` (union type from enum)
- `BulkJobStatus` (union type from enum)
- `CredentialType` (interface)
- `CredentialInventoryPool` (interface with computed `available_count`)
- `CredentialAssignment` (interface with expanded relations)
- `CredentialScanLogEntry` (interface)
- `BulkImportJob` (interface)
- `ExportTemplate` (interface with typed `column_mapping`)
- `CredentialAssignmentWithType` (joined type for UI)
- `PoolUtilization` (derived view type: `{ pool_id, type_name, total, allocated, available, utilization_pct }`)

**`src/types/external-sync.ts`:**
- `ProviderType` (union: `'eventbrite' | 'square' | 'front_gate' | 'intellitix' | 'custom'`)
- `SyncDirection` (union: `'inbound' | 'outbound' | 'bidirectional'`)
- `ConflictStrategy` (union: `'provider_wins' | 'compvss_wins' | 'last_write_wins' | 'manual'`)
- `WebhookEventStatus` (union: `'received' | 'processing' | 'processed' | 'failed' | 'skipped'`)
- `SyncEventStatus` (union: `'pending' | 'in_progress' | 'completed' | 'failed' | 'conflict'`)
- `ProviderConnection` (interface — masks `api_secret` and `webhook_secret`)
- `ProviderTicketMap` (interface)
- `PosTransaction` (interface with typed `line_items`)
- `PosTransactionItem` (interface)
- `WebhookEvent` (interface)
- `SyncEvent` (interface)
- `SyncConflictPolicy` (interface)
- `ProviderAdapter` (interface contract for Phase 4 adapters)

### 1.7 RBAC Resources

**Complexity:** S | **Depends on:** 1.6

Update `src/config/rbac.ts` — add 13 new resources to the `PERMISSION_MATRIX` for all 6 tiers per the RBAC Visibility Matrix in the audit's IA Integration section.

**New resources to add:**

```
credential_types, credential_inventory_pools, credential_assignments,
credential_scan_log, bulk_import_jobs, export_templates,
provider_connections, provider_ticket_map, pos_transactions,
pos_transaction_items, webhook_events, sync_events, sync_conflict_policies
```

**Implementation detail:** Add to each of the 6 role blocks (`exec`, `director`, `pm`, `member`, `client`, `collaborator`) with the exact permission sets defined in the audit's RBAC Visibility Matrix. Group under a `// Credentialing` and `// External Sync` comment block within each role.

**Field visibility masks:** Add `api_key`, `api_secret`, `webhook_secret` to `FIELD_VISIBILITY_MASKS` restricted to `["exec"]`.

### Phase 1 Deliverables Checklist

- [ ] 3 migration files created and applied locally
- [ ] All 13 tables have RLS policies enabled
- [ ] All triggers functional (pool allocation, updated_at)
- [ ] `database.types.ts` regenerated with all new types
- [ ] `src/types/credentialing.ts` created
- [ ] `src/types/external-sync.ts` created
- [ ] `src/config/rbac.ts` updated with 13 resources × 6 tiers
- [ ] `npx supabase db reset` succeeds without errors
- [ ] `npm run type-check` passes

---

## Phase 2: Core Hooks & API Routes (Weeks 3–4)

**Goal:** All data access hooks and server-side API routes are functional. No UI yet.

### 2.1 Supabase Hooks: `src/lib/supabase/hooks-credentialing.ts`

**Complexity:** M | **Depends on:** 1.5

CRUD hooks following the existing pattern in `hooks-pages.ts`:

| Hook | Query | Returns |
|------|-------|---------|
| `useCredentialTypes(orgId)` | `credential_types` WHERE org + active, ordered by category, tier_level | `CredentialType[]` |
| `useCredentialType(id)` | Single record by ID | `CredentialType \| null` |
| `useCredentialInventoryPools(eventId)` | `credential_inventory_pools` WHERE event, joined with `credential_types` | `CredentialInventoryPool[]` |
| `useCredentialAssignments(poolId?, eventId?, status?)` | Filtered query with optional joins to `credential_types`, `profiles`, `crew_members`, `vip_guests` | `CredentialAssignmentWithType[]` |
| `useCredentialAssignment(id)` | Single record with full relations | `CredentialAssignmentWithType \| null` |
| `useCredentialScanLog(assignmentId?, zoneId?, timeRange?)` | `credential_scan_log` with filters, ordered by `scanned_at DESC` | `CredentialScanLogEntry[]` |
| `useBulkImportJobs(orgId)` | `bulk_import_jobs` ordered by `created_at DESC` | `BulkImportJob[]` |
| `useExportTemplates(orgId, entityType?)` | `export_templates` with optional entity type filter | `ExportTemplate[]` |

**Mutation hooks:**
- `useCreateCredentialType()` → INSERT into `credential_types`
- `useUpdateCredentialType()` → UPDATE `credential_types`
- `useCreateCredentialPool()` → INSERT into `credential_inventory_pools`
- `useAssignCredential()` → INSERT into `credential_assignments` (single)
- `useUpdateAssignmentStatus()` → UPDATE `credential_assignments.status`
- `useRevokeCredential()` → UPDATE status to `revoked` + set `revoked_at`, `revoked_by`

### 2.2 Supabase Hooks: `src/lib/supabase/hooks-external-sync.ts`

**Complexity:** M | **Depends on:** 1.5

| Hook | Query | Returns |
|------|-------|---------|
| `useProviderConnections(orgId)` | `provider_connections` WHERE org, masks secrets | `ProviderConnection[]` |
| `useProviderConnection(id)` | Single record, masks secrets | `ProviderConnection \| null` |
| `useProviderTicketMap(connectionId)` | `provider_ticket_map` WHERE connection | `ProviderTicketMap[]` |
| `usePosTransactions(eventId?, zoneId?, dateRange?)` | Filtered `pos_transactions` with optional joins | `PosTransaction[]` |
| `usePosTransactionItems(transactionId)` | `pos_transaction_items` WHERE transaction | `PosTransactionItem[]` |
| `useWebhookEvents(connectionId?, status?)` | Filtered `webhook_events`, ordered by `received_at DESC` | `WebhookEvent[]` |
| `useSyncEvents(connectionId?, status?, dateRange?)` | Filtered `sync_events`, ordered by `created_at DESC` | `SyncEvent[]` |
| `useSyncConflictPolicies(connectionId)` | `sync_conflict_policies` WHERE connection | `SyncConflictPolicy[]` |

**Mutation hooks:**
- `useCreateProviderConnection()` → INSERT (encrypts secrets server-side)
- `useUpdateProviderConnection()` → UPDATE
- `useToggleProviderConnection()` → UPDATE `is_active`
- `useCreateSyncConflictPolicy()` → INSERT
- `useUpdateSyncConflictPolicy()` → UPDATE

### 2.3 API Route: `POST /api/credentials/assign`

**Complexity:** M | **Depends on:** 2.1

**File:** `src/app/api/credentials/assign/route.ts`

**Accepts:**
```typescript
{
    pool_id: string;
    assignments: Array<{
        // One of these required (polymorphic assignee)
        profile_id?: string;
        crew_member_id?: string;
        vip_guest_id?: string;
        vendor_id?: string;
        // Optional overrides
        zone_access_override?: string[];
        valid_from?: string;  // ISO 8601
        valid_until?: string;
        notes?: string;
    }>;
}
```

**Logic:**
1. Validate RBAC (`credential_assignments.write`)
2. Fetch pool → check `allocated_count + assignments.length <= total_quantity`
3. For each assignment:
   a. Generate unique `barcode_value` (format: `COMPVSS-{org_short}-{sequential_id}`)
   b. INSERT into `credential_assignments` with status `requested`
   c. Pool trigger auto-increments `allocated_count`
4. Return created assignments with IDs

**Error responses:**
- `409 Conflict` — pool capacity exceeded
- `422 Unprocessable` — invalid assignee references
- `403 Forbidden` — RBAC violation

### 2.4 API Route: `POST /api/credentials/scan`

**Complexity:** S | **Depends on:** 2.1

**File:** `src/app/api/credentials/scan/route.ts`

**Accepts:**
```typescript
{
    barcode_value?: string;  // One of barcode or rfid required
    rfid_tag?: string;
    scan_type: 'check_in' | 'check_out' | 'verify';
    zone_id?: string;
    device_id?: string;
    latitude?: number;
    longitude?: number;
}
```

**Logic:**
1. Lookup `credential_assignments` by `barcode_value` or `rfid_tag`
2. Validate assignment status (must be `issued` or `checked_in` depending on scan_type)
3. Check validity window (`valid_from` ≤ NOW ≤ `valid_until`)
4. Check zone access (if `zone_id` provided, verify it's in `zone_access` array)
5. INSERT into `credential_scan_log`
6. UPDATE `credential_assignments.status` (e.g., `issued` → `checked_in`)
7. Return scan result with credential details

**Performance requirement:** < 200ms total response time. Use a direct Supabase service-role client (no RLS overhead for gate devices — authenticate via device token).

**Error responses:**
- `404 Not Found` — unknown barcode/RFID
- `410 Gone` — credential revoked or expired
- `403 Forbidden` — zone access denied

### 2.5 API Route: `POST /api/credentials/bulk-import`

**Complexity:** L | **Depends on:** 2.1

**File:** `src/app/api/credentials/bulk-import/route.ts`

**Accepts:** `multipart/form-data` with:
- `file` — CSV or XLSX file
- `pool_id` — target credential pool
- `dry_run` — boolean (validate only, no writes)

**Logic:**
1. Validate RBAC (`bulk_import_jobs.write`)
2. Create `bulk_import_jobs` record with status `pending`
3. Parse file (CSV via `papaparse`, XLSX via `xlsx`)
4. Update job status to `validating`
5. Validate each row:
   - Required fields present (name/email or crew_member_id)
   - Assignee references exist in DB
   - No duplicate barcodes
   - Pool capacity sufficient for total valid rows
6. If `dry_run`: return validation results, update job status to `completed`
7. If not dry_run: update status to `processing`, batch INSERT assignments (chunks of 100)
8. Update job with `processed_rows`, `error_rows`, `error_details`, `result_summary`
9. Update status to `completed` or `failed`

**File size limit:** 10MB. **Row limit:** 10,000 per upload.

### 2.6 API Route: `POST /api/credentials/export`

**Complexity:** M | **Depends on:** 2.1

**File:** `src/app/api/credentials/export/route.ts`

**Accepts:**
```typescript
{
    template_id?: string;    // Use predefined template
    event_id: string;
    pool_ids?: string[];     // Filter to specific pools
    status_filter?: string[];
    format: 'csv' | 'xlsx' | 'pdf' | 'json';
}
```

**Logic:**
1. Validate RBAC (`export_templates.read` + `credential_assignments.read`)
2. Fetch template (if `template_id`) or use default column mapping
3. Query `credential_assignments` with joins to `credential_types`, `profiles`, `crew_members`, `vip_guests`, `vendors`
4. Apply `column_mapping` transforms
5. Generate output:
   - CSV: `papaparse` unparse
   - XLSX: `xlsx` write
   - PDF: `@react-pdf/renderer` with optional branding
   - JSON: direct serialization
6. Return file as download response

### 2.7 API Route: `GET/POST /api/integrations/connections`

**Complexity:** S | **Depends on:** 2.2

**File:** `src/app/api/integrations/connections/route.ts`

**GET:** List provider connections for org (masks secrets).
**POST:** Create new provider connection.

**Secret handling:** `api_key` and `api_secret` are stored encrypted. The API route uses a server-side encryption utility (Supabase Vault or AES-256 via `crypto`). Secrets are never returned in GET responses — only `api_key_last4` for display.

### 2.8 API Route: `GET /api/integrations/sync-log`

**Complexity:** S | **Depends on:** 2.2

**File:** `src/app/api/integrations/sync-log/route.ts`

**GET:** Paginated sync events with filters (connection_id, status, date range).

Query params: `?connection_id=&status=&from=&to=&page=&per_page=`

### 2.9 Realtime Subscriptions: `src/lib/supabase/realtime.ts`

**Complexity:** S | **Depends on:** 2.1, 2.2

Add Supabase Realtime channel subscriptions for:

| Channel | Table | Filter | Used By |
|---------|-------|--------|---------|
| `credential-assignments:{event_id}` | `credential_assignments` | `pool_id` in event pools | Live Ops Credentials page |
| `credential-scans:{event_id}` | `credential_scan_log` | Assignments in event pools | Live Ops Gate page, FOH page |
| `pos-transactions:{event_id}` | `pos_transactions` | `event_id` match | Live Ops Financials page |

**Pattern:** Follow existing realtime subscription patterns if any exist in the codebase. Use `useEffect` cleanup to unsubscribe on unmount.

### 2.10 Install Dependencies

**Complexity:** S | **Depends on:** Nothing

```bash
npm install papaparse xlsx @react-pdf/renderer
npm install -D @types/papaparse
```

- `papaparse` — CSV parsing/generation
- `xlsx` (SheetJS) — XLSX parsing/generation
- `@react-pdf/renderer` — PDF manifest generation

### Phase 2 Deliverables Checklist

- [ ] 8 query hooks + 8 mutation hooks in 2 hook files
- [ ] 6 API routes created and returning correct responses
- [ ] Realtime subscriptions configured for 3 channels
- [ ] 3 npm packages installed
- [ ] All API routes validate RBAC before data access
- [ ] Secret masking verified (no raw API keys in GET responses)
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes

---

## Phase 3: UI Views & Navigation (Weeks 5–7)

**Goal:** All user-facing pages, components, and navigation updates are complete.

### 3.1 Page: Credential Types & Pools — `/credentials`

**File:** `src/app/(dashboard)/credentials/page.tsx`
**IA Section:** Production
**Complexity:** M | **Depends on:** 2.1

**Layout:**
- **Header:** Page title "Credentials" + "Add Credential Type" button
- **Grid view:** Cards per credential type showing:
  - Name, category badge, tier level, color swatch
  - Default zone access tags
  - Format icon (wristband/badge/lanyard/digital/rfid/ticket)
  - Active/inactive toggle
- **Pool section (per event):** Event selector → pool list showing:
  - Type name, total quantity, allocated, available
  - `PoolCapacityBar` component (visual utilization)
  - "Create Pool" button

**Components to create:**
- `src/components/credentials/credential-type-card.tsx` — type display card
- `src/components/credentials/pool-capacity-bar.tsx` — visual capacity indicator

**RBAC:** `credential_types.read` (page visibility), `credential_types.write` (create/edit buttons)

### 3.2 Page: Credential Assignments — `/credentials/assignments`

**File:** `src/app/(dashboard)/credentials/assignments/page.tsx`
**IA Section:** Production > Credentials > Assignments
**Complexity:** M | **Depends on:** 2.3

**Layout:**
- **Filters:** Event selector, pool selector, status filter, search by name/barcode
- **Table view:** Sortable columns:
  - Assignee name + type (crew/vip/vendor/profile)
  - Credential type + category badge
  - Status badge (color-coded per lifecycle state)
  - Barcode value
  - Zone access tags
  - Valid from/until
  - Actions: view, revoke, re-issue
- **Bulk actions toolbar:** Import CSV, Export, Bulk status change
- **Assign dialog:** Single assignment form with assignee search, type/pool selector, zone overrides

**Components to create:**
- `src/components/credentials/assignment-status-badge.tsx` — color-coded status

**RBAC:** `credential_assignments.read` (page), `credential_assignments.write` (assign/revoke buttons)

### 3.3 Page: Live Credentials Dashboard — `/live-ops/credentials`

**File:** `src/app/(dashboard)/live-ops/credentials/page.tsx`
**IA Section:** Live Operations (contextual)
**Complexity:** L | **Depends on:** 2.9

**Layout (real-time):**
- **Summary cards row:** Total issued, Checked in (count + %), Checked out, Revoked, Flagged
- **Zone heatmap:** Grid of FOH zones with credential check-in counts, color-coded by utilization
- **Live feed:** Scrolling list of recent scan events (name, type, zone, time, scan result)
- **Alerts panel:** Revoked credentials attempting entry, expired credentials, over-capacity zones

**Data source:** Supabase Realtime subscription on `credential_assignments` + `credential_scan_log` for the active `live_event_id`.

**Performance:** Use optimistic UI updates from Realtime. Debounce summary card recalculation to 1s intervals.

**RBAC:** `credential_assignments.read` (page visibility)

### 3.4 Page: Gate Scan Interface — `/live-ops/gate`

**File:** `src/app/(dashboard)/live-ops/gate/page.tsx`
**IA Section:** Live Operations (contextual)
**Complexity:** M | **Depends on:** 2.4

**Layout (touch-optimized for tablets/phones):**
- **Large scan input:** Full-width text field for barcode scanner input (auto-focus, auto-submit on scan)
- **Manual lookup:** Search by name or barcode
- **Scan result display:** Full-screen result card:
  - ✅ **VALID** (green) — name, type, zone access, photo (if available)
  - ❌ **DENIED** (red) — reason (revoked, expired, wrong zone, not found)
  - ⚠️ **FLAG** (amber) — valid but flagged (e.g., re-entry, VIP requiring escort)
- **Zone selector:** Current gate/zone dropdown (pre-fills `zone_id` on scan)
- **Recent scans:** Last 10 scans at this gate

**UX requirements:**
- Auto-clear result after 3 seconds (configurable)
- Sound/haptic feedback on scan result
- Works offline-first with sync queue (stretch goal — Phase 4+)
- Minimal UI chrome — no sidebar, no topbar (full-screen mode option)

**Components to create:**
- `src/components/credentials/scan-result-indicator.tsx` — full-screen scan result

**RBAC:** `credential_scan_log.write` (page visibility — gate staff)

### 3.5 Page: Integrations — `/integrations`

**File:** `src/app/(dashboard)/integrations/page.tsx`
**IA Section:** Admin
**Complexity:** M | **Depends on:** 2.7

**Layout:**
- **Provider cards grid:** One card per connected provider showing:
  - Provider logo + name
  - Connection status (active/inactive/error)
  - Last sync timestamp
  - Sync direction badges (inbound/outbound/bidirectional)
  - Event scope (all events or specific)
  - Actions: configure, test connection, disable, delete
- **Add connection dialog:** Provider type selector → config form:
  - API key, API secret (masked input)
  - Webhook URL (auto-generated, copy-to-clipboard)
  - Sync direction toggles
  - Event scope selector
  - Conflict resolution defaults
- **Sync status summary:** Total syncs today, failed count, pending conflicts

**RBAC:** `provider_connections.read` (page), `provider_connections.write` (create/edit/delete)

### 3.6 Page: Sync Log — `/integrations/sync-log`

**File:** `src/app/(dashboard)/integrations/sync-log/page.tsx`
**IA Section:** Admin > Integrations > Sync Log
**Complexity:** S | **Depends on:** 2.8

**Layout:**
- **Filters:** Provider, direction, status, date range
- **Table:** Timestamp, provider, direction, entity type, status, record count, duration, error message
- **Row expand:** Full sync event details including payload preview (truncated), conflict resolution actions taken
- **Retry action:** For failed events, "Retry" button triggers re-processing

**RBAC:** `sync_events.read` (page visibility)

### 3.7 Update: Front of House — `/live-ops/foh`

**File:** `src/app/(dashboard)/live-ops/foh/page.tsx` (modify)
**Complexity:** S | **Depends on:** 2.9

**Changes:**
- Add "Credentials" column to zone metrics table: count of checked-in credentials per zone
- Add "Credential Utilization" metric to zone detail cards
- Source data from `credential_scan_log` joined with `foh_zones` via Realtime

### 3.8 Update: Live Financials — `/live-ops/financials`

**File:** `src/app/(dashboard)/live-ops/financials/page.tsx` (modify)
**Complexity:** S | **Depends on:** 2.2

**Changes:**
- Add "POS Revenue" section below existing financial snapshot:
  - Revenue by category (tickets, F&B, merch, other)
  - Revenue by zone (from `pos_transactions.foh_zone_id`)
  - Transaction count + average transaction value
- Source data from `pos_transactions` aggregated per event via `usePosTransactions(eventId)`

### 3.9 Bulk Import Dialog

**File:** `src/components/credentials/bulk-import-dialog.tsx`
**Complexity:** M | **Depends on:** 2.5

**Features:**
- File drop zone (CSV/XLSX)
- Pool selector
- Preview table (first 10 rows)
- Dry run button → validation results
- Import button → progress bar with row counts
- Error summary with downloadable error report

### 3.10 Export Dialog

**File:** `src/components/credentials/export-dialog.tsx`
**Complexity:** S | **Depends on:** 2.6

**Features:**
- Template selector (or default)
- Format selector (CSV/XLSX/PDF/JSON)
- Pool/status filters
- Preview of column mapping
- Download button

### 3.11 Navigation Config Update

**File:** `src/config/navigation.ts` (modify)
**Complexity:** S | **Depends on:** 3.1, 3.5

**Changes (as specified in audit IA Integration section):**

1. **Production section:** Add `Credentials` item with `Assignments` child after `Locations`
2. **Live Operations section:** Add `Credentials` and `Gate Scan` items after `VIP Management`
3. **Admin section:** Add `Integrations` item with `Sync Log` child after `Data Export`

No new icon imports required — all 6 icons already imported.

### Phase 3 Deliverables Checklist

- [ ] 6 new pages created
- [ ] 2 existing pages updated with POS/credential data
- [ ] 6 new components created
- [ ] Navigation config updated (3 sections modified)
- [ ] All pages respect RBAC visibility
- [ ] Gate scan page is touch-optimized (test on iPad viewport)
- [ ] Live credentials page uses Realtime (verify live updates)
- [ ] Bulk import handles 1,000+ row files without UI freeze
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes

---

## Phase 4: Edge Functions & Sync Workers (Weeks 8–10)

**Goal:** All external-facing webhook receivers, outbound sync workers, and POS aggregation are operational.

### 4.1 Edge Function: Eventbrite Webhook Receiver

**File:** `supabase/functions/webhook-eventbrite/index.ts`
**Complexity:** M | **Depends on:** 1.3

**Handles Eventbrite webhook events:**
- `order.placed` — new ticket order → create `provider_ticket_map` + `credential_assignments`
- `order.refunded` — refund → update assignment status to `revoked`
- `order.updated` — attendee info change → update `provider_ticket_map`
- `attendee.checked_in` — check-in from Eventbrite app → update assignment status

**Flow:**
1. Validate webhook signature (Eventbrite uses custom header `X-Eventbrite-Webhook-Secret`)
2. Compute `payload_hash` (SHA-256 of body)
3. Check `webhook_events` for duplicate → skip if exists
4. INSERT into `webhook_events` with status `received`
5. Normalize payload via Eventbrite adapter
6. Apply conflict resolution policy
7. Create/update COMPVSS records
8. INSERT into `sync_events`
9. UPDATE `webhook_events` status to `processed`
10. Return `200 OK`

**Error handling:** On failure, UPDATE `webhook_events` status to `failed`, increment `retry_count`, set `next_retry_at` (exponential backoff: `2^retry_count` minutes, max 24h).

### 4.2 Edge Function: Square Webhook Receiver

**File:** `supabase/functions/webhook-square/index.ts`
**Complexity:** M | **Depends on:** 1.3

**Handles Square webhook events:**
- `payment.completed` — POS sale → INSERT `pos_transactions` + `pos_transaction_items`
- `payment.refunded` — refund → UPDATE `pos_transactions` with refund details
- `inventory.count.updated` — inventory change (if applicable)

**Flow:** Same 10-step pattern as 4.1, using Square adapter for normalization.

**Square-specific:** HMAC-SHA256 signature validation using `X-Square-Hmacsha256-Signature` header.

### 4.3 Edge Function: Outbound Sync Worker

**File:** `supabase/functions/sync-outbound/index.ts`
**Complexity:** L | **Depends on:** 1.3, 2.3

**Triggered by:** `pg_notify('sync_outbox', ...)` on `credential_assignments` INSERT/UPDATE, or via cron schedule (fallback).

**Flow:**
1. Receive notification with `assignment_id` and `change_type`
2. Lookup `credential_assignments` → get `pool_id` → get `event_id`
3. Query `provider_connections` WHERE `event_id` AND `sync_direction IN ('outbound', 'bidirectional')` AND `is_active`
4. For each active connection:
   a. Load provider adapter (from `_shared/provider-adapters/`)
   b. Transform COMPVSS assignment → provider format
   c. Call provider API (with rate limiting — see 4.5)
   d. INSERT into `sync_events` with result
   e. UPDATE `credential_assignments.last_synced_at`
5. On failure: INSERT `sync_events` with status `failed`, schedule retry

**Rate limiting:** Per-provider rate limits stored in `provider_connections.rate_limit_config` (JSONB). Default: 10 requests/second.

### 4.4 Edge Function: POS Aggregation Worker

**File:** `supabase/functions/sync-pos-aggregate/index.ts`
**Complexity:** M | **Depends on:** 1.3

**Triggered by:** Cron schedule (every 5 minutes during active events) or on-demand.

**Flow:**
1. Query active `live_event_instances` (phase = `live`)
2. For each active event:
   a. Aggregate `pos_transactions` by `foh_zone_id` → UPDATE `foh_zone_readings` (sales_amount, transactions_count)
   b. Aggregate `pos_transactions` by category → UPDATE `live_financial_snapshots` (revenue_tickets, revenue_fb, revenue_merch, revenue_other)
3. Log aggregation run

**Idempotency:** Aggregation is a full recompute from source transactions, not incremental. Safe to re-run.

### 4.5 Shared Library: Webhook Utilities

**File:** `supabase/functions/_shared/webhook-utils.ts`
**Complexity:** S | **Depends on:** Nothing

**Exports:**
- `validateHmacSignature(payload, secret, signature, algorithm)` → boolean
- `computePayloadHash(payload)` → SHA-256 hex string
- `checkIdempotency(supabaseClient, payloadHash)` → boolean (true if duplicate)
- `createWebhookEvent(supabaseClient, event)` → WebhookEvent
- `updateWebhookEventStatus(supabaseClient, id, status, error?)` → void
- `calculateNextRetry(retryCount, maxRetries)` → Date | null (exponential backoff)

### 4.6 Shared Library: Sync Utilities

**File:** `supabase/functions/_shared/sync-utils.ts`
**Complexity:** S | **Depends on:** Nothing

**Exports:**
- `resolveConflict(localValue, remoteValue, policy)` → resolved value
- `loadConflictPolicies(supabaseClient, connectionId)` → SyncConflictPolicy[]
- `createSyncEvent(supabaseClient, event)` → SyncEvent
- `RateLimiter` class — token bucket implementation per provider
- `withRetry(fn, maxRetries, backoffMs)` → result (generic retry wrapper)

### 4.7 Shared Library: Provider Adapters

**Directory:** `supabase/functions/_shared/provider-adapters/`
**Complexity:** M | **Depends on:** Nothing

**Files:**
- `types.ts` — `ProviderAdapter` interface:
  ```typescript
  interface ProviderAdapter {
      providerKey: string;
      validateSignature(payload: string, secret: string, signature: string): boolean;
      normalizeInbound(rawPayload: unknown, eventType: string): NormalizedEvent;
      transformOutbound(assignment: CredentialAssignment): ProviderPayload;
      getApiHeaders(connection: ProviderConnection): Record<string, string>;
  }
  ```
- `eventbrite.ts` — Eventbrite adapter implementing `ProviderAdapter`
- `square.ts` — Square adapter implementing `ProviderAdapter`
- `front-gate.ts` — Front Gate Tickets adapter (stub — populate when API docs available)

### 4.8 Cron Job Configuration

**Complexity:** S | **Depends on:** 4.3, 4.4

Add to `supabase/config.toml` or create `supabase/functions/cron.json`:

| Schedule | Function | Purpose |
|----------|----------|---------|
| `*/5 * * * *` (every 5 min) | `sync-pos-aggregate` | Aggregate POS data during active events |
| `*/1 * * * *` (every 1 min) | `sync-outbound` | Process outbound sync queue (fallback for missed `pg_notify`) |

**Note:** Cron functions check for active events first and no-op if none are running.

### Phase 4 Deliverables Checklist

- [ ] 4 Edge Functions created in `supabase/functions/`
- [ ] 3 shared library files created in `supabase/functions/_shared/`
- [ ] 3 provider adapters created (Eventbrite, Square, Front Gate stub)
- [ ] Webhook signature validation tested per provider
- [ ] Idempotency dedup verified (duplicate webhook → no duplicate records)
- [ ] Outbound sync tested end-to-end (COMPVSS change → provider API call)
- [ ] POS aggregation verified (transactions → zone readings + financial snapshots)
- [ ] Rate limiting functional (verify no provider API throttling)
- [ ] Cron jobs configured
- [ ] `npx supabase functions serve` runs all functions without errors

---

## Cross-Cutting Concerns

### Secret Management

| Secret | Storage | Access |
|--------|---------|--------|
| Provider API keys | `provider_connections.api_key` (encrypted at rest via Supabase) | Edge Functions (service role), API routes (server-side only) |
| Provider API secrets | `provider_connections.api_secret` (encrypted) | Edge Functions only |
| Webhook secrets | `provider_connections.webhook_secret` (encrypted) | Edge Functions only (webhook validation) |
| HMAC signing keys | Supabase Vault (per provider) | Edge Functions only |

**Client-side exposure:** ZERO. API GET responses return `api_key_last4` only. RBAC restricts `provider_connections` write to `exec`/`director`.

### Performance Budgets

| Operation | Target | Mitigation |
|-----------|--------|------------|
| Gate scan (API round-trip) | < 200ms | Service role client, no RLS overhead, indexed barcode lookup |
| Bulk import (1,000 rows) | < 30s | Chunked inserts (100/batch), background job |
| Webhook processing | < 5s | Edge Function cold start + single DB transaction |
| Live dashboard update | < 1s | Supabase Realtime, debounced UI updates |
| Export generation (10,000 rows) | < 10s | Streaming CSV, chunked XLSX |

### Accessibility (WCAG 2.2 AA)

- Gate scan page: High-contrast result indicators, screen reader announcements for scan results
- All status badges: Color + icon + text (never color-only)
- Bulk import dialog: Keyboard navigable, file input with drag-and-drop alternative
- Live dashboard: `aria-live="polite"` regions for real-time updates
- All new forms: Proper `label` associations, error messages linked via `aria-describedby`

### Internationalization

- All user-facing strings in new pages must use the existing i18n pattern (if one exists) or be extracted as string constants ready for i18n
- Date/time formatting: Use `Intl.DateTimeFormat` with locale from context
- Number formatting (currency, counts): Use `Intl.NumberFormat`
- Credential categories and statuses: Display values are translatable labels, not raw enum values

---

## Testing Strategy

### Unit Tests

| Target | Test File | Key Assertions |
|--------|-----------|----------------|
| RBAC matrix (new resources) | `src/__tests__/lib/rbac-credentialing.test.ts` | All 13 resources × 6 tiers match audit matrix |
| Conflict resolution engine | `src/__tests__/lib/sync-conflict.test.ts` | All 4 strategies produce correct winner |
| Barcode generation | `src/__tests__/lib/barcode-gen.test.ts` | Uniqueness, format compliance |
| Payload hash computation | `src/__tests__/lib/webhook-utils.test.ts` | SHA-256 correctness, idempotency |
| CSV/XLSX parsing | `src/__tests__/lib/bulk-import-parse.test.ts` | Column mapping, error detection |

### Integration Tests

| Target | Test File | Key Assertions |
|--------|-----------|----------------|
| Credential assignment flow | `src/__tests__/api/credentials-assign.test.ts` | Pool capacity enforcement, status lifecycle, barcode generation |
| Gate scan flow | `src/__tests__/api/credentials-scan.test.ts` | Valid/denied/expired scenarios, scan log creation |
| Bulk import flow | `src/__tests__/api/credentials-bulk-import.test.ts` | File parsing, validation, partial failure handling |
| Webhook receiver | `src/__tests__/api/webhook-eventbrite.test.ts` | Signature validation, idempotency, record creation |
| Outbound sync | `src/__tests__/api/sync-outbound.test.ts` | Provider API call, retry on failure, rate limiting |

### E2E Tests (if Playwright available)

| Scenario | Steps |
|----------|-------|
| Create credential type → pool → assignment | Navigate Production > Credentials, create type, create pool for event, assign credential |
| Gate scan happy path | Navigate Live Ops > Gate Scan, scan valid barcode, verify green result |
| Gate scan denied | Scan revoked credential, verify red result with reason |
| Bulk import | Upload CSV, verify dry run results, confirm import, verify assignment count |
| Provider connection setup | Navigate Admin > Integrations, add Eventbrite connection, verify webhook URL generated |

---

## Rollback Strategy

### Migration Rollback

Each migration has a corresponding DOWN script:

| Migration | Rollback |
|-----------|----------|
| `041_credentialing_ticketing.sql` | DROP tables `credential_scan_log`, `credential_assignments`, `credential_inventory_pools`, `credential_types` + DROP enums |
| `042_bulk_export_infrastructure.sql` | DROP tables `export_templates`, `bulk_import_jobs` |
| `043_external_sync_infrastructure.sql` | DROP tables `sync_conflict_policies`, `sync_events`, `webhook_events`, `pos_transaction_items`, `pos_transactions`, `provider_ticket_map`, `provider_connections` |

**Order matters:** Rollback in reverse order (043 → 042 → 041) to respect FK dependencies.

### Feature Flag Strategy

All new UI pages should be gated behind a feature flag check (when feature flag infrastructure is available per the Settings/RBAC audit):

| Flag Key | Default | Controls |
|----------|---------|----------|
| `credentialing.enabled` | `false` | Production > Credentials nav item + pages |
| `credentialing.gate_scan` | `false` | Live Ops > Gate Scan nav item + page |
| `integrations.external_sync` | `false` | Admin > Integrations nav item + pages |
| `integrations.pos` | `false` | POS transaction data on Finance + Live Ops pages |

Until feature flags are implemented, use a simple `NEXT_PUBLIC_FEATURE_CREDENTIALING=true` env var check.

---

## Dependency Map

```
Phase 1 (Schema)
├── 1.1 041_credentialing_ticketing.sql ──────┐
├── 1.2 042_bulk_export_infrastructure.sql ───┤
├── 1.3 043_external_sync_infrastructure.sql ─┤
├── 1.4 RLS + Triggers ──────────────────────←┘ (depends on 1.1, 1.2, 1.3)
├── 1.5 database.types.ts ───────────────────← 1.4
├── 1.6 TypeScript types ────────────────────← 1.5
└── 1.7 RBAC resources ─────────────────────← 1.6

Phase 2 (Hooks + API)
├── 2.1 hooks-credentialing.ts ──────────────← 1.5
├── 2.2 hooks-external-sync.ts ──────────────← 1.5
├── 2.3 POST /credentials/assign ────────────← 2.1
├── 2.4 POST /credentials/scan ──────────────← 2.1
├── 2.5 POST /credentials/bulk-import ───────← 2.1
├── 2.6 POST /credentials/export ────────────← 2.1
├── 2.7 GET/POST /integrations/connections ──← 2.2
├── 2.8 GET /integrations/sync-log ──────────← 2.2
├── 2.9 Realtime subscriptions ──────────────← 2.1, 2.2
└── 2.10 npm install ────────────────────────← (none)

Phase 3 (UI)
├── 3.1 /credentials ────────────────────────← 2.1
├── 3.2 /credentials/assignments ────────────← 2.3
├── 3.3 /live-ops/credentials ───────────────← 2.9
├── 3.4 /live-ops/gate ──────────────────────← 2.4
├── 3.5 /integrations ──────────────────────← 2.7
├── 3.6 /integrations/sync-log ──────────────← 2.8
├── 3.7 /live-ops/foh (update) ──────────────← 2.9
├── 3.8 /live-ops/financials (update) ───────← 2.2
├── 3.9 bulk-import-dialog.tsx ──────────────← 2.5
├── 3.10 export-dialog.tsx ──────────────────← 2.6
└── 3.11 navigation.ts (update) ─────────────← 3.1, 3.5

Phase 4 (Edge Functions)
├── 4.1 webhook-eventbrite ──────────────────← 1.3
├── 4.2 webhook-square ─────────────────────← 1.3
├── 4.3 sync-outbound ──────────────────────← 1.3, 2.3
├── 4.4 sync-pos-aggregate ─────────────────← 1.3
├── 4.5 webhook-utils.ts ───────────────────← (none)
├── 4.6 sync-utils.ts ──────────────────────← (none)
├── 4.7 provider-adapters/ ─────────────────← (none)
└── 4.8 cron config ────────────────────────← 4.3, 4.4
```

---

## Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | Provider API changes break adapters | Medium | High | Adapter pattern isolates changes to single file per provider. Version-pin API endpoints. |
| R2 | Webhook delivery failures from providers | Medium | Medium | `webhook_events` retry queue with exponential backoff. Alert on 3+ consecutive failures. |
| R3 | Pool capacity race condition (concurrent assignments) | Medium | High | Use `SELECT ... FOR UPDATE` on pool row during assignment. Database-level constraint on `allocated_count <= total_quantity`. |
| R4 | Gate scan latency exceeds 200ms target | Low | High | Pre-warm Edge Function. Use indexed barcode lookup. Fallback: local cache on gate device. |
| R5 | Bulk import OOM on large files | Low | Medium | Stream CSV parsing (papaparse streaming mode). Chunk XLSX processing. Enforce 10MB/10K row limit. |
| R6 | Secret exposure via API response | Low | Critical | Server-side masking in all hooks/routes. `FIELD_VISIBILITY_MASKS` for API key fields. Code review gate. |
| R7 | Realtime subscription overload during large events | Medium | Medium | Debounce UI updates. Use channel filters to reduce payload volume. |
| R8 | POS aggregation lag during peak sales | Low | Low | 5-minute cron interval is acceptable. On-demand trigger available for manual refresh. |
| R9 | Migration rollback needed post-deployment | Low | High | All migrations have DOWN scripts. No existing tables modified. Clean rollback path. |
| R10 | Missing provider API documentation (Front Gate) | High | Medium | Front Gate adapter is a stub. Ship without it. Implement when API docs become available. |

---

## Acceptance Criteria

### Phase 1 Complete When:
- All 3 migrations apply cleanly on fresh `supabase db reset`
- `database.types.ts` includes all 13 new tables + 3 enums
- TypeScript types compile without errors
- RBAC matrix has 13 new resources across 6 tiers
- RLS policies prevent cross-org data access (manual test with 2 org users)

### Phase 2 Complete When:
- All 8 query hooks return data from seeded test records
- `POST /api/credentials/assign` creates assignments and decrements pool capacity
- `POST /api/credentials/scan` returns correct VALID/DENIED/EXPIRED for all scenarios
- `POST /api/credentials/bulk-import` processes 1,000-row CSV in < 30s
- `POST /api/credentials/export` generates valid CSV, XLSX, PDF, JSON files
- Provider connection secrets are never visible in API GET responses
- Realtime subscriptions deliver updates within 1s of DB change

### Phase 3 Complete When:
- All 6 new pages render with seeded data
- Navigation shows Credentials (Production), Credentials + Gate Scan (Live Ops), Integrations (Admin)
- RBAC filtering hides pages from unauthorized roles (test with `member` and `client` roles)
- Gate scan page works on iPad viewport (1024×768)
- Bulk import dialog handles CSV and XLSX files
- Live credentials dashboard updates in real-time when scan events are inserted

### Phase 4 Complete When:
- Eventbrite webhook receiver processes `order.placed` event end-to-end
- Square webhook receiver processes `payment.completed` event end-to-end
- Duplicate webhooks are deduplicated (no duplicate records)
- Outbound sync pushes credential changes to provider API
- POS aggregation updates `foh_zone_readings` and `live_financial_snapshots`
- Failed webhooks retry with exponential backoff
- Rate limiter prevents exceeding provider API limits

---

## Appendix: File Inventory

### New Files (33 total)

| # | File | Phase |
|---|------|-------|
| 1 | `supabase/migrations/041_credentialing_ticketing.sql` | 1.1 |
| 2 | `supabase/migrations/042_bulk_export_infrastructure.sql` | 1.2 |
| 3 | `supabase/migrations/043_external_sync_infrastructure.sql` | 1.3 |
| 4 | `src/types/credentialing.ts` | 1.6 |
| 5 | `src/types/external-sync.ts` | 1.6 |
| 6 | `src/lib/supabase/hooks-credentialing.ts` | 2.1 |
| 7 | `src/lib/supabase/hooks-external-sync.ts` | 2.2 |
| 8 | `src/app/api/credentials/assign/route.ts` | 2.3 |
| 9 | `src/app/api/credentials/scan/route.ts` | 2.4 |
| 10 | `src/app/api/credentials/bulk-import/route.ts` | 2.5 |
| 11 | `src/app/api/credentials/export/route.ts` | 2.6 |
| 12 | `src/app/api/integrations/connections/route.ts` | 2.7 |
| 13 | `src/app/api/integrations/sync-log/route.ts` | 2.8 |
| 14 | `src/app/(dashboard)/credentials/page.tsx` | 3.1 |
| 15 | `src/app/(dashboard)/credentials/assignments/page.tsx` | 3.2 |
| 16 | `src/app/(dashboard)/live-ops/credentials/page.tsx` | 3.3 |
| 17 | `src/app/(dashboard)/live-ops/gate/page.tsx` | 3.4 |
| 18 | `src/app/(dashboard)/integrations/page.tsx` | 3.5 |
| 19 | `src/app/(dashboard)/integrations/sync-log/page.tsx` | 3.6 |
| 20 | `src/components/credentials/credential-type-card.tsx` | 3.1 |
| 21 | `src/components/credentials/pool-capacity-bar.tsx` | 3.1 |
| 22 | `src/components/credentials/assignment-status-badge.tsx` | 3.2 |
| 23 | `src/components/credentials/scan-result-indicator.tsx` | 3.4 |
| 24 | `src/components/credentials/bulk-import-dialog.tsx` | 3.9 |
| 25 | `src/components/credentials/export-dialog.tsx` | 3.10 |
| 26 | `supabase/functions/webhook-eventbrite/index.ts` | 4.1 |
| 27 | `supabase/functions/webhook-square/index.ts` | 4.2 |
| 28 | `supabase/functions/sync-outbound/index.ts` | 4.3 |
| 29 | `supabase/functions/sync-pos-aggregate/index.ts` | 4.4 |
| 30 | `supabase/functions/_shared/webhook-utils.ts` | 4.5 |
| 31 | `supabase/functions/_shared/sync-utils.ts` | 4.6 |
| 32 | `supabase/functions/_shared/provider-adapters/types.ts` | 4.7 |
| 33 | `supabase/functions/_shared/provider-adapters/eventbrite.ts` | 4.7 |
| 34 | `supabase/functions/_shared/provider-adapters/square.ts` | 4.7 |
| 35 | `supabase/functions/_shared/provider-adapters/front-gate.ts` | 4.7 |

### Modified Files (5 total)

| # | File | Phase | Change |
|---|------|-------|--------|
| 1 | `src/config/rbac.ts` | 1.7 | Add 13 resources × 6 tiers + 3 field masks |
| 2 | `src/config/navigation.ts` | 3.11 | Add 4 nav items (3 sections) |
| 3 | `src/app/(dashboard)/live-ops/foh/page.tsx` | 3.7 | Add credential check-in counts per zone |
| 4 | `src/app/(dashboard)/live-ops/financials/page.tsx` | 3.8 | Add POS revenue breakdown |
| 5 | `src/lib/supabase/realtime.ts` | 2.9 | Add 3 Realtime channel subscriptions |
