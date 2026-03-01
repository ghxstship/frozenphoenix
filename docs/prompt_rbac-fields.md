# WINDSURF PROMPT: Database Schema Audit, Data Field SSOT, Field-Level RBAC & Usage-Based Pricing Architecture — Frozen Phoenix (Production Command Center)

---

## CONTEXT

You are an enterprise data architect and full-stack systems engineer working inside the **Frozen Phoenix** codebase — a Next.js 16 + Supabase SaaS platform described as an "End-to-end client ecosystem for technical production, fabrication, and experiential agencies."

**Repository:** `ghxstship/frozenphoenix`
**Live deployment:** `frozenphoenix.vercel.app`

### Tech Stack (read directly from `package.json` and README)

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| State | Zustand + React Query |
| Styling | Tailwind CSS 4 |
| UI Components | Radix UI + shadcn/ui patterns |
| Forms | React Hook Form + Zod validation |
| Charts | Recharts |
| Hosting | Vercel |
| Quality | Vitest + ESLint + custom quality-gate config |

### Key File Paths (anchor your work to these)

```
frozenphoenix/
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql        ← PRIMARY SCHEMA — scan this first
├── src/
│   ├── app/(dashboard)/                  ← All protected routes / modules
│   ├── config/
│   │   ├── navigation.ts                 ← Sidebar nav structure
│   │   └── rbac.ts                       ← Current RBAC config
│   ├── lib/
│   │   └── supabase/
│   │       ├── database.types.ts         ← Auto-generated TypeScript types
│   │       ├── hooks.ts                  ← Data fetching hooks (shows field usage)
│   │       ├── client.ts                 ← Browser Supabase client
│   │       └── server.ts                 ← Server Supabase client
│   └── types/
│       └── index.ts                      ← Core type definitions
├── .quality-gate/                        ← Quality gate configs
├── docs/                                 ← Project documentation
├── scripts/                              ← Build/utility scripts
├── middleware.ts                         ← Auth middleware (route protection)
├── quality-gate.config.ts
└── vitest.config.ts
```

### Platform Modules (from `src/app/(dashboard)/` routes)

These are the actual dashboard routes in the codebase. Every module below maps to a route, a set of database tables, and a feature surface:

**Command Center**
- `dashboard/` — Real-time KPIs, active projects, overdue approvals
- `calendar/` — Unified view of projects, tasks, and milestones

**Commercial**
- `pipeline/` — CRM Pipeline: Kanban-style deal management (RFP → Bid → Contract → Onboarding → Advancing → Compliance → Training lifecycle)
- `people/` — Stakeholder matrix / Contacts CRM
- `brand-kit/` — Client brand guidelines repository
- `decks/` — Presentation decks (pitch decks, case study decks)
- `case-studies/` — Auto-published from completed projects

**Production**
- `projects/` — Full lifecycle management with phase tracking (draft → planning → scheduled → active → post_mortem → archived)
- `tasks/` — Granular task management with fabrication status tracking
- `scheduling/` — Crew shift scheduling and management
- `crew/` — Crew profiles, certifications, compliance gates
- `assets/` — Equipment/asset inventory with barcode tracking
- `fleet/` — Vehicle fleet management and dispatch
- `org-chart/` — Project-specific organizational charts

**Operations & Compliance**
- `vendors/` — Vendor vault: directory, COIs, scorecards, payment terms
- `procurement/` — Purchase requests, purchase orders, bid management
- `finance/` — Financial operations: budgets (est/actual/committed), invoicing, expense tracking, P&L
- `approvals/` — Milestone approval workflows

**Knowledge & Admin**
- `sops/` — Standard operating procedures
- `vault/` — Secure document storage
- `settings/` — User & org settings, billing, team management

### Existing Database Schema (from `supabase/migrations/`)

**Before you begin, read the actual migration file(s) in `supabase/migrations/`.** The current schema defines the following structure:

#### Enum Types (already defined)

