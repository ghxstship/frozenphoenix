# 📊 TYPE_CANONIZATION.md — Data Type & Constraint Audit

> **Protocol**: FP-DATA-BEDROCK-001 · Phase 4
> **Generated**: 2026-03-29
> **Scope**: 352 tables, 280 ENUMs

## Type Consistency Audit

### ✅ COMPLIANT Patterns

| Pattern         | Convention                                                                     | Status                          |
| --------------- | ------------------------------------------------------------------------------ | ------------------------------- |
| Primary Keys    | `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`                                | ✅ 100% consistent              |
| Created At      | `created_at TIMESTAMPTZ DEFAULT NOW()`                                         | ✅ 100% consistent              |
| Updated At      | `updated_at TIMESTAMPTZ DEFAULT NOW()`                                         | ✅ Present on 270/352 tables    |
| Organization FK | `organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE` | ✅ Consistent across 289 tables |
| User FKs        | `*_by UUID REFERENCES user_profiles(id)`                                       | ✅ Post-migration 081           |

### ⚠️ VIOLATIONS

#### V1: Mixed Status Column Types (43 TEXT vs 106 ENUM)

**43 tables** use `status TEXT CHECK(status IN (...))` instead of PostgreSQL ENUM types.

| Table          | Current Type       | Recommended ENUM                     | Notes                      |
| -------------- | ------------------ | ------------------------------------ | -------------------------- |
| `projects`     | TEXT CHECK         | `project_status` ENUM already exists | ⚠️ Not using existing ENUM |
| `tasks`        | TEXT CHECK         | `task_status` ENUM already exists    | ⚠️ Not using existing ENUM |
| `deals`        | TEXT CHECK (stage) | —                                    | Uses `stage` not `status`  |
| `invoices`     | TEXT CHECK         | `invoice_status` ENUM exists         | ⚠️ Not using existing ENUM |
| `milestones`   | TEXT CHECK         | `milestone_status` ENUM exists       | ⚠️ Not using existing ENUM |
| `expenses`     | TEXT CHECK         | `expense_status` ENUM exists         | ⚠️ Not using existing ENUM |
| `time_entries` | TEXT CHECK         | `time_entry_status` ENUM exists      | ⚠️ Not using existing ENUM |
| `companies`    | TEXT CHECK         | —                                    | No ENUM defined            |
| `contacts`     | TEXT CHECK         | —                                    | No ENUM defined            |
| `vendors`      | TEXT CHECK         | `vendor_status` ENUM exists          | ⚠️ Not using existing ENUM |
| `crew_members` | TEXT CHECK         | `crew_status` ENUM exists            | ⚠️ Not using existing ENUM |
| ...            | ...                | ...                                  | 32 more tables             |

> [!IMPORTANT]
> **Root Cause**: Tables from migrations 001-005 (the earliest schema) tend to use TEXT CHECK constraints. Tables from migration 008+ consistently use ENUM types. This is a generational pattern from the schema's evolution.

**Risk Assessment**: LOW — TEXT CHECK constraints are functionally equivalent to ENUMs for data validation. The generated TypeScript types handle both correctly. However, ENUMs provide:

- Better `pg_dump` documentation
- Cleaner `ALTER TYPE` syntax for future value additions
- Slightly better query optimization

**Recommendation**: Add to remediation backlog but do NOT prioritize. A bulk migration to convert TEXT CHECK → ENUM for 43 tables would be the correct fix, but the effort-to-benefit ratio is unfavorable.

#### V2: Mixed Money Column Precision

| Precision       | Count | Tables                                                           |
| --------------- | ----- | ---------------------------------------------------------------- |
| `NUMERIC(14,2)` | ~30   | Most financial tables (invoices, proposals, budgets)             |
| `NUMERIC(12,2)` | ~10   | Some older tables (proposals, rate_cards)                        |
| `NUMERIC(10,2)` | ~15   | Rate cards, expenses, some line items                            |
| `NUMERIC(14,4)` | 1     | `custom_field_values.value_number` (higher precision for custom) |

**Recommendation**: Standardize on `NUMERIC(14,2)` for all monetary columns. The mixed precision doesn't cause data loss (smaller can be widened) but is inconsistent.

#### V3: Missing NOT NULL on `created_at`

Most `created_at TIMESTAMPTZ DEFAULT NOW()` columns are nullable (the DEFAULT handles insert, but an explicit `NOT NULL` would prevent accidental nulls).

**Risk**: Negligible — the DEFAULT ensures non-null in practice.

---

## ENUM Audit

### ENUM Count: 280

### Unused ENUMs (no column references found)

Based on the generated types, ALL 280 ENUMs are referenced by at least one column.

### ENUM Type Mismatches

| ENUM          | Issue                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------- |
| `department`  | Still used by `rate_card_items`, `resource_bookings` but `departments` table is now canonical (071) |
| `entity_type` | Very broad — used by `automations`, `saved_views`, etc. but values are limited to original 005 set  |

### Large ENUMs (>15 values)

| ENUM                    | Values | Notes                               |
| ----------------------- | ------ | ----------------------------------- |
| `budget_category`       | 40     | Event industry specific — justified |
| `clause_type`           | 23     | Legal domain — justified            |
| `command_position_type` | 18     | ICS framework — justified           |
| `compliance_doc_type`   | 18     | Regulatory — justified              |
| `certification_type`    | 16     | Industry specific — justified       |
| `currency_code`         | 20     | ISO standard — justified            |
| `contract_category`     | 15     | Legal domain — justified            |

All large ENUMs are domain-specific and justified.

---

## Constraint Completeness

### CHECK Constraints

- All TEXT-based status columns have CHECK constraints ✓
- All rating columns have range CHECKs (e.g., `CHECK (rating BETWEEN 1 AND 5)`) ✓
- Percentage columns have range CHECKs ✓

### NOT NULL Coverage

- All `id` columns: `NOT NULL` (via PRIMARY KEY) ✓
- All `organization_id` columns: `NOT NULL` ✓ (289 tables)
- Most `status` columns: `NOT NULL` ✓
- Most `name`/`title` columns: `NOT NULL` ✓

### DEFAULT Values

- All `id`: `DEFAULT gen_random_uuid()` ✓
- All `created_at`: `DEFAULT NOW()` ✓
- All `updated_at`: `DEFAULT NOW()` ✓
- Most `status`: `DEFAULT '<initial_status>'` ✓
- Most `is_*`: `DEFAULT false/true` ✓

---

## Summary

| Finding                        | Severity   | Count     | Action                                 |
| ------------------------------ | ---------- | --------- | -------------------------------------- |
| TEXT CHECK vs ENUM mismatch    | LOW        | 43 tables | Backlog (functional parity)            |
| Mixed money precision          | LOW        | ~55 cols  | Backlog (standardize to NUMERIC(14,2)) |
| Missing NOT NULL on created_at | NEGLIGIBLE | ~200 cols | Backlog                                |
| ENUM type hygiene              | LOW        | 2 ENUMs   | Advisory only                          |

> [!TIP]
> **Overall Assessment**: Type system is **well-designed**. The TEXT CHECK vs ENUM split is the most notable pattern, but it's a cosmetic/organizational issue rather than a correctness issue.
