# Creative, Brand & Campaign Lifecycle Architecture

**Version:** 1.0  
**Date:** 2026-02-25  
**Status:** Architecture Specification  
**Scope:** Unified creative brief, brand governance, campaign execution, and asset production lifecycle across multi-project, multi-market operations

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current-State Workflow Maps](#2-current-state-workflow-maps)
3. [Gap Analysis & Structural Findings](#3-gap-analysis--structural-findings)
4. [Future-State Brand Governance Architecture](#4-future-state-brand-governance-architecture)
5. [Creative Brief Standardization Framework](#5-creative-brief-standardization-framework)
6. [Brand Guideline Normalization Model](#6-brand-guideline-normalization-model)
7. [Campaign-to-Asset Relationship Schema](#7-campaign-to-asset-relationship-schema)
8. [3NF-Compliant Entity Relationship Model](#8-3nf-compliant-entity-relationship-model)
9. [Approval Dependency Matrix](#9-approval-dependency-matrix)
10. [Performance Attribution Model](#10-performance-attribution-model)
11. [Version Control & Archival Strategy](#11-version-control--archival-strategy)
12. [Asset Reuse & Modularity Framework](#12-asset-reuse--modularity-framework)
13. [UI/UX Simplification Principles](#13-uiux-simplification-principles)
14. [Automation & AI Augmentation Roadmap](#14-automation--ai-augmentation-roadmap)

---

## 1. Executive Summary

### 1.1 Scope

This document defines the enterprise architecture for managing the **full lifecycle of creative briefs, brand guidelines, marketing campaigns, and brand deliverable assets** within the Frozen Phoenix platform. The system must unify creative strategy, brand governance, campaign execution, and asset production under a normalized (3NF), Single Source of Truth (SSOT) architecture while minimizing cognitive overload for creative, marketing, production, and executive teams.

### 1.2 Critical Findings

| # | Finding | Severity | Category |
|---|---------|----------|----------|
| F1 | **No creative brief entity** — briefs are captured as free-text in deal/project notes with no structured lifecycle | Critical | SSOT Violation |
| F2 | **Brand kits are flat records** — `brand_kits` table stores only colors/font/logo with no hierarchy, versioning, or governance structure | Critical | Architecture |
| F3 | **No campaign entity** — marketing campaigns have no dedicated data model; campaign coordination happens in ad-hoc tasks and calendar events | Critical | SSOT Violation |
| F4 | **No brief-to-campaign-to-asset traceability** — impossible to trace from strategic intent through execution to measurable outcome | Critical | Traceability |
| F5 | **Brand guidelines are a single TEXT field** — `brand_kits.guidelines` stores unstructured prose; no typed sections, no versioning, no compliance checks | High | Data Integrity |
| F6 | **No deliverable production tracking** — creative assets move through design→review→approval→distribution with no state machine | High | Workflow |
| F7 | **No channel distribution model** — assets are produced but have no structured deployment-to-channel mapping | High | Architecture |
| F8 | **No campaign performance tracking** — KPIs, metrics, and attribution are not modeled | High | Analytics |
| F9 | **No template instantiation for briefs** — every brief starts from scratch despite recurring patterns | Medium | Efficiency |
| F10 | **No multi-brand hierarchy** — sub-brands, co-brands, and market-specific brand variants share one flat table | Medium | Scalability |
| F11 | **No creative review workflow** — approvals exist generically but lack creative-specific gates (brand compliance, legal, stakeholder) | Medium | Governance |
| F12 | **Digital asset lifecycle (Migration 014) exists but lacks creative-domain linkage** — `digital_assets` has no FK to briefs, campaigns, or brand guidelines | Medium | Integration |

### 1.3 Recommendation Summary

| Priority | Action | Eliminates |
|----------|--------|------------|
| P0 | `creative_briefs` table with full lifecycle state machine | F1, F9 |
| P0 | `brand_guidelines` table with typed sections, versioning, multi-brand hierarchy | F2, F5, F10 |
| P0 | `campaigns` table with channel strategy, budget, timeline, KPI tracking | F3, F8 |
| P0 | `campaign_assets` junction linking campaigns → digital_assets with channel + role metadata | F4, F7 |
| P1 | `brief_templates` for repeatable brief patterns with dynamic field logic | F9 |
| P1 | `brand_guideline_sections` for typed, versionable guideline components | F5 |
| P1 | `creative_reviews` for multi-gate creative approval workflow | F11 |
| P1 | `campaign_metrics` for performance tracking and attribution | F8 |
| P2 | `brand_compliance_checks` for automated brand standard enforcement | F5, F10 |
| P2 | `asset_channel_deployments` for distribution tracking with performance linkage | F7 |
| P3 | AI-assisted brief drafting, brand deviation detection, asset repurposing suggestions | F9, F5 |

---

## 2. Current-State Workflow Maps

### 2.1 Creative Brief Lifecycle (Current)

```
[Deal Won] ──→ [PM writes notes in project description] ──→ [Email chain with stakeholders]
     │                                                              │
     │    No structured intake                                      │    No version control
     │    No audience segmentation                                  │    No approval gating
     │    No KPI definition                                         │    No change tracking
     ▼                                                              ▼
[Creative team interprets free-text] ──→ [Production starts] ──→ [Revisions via Slack/email]
                                                                        │
                                                                        │ No traceability
                                                                        ▼
                                                                [Final asset uploaded to vault]
```

**Pain Points:**
- No single owner for brief accuracy
- Strategic intent lost in translation between sales, PM, and creative
- Budget alignment happens after production starts
- KPIs never formally defined → post-campaign analysis impossible
- Version drift: stakeholder feedback captured across email, Slack, comments with no canonical state

### 2.2 Brand Guidelines Lifecycle (Current)

```
[brand_kits table] ──→ Flat record: 3 colors + 1 font + 1 logo URL + 1 TEXT guidelines
     │
     │  No hierarchy (parent brand → sub-brand → market variant)
     │  No typed sections (voice, motion, accessibility, co-branding)
     │  No version history
     │  No compliance enforcement
     ▼
[Creative team references PDF guidelines externally] ──→ [Brand drift across projects]
```

**Pain Points:**
- Brand kits serve as a "color swatch library" rather than a governance system
- Typography standards (weights, sizes, line-heights) not captured
- Motion standards, accessibility compliance, co-branding rules absent
- No mechanism to detect or prevent brand deviations in deliverables
- Multi-market localization (RTL, cultural adaptations) unsupported

### 2.3 Marketing Campaign Lifecycle (Current)

```
[No dedicated entity] ──→ Campaigns exist as:
     ├── A project with "campaign" in the name
     ├── Calendar events for launch dates
     ├── Tasks for asset production
     └── Budget line items tagged informally
```

**Pain Points:**
- No campaign-level strategy object (target audience, channels, objectives)
- Content calendar is a calendar event, not a structured timeline
- Media buying alignment impossible without channel model
- Cross-functional approvals fragmented across generic approval system
- No performance tracking → no optimization cycles → no post-campaign analysis
- Asset repurposing is entirely manual with no suggestion engine

### 2.4 Brand Deliverable Asset Lifecycle (Current)

```
[digital_assets (Migration 014)] ──→ Metadata + versioning + tagging exists
     │
     │  BUT: No creative-domain context
     │  No link to originating brief
     │  No campaign association
     │  No channel deployment tracking
     │  No brand compliance scoring
     │  No template instantiation
     ▼
[Assets exist in isolation from strategy]
```

**Pain Points:**
- `digital_assets` handles storage/versioning well but lacks creative workflow context
- Review/revision cycles use generic approvals — no creative-specific gates
- Legal/compliance review not distinguished from creative approval
- Distribution/publishing has no structured channel mapping
- Performance measurement at asset level not linked back to campaign KPIs
- Template instantiation exists for documents but not for creative deliverables

---

## 3. Gap Analysis & Structural Findings

### 3.1 SSOT Violations (5)

| # | Violation | Impact | Resolution |
|---|-----------|--------|------------|
| V1 | Brief captured in 3+ surfaces (project notes, deal notes, email) | Strategic intent fragmentation | `creative_briefs` as canonical source |
| V2 | Brand rules in TEXT field + external PDFs + tribal knowledge | Inconsistent brand execution | `brand_guidelines` + `brand_guideline_sections` |
| V3 | Campaign data scattered across projects, tasks, calendar events | No campaign-level analytics | `campaigns` entity |
| V4 | Channel strategy implicit in task names | No structured distribution model | `campaign_channels` + `asset_channel_deployments` |
| V5 | KPIs defined ad-hoc per report, not at campaign definition time | Misaligned performance tracking | `campaign_kpis` on brief + campaign |

### 3.2 Scope Creep Triggers (4)

| # | Trigger | Current Mitigation | Proposed Mitigation |
|---|---------|-------------------|-------------------|
| S1 | Brief changes after production starts | None — no formal brief | Brief status lock after `approved` state; change requests create versioned amendments |
| S2 | Stakeholder adds channels mid-campaign | None | Channel strategy locked at `in_production` state; additions require change order |
| S3 | Brand guidelines updated during active campaign | None | Guideline versions pinned per campaign; updates create new version |
| S4 | Asset count grows beyond brief scope | None | Brief defines asset manifest; additions require brief amendment |

### 3.3 Approval Bottlenecks (6)

| # | Bottleneck | Avg Delay | Resolution |
|---|-----------|-----------|-----------|
| A1 | Creative brief approval requires sequential sign-off | 3–5 days | Parallel approval tracks (strategy, budget, legal) |
| A2 | Brand compliance review is manual and subjective | 1–2 days per asset | Automated compliance scoring with human override |
| A3 | Legal review blocks all downstream work | 2–7 days | Legal review runs in parallel with production; gates only distribution |
| A4 | Client approval on deliverables lacks structured feedback | 3–5 days | Structured review with annotated comments on specific assets |
| A5 | Campaign launch requires all-or-nothing approval | 1–3 days | Per-channel launch approval; independent activation per channel |
| A6 | Post-campaign analysis never formally triggered | ∞ (often skipped) | Automated trigger 7 days post-campaign end date |

### 3.4 Version Control Conflicts (4)

| # | Conflict | Resolution |
|---|---------|-----------|
| C1 | Brief has no version history | `creative_brief_versions` with diff tracking |
| C2 | Brand guidelines updated globally, breaking active campaigns | Version pinning per campaign |
| C3 | Asset revisions lose review history | Leverage existing `asset_versions` from Migration 014 |
| C4 | Template changes propagate unexpectedly | Templates versioned independently; instances snapshot at creation |

### 3.5 Brand Inconsistency Risks (5)

| # | Risk | Impact | Mitigation |
|---|------|--------|-----------|
| B1 | No enforcement of color/typography rules in deliverables | Off-brand assets reach clients | Brand compliance check system |
| B2 | Sub-brand guidelines not distinguished from parent | Market-specific deviations treated as errors | Multi-brand hierarchy with inheritance |
| B3 | Co-branding rules undefined | Partner brand clashes | Co-branding section in guidelines with partner-specific rules |
| B4 | Motion/animation standards absent | Inconsistent video/motion deliverables | Motion standards section with timing/easing specifications |
| B5 | Accessibility requirements not tied to brand | Non-compliant deliverables | Accessibility section with WCAG mapping |

### 3.6 Knowledge Fragmentation (3)

| # | Fragment | Resolution |
|---|---------|-----------|
| K1 | Creative lessons learned not captured | Post-campaign retrospective linked to brief |
| K2 | Asset performance data not fed back to creative strategy | Performance attribution model |
| K3 | Successful patterns not templatized | Brief + campaign template system |

---

## 4. Future-State Brand Governance Architecture

### 4.1 Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        STRATEGY LAYER                           │
│  Creative Briefs → Campaign Strategy → KPI Definitions          │
│  Brief Templates → Audience Segments → Channel Strategy         │
├─────────────────────────────────────────────────────────────────┤
│                       GOVERNANCE LAYER                          │
│  Brand Guidelines → Guideline Sections → Compliance Rules       │
│  Multi-Brand Hierarchy → Version Control → Approval Gates       │
├─────────────────────────────────────────────────────────────────┤
│                       EXECUTION LAYER                           │
│  Campaigns → Campaign Assets → Channel Deployments              │
│  Creative Reviews → Performance Metrics → Retrospectives        │
│  (Leverages existing: digital_assets, asset_versions, tasks)    │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Entity Hierarchy

```
Organization
 └── Brand Guidelines (multi-brand hierarchy)
      ├── Parent Brand
      │    ├── Sub-Brand A
      │    │    └── Market Variant A-EMEA
      │    └── Sub-Brand B
      └── Guideline Sections (visual, typography, voice, motion, accessibility, co-branding)

 └── Creative Briefs
      ├── Brief Templates (reusable patterns)
      ├── Brief → Campaign (1:N)
      ├── Brief → Brand Guideline Version (pinned)
      └── Brief → Project (optional link)

 └── Campaigns
      ├── Campaign → Brief (M:1)
      ├── Campaign → Channels (1:N)
      ├── Campaign → Assets (M:N via campaign_assets)
      ├── Campaign → KPIs (1:N)
      ├── Campaign → Metrics (1:N, time-series)
      └── Campaign → Creative Reviews (1:N)

 └── Creative Reviews
      ├── Review → Campaign Asset (M:1)
      ├── Review → Reviewer (M:1)
      └── Review Gate Types: brand_compliance, creative_director, legal, stakeholder, client
```

### 4.3 State Machines

#### Creative Brief States

```
draft → stakeholder_review → strategy_approved → budget_approved → final_approved → active → completed → archived
                 │                    │                  │                              │
                 └── revision ────────┘──────────────────┘                              └── retrospective
```

#### Campaign States

```
planning → brief_approved → in_production → review → approved → launching → live → optimizing → completed → archived
                                                                    │                                │
                                                                    └── per-channel activation        └── post_analysis
```

#### Creative Review States

```
requested → in_review → approved / revision_requested / rejected
                │
                └── brand_compliance_score attached
```

---

## 5. Creative Brief Standardization Framework

### 5.1 Brief Structure (Typed Sections)

| Section | Fields | Required |
|---------|--------|----------|
| **Overview** | title, objective_summary, brief_type (brand, campaign, product, event) | Yes |
| **Strategic Context** | business_objectives[], success_criteria[], competitive_context | Yes |
| **Audience** | target_segments[] (demographic, psychographic, behavioral), personas[] | Yes |
| **Scope** | deliverable_manifest[] (type, quantity, specs), channels[], markets[] | Yes |
| **Brand** | brand_guideline_id (pinned version), tone_direction, visual_direction | Yes |
| **Budget** | total_budget, budget_breakdown[] (category, amount), contingency_pct | Yes |
| **Timeline** | start_date, end_date, milestone_dates[] (draft, review, final, launch) | Yes |
| **KPIs** | kpi_definitions[] (metric, target, measurement_method, attribution_model) | Yes |
| **Stakeholders** | owner_id, approvers[], reviewers[], contributors[] | Yes |
| **References** | inspiration_assets[], competitor_references[], previous_campaigns[] | No |

### 5.2 Brief Templates

Templates capture recurring brief patterns (e.g., "Product Launch Brief", "Event Activation Brief", "Social Campaign Brief") with:
- Pre-filled sections with placeholder guidance
- Dynamic field logic (e.g., event briefs show venue/logistics sections)
- Default KPI sets per brief type
- Default deliverable manifests per channel strategy

### 5.3 Change Request Model

After a brief reaches `final_approved`:
- Changes create a `brief_amendment` record
- Amendments reference the original brief + specific sections changed
- Amendments require re-approval from affected stakeholders only
- All campaign assets linked to the brief receive notification of amendment

---

## 6. Brand Guideline Normalization Model

### 6.1 Multi-Brand Hierarchy

```
brand_guidelines
├── parent_id: NULL (root brand)
│    ├── parent_id: root.id (sub-brand, inherits from parent)
│    │    └── parent_id: sub.id (market variant, inherits from sub-brand)
│    └── parent_id: root.id (co-brand variant)
```

**Inheritance Rules:**
- Child brands inherit all parent sections unless explicitly overridden
- Overrides are section-level (not field-level) for clarity
- Inheritance is resolved at read time via recursive CTE
- Active campaigns pin to a specific guideline version (not latest)

### 6.2 Guideline Section Types

| Section Type | Key Fields |
|-------------|-----------|
| `visual_identity` | logo_usage_rules, logo_variants[], minimum_sizes, clear_space, incorrect_usage_examples[] |
| `color_system` | primary_palette[], secondary_palette[], gradient_rules, contrast_ratios, dark_mode_variants |
| `typography` | font_families[], weights[], sizes_scale, line_heights, heading_styles, body_styles, code_styles |
| `tone_and_voice` | brand_personality[], tone_dimensions (formal↔casual, serious↔playful), vocabulary_guidelines, prohibited_terms[] |
| `motion` | timing_curves, duration_ranges, entrance_patterns, exit_patterns, loading_patterns, interaction_feedback |
| `accessibility` | wcag_level (AA/AAA), color_contrast_minimums, font_size_minimums, motion_preferences, alt_text_requirements |
| `co_branding` | partner_rules[], logo_lockup_specs, color_hierarchy, typography_hierarchy, approval_requirements |
| `photography` | style_direction, composition_rules, color_treatment, subject_guidelines, stock_vs_original_policy |
| `iconography` | style (outlined/filled/duotone), grid_size, stroke_width, corner_radius, color_rules |
| `layout` | grid_systems[], margin_rules, component_spacing, responsive_breakpoints |

### 6.3 Version Control

- Each guideline has a `version` (integer, auto-incremented)
- Publishing a new version creates an immutable snapshot
- Active campaigns reference `guideline_version_id` (not latest)
- Diff visualization between versions at section level

---

## 7. Campaign-to-Asset Relationship Schema

### 7.1 Relationship Model

```
creative_briefs ──1:N──→ campaigns
campaigns ──M:N──→ digital_assets (via campaign_assets)
campaigns ──1:N──→ campaign_channels
campaign_assets ──1:N──→ asset_channel_deployments
campaign_channels ──1:N──→ asset_channel_deployments
campaigns ──1:N──→ campaign_kpis
campaigns ──1:N──→ campaign_metrics
campaign_assets ──1:N──→ creative_reviews
```

### 7.2 Campaign Asset Roles

Each `campaign_asset` record carries:
- `asset_role`: hero, supporting, variant, localized, thumbnail, social_crop, print_adaptation
- `target_channels[]`: which channels this asset is intended for
- `production_status`: briefed, in_production, in_review, approved, deployed, retired
- `brand_compliance_score`: 0–100 (computed from automated + manual checks)

### 7.3 Channel Distribution Logic

```
campaign_channels (defines strategy)
     │
     ├── channel_type: social_meta, social_tiktok, social_linkedin, display, email,
     │                 website, print, ooh, experiential, video, podcast
     ├── budget_allocation: percentage of campaign budget
     ├── launch_date / end_date: per-channel timeline
     └── status: planned, active, paused, completed
          │
          └── asset_channel_deployments (tracks actual deployment)
               ├── campaign_asset_id → which asset
               ├── campaign_channel_id → which channel
               ├── deployed_at / retired_at
               ├── deployment_url (where it went live)
               └── performance_snapshot_id (links to metrics)
```

### 7.4 Multi-Market Localization

```
campaign_assets
├── locale: en-US (original)
├── localized_from_id: NULL (original)
│
└── campaign_assets (localized variant)
    ├── locale: fr-FR
    ├── localized_from_id: original.id
    └── localization_notes: "Adapted tagline, RTL layout for ar-SA"
```

---

## 8. 3NF-Compliant Entity Relationship Model

### 8.1 New Entities

| Entity | Purpose | Key FKs |
|--------|---------|---------|
| `creative_briefs` | Strategic brief with full lifecycle | organization_id, project_id?, brand_guideline_id, template_id?, owner_id |
| `brief_templates` | Reusable brief patterns | organization_id, created_by |
| `brand_guidelines` | Multi-brand hierarchy with versioning | organization_id, parent_id?, brand_kit_id? |
| `brand_guideline_sections` | Typed sections within a guideline | brand_guideline_id |
| `brand_guideline_versions` | Immutable version snapshots | brand_guideline_id, published_by |
| `campaigns` | Campaign lifecycle with strategy | organization_id, brief_id, brand_guideline_version_id |
| `campaign_channels` | Per-channel strategy and budget | campaign_id |
| `campaign_assets` | M:N junction: campaign ↔ digital_asset | campaign_id, digital_asset_id, brief_id? |
| `campaign_kpis` | KPI definitions per campaign | campaign_id |
| `campaign_metrics` | Time-series performance data | campaign_id, campaign_kpi_id?, campaign_channel_id? |
| `creative_reviews` | Multi-gate creative approval workflow | campaign_asset_id, reviewer_id |
| `asset_channel_deployments` | Tracks where assets are deployed | campaign_asset_id, campaign_channel_id |

### 8.2 3NF Compliance Audit

| Entity | 1NF (Atomic) | 2NF (Full Dep) | 3NF (No Transitive) | Notes |
|--------|:---:|:---:|:---:|-------|
| creative_briefs | ✅ | ✅ | ✅ | JSONB for flexible sections (deliverable_manifest, kpi_definitions) — semi-structured by design |
| brief_templates | ✅ | ✅ | ✅ | template_sections as JSONB schema definition |
| brand_guidelines | ✅ | ✅ | ✅ | Hierarchy via self-referential parent_id |
| brand_guideline_sections | ✅ | ✅ | ✅ | section_type + content JSONB for type-specific fields |
| brand_guideline_versions | ✅ | ✅ | ✅ | Immutable snapshots |
| campaigns | ✅ | ✅ | ✅ | Budget on campaign, breakdown on channels |
| campaign_channels | ✅ | ✅ | ✅ | Per-channel budget allocation |
| campaign_assets | ✅ | ✅ | ✅ | Junction with role metadata |
| campaign_kpis | ✅ | ✅ | ✅ | Definition separate from measurement |
| campaign_metrics | ✅ | ✅ | ✅ | Time-series, no derived aggregates persisted |
| creative_reviews | ✅ | ✅ | ✅ | Per-asset, per-gate review records |
| asset_channel_deployments | ✅ | ✅ | ✅ | Tracks actual deployment per channel |

### 8.3 Who/What/When/Where/Why/How/If-Then Coverage

| Entity | Who | What | When | Where | Why | How | If-Then |
|--------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| creative_briefs | owner_id, approvers | objective, scope | timeline | markets[] | business_objectives | deliverable_manifest | status machine |
| brand_guidelines | created_by | brand identity | version_at | markets | governance | sections | inheritance rules |
| campaigns | owner_id | strategy | start/end | channels | brief linkage | assets + channels | status machine |
| campaign_assets | created_by | asset + role | produced_at | channels[] | brief requirement | production_status | compliance gates |
| creative_reviews | reviewer_id | feedback | reviewed_at | — | gate_type | score + notes | approval/rejection |
| campaign_metrics | — | KPI measurement | measured_at | channel | attribution | metric_value | threshold alerts |

All 6 core entities achieve **7/7** coverage.

### 8.4 Integration with Existing Entities

| Existing Entity | Integration Point |
|----------------|-------------------|
| `projects` | `creative_briefs.project_id` (optional) — brief may originate from a project |
| `brand_kits` | `brand_guidelines.brand_kit_id` (optional) — backward-compatible link to existing color data |
| `digital_assets` | `campaign_assets.digital_asset_id` — leverages existing asset metadata/versioning |
| `deals` | `creative_briefs.deal_id` (optional) — brief may originate from a won deal |
| `companies` | `campaigns.company_id` — client association |
| `approvals` | `creative_reviews` extends approval pattern with creative-specific gates |
| `tasks` | Campaign production tasks link via `tasks.campaign_id` |
| `budget_line_items` | Campaign budget attribution via `budget_line_items.campaign_id` |

---

## 9. Approval Dependency Matrix

### 9.1 Brief Approval Gates

| Gate | Required Approvers | Blocks | Parallel |
|------|-------------------|--------|----------|
| G1: Strategy Alignment | Creative Director, Account Lead | Production start | Yes (with G2) |
| G2: Budget Approval | Finance Lead, PM | Production start | Yes (with G1) |
| G3: Legal Review | Legal/Compliance | Distribution only | Yes (with G1, G2) |
| G4: Client Sign-off | Client Stakeholder | Production start | After G1+G2 |

### 9.2 Asset Approval Gates

| Gate | Required Approvers | Blocks | Parallel |
|------|-------------------|--------|----------|
| G5: Creative Review | Creative Director | Client review | No |
| G6: Brand Compliance | Brand Manager (+ automated score) | Distribution | Yes (with G5) |
| G7: Legal/Compliance | Legal Reviewer | Distribution | Yes (with G5) |
| G8: Client Approval | Client Stakeholder | Distribution | After G5 |
| G9: Channel-Specific | Channel Owner | Channel deployment | After G8 |

### 9.3 Campaign Launch Gates

| Gate | Required | Blocks |
|------|----------|--------|
| G10: All channel assets approved | Automated check | Campaign → `launching` |
| G11: Budget reconciled | Finance | Campaign → `live` |
| G12: Legal clearance | Legal | Campaign → `live` |

### 9.4 Dependency Graph

```
Brief: G1+G2 (parallel) → G4 (sequential) → Brief Approved
                                                    │
Campaign Production: G3 runs in parallel ───────────┤
                                                    ▼
Asset: G5 → G6+G7 (parallel) → G8 → G9 (per channel)
                                         │
Campaign Launch: G10+G11+G12 ────────────┘
```

---

## 10. Performance Attribution Model

### 10.1 Three-Tier Attribution

| Tier | Scope | Metrics |
|------|-------|---------|
| **Campaign-level** | Overall campaign performance | Total reach, impressions, engagement rate, conversion rate, ROI, ROAS |
| **Channel-level** | Per-channel performance | Channel-specific reach, CTR, CPC, CPM, conversion by channel |
| **Asset-level** | Per-asset performance | Asset impressions, engagement, click-through, conversion contribution |

### 10.2 KPI Definition Schema

```
campaign_kpis:
├── metric_name: "Engagement Rate"
├── metric_type: percentage | count | currency | ratio
├── target_value: 4.5
├── measurement_method: "Total engagements / Total impressions × 100"
├── attribution_model: first_touch | last_touch | linear | time_decay | position_based
├── data_source: platform_api | manual | utm_tracking
└── reporting_frequency: daily | weekly | monthly
```

### 10.3 Metrics Time-Series

```
campaign_metrics:
├── campaign_id
├── campaign_kpi_id (optional — for KPI-aligned metrics)
├── campaign_channel_id (optional — for channel-level metrics)
├── campaign_asset_id (optional — for asset-level metrics)
├── metric_name
├── metric_value: NUMERIC
├── measured_at: TIMESTAMPTZ
└── metadata: JSONB (source, confidence, notes)
```

### 10.4 Feedback Loop

```
Campaign Metrics → Asset Performance Scores → Creative Review Insights
       │                                              │
       ▼                                              ▼
Post-Campaign Analysis ──→ Brief Retrospective ──→ Template Improvements
       │
       ▼
Next Campaign Brief (informed by data)
```

---

## 11. Version Control & Archival Strategy

### 11.1 Version Control by Entity

| Entity | Strategy | Trigger |
|--------|----------|---------|
| Creative Briefs | Status snapshots + amendment records | Status transition or amendment |
| Brand Guidelines | Section-level versioning with immutable snapshots | Explicit publish action |
| Campaign Assets | Leverages `asset_versions` from Migration 014 | New file upload |
| Campaigns | Status history via activity log | Status transition |
| Templates | Version integer, immutable after use | Explicit publish action |

### 11.2 Archival Rules

| Entity | Archive Trigger | Retention |
|--------|----------------|-----------|
| Creative Briefs | 90 days after campaign completion | 7 years (regulatory) |
| Brand Guidelines | Superseded by new version | Indefinite (historical reference) |
| Campaign Assets | Campaign archived + 30 days | Per retention policy (default 3 years) |
| Campaigns | 60 days after completion + post-analysis | 5 years |
| Campaign Metrics | — | 5 years (analytics value) |

### 11.3 Immutability Rules

- Brand guideline versions are **immutable** after publish
- Brief amendments create new records (never modify approved brief)
- Campaign metrics are **append-only** (no updates, no deletes)
- Creative review records are **immutable** after submission
- Asset versions leverage existing immutability from Migration 014

---

## 12. Asset Reuse & Modularity Framework

### 12.1 Reuse Patterns

| Pattern | Description | Implementation |
|---------|------------|---------------|
| **Cross-Campaign Reuse** | Same asset deployed across multiple campaigns | `campaign_assets` M:N junction allows sharing |
| **Localization Variants** | Market-specific adaptations of original asset | `localized_from_id` self-reference on `campaign_assets` |
| **Template Instantiation** | Brief templates with pre-filled sections | `brief_templates` → `creative_briefs.template_id` |
| **Channel Adaptation** | Same creative adapted for different channels (16:9 → 1:1 → 9:16) | `asset_role` + `target_channels[]` on `campaign_assets` |
| **Seasonal Refresh** | Update assets with new season/date while retaining layout | Link to template asset + override fields |

### 12.2 Reuse Discovery

When creating a new campaign asset:
1. Query existing `digital_assets` matching same brand_guideline + asset_class
2. Surface assets from previous campaigns with high performance scores
3. Suggest localization variants needed based on campaign markets
4. Recommend channel adaptations based on campaign_channels

### 12.3 Duplicate Prevention

- Before uploading a new asset, check perceptual hash against existing assets in same org
- Flag potential duplicates with similarity score
- Suggest linking to existing asset instead of re-uploading
- Track "reuse rate" as an efficiency metric

---

## 13. UI/UX Simplification Principles

### 13.1 Role-Based Views

| Role | Primary View | Secondary Access |
|------|-------------|-----------------|
| **Creative Director** | Brief inbox, campaign overview, review queue | Brand guidelines, performance dashboards |
| **Brand Manager** | Brand guidelines editor, compliance dashboard | Review queue, campaign overview |
| **Marketing Manager** | Campaign planner, content calendar, performance | Briefs, channel strategy |
| **Designer/Producer** | Asset production queue, review feedback | Brief details, brand guidelines reference |
| **Account Manager** | Client-facing campaign progress, brief intake | Performance reports |
| **Executive** | Portfolio performance, ROI dashboards | Campaign summaries |

### 13.2 Progressive Disclosure

| Level | Shown | Hidden Until Needed |
|-------|-------|-------------------|
| L1: Overview | Campaign cards with status, brief status, top-line metrics | Detailed sections |
| L2: Working | Asset production board, review queue, channel status | Configuration, settings |
| L3: Deep | Metric time-series, brand compliance details, version diffs | Archival, admin |

### 13.3 Navigation Integration

The existing "Creative" nav section expands:

```
Creative
├── Briefs           (creative brief lifecycle)
├── Brand Guidelines (multi-brand governance)
├── Campaigns        (campaign lifecycle + performance)
├── Brand Kit        (existing — backward compatible)
├── Decks            (existing)
├── Templates        (existing — enhanced with brief templates)
```

### 13.4 Key UX Patterns

- **Brief Wizard**: Step-by-step guided brief creation with progressive sections
- **Campaign Kanban**: Drag-drop campaign status board (planning → live → completed)
- **Review Lightbox**: Full-screen asset review with annotation, side-by-side brand guideline reference
- **Performance Dashboard**: Real-time campaign metrics with drill-down to channel and asset level
- **Brand Compliance Score**: Visual indicator on every asset showing adherence to guidelines
- **Content Calendar**: Timeline view of campaign milestones + asset due dates + channel launch dates

### 13.5 Performance Targets

| Interaction | Target |
|------------|--------|
| Brief creation wizard step transition | < 100ms |
| Campaign Kanban drag-drop | < 50ms |
| Asset review lightbox open | < 200ms |
| Performance dashboard load | < 500ms |
| Brand compliance score computation | < 1s |

---

## 14. Automation & AI Augmentation Roadmap

### 14.1 Phase 0 — Rule-Based Automation (P0)

| # | Automation | Trigger | Action |
|---|-----------|---------|--------|
| A1 | Brief status advancement | All required approvers approved | Move to next state |
| A2 | Campaign asset count validation | Asset uploaded to campaign | Check against brief deliverable manifest |
| A3 | Brand compliance pre-check | Asset uploaded | Compare color palette, fonts against guideline |
| A4 | Campaign launch readiness | All assets approved | Notify campaign owner |
| A5 | Post-campaign analysis trigger | Campaign end_date + 7 days | Create retrospective task |
| A6 | Guideline version notification | New version published | Notify active campaign owners |
| A7 | KPI threshold alerts | Metric value crosses threshold | Notify campaign owner |
| A8 | Review SLA enforcement | Review request > 48hrs | Escalate to reviewer's manager |

### 14.2 Phase 1 — Smart Automation (P1)

| # | Automation | Input | Output |
|---|-----------|-------|--------|
| S1 | Smart brief prefill | Brief type + client history | Pre-populated sections from past briefs |
| S2 | Budget estimation | Brief scope + historical data | Suggested budget breakdown |
| S3 | Timeline estimation | Deliverable manifest + team capacity | Suggested milestone dates |
| S4 | Channel recommendation | Target audience + objectives | Recommended channel mix |
| S5 | Asset format generation | Channel strategy | Required asset specifications per channel |
| S6 | Review routing | Asset type + campaign tier | Optimal reviewer assignment |

### 14.3 Phase 2 — AI-Assisted (P2)

| # | Capability | Input | Output |
|---|-----------|-------|--------|
| I1 | AI brief drafting | Objective + audience + constraints | Draft brief with all sections |
| I2 | Brand compliance scoring | Asset image/video + guidelines | Compliance score + deviation details |
| I3 | Copy tone analysis | Written content + voice guidelines | Tone adherence score + suggestions |
| I4 | Asset repurposing suggestions | Completed campaign assets + new brief | Recommended assets for reuse/adaptation |
| I5 | Performance prediction | Historical campaign data + new brief | Predicted KPI ranges |
| I6 | Creative fatigue detection | Asset performance over time | Refresh recommendation with timing |

### 14.4 Phase 3 — Advanced AI (P3)

| # | Capability | Description |
|---|-----------|-------------|
| X1 | Generative brief expansion | Turn bullet points into full brief sections |
| X2 | Auto-localization suggestions | Recommend cultural adaptations per market |
| X3 | Dynamic creative optimization | A/B variant selection based on real-time performance |
| X4 | Competitive creative analysis | Benchmark against competitor creative (with data source) |
| X5 | Brand evolution tracking | Trend analysis of brand guideline changes over time |

### 14.5 Priority Matrix

```
Impact ▲
       │  I2  X3
       │  I1  S1  A3
       │  I4  S4  A1  A4
       │  S2  S5  A2  A5
       │  I5  S3  A6  A7
       │  X1  S6  A8
       │  X2  X4  X5  I6  I3
       └──────────────────────→ Effort
```

---

## 15. Implementation Roadmap

### Phase 0 (P0) — Foundation (Weeks 1–3)

- [ ] Migration 015: `creative_briefs`, `brief_templates`, `brand_guidelines`, `brand_guideline_sections`, `brand_guideline_versions`, `campaigns`, `campaign_channels`, `campaign_assets`, `campaign_kpis`, `campaign_metrics`, `creative_reviews`, `asset_channel_deployments`
- [ ] TypeScript types for all new entities
- [ ] RBAC permissions for creative domain
- [ ] Navigation expansion
- [ ] Pages: /briefs, /brand-guidelines, /campaigns, /creative-assets

### Phase 1 (P1) — Workflow & Governance (Weeks 4–6)

- [ ] Brief creation wizard with template selection
- [ ] Brand guideline editor with section management
- [ ] Campaign Kanban board
- [ ] Creative review workflow with multi-gate approvals
- [ ] Brand compliance scoring (rule-based)

### Phase 2 (P2) — Performance & Intelligence (Weeks 7–10)

- [ ] Campaign performance dashboard
- [ ] KPI tracking and threshold alerts
- [ ] Asset-level performance attribution
- [ ] Post-campaign analysis automation
- [ ] Channel distribution tracking

### Phase 3 (P3) — AI & Optimization (Weeks 11–16)

- [ ] AI brief drafting
- [ ] AI brand compliance scoring (vision model)
- [ ] Asset repurposing suggestions
- [ ] Creative fatigue detection
- [ ] Dynamic creative optimization

---

*This architecture connects creative strategy to measurable execution through a normalized, governance-driven system that prevents brand fragmentation, accelerates creative velocity, and provides full traceability from initial brief through campaign performance.*
