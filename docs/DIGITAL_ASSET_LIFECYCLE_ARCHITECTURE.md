# Digital Asset Lifecycle Management Architecture

**Version:** 1.0  
**Date:** 2026-02-25  
**Status:** Architecture Specification  
**Scope:** Enterprise-grade digital asset governance across the full operational hierarchy

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current-State Repository Audit Map](#2-current-state-repository-audit-map)
3. [Gap Analysis & Structural Findings](#3-gap-analysis--structural-findings)
4. [Asset Classification Taxonomy Framework](#4-asset-classification-taxonomy-framework)
5. [Future-State Digital Asset Architecture](#5-future-state-digital-asset-architecture)
6. [Metadata Schema (3NF Compliant)](#6-metadata-schema-3nf-compliant)
7. [Entity Relationship Model](#7-entity-relationship-model)
8. [Version Control Strategy](#8-version-control-strategy)
9. [Access Control Model (RBAC + Inheritance)](#9-access-control-model-rbac--inheritance)
10. [Retention & Archival Policy Model](#10-retention--archival-policy-model)
11. [Asset Dependency Matrix](#11-asset-dependency-matrix)
12. [UI/UX Simplification Principles](#12-uiux-simplification-principles)
13. [Automation & AI Augmentation Roadmap](#13-automation--ai-augmentation-roadmap)
14. [Implementation Roadmap](#14-implementation-roadmap)

---

## 1. Executive Summary

### 1.1 Scope

This document defines the enterprise architecture for managing **all digital assets** across the Frozen Phoenix platform — from contracts and permits to CAD files, media libraries, SOPs, and knowledge base articles. The system must scale across multi-market, multi-client operations while maintaining strict SSOT discipline, full auditability, and cognitive simplicity for non-technical users.

### 1.2 Critical Findings

| # | Finding | Severity | Category |
|---|---------|----------|----------|
| F1 | **7 parallel document storage systems** with no unified metadata layer | Critical | SSOT Violation |
| F2 | **No file storage abstraction** — URLs stored as raw TEXT across 15+ tables | Critical | Architecture |
| F3 | **Version control fragmented** — `document_versions` exists for docs only; SOPs, contracts, KB articles, tech sheets all lack proper versioning | Critical | Data Integrity |
| F4 | **No structured taxonomy** — categories are hardcoded ENUMs per table with no unified classification | High | Discoverability |
| F5 | **Access control is role-level only** — `vault_documents.access_level` uses 4 roles; no inheritance from project hierarchy | High | Security |
| F6 | **No retention/expiration policies** — certifications have `expiry_date` but contracts, permits, compliance docs lack automated lifecycle management | High | Compliance |
| F7 | **Attachment references are opaque UUID arrays** — `incidents.attachment_ids`, `kb_articles.attachment_ids` point to nothing queryable | High | Referential Integrity |
| F8 | **No metadata standardization** — no tagging system, no full-text search support, no MIME-type normalization | Medium | Discoverability |
| F9 | **Media assets have no dedicated surface** — photos, videos, 3D files share the same undifferentiated vault | Medium | UX |
| F10 | **Template instantiation is manual** — `document_templates` exist but no instantiation workflow | Medium | Automation |
| F11 | **No dependency locking** — permits can be approved without stamped drawings | Medium | Workflow |
| F12 | **3 parallel SOP systems** with different schemas | High | SSOT Violation |

### 1.3 Recommendation Summary

| Priority | Action | Eliminates |
|----------|--------|------------|
| P0 | Unified `digital_assets` metadata table as SSOT for all file references | F1, F4, F7, F8 |
| P0 | File storage abstraction layer (`storage_objects` + provider config) | F2 |
| P0 | Universal version control system (`asset_versions`) | F3 |
| P1 | Structured taxonomy with hierarchical categories + tags | F4, F8, F9 |
| P1 | Inheritance-based access control with project hierarchy propagation | F5 |
| P1 | Asset dependency graph with prerequisite locking | F11 |
| P2 | Retention policy engine with automated expiration/archival | F6 |
| P2 | Knowledge consolidation: merge SOPs + production_sops + KB | F12 |
| P3 | AI-powered auto-tagging, contextual search, smart recommendations | F8, F10 |

---

## 2. Current-State Repository Audit Map

### 2.1 Inventory of Document/Asset Storage Surfaces

The codebase contains **7 distinct storage surfaces**:

| # | Table | Migration | Purpose | Version Control | Access Model |
|---|-------|-----------|---------|----------------|--------------|
| 1 | `vault_documents` | 001 | General file vault | None | `access_level` (4 roles) |
| 2 | `documents` | 005 | Collaborative docs (Notion-style) | `document_versions` table | `shared_with_user_ids[]`, `is_public` |
| 3 | `document_templates` | 005 | Doc templates | None | Org-scoped |
| 4 | `knowledge_base_articles` | 003 | KB articles, SOPs, guides | `version` INT (no snapshots) | Org-scoped |
| 5 | `sops` | 001 | Standard operating procedures | `version` TEXT (no snapshots) | Org-scoped |
| 6 | `production_sops` | 003 | Production-specific SOPs | `version` INT (no snapshots) | Org + department |
| 7 | `contracts` | 003 | Legal contracts | `amendment_ids[]` (opaque) | Org-scoped |

### 2.2 Scattered File URL References (18+ tables)

| Table | Column(s) | Asset Type |
|-------|-----------|-----------|
| `certifications` | `document_url` | Certification scans |
| `expenses` | `receipt_url` | Receipt images |
| `production_expenses` | `receipt_url` | Receipt images |
| `approvals` | `deliverable_url` | Deliverable files |
| `case_studies` | `hero_image` | Marketing images |
| `brand_kits` | `logo_url`, `guidelines` | Brand assets |
| `tech_sheets` | `floor_plan_url`, `rigging_plot_url`, `electrical_diagram_url` | Engineering drawings |
| `contracts` | `document_url` | Legal PDFs |
| `vendor_compliance_docs` | `document_url` | Compliance documents |
| `work_orders` | `completion_photos[]` | Job photos |
| `vendor_communications` | `attachment_urls[]` | Message attachments |
| `incidents` | `attachment_ids[]` | Incident evidence |
| `organizations` | `logo_url` | Org logos |
| `profiles` | `avatar_url` | User avatars |
| `crew_members` | `avatar_url` | Crew photos |
| `companies` | `logo_url` | Client logos |

### 2.3 Entity Hierarchy for Asset Scoping

```
Organization (tenant root)
├── Global Assets (templates, SOPs, brand guidelines, policies)
├── Company/Account
│   └── Company-scoped docs (contracts, NDAs, brand kits)
├── Project
│   ├── Project-scoped docs (SOWs, budgets, proposals, schedules)
│   ├── Location → Location docs (site maps, permits, floor plans)
│   ├── Activation → Activation docs (tech riders, rigging plots)
│   ├── Event → Event docs (call sheets, run-of-show)
│   └── Task → Task attachments (deliverables, reference files)
├── Vendor → Vendor docs (COI, W9, NDA, compliance docs)
├── Crew Member / Worker → Worker docs (certifications, IDs)
└── Department → Department KB (SOPs, training materials)
```

### 2.4 Current-State Lifecycle Summary by Category

| Category | Tables | Lifecycle Stages Present | Key Gaps |
|----------|--------|------------------------|----------|
| Contracts & Legal | `contracts`, `e_signatures` | draft→review→signature→active→expired | No version history; `amendment_ids[]` opaque; no COI dependency |
| Permits & Certs | `certifications` | issued→expiry tracking | No permit entity; certs crew-only; no approval workflow |
| Engineering Docs | `tech_sheets` | draft→reviewed→approved→distributed | Bare URL columns; no CAD support; no revision tracking |
| Collaborative Docs | `documents`, `document_versions` | draft→review→published→archived | Best implementation; lacks tags, FTS, file attachments |
| SOPs & Training | `sops`, `production_sops`, `knowledge_base_articles` | draft→active/published→archived | 3 parallel systems; inconsistent schemas; fragmented search |
| Financial Docs | `invoices`, `client_invoices`, `expenses` | draft→sent→paid | No PDF archive; receipt URLs unmanaged |
| Brand & Creative | `brand_kits`, `decks` | Mutable (no lifecycle) | No version control; no media library; no creative file mgmt |

---

## 3. Gap Analysis & Structural Findings

### 3.1 SSOT Violations (7)

| # | Violation | Tables Affected |
|---|-----------|----------------|
| S1 | 3 parallel SOP systems | `sops`, `production_sops`, `knowledge_base_articles` (category='sop') |
| S2 | 2 parallel compliance doc systems | `vendor_compliance_docs` (008), `worker_compliance_docs` (011) |
| S3 | File URLs scattered across 18+ tables | See §2.2 |
| S4 | Template references disconnected | `documents.template_id`, `production_sops.training_material_ids[]`, `checklist_templates` |
| S5 | Version tracking inconsistent | `document_versions` (snapshots) vs `sops.version` (TEXT) vs `kb_articles.version` (INT, no snapshots) |
| S6 | Category taxonomies fragmented | `document_category` ENUM, `document_type` ENUM, vault `category` CHECK, `compliance_doc_type` ENUM |
| S7 | Attachment arrays opaque | `incidents.attachment_ids[]`, `kb_articles.attachment_ids[]`, `production_sops.training_material_ids[]` |

### 3.2 Version Control Gaps (6)

| # | Gap | Risk |
|---|-----|------|
| V1 | Contracts: no content versioning | Cannot audit contract changes |
| V2 | Tech sheets: version field but no snapshots | Lost revision history |
| V3 | SOPs: no content snapshots | Cannot rollback or diff |
| V4 | KB articles: increment version, don't snapshot | No audit trail for policy changes |
| V5 | Brand kits: no version control | Brand changes invisible |
| V6 | Proposals: parent chain but no diff tracking | Cannot compare revisions |

### 3.3 Access Control Vulnerabilities (5)

| # | Vulnerability | Risk |
|---|--------------|------|
| A1 | Vault uses flat 4-role hierarchy | All PMs see all vault docs |
| A2 | Documents use manually-maintained array sharing | No project membership inheritance |
| A3 | No document-level audit trail | Compliance risk for legal/financial docs |
| A4 | Expiring links have no access logging | Cannot verify who accessed |
| A5 | Client/vendor portal access unscoped | Cannot restrict to specific project docs |

### 3.4 Discoverability Friction (5)

| # | Friction | Impact |
|---|---------|--------|
| D1 | No full-text search across surfaces | Cannot find docs across systems |
| D2 | No unified tag system | Inconsistent filtering |
| D3 | No MIME-type based filtering | Cannot filter by "all PDFs" |
| D4 | No "recently viewed" tracking | Cannot find recently used files |
| D5 | No contextual asset surfacing | Assets siloed in separate nav sections |

---

## 4. Asset Classification Taxonomy Framework

### 4.1 Two-Dimensional Classification

Every digital asset is classified along two axes:
- **Axis 1: Asset Class** (what the file fundamentally is)
- **Axis 2: Functional Domain** (what business purpose it serves)

### 4.2 Asset Class Hierarchy (dot-notation, 2 levels)

```
document.contract | document.proposal | document.scope_of_work | document.estimate
document.invoice | document.purchase_order | document.budget | document.report
document.correspondence | document.general

legal.permit | legal.license | legal.certification | legal.insurance_certificate
legal.nda | legal.msa | legal.w9_w8 | legal.compliance_doc

engineering.floor_plan | engineering.rigging_plot | engineering.electrical_diagram
engineering.structural_drawing | engineering.cad_file | engineering.rendering_3d
engineering.bim_model | engineering.technical_spec

creative.design_file | creative.brand_guideline | creative.logo | creative.typography
creative.color_palette | creative.mockup | creative.presentation | creative.deck

media.photo | media.video | media.audio | media.animation | media.livestream_recording

production.call_sheet | production.run_of_show | production.tech_rider
production.production_schedule | production.load_plan | production.site_map

knowledge.sop | knowledge.policy | knowledge.guide | knowledge.training_material
knowledge.checklist_template | knowledge.form_template | knowledge.wiki | knowledge.reference

financial.invoice_pdf | financial.receipt | financial.expense_report
financial.budget_export | financial.tax_document | financial.payment_proof

identity.avatar | identity.org_logo | identity.client_logo | identity.signature
```

### 4.3 Functional Domain Tags

| Domain | Example Assets |
|--------|---------------|
| `sales` | Proposals, estimates, case studies |
| `legal` | Contracts, NDAs, permits, COIs |
| `production` | Tech riders, call sheets, run-of-show |
| `creative` | Logos, brand guidelines, mockups |
| `finance` | Invoices, receipts, budgets |
| `hr` | Certifications, training materials |
| `operations` | SOPs, checklists, policies |
| `logistics` | Load plans, shipping docs |
| `client_facing` | Deliverables, presentations |
| `internal` | Meeting notes, wikis, playbooks |

### 4.4 Scope Levels

```
scope_level ENUM:
  'global'       → Org-wide (templates, policies)
  'company'      → Company/account scoped (contracts, brand kits)
  'project'      → Project scoped (SOWs, budgets)
  'location'     → Location scoped (site maps, permits)
  'activation'   → Activation scoped (tech riders)
  'event'        → Event scoped (call sheets)
  'task'         → Task scoped (deliverables)
  'vendor'       → Vendor scoped (compliance docs)
  'worker'       → Worker scoped (certifications)
  'department'   → Department scoped (dept SOPs)
  'personal'     → Private to user (drafts)
```

---

## 5. Future-State Digital Asset Architecture

### 5.1 Core Design Principles

1. **Metadata ≠ Storage**: `digital_assets` stores metadata only. File bytes live in Supabase Storage (S3-compatible). Separation enables provider migration without schema changes.
2. **Everything is a Digital Asset**: Every file reference — crew avatar to stamped drawing — gets a `digital_assets` row.
3. **Polymorphic Scoping via Junction**: Single `asset_links` table maps assets to any entity, avoiding FK columns on 20+ tables.
4. **Inherited Access**: Assets inherit access from their scope entity. Override ACLs are exceptions.
5. **Immutable Version History**: Every change creates a new `asset_versions` row. Old versions never deleted.

### 5.2 Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│  UI LAYER                                            │
│  Asset Manager │ Media Library │ Doc Editor │         │
│  Contextual Panel (per-entity) │ ⌘K Search          │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│  METADATA LAYER                                      │
│  digital_assets │ asset_versions │ asset_links       │
│  asset_tags │ asset_dependencies │ asset_access_log  │
│  asset_retention_policies │ asset_access_controls    │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│  STORAGE LAYER                                       │
│  storage_objects (Supabase Storage / S3-compatible)  │
│  Org-partitioned buckets │ CDN │ Thumbnails          │
└─────────────────────────────────────────────────────┘
```

### 5.3 Key Decisions

| Decision | Rationale |
|----------|-----------|
| Polymorphic `asset_links` over FK columns | Extensible without schema changes |
| `asset_class` as hierarchical TEXT over ENUM | Admin-configurable; no migration to extend |
| SHA-256 checksums | Enables deduplication across uploads |
| `current_version_id` pointer | O(1) access to live version |
| Scope-based inheritance over per-asset ACLs | 95% of assets follow parent access rules |
| Separate `asset_access_log` | High-volume; avoid bloating `activity_log` |

### 5.4 Migration Strategy

- **Phase 1**: Create `digital_assets` rows for all existing URLs; create `asset_links` junctions; preserve existing URL columns
- **Phase 2**: Move files to unified org-partitioned buckets; generate thumbnails; compute checksums
- **Phase 3**: Deprecate bare URL columns; replace with FK joins through `asset_links`

---

## 6. Metadata Schema (3NF Compliant)

### 6.1 `digital_assets` — Universal Metadata Record

```sql
CREATE TABLE digital_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_class TEXT NOT NULL,
    asset_class_l1 TEXT GENERATED ALWAYS AS (split_part(asset_class, '.', 1)) STORED,
    asset_class_l2 TEXT GENERATED ALWAYS AS (split_part(asset_class, '.', 2)) STORED,
    name TEXT NOT NULL,
    filename TEXT NOT NULL,
    description TEXT,
    scope_level TEXT NOT NULL DEFAULT 'project'
        CHECK (scope_level IN ('global','company','project','location',
               'activation','event','task','vendor','worker','department','personal')),
    scope_entity_id UUID,
    domains TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft','pending_review','in_review','approved','published',
               'active','superseded','archived','expired','deleted')),
    published_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    current_version_id UUID,
    owner_id UUID NOT NULL REFERENCES profiles(id),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    document_number TEXT,
    last_reviewed_at TIMESTAMPTZ,
    next_review_date DATE,
    reviewer_ids UUID[] DEFAULT '{}',
    requires_acknowledgment BOOLEAN DEFAULT false,
    sensitivity TEXT DEFAULT 'internal'
        CHECK (sensitivity IN ('public','internal','confidential','restricted')),
    data_purpose TEXT,
    retention_policy_id UUID,
    search_text TSVECTOR,
    custom_metadata JSONB DEFAULT '{}',
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.2 `asset_versions` — Immutable Version History

```sql
CREATE TABLE asset_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES digital_assets(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    version_label TEXT,
    is_major BOOLEAN DEFAULT true,
    storage_object_id UUID,
    content JSONB,
    content_text TEXT,
    mime_type TEXT,
    size_bytes BIGINT,
    checksum TEXT,
    change_description TEXT,
    change_type TEXT DEFAULT 'update'
        CHECK (change_type IN ('create','update','amendment','revision','correction','reformat','merge')),
    diff_from_previous JSONB,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(asset_id, version_number)
);
-- NOTE: No updated_at — versions are INSERT-ONLY (immutable)
```

### 6.3 `asset_links` — Polymorphic Entity-Asset Junction

```sql
CREATE TABLE asset_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES digital_assets(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    link_type TEXT NOT NULL DEFAULT 'attachment'
        CHECK (link_type IN ('primary','attachment','reference','deliverable',
               'evidence','template_source','supersedes')),
    link_role TEXT,
    display_order INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    effective_from TIMESTAMPTZ,
    effective_until TIMESTAMPTZ,
    notes TEXT,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(asset_id, entity_type, entity_id, link_type, link_role)
);
```

### 6.4 `asset_tags` — Normalized Tag System

```sql
CREATE TABLE asset_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    tag_group TEXT,
    color TEXT,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, slug)
);

CREATE TABLE asset_tag_assignments (
    asset_id UUID NOT NULL REFERENCES digital_assets(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES asset_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (asset_id, tag_id)
);
```

### 6.5 `storage_objects` — File Storage Abstraction

```sql
CREATE TABLE storage_objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL DEFAULT 'supabase_storage'
        CHECK (provider IN ('supabase_storage','s3','gcs','azure_blob','external_url')),
    bucket_id TEXT NOT NULL,
    object_path TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    checksum_sha256 TEXT,
    storage_url TEXT NOT NULL,
    cdn_url TEXT,
    thumbnail_url TEXT,
    preview_url TEXT,
    processing_status TEXT DEFAULT 'ready'
        CHECK (processing_status IN ('uploading','processing','ready','error')),
    processing_error TEXT,
    is_deduplicated BOOLEAN DEFAULT false,
    canonical_object_id UUID REFERENCES storage_objects(id),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.6 3NF Compliance

| NF | Requirement | Status |
|----|------------|--------|
| 1NF | Atomic fields | ✅ `domains[]` intentionally denormalized; normalized via `asset_tag_assignments` |
| 2NF | Full key dependency | ✅ Single-column UUID PKs |
| 3NF | No transitive deps | ✅ `asset_class_l1/l2` are GENERATED ALWAYS; file metadata on versions is documented denormalization |

---

## 7. Entity Relationship Model

### 7.1 Core Relationships

```
digital_assets 1──M asset_versions
digital_assets 1──M asset_links
digital_assets M──M asset_tags (via asset_tag_assignments)
digital_assets M──1 asset_retention_policies
digital_assets 1──M asset_access_log
digital_assets M──M digital_assets (via asset_dependencies)
asset_versions M──1 storage_objects

asset_links ──► projects, contracts, events, activations, locations,
               vendors, crew_members, tasks, incidents, ... (any UUID entity)
```

### 7.2 Structural Rules

| Rule | Description |
|------|-------------|
| R1 | Every `digital_assets` row MUST have ≥1 `asset_versions` row |
| R2 | `current_version_id` MUST point to a version of the same asset |
| R3 | `asset_versions` rows are INSERT-ONLY |
| R4 | `storage_objects` may be shared (deduplication) |
| R5 | `link_type='primary'` enforces at-most-one per `(entity_type, entity_id, link_role)` |
| R6 | Deleting `digital_assets` cascades to versions, links, tags, access log |
| R7 | `scope_entity_id` references validated by application layer (polymorphic) |
| R8 | `asset_dependencies` with `is_blocking=true` prevent status transitions |

### 7.3 Integration with Existing Schema

| Existing Entity | Link Role Examples |
|----------------|-------------------|
| `contracts` | `'primary'` (PDF), `'attachment'` (amendments) |
| `tech_sheets` | `'floor_plan'`, `'rigging_plot'`, `'electrical_diagram'` |
| `certifications` | `'primary'` (cert scan) |
| `incidents` | `'evidence'` (photos, reports) |
| `vendor_compliance_docs` | `'primary'` (COI, W9 PDF) |
| `brand_kits` | `'logo'`, `'guideline'`, `'typography'` |
| `work_orders` | `'evidence'` (completion photos) |
| `expenses` | `'receipt'` |
| `proposals` | `'primary'` (PDF export) |

---

## 8. Version Control Strategy

### 8.1 Two Paradigms

**Linear Versioning (default)**: `v1 → v2 → v3 → v4 (current)` — for contracts, SOPs, proposals.

**Branch Versioning (engineering/creative)**: Parallel revisions via `version_label` + `branch_name`. One branch is `is_current=true`.

### 8.2 Version States

```
draft → in_review → approved/rejected → published (current_version_id) → superseded
```

### 8.3 Auto-Version Rules

| Trigger | Version Type |
|---------|-------------|
| Content edit saved | Minor auto-increment |
| Status → `approved` | Snapshot locked (immutable) |
| Amendment created | Major version with label |
| Template instantiation | v1 of new asset |
| File re-upload | Major auto-increment |

---

## 9. Access Control Model (RBAC + Inheritance)

### 9.1 Cascading Hierarchy

```
Level 1: Organization RLS (all members see org assets)
Level 2: Scope Inheritance (project members see project assets)
Level 3: Sensitivity (confidential/restricted = explicit grant)
Level 4: Asset-Level Override (per-asset ACL exceptions)
```

### 9.2 Scope Inheritance Rules

| Scope | Inherited From | Who Gets Access |
|-------|---------------|----------------|
| `global` | Org membership | All org members |
| `project` | `project_members` + `project_assignments` | Project team |
| `vendor` | Vendor portal token | Vendor + internal team |
| `worker` | Worker + supervisor + HR | Limited |
| `personal` | Owner only | Owner |

### 9.3 Asset-Level ACL

```sql
CREATE TABLE asset_access_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES digital_assets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    role TEXT,
    can_view BOOLEAN DEFAULT true,
    can_download BOOLEAN DEFAULT true,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    can_share BOOLEAN DEFAULT false,
    can_approve BOOLEAN DEFAULT false,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    granted_by UUID REFERENCES profiles(id),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    UNIQUE(asset_id, user_id)
);
```

### 9.4 Audit Trail

```sql
CREATE TABLE asset_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES digital_assets(id) ON DELETE CASCADE,
    version_id UUID REFERENCES asset_versions(id),
    user_id UUID REFERENCES profiles(id),
    actor_type TEXT DEFAULT 'user',
    action TEXT NOT NULL CHECK (action IN ('viewed','downloaded','previewed','printed',
           'shared','linked','unlinked','versioned','status_changed',
           'permissions_changed','deleted','restored','exported')),
    ip_address INET,
    user_agent TEXT,
    context JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 10. Retention & Archival Policy Model

### 10.1 Policy Table

```sql
CREATE TABLE asset_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    applies_to_class TEXT,
    applies_to_scope TEXT,
    applies_to_sensitivity TEXT,
    retention_period_days INTEGER,
    retention_trigger TEXT NOT NULL DEFAULT 'creation'
        CHECK (retention_trigger IN ('creation','expiration','project_closure',
               'contract_termination','last_access','manual')),
    on_retention_reached TEXT NOT NULL DEFAULT 'archive'
        CHECK (on_retention_reached IN ('archive','delete','review','notify_owner')),
    on_expiration TEXT DEFAULT 'notify_owner',
    warning_days_before INTEGER[] DEFAULT '{30,7,1}',
    legal_hold_exempt BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 10.2 Default Policies

| Asset Class | Retention | Trigger | Action |
|------------|-----------|---------|--------|
| `legal.contract` | 7 years | contract_termination | archive |
| `legal.certification` | 3 years | expiration | notify_owner |
| `financial.invoice_pdf` | 7 years | creation | archive |
| `financial.tax_document` | 10 years | creation | archive |
| `knowledge.sop` | Indefinite | — | review (annual) |
| `production.call_sheet` | 1 year | project_closure | archive |
| `media.photo` | 3 years | project_closure | review |
| `engineering.cad_file` | 5 years | project_closure | archive |

### 10.3 Legal Holds

```sql
CREATE TABLE legal_holds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    hold_type TEXT NOT NULL CHECK (hold_type IN ('litigation','regulatory','investigation','audit')),
    scope_type TEXT NOT NULL CHECK (scope_type IN ('asset','project','company','vendor','global')),
    scope_entity_id UUID,
    is_active BOOLEAN DEFAULT true,
    placed_at TIMESTAMPTZ DEFAULT NOW(),
    released_at TIMESTAMPTZ,
    placed_by UUID REFERENCES profiles(id),
    matter_number TEXT,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Assets under legal hold **cannot be deleted, archived, or purged** regardless of retention policy.

---

## 11. Asset Dependency Matrix

### 11.1 Dependency Table

```sql
CREATE TABLE asset_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES digital_assets(id) ON DELETE CASCADE,
    depends_on_asset_id UUID NOT NULL REFERENCES digital_assets(id) ON DELETE CASCADE,
    dependency_type TEXT NOT NULL
        CHECK (dependency_type IN ('requires_approval','requires_signature','derived_from',
               'supersedes','references','bundles','requires_upload')),
    is_blocking BOOLEAN DEFAULT false,
    is_satisfied BOOLEAN DEFAULT false,
    satisfied_at TIMESTAMPTZ,
    notes TEXT,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(asset_id, depends_on_asset_id, dependency_type),
    CHECK (asset_id != depends_on_asset_id)
);
```

### 11.2 Common Dependency Chains

```
Permit Application
  └── requires_upload: Stamped Engineering Drawing
       └── requires_approval: Structural Calculation

Contract Activation
  └── requires_signature: Contract PDF
       └── requires_upload: COI + W9 + NDA

Event Execution
  └── requires_approval: Call Sheet
       └── requires_approval: Tech Rider
            └── requires_upload: Floor Plan + Rigging Plot

SOW → Invoice Chain
  └── requires_approval: SOW Document
       └── derived_from: Proposal → derived_from: Invoice
```

### 11.3 Blocking Logic

| Status Transition | Blocked Until |
|-------------------|---------------|
| `draft → in_review` | All `requires_upload` satisfied |
| `in_review → approved` | All `requires_approval` satisfied |
| `approved → active` | All `requires_signature` satisfied |

---

## 12. UI/UX Simplification Principles

### 12.1 Navigation Restructure

**Current**: Documents, Vault, Knowledge Base, SOPs across 4 nav items in 2 sections.

**Future**: Unified "Assets & Docs" section:

```
Assets & Docs
├── All Assets          → Unified search/browse
├── Documents           → Rich text editor UI
├── Media Library       → Gallery UI (photos, videos, renderings)
├── Knowledge Base      → Article UI (SOPs, policies, guides)
├── Contracts & Legal   → Lifecycle UI (contracts, permits)
└── Templates           → Instantiation UI
```

### 12.2 Contextual Asset Panels

Every entity detail page gets a contextual assets panel:

| Page | Shows |
|------|-------|
| Project Detail | SOW, budget, deliverables, schedules |
| Event Detail | Call sheet, tech rider, run-of-show, floor plan |
| Vendor Detail | COI, W9, NDA, contracts |
| Task Detail | Attached files, deliverables |
| Incident Detail | Evidence photos, reports |

### 12.3 Progressive Disclosure

- **Level 1**: Card grid (name, type icon, status, owner, last modified, quick filters)
- **Level 2**: Table view (all metadata columns, advanced filters)
- **Level 3**: Detail panel (version history, dependencies, access log, metadata editor)

### 12.4 Performance Targets

| Metric | Target |
|--------|--------|
| Asset list render (50 items) | < 100ms |
| Full-text search | < 200ms |
| Thumbnail generation | < 2s |
| File upload + metadata | < 3s (< 50MB) |
| Version history load | < 150ms |

---

## 13. Automation & AI Augmentation Roadmap

### 13.1 Phase 0 — Rule-Based (Immediate)

| # | Automation | Trigger → Action |
|---|-----------|-----------------|
| A1 | Auto-version on save | Content changed → create `asset_versions` row |
| A2 | Expiration warnings | `expires_at` approaching → notifications at 30d/7d/1d |
| A3 | Retention enforcement | Period reached → execute policy action |
| A4 | Dependency blocking | Status UPDATE → check blocking deps |
| A5 | Auto-link on upload | File uploaded from entity page → create `asset_links` |
| A6 | Thumbnail generation | New `storage_objects` (image/video/PDF) → generate renditions |
| A7 | Search index update | INSERT/UPDATE → update `search_text` TSVECTOR |
| A8 | Acknowledgment tracking | SOP published → create ack requests |
| A9 | Ownership transfer | User deactivated → transfer to manager |
| A10 | Legal hold enforcement | DELETE/archive on held asset → block + log |

### 13.2 Phase 1 — Smart Automations (3-6 months)

| # | Automation | Description |
|---|-----------|-------------|
| B1 | Smart naming | Suggest `{project}-{class}-{description}-{date}` |
| B2 | Auto-numbering | Sequential doc numbers per class per org |
| B3 | Review routing | Route to appropriate reviewer by class + department |
| B4 | Compliance dashboard | Real-time compliance score from expiring docs |
| B5 | Duplicate detection | SHA-256 match → suggest linking instead of uploading |
| B6 | Batch operations | Multi-select → bulk tag/move/archive/share |

### 13.3 Phase 2 — AI-Powered (6-12 months)

| # | Capability | Description |
|---|-----------|-------------|
| C1 | Auto-tagging | ML classification of uploaded files → suggest tags |
| C2 | Content extraction | OCR for scanned docs; metadata extraction from PDFs |
| C3 | Smart search | Semantic search across all asset content |
| C4 | Contextual recommendations | "You might also need..." based on project phase + class |
| C5 | Change tracking | Visual diff for images/PDFs; structural diff for rich text |
| C6 | Expiration prediction | Predict which certs/permits will need renewal based on patterns |

### 13.4 Phase 3 — Advanced AI (12+ months)

| # | Capability | Description |
|---|-----------|-------------|
| D1 | Auto-summarization | Generate summaries of long documents for preview |
| D2 | Contract analysis | Extract key terms, obligations, deadlines from contracts |
| D3 | Knowledge graph | Surface related assets across projects based on content similarity |
| D4 | Automated compliance audit | Flag non-compliant docs (missing signatures, expired refs) |
| D5 | Template intelligence | Suggest templates based on context + past usage patterns |

---

## 14. Implementation Roadmap

### Phase 0 — Foundation (Weeks 1-3)

- [ ] Migration 014: Create `digital_assets`, `asset_versions`, `asset_links`, `storage_objects`, `asset_tags`, `asset_tag_assignments` tables
- [ ] TypeScript types for all new entities
- [ ] Supabase hooks for CRUD operations
- [ ] Full-text search trigger on `digital_assets`
- [ ] Auto-version trigger on content changes

### Phase 1 — Integration (Weeks 4-6)

- [ ] Migrate existing vault_documents → `digital_assets` + `storage_objects`
- [ ] Migrate existing document_versions → `asset_versions`
- [ ] Create `asset_links` for all existing URL references (18+ tables)
- [ ] Unified Asset Manager page (search, browse, filter)
- [ ] Contextual asset panels on entity detail pages

### Phase 2 — Access & Governance (Weeks 7-9)

- [ ] `asset_access_controls` table + RLS policies
- [ ] `asset_access_log` table + triggers
- [ ] `asset_retention_policies` + `legal_holds` tables
- [ ] `asset_dependencies` table + blocking trigger
- [ ] Retention enforcement cron job
- [ ] Expiration warning notifications

### Phase 3 — UI Polish (Weeks 10-12)

- [ ] Media Library page (gallery view for photos/videos)
- [ ] Unified Knowledge Base (merge SOPs + production_sops + KB articles)
- [ ] Contract & Legal lifecycle UI
- [ ] Template instantiation workflow
- [ ] Drag & drop upload on entity pages
- [ ] ⌘K command bar integration

### Phase 4 — AI & Automation (Months 4-6)

- [ ] Thumbnail/preview generation pipeline
- [ ] Smart naming suggestions
- [ ] Auto-numbering system
- [ ] Duplicate detection
- [ ] OCR/content extraction pipeline

### Phase 5 — Advanced (Months 6-12)

- [ ] Semantic search
- [ ] Auto-tagging ML model
- [ ] Visual diff for images/PDFs
- [ ] Contract analysis AI
- [ ] Knowledge graph

---

## Design Constraints Verification

| Constraint | How Addressed |
|-----------|---------------|
| Multi-market, multi-client scale | Org-partitioned storage buckets; `scope_level` hierarchy; tenant isolation via RLS |
| High-volume media assets | Dedicated `storage_objects` with CDN URLs; thumbnail/preview generation; deduplication |
| Fast retrieval during live ops | CDN-accelerated URLs; `current_version_id` pointer (O(1)); denormalized file metadata on versions |
| Full auditability | `asset_access_log` for all actions; immutable `asset_versions`; `legal_holds` protection |
| Cross-functional collaboration | Scope-based inheritance; functional domain tags; contextual panels on all entity pages |
| Strict SSOT | Single `digital_assets` table for all metadata; `asset_links` for all relationships; no duplicate storage |
| No redundant file proliferation | SHA-256 deduplication; `canonical_object_id` on `storage_objects`; smart duplicate detection |
| Cognitively lightweight | Progressive disclosure (3 levels); contextual surfacing; unified search; drag & drop; ⌘K integration |
