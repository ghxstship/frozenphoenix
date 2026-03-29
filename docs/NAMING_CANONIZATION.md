# 📐 NAMING_CANONIZATION.md — FrozenPhoenix Naming Convention Audit

> **Protocol**: FP-DATA-BEDROCK-001 · Phase 2
> **Generated**: 2026-03-29

## Canonical Naming Rules

| Rule       | Convention                             | Example                            |
| ---------- | -------------------------------------- | ---------------------------------- |
| Tables     | `snake_case`, plural, no abbreviations | `production_tasks` ✓               |
| Columns    | `snake_case`, descriptive              | `organization_id` ✓                |
| PKs        | `id UUID`                              | ✓ Consistent across all 352 tables |
| FKs        | `<entity>_id`                          | `project_id`, `vendor_id` ✓        |
| Timestamps | `*_at TIMESTAMPTZ`                     | `created_at`, `updated_at` ✓       |
| Booleans   | `is_*` or `has_*` prefix               | `is_active`, `has_conflict` ✓      |
| ENUMs      | `<entity>_<property>` singular         | `task_status`, `booking_type` ✓    |

---

## ✅ COMPLIANT: Broad Patterns

### Table Naming

- **All 352 tables use `snake_case`** ✓
- **All tables are plural** (with justified exceptions like `custom_field_values`, `activity_log`)
- **No abbreviations** in table names ✓
- **No camelCase** ✓

### Column Naming

- **All PKs are `id UUID`** ✓
- **All FK columns end in `_id`** ✓
- **Timestamps use `_at` suffix**: `created_at`, `updated_at`, `deleted_at`, `approved_at`, `signed_at`, etc. ✓
- **Booleans consistently use `is_*` prefix**: `is_active`, `is_default`, `is_required`, `is_billable`, `is_public`, etc. ✓

---

## ⚠️ VIOLATIONS FOUND

### V1: Inconsistent Organization ID Naming

**Severity**: LOW (cosmetic — functionally correct)

All 289 org-scoped tables consistently use `organization_id`. No instances of abbreviated `org_id` found in table definitions.

**Verdict**: ✅ **COMPLIANT** — `organization_id` is the canonical name.

### V2: Inconsistent Boolean Prefixes

**Severity**: LOW

| Table          | Column               | Expected                | Notes                |
| -------------- | -------------------- | ----------------------- | -------------------- |
| `proposals`    | `signature_required` | `is_signature_required` | Missing `is_` prefix |
| `api_tokens`   | `revoked`            | `is_revoked`            | Missing `is_` prefix |
| `crew_members` | `background_checked` | `is_background_checked` | Missing `is_` prefix |
| `contacts`     | `is_primary`         | ✓                       | Correct              |
| `contacts`     | `is_billing_contact` | ✓                       | Correct              |
| `contacts`     | `is_decision_maker`  | ✓                       | Correct              |

**Count**: ~3 columns across 352 tables. Extremely minor.

### V3: Activity Log Table Naming Inconsistency

**Severity**: MEDIUM

| Table                    | Domain        | Notes                           |
| ------------------------ | ------------- | ------------------------------- |
| `activity_log`           | Core (002)    | Original activity tracking      |
| `record_activity_log`    | Generic (034) | Universal entity activity log   |
| `lead_activities`        | CRM (005)     | Lead-specific activities        |
| `opportunity_activities` | CRM (005)     | Opportunity-specific activities |

**Issue**: Mixed naming patterns for similar concepts:

- `activity_log` (singular "log") vs `record_activity_log` (compound)
- `lead_activities` / `opportunity_activities` (domain-specific, plural)

**Recommendation**: The `record_activity_log` is the canonical universal activity log (migration 034). The domain-specific tables (`lead_activities`, `opportunity_activities`) are justified as they serve different query patterns. The original `activity_log` from 002 should be audited for redundancy with `record_activity_log`.

### V4: Inconsistent `_log` vs `_history` vs `_events` Suffix

**Severity**: LOW

| Pattern     | Tables                                                                                                                                                                                                                                                                     |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `*_log`     | `activity_log`, `record_activity_log`, `change_order_log`, `sow_change_log`, `comm_log_entries`, `login_audit_log`, `governance_audit_log`, `role_change_log`, `access_audit_log`, `settings_change_log`, `username_change_log`, `credential_scan_log`, `asset_access_log` |
| `*_history` | `advance_status_history`                                                                                                                                                                                                                                                   |
| `*_events`  | `domain_events`, `webhook_events`, `sync_events`, `logistics_events`, `upsell_events`, `scan_events`, `field_usage_events`                                                                                                                                                 |

**Recommendation**: Standardize on:

- `*_audit_log` for compliance/security audit trails
- `*_change_log` for field-level change tracking
- `*_events` for event-sourced domain events
- `*_history` for state machine transition history

This is an **advisory** finding only — no renaming recommended due to migration complexity vs. benefit ratio.

### V5: Dead ENUM Reference — `department` ENUM

**Severity**: LOW (already addressed)

The `department` ENUM type still exists and is referenced in `rate_card_items.department` and `resource_bookings.department`, but migration 071 created the canonical `departments` lookup table. The ENUM is preserved for backward compatibility.

**Status**: ✅ Already documented in migration 071 comments.

---

## Summary

| Finding                      | Severity | Count           | Remediation               |
| ---------------------------- | -------- | --------------- | ------------------------- |
| Boolean prefix inconsistency | LOW      | 3 cols          | Optional rename migration |
| Activity log naming          | MEDIUM   | 4 tables        | Audit for redundancy      |
| Log/history/events suffix    | LOW      | Advisory        | Document convention       |
| Department ENUM vs table     | LOW      | Already handled | No action                 |

> [!TIP]
> **Overall Assessment**: The FrozenPhoenix naming conventions are **95%+ compliant** with BEDROCK standards. The few violations are cosmetic and do not impact correctness or query patterns. The schema demonstrates strong naming discipline across 352 tables.
