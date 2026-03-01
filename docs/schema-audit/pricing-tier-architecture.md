# Frozen Phoenix — Pricing Tier Architecture

> **Version:** 1.0.0 | **Aligned with:** `pricing_tier` enum (core, pro, enterprise)
> **Source:** RBAC Field Access Matrix + Master Data Field Type Registry

---

## 1. Tier Model Overview

The pricing model is **field-access-driven**: users pay for the breadth and depth of data they can access, not per-seat or per-project. Every field in the platform maps to exactly one pricing tier. Organizations subscribe to a tier, and all members inherit that tier's field access.

### Design Principles

- **Safety-critical fields are NEVER paywalled** — emergency contacts, certifications, permits, compliance status, hazmat flags are always CORE
- **Core tier is fully functional** — a production company can run projects end-to-end on Core
- **Pro unlocks operational efficiency** — analytics, advanced scheduling, financial detail, spatial data
- **Enterprise unlocks governance** — custom RBAC, audit trails, compliance dashboards, sensitive PII

---

## 2. Tier Definitions

### CORE (Default)

| Attribute | Value |
|---|---|
| **Target User** | Small production companies, freelance PMs |
| **Field Count** | 98 of 168 field types (58%) |
| **Key Capabilities** | Project management, task tracking, basic CRM, crew scheduling, asset tracking, invoicing, approvals, notifications, basic reporting |
| **Categories Included** | Identity, Text, PII (Contact), PII (Emergency), Address, Temporal, Enumeration, Boolean, Boolean (Safety), Numeric, URL, Audit, Compliance |
| **Limitations** | No JSONB/array fields, no spatial/IoT, no workflow automation, no custom RBAC, no financial analytics |

### PRO

| Attribute | Value |
|---|---|
| **Target User** | Mid-size agencies, multi-project operations |
| **Field Count** | 48 additional field types (total: 146, 87%) |
| **Key Capabilities** | Everything in Core + financial detail (budgets, GL accounts, 3-way matching), advanced scheduling, barcode/QR scanning, JSONB configs, array fields, spatial/media/IoT, workflow automation, feature flags, settings management |
| **Categories Added** | Financial (Standard), JSON/JSONB, Array, Settings/Flags, Spatial/Media/IoT, Workflow |
| **Unlock Trigger** | First use of budgets module, first barcode scan, first custom workflow |

### ENTERPRISE

| Attribute | Value |
|---|---|
| **Target User** | Large agencies, venue operators, multi-org enterprises |
| **Field Count** | 22 additional field types (total: 168, 100%) |
| **Key Capabilities** | Everything in Pro + sensitive financial data (margins, internal rates, pay rates), regulated PII (SSN, tax ID), custom RBAC, security management, audit/compliance dashboards |
| **Categories Added** | PII (Regulated), Financial (Sensitive), Financial (Pay Rates), RBAC, Security |
| **Unlock Trigger** | First custom role creation, first payroll batch, first compliance audit |

---

## 3. Metering & Usage Tracking

### 3.1 What Gets Metered

| Metric | Granularity | Storage |
|---|---|---|
| **Field access events** | Per-field-type per-user per-day | `field_usage_events` table (aggregated daily) |
| **API calls by tier** | Per-endpoint per-org per-hour | `api_usage_metrics` table |
| **Export events** | Per-export per-org | `export_audit_log` table |
| **Storage usage** | Per-org (Supabase Storage) | Supabase dashboard |
| **Realtime connections** | Per-org concurrent | Supabase dashboard |

### 3.2 Metering Architecture

```
Request → Middleware (auth) → Permission Resolver → Field Resolver
                                                      │
                                                      ├─ Resolve visibility per field
                                                      ├─ Log usage event (async, non-blocking)
                                                      └─ Return masked/filtered response
```

Usage events are **fire-and-forget** — they never block the request path. Daily aggregation runs via Supabase cron (pg_cron) to compute usage summaries.

### 3.3 Usage Event Schema

