# Schema Enrichment Report — Finance & Procurement Tables

> **Migration Sources:** 001, 005, 007, 016
> **Tables:** purchase_orders, purchase_order_items, invoices, budgets, budget_line_items, expenses, time_entries, client_invoices, credit_notes, payroll_batches, production_expenses, gl_accounts, purchase_requisitions, goods_receipts, vendor_risk_scores, budget_approvals, payment_approvals

---

## purchase_orders

| Attribute | Value |
|---|---|
| **Migration** | 001 (created), 016 (governance links) |
| **Route(s)** | procurement/, finance/ |
| **Current Columns** | 9 |
| **Recommended Columns** | +4 |
| **Compliance Score** | Before: 68% → After: 85% |

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `po_number` | FT-TEXT-004 | TEXT | Human-readable PO reference; procurement audit trail | core |
| `currency` | FT-TEXT-003 | TEXT | ISO 4217; multi-currency vendor payments | pro |
| `payment_terms` | FT-TEXT-001 | TEXT | Net-30/Net-60/etc.; cash flow forecasting | pro |
| `approved_by` | FT-ID-004 | UUID FK | Approval chain; SOX segregation of duties | pro |

### Columns to Re-type

| Column | Current | Recommended | Reason |
|---|---|---|---|
| `status` | TEXT CHECK | ENUM `po_status` | Type safety; align with migration 016 patterns |

---

## invoices

| Attribute | Value |
|---|---|
| **Migration** | 001 (created), 005 (extended) |
| **Route(s)** | finance/ |
| **Current Columns** | 11 |
| **Recommended Columns** | +3 |
| **Compliance Score** | Before: 72% → After: 88% |

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `invoice_number` | FT-TEXT-004 | TEXT | Vendor invoice reference; 3-way match reconciliation | core |
| `currency` | FT-TEXT-003 | TEXT | ISO 4217 | pro |
| `tax_amount` | FT-FIN-001 | NUMERIC(12,2) | Sales tax/VAT compliance; international operations | pro |

---

## gl_accounts (Migration 016)

| Attribute | Value |
|---|---|
| **Migration** | 016 |
| **Route(s)** | finance/ (chart of accounts) |
| **Current Columns** | ~12 |
| **Compliance Score** | 92% |

### Assessment

Full chart of accounts with `gl_account_type` enum, `account_code`, `parent_account_id` hierarchy, `is_active` flag, and `normal_balance` (debit/credit). GAAP-compliant design. No enrichment needed.

---

## purchase_requisitions (Migration 016)

| Attribute | Value |
|---|---|
| **Migration** | 016 |
| **Route(s)** | procurement/ |
| **Current Columns** | ~15 |
| **Compliance Score** | 90% |

### Assessment

Full requisition-to-PO lifecycle with `requisition_status` enum, multi-level approval, budget linkage, and urgency classification. Well-designed. Gap: missing `delivery_location_id` FK to `locations` table for logistics coordination.

---

## goods_receipts (Migration 016)

| Attribute | Value |
|---|---|
| **Migration** | 016 |
| **Route(s)** | procurement/ |
| **Current Columns** | ~12 |
| **Compliance Score** | 88% |

### Assessment

3-way match component (PO → GR → Invoice). Includes `quantity_received`, `condition_notes`, `received_by`. Gap: missing `warehouse_location_id` FK (019) for inventory placement tracking.

---

## vendor_risk_scores (Migration 016)

| Attribute | Value |
|---|---|
| **Migration** | 016 |
| **Route(s)** | vendors/ |
| **Current Columns** | ~10 |
| **Compliance Score** | 90% |

### Assessment

Composite risk scoring with `financial_score`, `compliance_score`, `performance_score`, `overall_score`. Links to vendors. Well-designed for vendor due diligence. No enrichment needed.

---

## budgets / budget_line_items (Migration 005)

| Attribute | Value |
|---|---|
| **Migration** | 005 |
| **Route(s)** | finance/, projects/ |
| **Current Columns** | ~12 / ~10 |
| **Compliance Score** | 85% |

### Columns to Add (budget_line_items)

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `gl_account_id` | FT-ID-002 | UUID FK | Links to chart of accounts; GAAP cost coding | pro |
| `cost_center` | FT-TEXT-001 | TEXT | Department cost allocation; P&L attribution | pro |
| `committed_amount` | FT-FIN-001 | NUMERIC(12,2) | 3-bucket budgeting (estimated/committed/actual) | pro |

---

## client_invoices (Migration 005)

| Attribute | Value |
|---|---|
| **Migration** | 005 |
| **Route(s)** | finance/ |
| **Current Columns** | ~15 |
| **Compliance Score** | 85% |

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `asc_606_recognized_at` | FT-TEMP-002 | TIMESTAMPTZ | ASC 606 revenue recognition timestamp | enterprise |
| `retention_percent` | FT-NUM-002 | NUMERIC(5,2) | Client payment retention/holdback percentage | pro |

---

## expenses / time_entries / production_expenses (Migration 005)

| Attribute | Value |
|---|---|
| **Migration** | 005 |
| **Route(s)** | finance/, projects/ |
| **Compliance Score** | 85% |

### Assessment

Standard expense and time tracking with category enums, approval workflows, and project linkage. Well-structured. Gaps:
- `expenses` missing `receipt_verified` boolean for audit compliance
- `time_entries` missing `overtime_flag` for FLSA compliance
- `production_expenses` well-designed with `expense_category` enum covering production-specific categories

---

## payroll_batches (Migration 005)

| Attribute | Value |
|---|---|
| **Migration** | 005 |
| **Route(s)** | finance/ |
| **Current Columns** | ~12 |
| **Compliance Score** | 82% |

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `tax_withholding_total` | FT-FIN-001 | NUMERIC(12,2) | Federal/state tax withholding; IRS compliance | enterprise |
| `union_dues_total` | FT-FIN-001 | NUMERIC(12,2) | IATSE/Teamsters/SAG-AFTRA union deductions | enterprise |
| `workers_comp_total` | FT-FIN-001 | NUMERIC(12,2) | Workers' compensation insurance allocation | enterprise |

### PII Classification

All payroll data is **sensitive PII** — requires enterprise tier, field-level encryption at rest, and audit trail on every access.