```sql
-- Organization lifecycle
CREATE TYPE org_status AS ENUM ('active', 'suspended', 'pending_verification', 'deactivated');

-- Pricing tiers (THIS IS THE ACTUAL BILLING MODEL)
CREATE TYPE pricing_tier AS ENUM ('core', 'pro', 'enterprise');

-- Platform-wide roles
CREATE TYPE platform_role AS ENUM ('super_admin', 'platform_admin', 'organization_admin', 'member', 'guest');

-- Per-project roles
CREATE TYPE project_role AS ENUM ('owner', 'manager', 'contributor', 'crew', 'vendor', 'artist', 'guest_public', 'guest_ticketed');

-- User lifecycle
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending_invitation', 'suspended');

-- Production lifecycle
CREATE TYPE event_phase AS ENUM ('draft', 'planning', 'scheduled', 'active', 'post_mortem', 'archived');

-- Task workflow
CREATE TYPE task_status AS ENUM ('backlog', 'todo', 'in_progress', 'in_review', 'blocked', 'completed', 'cancelled');
CREATE TYPE task_priority AS ENUM ('critical', 'high', 'medium', 'low', 'none');

-- Asset lifecycle
CREATE TYPE asset_status AS ENUM ('available', 'checked_out', 'in_transit', 'maintenance', 'retired', 'lost');

-- Workflow engine
CREATE TYPE workflow_status AS ENUM ('draft', 'active', 'paused', 'completed', 'failed', 'cancelled');
CREATE TYPE workflow_trigger AS ENUM ('manual', 'on_create', 'on_update', 'on_delete', 'on_status_change', 'on_schedule', 'on_webhook', 'on_lifecycle_change');

-- Approvals
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'expired');

-- Notifications
CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'sms', 'push');

-- Audit trail
CREATE TYPE audit_action AS ENUM ('create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import', 'approve', 'reject');

-- Departments
CREATE TYPE department_type AS ENUM ('executive', 'creative', 'marketing', 'talent', 'technology', 'production', 'operations', 'experience', 'hospitality', 'entertainment', 'public_safety', 'accessibility', 'sustainability', 'other');

-- View engine
CREATE TYPE view_type AS ENUM ('list', 'table', 'board', 'calendar', 'timeline', 'gantt', 'workload', 'dashboard', 'activity', 'audit', 'public');
```

#### Table Groups (already defined)

**CORE TABLES:**
- `organizations` — Multi-tenant root (name, slug, status, pricing_tier, branding, settings)
- `user_profiles` — Extended user data linked to Supabase Auth
- `roles` — Role definitions per organization
- `departments` — Organizational departments (typed by `department_type`)
- `teams` — Team groupings within departments
- `team_memberships` — User-to-team assignments with `project_role`

**BUSINESS TABLES:**
- `projects` — Productions/events (lifecycle via `event_phase`, hierarchy via `parent_project_id`, venue data, settings JSONB)
- `tasks` — Task tracking (`task_status`, `task_priority`, assignees, dates)
- `subtasks` — Nested task breakdown
- `assets` — Equipment inventory (`asset_status`, type, tracking)
- `asset_types` — Asset classification taxonomy
- `documents` — File/document records
- `procedures` — SOPs and operational procedures
- `audit_logs` — System-wide audit trail (`audit_action`)
- `comments` — Polymorphic commenting system
- `attachments` — File attachments (linked to any entity)
- `approvals` — Approval workflow instances (`approval_status`)

**CONFIG TABLES:**
- `view_configs` — Saved view configurations per user/module
- `workflows` — Active workflow instances (`workflow_status`)
- `workflow_definitions` — Workflow templates (`workflow_trigger`)
- `permissions` — Permission definitions
- `pricing_tiers` — Tier metadata and feature flags
- `feature_flags` — Feature toggle system
- `theme_configs` — UI theme/branding per org
- `notifications` — Notification queue (`notification_channel`)
- `templates` — Reusable templates (budgets, timelines, safety plans, etc.)

### Industry Scope

Frozen Phoenix serves professionals across:

- **Experiential marketing agencies** — Brand activations, pop-ups, immersive experiences, product launches, sampling campaigns, mobile tours
- **Technical production companies** — Festivals, concerts, conferences, corporate events, sporting event activations, touring productions
- **Fabrication & scenic agencies** — Scenic design, environmental design, fabrication management, interactive installations, projection mapping
- **Venue operators** — Nightclubs, theaters, multi-use event spaces, convention centers, outdoor festival grounds
- **Touring & entertainment** — Concert touring, theatrical productions, traveling exhibitions, cruise ship entertainment
- **Brand & sponsorship management** — Sponsor fulfillment, hospitality programs, VIP experiences, influencer activations

Productions range from a 20-person intimate immersive theater piece to a multi-stage international festival with 400K+ attendees and multi-million dollar budgets spanning dozens of countries.

---

## MISSION