```sql
field_usage_events (
  id UUID PK,
  organization_id UUID FK NOT NULL,
  user_id UUID FK NOT NULL,
  field_type_id TEXT NOT NULL,
  action TEXT NOT NULL,  -- 'read' | 'write' | 'export'
  resource TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  event_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

Daily aggregation into `field_usage_daily`:
```sql
field_usage_daily (
  id UUID PK,
  organization_id UUID FK NOT NULL,
  field_type_id TEXT NOT NULL,
  action TEXT NOT NULL,
  total_count INTEGER,
  unique_users INTEGER,
  event_date DATE,
  pricing_tier TEXT NOT NULL
)
```

---

## 4. Upsell Triggers

### 4.1 Soft Gates (UI Prompts)

| Trigger | Current Tier | Target Tier | UX Treatment |
|---|---|---|---|
| User navigates to Budgets detail | Core | Pro | Blurred overlay + "Unlock financial analytics with Pro" |
| User tries to scan a barcode | Core | Pro | Modal: "Barcode scanning requires Pro" |
| User opens Workflow builder | Core | Pro | Feature card: "Automate approvals with Pro" |
| User tries to view pay rates | Pro | Enterprise | REDACTED field + tooltip: "Upgrade to Enterprise" |
| User attempts custom role creation | Pro | Enterprise | Modal: "Custom RBAC requires Enterprise" |
| User runs compliance audit | Pro | Enterprise | Feature card: "SOC2 dashboards with Enterprise" |

### 4.2 Hard Gates (API Enforcement)

Fields above the org's tier are **HIDDEN** at the API level — they are stripped from responses entirely. This is enforced by the `field-resolver.ts` permission engine, not by UI-only logic.

### 4.3 Usage-Based Upsell Signals

| Signal | Threshold | Action |
|---|---|---|
| Daily field access attempts against Pro fields | > 10/day for 3 days | In-app notification: "You've been using Pro features" |
| Export attempts on hidden fields | > 5 in a week | Email to org admin: "Unlock full exports" |
| API calls returning tier_insufficient | > 50/day | Slack webhook to sales team |
| Org user count growth | > 10 active users on Core | In-app banner: "Growing teams love Pro" |

---

## 5. Field Bundles

Bundles group related field types into purchasable units for organizations that need specific capabilities without a full tier upgrade. See `field-bundle-definitions.json` for the complete bundle catalog.

### Bundle Model

- An org subscribes to a **base tier** (Core, Pro, Enterprise)
- Optionally purchases **add-on bundles** that unlock specific field type groups
- Bundles are scoped to the organization, not individual users
- Bundle access is checked by `field-resolver.ts` alongside tier access

### Bundle vs Tier Decision Tree

```
Is the field in the org's base tier? → YES → VISIBLE
                                       NO  → Is it in an active bundle? → YES → VISIBLE
                                                                           NO  → HIDDEN (upsell)
```

---

## 6. Subscription Management Tables

### Core Tables (in migration 031_rbac_pricing.sql)

| Table | Purpose |
|---|---|
| `org_subscriptions` | Active subscription per org (tier, billing cycle, status) |
| `org_bundle_subscriptions` | Active add-on bundles per org |
| `field_tier_assignments` | SSOT mapping: field_type_id → pricing_tier |
| `field_bundles` | Bundle definitions (name, description, included field types) |
| `field_bundle_items` | Junction: bundle → field_type_id |
| `field_usage_events` | Raw usage events (append-only) |
| `field_usage_daily` | Aggregated daily usage summaries |
| `upsell_triggers` | Configured upsell rules and thresholds |
| `upsell_events` | Fired upsell events for tracking conversion |

---

## 7. Integration with Existing Infrastructure

### 7.1 middleware.ts

No changes needed — session management only. Field resolution happens at the API route level.

### 7.2 src/config/rbac.ts

The existing `FIELD_VISIBILITY_MASKS` and `isFieldVisible()` become **fallback** behavior. The new `field-resolver.ts` is the canonical authority:

```
Request flow:
1. middleware.ts → session refresh
2. API route → withPermission() → resource-level auth
3. API route → resolveFieldAccessBatch() → field-level auth
4. API route → applyFieldMasking() → response filtering
```

### 7.3 src/lib/supabase/hooks.ts

React Query hooks gain a `useFieldAccess(resource)` companion hook that resolves client-side field visibility for UI rendering (column hiding, blur overlays, upsell CTAs).

### 7.4 Supabase RLS

RLS policies continue to handle **row-level** isolation (org_id scoping). **Field-level** masking is handled application-side by `field-resolver.ts` because PostgreSQL column-level security is impractical at this scale.

---

## 8. Revenue Model Projections

| Tier | Monthly Price (est.) | Field Access | Seats | Projects |
|---|---|---|---|---|
| Core | $0 (free) or $49/mo | 98 field types | Unlimited | 3 active |
| Pro | $199/mo | 146 field types | Unlimited | Unlimited |
| Enterprise | $499/mo + custom | 168 field types | Unlimited | Unlimited |

| Bundle | Monthly Price (est.) | Fields Unlocked |
|---|---|---|
| Financial Analytics | $79/mo | 6 field types (FT-FIN-001..006) |
| Spatial & IoT | $59/mo | 7 field types (FT-GEO, FT-IOT) |
| Workflow Automation | $49/mo | 5 field types (FT-WF-001..005) |
| Advanced Compliance | $99/mo | 8 field types (FT-COMP + audit) |

---

## 9. Compliance Constraints

- **GDPR Art. 17 (Right to Erasure):** Field-level masking must support data deletion requests regardless of tier
- **SOC2 CC6.1:** Tier assignment changes must be audit-logged
- **PCI-DSS:** Payment-related fields (if added) must always be enterprise-tier with encryption
- **Safety:** Fields tagged `safety_critical: true` are exempt from all tier restrictions
