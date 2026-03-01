# Schema Enrichment Report — CRM & Revenue Tables

> **Migration Sources:** 001, 004, 013
> **Tables:** deals, stakeholders, stakeholder_projects, case_studies, case_study_metrics, accounts, contacts, opportunities, opportunity_contacts, revenue_forecasts, change_orders, lost_reasons, lead_sources, deal_activities

---

## deals

| Attribute | Value |
|---|---|
| **Migration** | 001 (created), 013 (extended) |
| **Route(s)** | pipeline/, dashboard/ |
| **Current Columns** | ~14 |
| **Recommended Columns** | +4 |
| **Compliance Score** | Before: 70% → After: 85% |

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `source_id` | FT-ID-002 | UUID FK | Links to `lead_sources`; attribution tracking for marketing ROI | pro |
| `lost_reason_id` | FT-ID-002 | UUID FK | Links to `lost_reasons`; pipeline loss analysis | pro |
| `weighted_value` | FT-FIN-001 | NUMERIC GENERATED | `value * probability / 100`; pipeline forecasting | core |
| `currency` | FT-TEXT-003 | TEXT | ISO 4217; multi-currency deal tracking | pro |

### Columns to Re-type

| Column | Current | Recommended | Reason |
|---|---|---|---|
| `stage` | TEXT CHECK | ENUM `deal_stage` | Type safety; migration 013 defines proper enum |
| `probability` | INTEGER | NUMERIC(5,2) | Allow decimal probabilities |

### RLS Assessment

- Current: Org-scoped — adequate
- Gap: Client-role users should only see deals where they are the contact

---

## accounts (Migration 013)

| Attribute | Value |
|---|---|
| **Migration** | 013 |
| **Route(s)** | pipeline/, people/ |
| **Current Columns** | ~15 |
| **Compliance Score** | 88% |

### Assessment

Enterprise CRM account model with `account_type` enum, industry classification, annual revenue, employee count, and parent account hierarchy. Well-designed. Minor gap: missing `credit_limit` for enterprise billing.

---

## contacts (Migration 013)

| Attribute | Value |
|---|---|
| **Migration** | 013 |
| **Route(s)** | people/, pipeline/ |
| **Current Columns** | ~18 |
| **Compliance Score** | 82% |

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `gdpr_consent_at` | FT-TEMP-002 | TIMESTAMPTZ | GDPR Art. 7 — consent timestamp for PII processing | core |
| `communication_opt_out` | FT-BOOL-001 | BOOLEAN | CAN-SPAM / CCPA opt-out compliance | core |
| `dietary_restrictions` | FT-TEXT-002 | TEXT | Hospitality/catering for VIP contacts at events | pro |

### PII Classification

All contact fields (`email`, `phone`, `mobile`, `address`) are **direct PII** — require field-level masking for vendor/crew roles and audit trail on access.

---

## opportunities (Migration 013)

| Attribute | Value |
|---|---|
| **Migration** | 013 |
| **Route(s)** | pipeline/ |
| **Current Columns** | ~20 |
| **Compliance Score** | 90% |

### Assessment

Full opportunity lifecycle with `opportunity_stage` enum, `win_probability`, `close_date`, `competitor` tracking, and `deal_id` FK. Comprehensive. No enrichment needed.

---

## revenue_forecasts (Migration 013)

| Attribute | Value |
|---|---|
| **Migration** | 013 |
| **Route(s)** | dashboard/, finance/ |
| **Current Columns** | ~12 |
| **Compliance Score** | 92% |

### Assessment

Monthly/quarterly revenue projections with `forecast_type` enum (conservative, expected, optimistic). Links to accounts and projects. Well-designed for ASC 606 revenue recognition. No enrichment needed.

---

## change_orders (Migration 013)

| Attribute | Value |
|---|---|
| **Migration** | 013 |
| **Route(s)** | projects/, finance/, approvals/ |
| **Current Columns** | ~15 |
| **Compliance Score** | 88% |

### Assessment

Change order lifecycle with cost/schedule impact tracking, approval workflow integration. Gap: missing `client_approved_at` timestamp for signed change order documentation.

---

## stakeholders

| Attribute | Value |
|---|---|
| **Migration** | 001 |
| **Route(s)** | people/, org-chart/ |
| **Current Columns** | 10 |
| **Compliance Score** | 72% |

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `title` | FT-TEXT-001 | TEXT | Professional title for contact cards | core |
| `company` | FT-TEXT-001 | TEXT | Company affiliation when type is external | core |
| `account_id` | FT-ID-002 | UUID FK | Link to CRM accounts table (013) | pro |
| `contact_id` | FT-ID-002 | UUID FK | Link to CRM contacts table (013) for deduplication | pro |

### Gap Analysis

The `stakeholders` table predates the CRM tables (013). It duplicates contact information that now lives in `contacts`/`accounts`. **Recommendation:** Deprecate `stakeholders` in favor of `contacts` with a `stakeholder_type` enum, or add FK references to bridge them.

---

## case_studies

| Attribute | Value |
|---|---|
| **Migration** | 001 |
| **Route(s)** | case-studies/ |
| **Current Columns** | 10 |
| **Compliance Score** | 80% |

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `industry_tags` | FT-ARR-001 | TEXT[] | Categorization for filtered browsing | core |
| `client_approved` | FT-BOOL-001 | BOOLEAN | Client sign-off before publishing | core |
| `video_url` | FT-URL-001 | TEXT | Video case study content | pro |
| `testimonial_quote` | FT-TEXT-002 | TEXT | Client testimonial for marketing | pro |