Execute a three-phase audit and architecture build across ALL database schemas in the `supabase/migrations/` directory. Each phase builds on the previous. Do not proceed to the next phase until the current phase is fully documented and validated.

**Start by reading the actual files:**
1. `supabase/migrations/001_initial_schema.sql` (and any subsequent migration files)
2. `src/types/index.ts`
3. `src/lib/supabase/database.types.ts`
4. `src/config/rbac.ts`
5. `src/lib/supabase/hooks.ts`

This gives you the ground truth of what exists before recommending what should exist.

---

## PHASE 1: Data Field Type Inventory — Centralized SSOT

### Objective
Scan every table in `supabase/migrations/`, every TypeScript type in `src/types/`, and every Supabase-generated type in `src/lib/supabase/database.types.ts`. Extract every field and classify it into a centralized Master Data Field Type Registry — the single source of truth for every field type in the Frozen Phoenix platform.

### Instructions

1. **Scan all existing database schemas.** For each table in the migrations, extract every column and classify its data type. Cross-reference with the TypeScript types to ensure frontend/backend alignment.

2. **Build the Master Data Field Type Registry** as a structured catalog with the following taxonomy:

```
FIELD_TYPE_ID (unique identifier)
├── Category (e.g., Identity, Temporal, Financial, Geospatial, Contact, Operational, Relational, Media, Compliance, Metric, Creative, Production)
├── Type Name (e.g., "UUID", "ISO_TIMESTAMP", "CURRENCY_AMOUNT", "EMAIL_ADDRESS", "GPS_COORDINATE", "CAD_FILE_REF", "UNION_CLASSIFICATION")
├── Base Data Type (maps to PostgreSQL: uuid, text, varchar, integer, numeric, boolean, timestamptz, jsonb, bytea, enum, uuid[] / array, uuid FK reference)
├── Validation Rules (regex patterns, min/max, allowed values, format masks, Zod schema reference)
├── Default Value (if applicable — match existing schema defaults)
├── Nullable (true/false)
├── Indexable (true/false, recommended index type: btree, gin, gist, pg_trgm)
├── Searchable (true/false, full-text via pg_trgm vs exact match)
├── PII Classification (none, personal, sensitive, restricted, regulated)
├── Encryption Requirement (none, at-rest via Supabase, column-level, field-level via pgcrypto)
├── Audit Trail Required (true/false — should this field trigger audit_logs entries on change)
├── RLS Policy Scope (org-scoped, project-scoped, user-scoped, public — maps to Supabase Row Level Security)
├── Industry Standard Reference (ISO, ANSI, W3C, IETF, ESTA, PLASA standard if applicable)
├── Module Usage (which dashboard routes use this type: pipeline, projects, tasks, crew, assets, fleet, vendors, finance, procurement, approvals, etc.)
├── RBAC Default Tier (core, pro, enterprise — maps to existing pricing_tier enum)
└── Description (human-readable explanation)
```

3. **Ensure completeness by cross-referencing against industry standards for:**
   - Live event production (ESTA/ANSI E1 standards, PLASA technical standards, rigging/power standards)
   - Venue management (IAVM standards, ADA compliance fields, fire marshal capacity standards)
   - Financial operations (PCI-DSS for payment fields, SOX compliance, GAAP/IFRS, ASC 606 revenue recognition)
   - Crew management (FLSA, I-9, W-9, 1099 field requirements, union regulations — IATSE, Teamsters, SAG-AFTRA)
   - Marketing & CRM (GDPR consent fields, CAN-SPAM, CCPA, brand compliance standards)
   - Ticketing & access control (barcode/QR standards, RFID/NFC identifiers, credential classification)
   - Logistics & fleet (shipping standards, DOT transport, customs/duty for international, vehicle tracking)
   - Health & safety (OSHA incident reporting, emergency contact standards, medical/allergy fields)
   - Hospitality & F&B (liquor license tracking, health department compliance, allergen data)
   - Media & content (EXIF metadata, rights management, usage licensing, resolution standards)
   - Geospatial / venue mapping (GeoJSON, coordinate systems, zone/sector identifiers, CAD reference)
   - Insurance & risk management (COI fields, liability classifications, additional insured requirements)
   - Permitting & government compliance (local/state/federal permit types, noise ordinances, fire watch)
   - Sustainability & environmental (carbon tracking, waste metrics, Leave No Trace compliance)
   - Creative & fabrication (material specifications, structural engineering sign-offs, scenic elements, AV signal flow)
   - Sponsorship & brand management (deliverable tracking, impression/reach metrics, proof-of-performance, exclusivity terms)

