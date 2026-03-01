# Schema Enrichment Report — Creative, Brand & Campaign Tables

> **Migration Sources:** 001, 014, 015
> **Tables:** brand_kits, decks, deck_slides, creative_briefs, brand_guidelines, campaigns, campaign_assets, campaign_kpis, creative_reviews, asset_channel_deployments, digital_assets, asset_versions, asset_collections, asset_tags, usage_rights, watermarks

---

## brand_kits

| Attribute | Value |
|---|---|
| **Migration** | 001 |
| **Route(s)** | brand-kit/ |
| **Current Columns** | 11 |
| **Recommended Columns** | +3 |
| **Compliance Score** | Before: 65% → After: 80% |

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `brand_voice_guidelines` | FT-TEXT-002 | TEXT | Copy tone/voice documentation for consistent brand messaging | pro |
| `do_not_use_notes` | FT-TEXT-002 | TEXT | Brand misuse examples and restrictions | pro |
| `approved_by` | FT-ID-004 | UUID FK | Client brand approval sign-off | core |

### Columns to Re-type

| Column | Current | Recommended | Reason |
|---|---|---|---|
| `client_id` | TEXT | UUID FK → accounts(id) | Should reference CRM accounts table (013) |

---

## decks / deck_slides

| Attribute | Value |
|---|---|
| **Migration** | 001 |
| **Route(s)** | decks/ |
| **Compliance Score** | 82% |

### Assessment

Presentation deck management with type classification (pitch/progress/wrap), status tracking, and JSONB data bindings for dynamic slide content. Well-structured for template-driven deck generation.

### Gap

Missing `shared_with` (UUID[] or junction table) for client-facing deck sharing with access control.

---

## creative_briefs (Migration 015)

| Attribute | Value |
|---|---|
| **Migration** | 015 |
| **Route(s)** | projects/ (creative workflow) |
| **Current Columns** | ~18 |
| **Compliance Score** | 90% |

### Assessment

Full creative brief lifecycle with `brief_status` enum (draft → submitted → in_review → approved → in_production → delivered → closed), deliverable specs, budget, and approval workflow. Links to projects, brand guidelines, and campaigns. Enterprise-grade. No enrichment needed.

---

## brand_guidelines (Migration 015)

| Attribute | Value |
|---|---|
| **Migration** | 015 |
| **Route(s)** | brand-kit/ |
| **Current Columns** | ~15 |
| **Compliance Score** | 92% |

### Assessment

Versioned brand guideline documents with `guideline_type` enum, `guideline_status`, version tracking, and approval workflow. Supersedes the simpler `brand_kits` table for enterprise use. No enrichment needed.

---

## campaigns (Migration 015)

| Attribute | Value |
|---|---|
| **Migration** | 015 |
| **Route(s)** | campaigns/ |
| **Current Columns** | ~20 |
| **Compliance Score** | 88% |

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `geo_targeting` | FT-JSON-001 | JSONB | Geographic targeting for multi-market campaigns | pro |
| `a_b_test_config` | FT-JSON-001 | JSONB | A/B testing parameters for creative variants | enterprise |

---

## campaign_kpis (Migration 015)

| Attribute | Value |
|---|---|
| **Migration** | 015 |
| **Route(s)** | campaigns/ |
| **Compliance Score** | 92% |

### Assessment

KPI tracking with metric type classification, target vs actual values, and measurement periods. Well-designed for proof-of-performance reporting. No enrichment needed.

---

## creative_reviews (Migration 015)

| Attribute | Value |
|---|---|
| **Migration** | 015 |
| **Route(s)** | campaigns/, projects/ |
| **Compliance Score** | 90% |

### Assessment

Multi-round creative review with `review_status` enum, reviewer assignment, version tracking, and feedback notes. Standard creative workflow. No enrichment needed.

---

## digital_assets (Migration 014)

| Attribute | Value |
|---|---|
| **Migration** | 014 |
| **Route(s)** | assets/ (digital asset management) |
| **Current Columns** | ~25 |
| **Compliance Score** | 90% |

### Assessment

Full DAM system with `asset_type` enum (image, video, audio, document, 3d_model, cad, vector, presentation, spreadsheet, archive), metadata extraction, version control, and usage rights tracking. Links to Supabase Storage. Enterprise-grade.

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `ai_generated` | FT-BOOL-001 | BOOLEAN | AI content disclosure; FTC/EU AI Act compliance | core |
| `model_release_on_file` | FT-BOOL-001 | BOOLEAN | Talent/model release for commercial use; IP protection | pro |

---

## usage_rights (Migration 014)

| Attribute | Value |
|---|---|
| **Migration** | 014 |
| **Route(s)** | assets/ |
| **Compliance Score** | 92% |

### Assessment

Rights management with `license_type` enum, territory/duration/medium restrictions, and exclusivity terms. Essential for brand content licensing and sponsor deliverables. No enrichment needed.
