# Schema Enrichment Report — Vendor & Contractor Tables

> **Migration Sources:** 001, 008, 016
> **Tables:** vendors, vendor_contacts, vendor_categories, vendor_insurance, vendor_documents, vendor_scorecards, vendor_scorecard_reviews, vendor_compliance_items, vendor_payment_terms, contracts, contract_amendments, vendor_risk_scores

---

## vendors

| Attribute | Value |
|---|---|
| **Migration** | 001 (created), 008 (extended) |
| **Route(s)** | vendors/, procurement/, finance/ |
| **Current Columns** | 13 |
| **Recommended Columns** | +5 |
| **Compliance Score** | Before: 62% → After: 82% |

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `tax_id` | FT-PII-007 | TEXT | 1099 reporting; IRS requirement for vendors >$600/yr | enterprise |
| `payment_terms_default` | FT-TEXT-001 | TEXT | Net-30/Net-60; cash flow management | pro |
| `insurance_minimum_required` | FT-FIN-001 | NUMERIC(12,2) | Minimum COI coverage amount; liability management | pro |
| `diversity_classification` | FT-TEXT-001 | TEXT | MBE/WBE/SDVOB; government contract compliance | enterprise |
| `preferred_vendor` | FT-BOOL-001 | BOOLEAN | Preferred vendor program flag; procurement optimization | core |

### Columns to Re-type

| Column | Current | Recommended | Reason |
|---|---|---|---|
| `status` | TEXT CHECK | ENUM `vendor_status` | Type safety; migration 008 defines expanded enum |
| `rating` | NUMERIC(0-5) | NUMERIC(3,2) | Precision for composite scoring |

### PII Classification

- `email`, `phone`, `contact_name` — **direct PII**; visible to pm+ roles
- `tax_id` — **regulated PII**; enterprise tier, encrypted at rest, audit logged
- `coi_expiry_date` — **compliance data**; visible at core tier (safety-critical)

### RLS Assessment

- Current: Org-scoped — adequate
- Gap: Vendor-role users should only see their own vendor record + assigned POs/WOs

---

## contracts (Migration 008/016)

| Attribute | Value |
|---|---|
| **Migration** | 008 (created), 016 (governance extension) |
| **Route(s)** | vendors/, finance/ |
| **Current Columns** | ~20 |
| **Compliance Score** | 88% |

### Assessment

Full contract lifecycle with `contract_type` and `contract_status` enums, auto-renewal, value tracking, and party references. Migration 016 adds governance links (entity_dependencies, governance_audit_logs). Well-designed.

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `indemnification_clause` | FT-BOOL-001 | BOOLEAN | Liability tracking for legal review | enterprise |
| `jurisdiction` | FT-TEXT-001 | TEXT | Governing law jurisdiction; international operations | enterprise |

---

## vendor_insurance (Migration 008)

| Attribute | Value |
|---|---|
| **Migration** | 008 |
| **Route(s)** | vendors/ |
| **Current Columns** | ~12 |
| **Compliance Score** | 90% |

### Assessment

COI tracking with policy type, coverage amounts, expiry dates, and additional insured status. Aligns with industry standard COI requirements (general liability, workers' comp, auto, umbrella). No enrichment needed.

---

## vendor_scorecards / vendor_scorecard_reviews (Migration 008)

| Attribute | Value |
|---|---|
| **Migration** | 008 |
| **Route(s)** | vendors/ |
| **Compliance Score** | 92% |

### Assessment

Multi-dimensional vendor evaluation with quality, timeliness, communication, safety, and value scores. Review history with reviewer attribution. Enterprise-grade vendor management. No enrichment needed.

---

## vendor_compliance_items (Migration 008)

| Attribute | Value |
|---|---|
| **Migration** | 008 |
| **Route(s)** | vendors/ |
| **Compliance Score** | 88% |

### Assessment

Tracks required compliance documents per vendor (COI, W-9, NDA, background check, drug test, union card). Status tracking with expiry dates and document URLs. Well-designed.

### Gap

Missing `auto_reminder_enabled` boolean and `reminder_days_before` integer for proactive compliance expiry notifications.