4. **Deduplicate aggressively.** If `email` appears in `organizations`, `user_profiles`, `contacts`, and `vendors` — there should be ONE canonical `EMAIL_ADDRESS` field type in the SSOT. Every instance references the same type ID.

5. **Output format:** Generate the Master Data Field Type Registry as:
   - `master-field-type-registry.json` — Structured SSOT schema (place in `docs/schema-audit/`)
   - `field-type-reference-guide.md` — Human-readable catalog with categories, descriptions, examples
   - Summary statistics: total unique field types, breakdown by category, PII distribution, encryption requirements, module coverage, RLS scope distribution

---

## PHASE 2: Schema Enrichment — Apply Field Library to Each Database Table

### Objective
Apply the Master Data Field Type Registry to every table in `supabase/migrations/`. Map each existing column to its canonical type, identify missing columns that industry standards require, and enrich every table to its highest possible level of professional/enterprise completeness.

### Instructions

1. **Map existing columns to canonical types.** For every column in every table:

```
FIELD_MAPPING:
├── Module Route: [dashboard | pipeline | projects | tasks | calendar | scheduling | crew | assets | fleet | vendors | finance | procurement | approvals | brand-kit | decks | people | org-chart | sops | vault | case-studies | settings]
├── Table Name (PostgreSQL)
├── Current Column Name
├── Current Data Type (as-is in migration SQL)
├── Mapped SSOT Field Type ID (from Phase 1)
├── Conformance Status: [COMPLIANT | NEEDS_MIGRATION | MISSING_VALIDATION | TYPE_MISMATCH | DEPRECATED]
├── Zod Schema Alignment: [ALIGNED | MISSING_ZOD | ZOD_MISMATCH] (check against React Hook Form + Zod validation in forms)
├── TypeScript Type Alignment: [ALIGNED | MISSING_TYPE | TYPE_MISMATCH] (check against database.types.ts and types/index.ts)
├── Migration Notes (what needs to change)
└── Priority: [CRITICAL | HIGH | MEDIUM | LOW]
```

2. **Gap analysis per table.** For each table, identify columns that SHOULD exist based on:
   - The entity type (e.g., `projects` table missing weather contingency fields, insurance policy refs, sustainability tracking, post-mortem scoring)
   - The route that consumes it (e.g., `fleet/` route implies vehicle inspection dates, mileage, DOT compliance, fuel tracking — are these columns present?)
   - Industry regulations (e.g., `crew` table missing I-9 verification status, union local affiliation, dietary restrictions, emergency contact)
   - Enterprise-grade requirements (e.g., missing `created_by`, `updated_by`, `deleted_at` soft-delete, `version` optimistic locking on tables that need them)
   - RLS completeness (every table needs `organization_id` for multi-tenant isolation — verify)

3. **Enrichment recommendations per table.** For each table, produce:

```
ENRICHMENT REPORT:
├── Table Name
├── Associated Route(s): [which src/app/(dashboard)/ routes consume this table]
├── Current Column Count
├── Recommended Column Count (after enrichment)
├── Columns to Add (with SSOT Field Type ID, justification, RBAC tier, Zod validation schema)
├── Columns to Rename (for naming convention consistency)
├── Columns to Re-type (data type corrections)
├── Columns to Deprecate (redundant or non-compliant)
├── Composite/Computed Fields to Add (derived metrics, calculated values)
├── Index Recommendations (new indexes, composite, full-text via pg_trgm, GIN for JSONB)
├── RLS Policy Recommendations (new or updated Row Level Security policies)
├── Relationship/FK Additions (cross-table references)
├── Supabase Realtime Candidates (which columns should trigger Supabase Realtime subscriptions)
└── Compliance Score: [0-100%] before and after enrichment
```

4. **Naming convention standardization.** Enforce consistency across ALL tables:
   - `snake_case` for all column names
   - Prefix/suffix conventions: `is_` for booleans, `_at` for timestamps, `_id` for FKs, `_count` for quantities, `_amount` for currency, `_url` for URLs, `_json` or JSONB type for structured data
   - Table naming: plural nouns, `snake_case`
   - Junction tables: `{table1}_{table2}` alphabetical
   - Enum naming: `snake_case`, matching existing enum style

5. **Cross-module relationship mapping.** Document every cross-table relationship:
   - `pipeline` deals → `projects` → `tasks` → `approvals`
   - `crew` profiles → `scheduling` shifts → `projects` assignments → `finance` labor costs
   - `vendors` records → `procurement` POs → `finance` payables → `approvals` sign-offs
   - `assets` inventory → `projects` allocations → `fleet` transport → `logistics`
   - `brand-kit` guidelines → `projects` deliverables → `decks` presentations → `case-studies`
   - `sops` procedures → `crew` training → `projects` compliance → `approvals`
   - Shared reference data: organizations, contacts, locations, currencies
   - Data flow direction (which table is system of record for each entity)

6. **TypeScript alignment.** For every schema change, specify:
   - Updated types for `src/types/index.ts`
   - Regeneration command for `src/lib/supabase/database.types.ts` (via Supabase CLI: `supabase gen types typescript`)
   - Updated Zod schemas for form validation
   - Updated React Query hooks in `src/lib/supabase/hooks.ts`

7. **Output format:**
   - Per-table enrichment report (one per table, placed in `docs/schema-audit/enrichment/`)
   - Cross-module relationship map (visual + structured data)
   - Migration priority matrix (what to fix first based on risk, compliance, operational impact)
   - New Supabase migration files (`supabase/migrations/002_schema_enrichment.sql`, etc.)
   - Updated TypeScript types

---

## PHASE 3: Field-Level RBAC & Usage-Based Pricing Architecture

### Objective
Design a field-level Role-Based Access Control system that maps directly to Frozen Phoenix's existing `pricing_tier` enum (`core`, `pro`, `enterprise`) and role enums (`platform_role`, `project_role`). Users are priced by data field access — not seats. Every field belongs to a tier, and tiers unlock progressively.

### Instructions

#### 3A: Field-Level RBAC Architecture

1. **Define the RBAC field access model (must integrate with existing `src/config/rbac.ts`):**

```
FIELD_ACCESS_CONTROL:
├── Field Type ID (from SSOT)
├── Access Tier: [CORE | PRO | ENTERPRISE]  ← maps directly to pricing_tier enum
├── Permission Level: [READ | WRITE | READ_WRITE | ADMIN | NONE]
├── Visibility: [VISIBLE | HIDDEN | REDACTED | MASKED]
│   ├── VISIBLE: Full field value displayed
│   ├── HIDDEN: Field not included in API response or UI render
│   ├── REDACTED: Field appears but value replaced with [REDACTED]
│   └── MASKED: Partial value shown (e.g., ****1234, j***@email.com)
├── Exportable: [true | false] (can this field be included in data exports)
├── API Accessible: [true | false] (available via Supabase client at this tier)
├── Audit Logged: [true | false] (triggers audit_logs entry on access)
├── RLS Enforced: [true | false] (enforce via Supabase Row Level Security vs application layer)
└── Override Allowed: [true | false] (can organization_admin grant access outside tier)
```

2. **Map to existing role enums.** The access profiles must align with the roles already defined in the schema:

```
ROLE → TIER MAPPING (using existing enums):

PLATFORM ROLES (platform_role):
├── super_admin     → ENTERPRISE (full access, all fields, all orgs)
├── platform_admin  → ENTERPRISE (full access, platform-scoped)
├── organization_admin → ENTERPRISE (full access, org-scoped)
├── member          → PRO or CORE (depends on org subscription)
└── guest           → CORE (minimum viable access)

PROJECT ROLES (project_role — contextual per production):
├── owner           → ENTERPRISE fields for that project
├── manager         → PRO fields for that project
├── contributor     → CORE + relevant PRO fields for assigned tasks
├── crew            → CORE fields (shifts, assignments, safety, check-in)
├── vendor          → CUSTOM: PO details, load-in schedule, COI requirements, payment status
├── artist          → CUSTOM: call times, rider status, payment status, hospitality
├── guest_public    → PUBLIC: event info, public schedule, venue directions
└── guest_ticketed  → PUBLIC + ticket-specific: assigned sections, credential level, access zones
```

**CRITICAL: A single user may hold DIFFERENT project_roles on DIFFERENT productions simultaneously.** Permission resolution must be contextual per production/project scope.

3. **Build the Field-to-Tier mapping matrix.** For EVERY field type in the SSOT, assign:
   - Minimum tier for READ access
   - Minimum tier for WRITE access
   - Whether included in tier's default view or explicitly enabled
   - Override rules (can org admin grant access to lower tier?)
   - RLS policy requirements (Supabase-native vs middleware)

4. **Design the permission resolution engine (must work with Supabase RLS + Next.js middleware):**

```
PERMISSION_RESOLUTION (integrate with middleware.ts + src/config/rbac.ts):
1. Supabase Auth → get user session + platform_role
2. Check user's organization → get org pricing_tier (from organizations table)
3. Check user's project assignment → get project_role for current context
4. Resolve: org_tier × platform_role × project_role → field access set
5. Apply field-level restrictions (PII, compliance, encryption)
6. Apply context-specific rules (which project, which module)
7. Conflict resolution: Most restrictive wins for sensitive fields, most permissive for operational
8. Cache via React Query (invalidate on role/tier change via Supabase Realtime)
9. Filter Supabase query .select() to only include accessible columns
```

**Implementation approach:** Leverage Supabase RLS policies for row-level access (already multi-tenant via `organization_id`). Layer field-level filtering in the application via:
- Server-side: Next.js Server Components / Route Handlers filter response fields
- Client-side: Zustand store holds resolved field permissions, React Query selectors strip inaccessible fields
- Hooks: Extend `src/lib/supabase/hooks.ts` with field-aware query builders

#### 3B: Usage-Based Pricing Architecture

1. **Map to existing `pricing_tier` enum (`core`, `pro`, `enterprise`):**

```
PRICING MODEL (aligns with existing schema):

CORE (Free tier — already defined in pricing_tier enum):
├── Price: $0 / included
├── Field Access: Core fields (~20-30%)
├── Purpose: Minimum viable access for crew, day-of staff, basic coordination
├── Users: Unlimited (onboard entire crews/volunteer workforces at zero cost)
├── API: Read-only, standard rate limits
├── Export: Basic CSV for accessible fields
├── Key bundles available as paid add-ons:
│   ├── PRODUCTION_OPS_BUNDLE: run-of-show, task management, scheduling, crew coordination
│   ├── CREATIVE_WORKFLOW_BUNDLE: asset management, review/approval workflows, version tracking
│   └── LOGISTICS_BUNDLE: equipment tracking, transportation, load-in/load-out
└── Revenue model: Funnel — get everyone in, upsell from field access patterns

PRO ($79/user/month — already defined):
├── Field Access: Core + Pro fields (~50-75%)
├── Purpose: Full production management, client-facing ops, cross-functional oversight
├── Includes all CORE bundles plus:
│   ├── FINANCE_BUNDLE: budgets (est/actual/committed), P&L, invoicing, purchase orders, cost coding
│   ├── VENDOR_BUNDLE: contracts, COIs, vendor scorecards, procurement workflows, bid management
│   ├── COMPLIANCE_BUNDLE: permits, insurance, OSHA plans, safety documentation, regulatory tracking
│   ├── ANALYTICS_BUNDLE: production metrics, client profitability, resource utilization, custom dashboards
│   └── TALENT_BUNDLE: crew rate cards, contractor management, availability/booking, certification tracking
├── API: Elevated rate limits, webhook support, Supabase Realtime subscriptions
└── Export: All formats, scheduled reports

ENTERPRISE ($1,499+/month org-wide — already defined):
├── Field Access: All fields (~95-100%)
├── Purpose: Full organizational visibility, portfolio management, strategic oversight
├── Includes all PRO bundles plus:
│   ├── EXECUTIVE_BUNDLE: portfolio analytics, agency margin analysis, strategic projections
│   ├── LEGAL_BUNDLE: contract management, IP/rights tracking, liability analysis
│   ├── AUDIT_BUNDLE: full audit trails, compliance evidence, SOC 2 documentation
│   ├── PII_BUNDLE: full PII access with enhanced logging and consent management
│   └── INTEGRATION_BUNDLE: unlimited API, custom integrations, data warehouse sync, white-label
├── API: Unlimited, priority support
├── Export: All formats, bulk, data warehouse connectors
└── Custom: White-label, custom field creation, custom tier definitions
```

2. **Field bundle architecture:**

```
FIELD_BUNDLE_SYSTEM:
├── Bundles are groups of related field types sold as add-ons within a tier
├── Each bundle has a clear use-case justification (not arbitrary grouping)
├── Bundles can be purchased independently (with minimum tier requirement)
├── Bundle pricing: flat monthly per bundle, or metered by access volume
├── Cross-tier safety exception: SAFETY_BUNDLE fields available at CORE (never paywalled)
├── Custom bundles: Enterprise clients define custom field groupings
└── Trial access: 14-day trial for any bundle to drive conversion
```

3. **Metering and usage tracking (store in Supabase):**

```
USAGE_METERING:
├── Track per-user field access (which fields, frequency, read vs write)
├── Track per-organization aggregate usage
├── Identify underutilized bundles → recommend downgrade
├── Identify over-accessed restricted fields → suggest upgrade
│   ("You accessed 47 Pro-tier fields last month. Upgrade to unlock permanent access.")
├── API call tracking per tier
├── Export volume tracking
├── Real-time usage dashboard (settings/ route, org admin view)
└── Store in: usage_metrics table + Supabase Edge Functions for aggregation
```

4. **Upsell triggers (implement as Supabase Edge Functions or Next.js API routes):**

```
UPSELL_TRIGGERS:
├── User repeatedly hits field access restrictions → suggest tier upgrade
├── User exports data but missing key fields → suggest relevant bundle
├── Org has 80%+ users at one tier → suggest org-wide upgrade discount
├── Seasonal spikes (festival season, Q4 activations) → temporary tier upgrades
├── New compliance requirement detected → suggest compliance bundle
├── Multi-module usage (Projects + Finance + Vendors) → suggest integrated bundle
├── Client-facing needs (sharing externally) → suggest Custom tier for client seats
└── Custom field requests → suggest Enterprise
```

#### 3C: Implementation Schema

1. **Generate new Supabase migration(s) for the RBAC + pricing tables:**

```sql
-- New tables to add (supabase/migrations/003_rbac_pricing.sql):
field_type_registry          -- The SSOT from Phase 1
field_tier_assignments       -- Maps field types to pricing_tier enum values
field_bundles                -- Bundle definitions
bundle_field_mappings        -- Which fields are in which bundles
role_field_overrides         -- Per-role field access exceptions
user_subscriptions           -- User's current tier + active bundles
org_subscriptions            -- Org-level tier + bundle subscriptions
field_access_log             -- Audit trail of field-level access (extends audit_logs)
usage_metrics                -- Aggregated usage for billing/analytics
permission_cache             -- Resolved permissions cache (JSONB, invalidated via triggers)
org_field_overrides          -- Org admin custom field grants
plan_definitions             -- Pricing plan metadata
plan_tier_mappings           -- Which tiers/bundles each plan includes
billing_usage_records        -- Metered usage for billing
```

**All new tables must include:**
- `organization_id` FK with RLS policy
- `created_at`, `updated_at` timestamps with triggers
- `deleted_at` for soft-delete
- Appropriate indexes

2. **Generate the permission resolution middleware** that integrates with:
   - `middleware.ts` — Route-level protection (already exists, extend for field context)
   - `src/config/rbac.ts` — Extend with field-level permission definitions
   - `src/lib/supabase/hooks.ts` — Field-aware React Query hooks
   - Supabase RLS policies — Row-level enforcement
   - Server Components — Field filtering before render

3. **Generate the API routes** (Next.js App Router handlers in `src/app/api/`):
   - `GET /api/fields/accessible` — User's accessible field set
   - `GET /api/fields/tier/:tier` — All fields in a tier
   - `GET /api/bundles/available` — Purchasable bundles for current tier
   - `POST /api/bundles/subscribe` — Subscribe to a bundle
   - `GET /api/usage/me` — User's field usage metrics
   - `GET /api/usage/org` — Org-level usage (org admin only)
   - `GET /api/permissions/resolve` — Fully resolved permissions for current user + context

---

## OUTPUT REQUIREMENTS

### Deliverables (place in `docs/schema-audit/` directory):

1. **`master-field-type-registry.json`** — Complete SSOT (Phase 1)
2. **`field-type-reference-guide.md`** — Human-readable catalog (Phase 1)
3. **`enrichment/`** — Directory of per-table enrichment reports (Phase 2)
4. **`module-relationship-map.md`** — Cross-module entity relationships (Phase 2)
5. **`migration-priority-matrix.md`** — Prioritized schema changes (Phase 2)
6. **`supabase/migrations/002_schema_enrichment.sql`** — Enrichment migration (Phase 2)
7. **`rbac-field-access-matrix.json`** — Field-to-tier-to-role mapping (Phase 3)
8. **`pricing-tier-architecture.md`** — Full pricing model documentation (Phase 3)
9. **`field-bundle-definitions.json`** — Bundle compositions (Phase 3)
10. **`supabase/migrations/003_rbac_pricing.sql`** — RBAC + pricing tables (Phase 3)
11. **`src/lib/permissions/field-resolver.ts`** — Permission resolution engine (Phase 3)
12. **`src/app/api/`** — API route handlers for RBAC/pricing endpoints (Phase 3)
13. **`implementation-roadmap.md`** — Phased plan with dependencies and effort estimates

### Quality Standards:

- Every field type must have a unique ID, validation rule, PII classification, and Zod schema
- Every column in every table must map to exactly one SSOT field type
- Every field must have a tier assignment and RBAC configuration
- No orphaned fields (columns that exist in migrations but not in SSOT)
- No phantom fields (SSOT entries that don't map to any table)
- Cross-module relationships must be bidirectional and documented
- Naming conventions must be 100% consistent with existing schema style
- All new tables must have RLS policies
- All new columns must have corresponding TypeScript types
- Compliance fields must reference specific regulatory standards
- Pricing tiers must align with existing `pricing_tier` enum (core/pro/enterprise)
- Bundle compositions must be justified by use-case

### Validation Checklist:

Before delivering, verify:
- [ ] All migration files in `supabase/migrations/` scanned
- [ ] All TypeScript types in `src/types/index.ts` cross-referenced
- [ ] All Supabase hooks in `src/lib/supabase/hooks.ts` reviewed for field usage patterns
- [ ] Total unique field types cataloged and counted
- [ ] Every existing column mapped to SSOT type
- [ ] Gap analysis complete for every table
- [ ] Enrichment recommendations include regulatory justification
- [ ] RBAC matrix covers all field types × all role combinations (platform_role × project_role)
- [ ] Pricing tiers match existing enum values (core/pro/enterprise)
- [ ] Bundle definitions are use-case driven
- [ ] Permission resolution integrates with existing middleware.ts and rbac.ts
- [ ] New Supabase migrations are valid SQL (test with `supabase db push --dry-run`)
- [ ] TypeScript types regenerated and aligned
- [ ] Zod validation schemas created for all new fields
- [ ] React Query hooks updated for field-aware queries
- [ ] Cross-module data flow direction documented for every shared entity

---

## EXECUTION NOTES

- **Read the actual files first.** Start with `supabase/migrations/`, then `src/types/`, then `src/config/rbac.ts`, then `src/lib/supabase/hooks.ts`. Catalog what EXISTS before recommending what SHOULD exist.
- When enriching schemas, justify every addition with specific industry standards or regulatory requirements — no padding.
- The CORE tier must be genuinely useful (not crippled) while making PRO/ENTERPRISE obviously valuable.
- Field-level RBAC must be performant — leverage Supabase RLS for row-level, application layer for field-level. Cache resolved permissions in Zustand store, invalidate via Supabase Realtime subscriptions.
- A single user may hold DIFFERENT `project_role` values on DIFFERENT productions — permissions MUST be contextual per project scope.
- External stakeholders (`vendor`, `artist`, `guest_public`, `guest_ticketed` project roles) get curated field views — only what's relevant to their relationship.
- The system is multi-tenant — `organization_id` scopes everything. Different orgs may have different pricing tiers and custom field requirements.
- **Safety-critical fields must NEVER be paywalled** — any field required for life safety, emergency response, or regulatory compliance must be accessible at CORE tier minimum.
- Think of fields as the atomic unit of value — the entire business model is built on providing the RIGHT data to the RIGHT person at the RIGHT time at the RIGHT price.
- The platform must handle the chaos of live production — schemas should account for real-time status changes, last-minute crew swaps, weather pivots, and general entropy. Design for Supabase Realtime where status fields change frequently.
- All new code must follow existing patterns: React Hook Form + Zod for forms, React Query for data fetching, Zustand for client state, shadcn/ui for components, Tailwind CSS 4 for styling.

---

*This prompt is designed for use with Windsurf/Cascade AI. Feed the entire prompt as a single instruction. Ensure the `ghxstship/frozenphoenix` repository is open in the workspace so Cascade can directly read migration files, TypeScript types, and existing RBAC config. If migration files don't yet contain all tables referenced by dashboard routes, Cascade should generate the missing table definitions as part of Phase 2 enrichment.*