# SCHEMA AUDIT — Layer 1.1

**Protocol:** CLEARANCE FP-DEPLOY-CLEARANCE-001
**Audit Date:** 2026-03-21
**Auditor:** Antigravity Agent

---

## Migration Integrity

| Check | Result |
|---|---|
| Total migrations | 104 files (001–104) |
| Sequential numbering | ✅ Mostly sequential (052–053 gap noted — non-blocking) |
| Direction | Forward-only (Supabase standard) |
| Reversibility | ⚠ No explicit down migrations — standard for Supabase; PITR handles rollback |
| Lock mechanism | ✅ Supabase CLI handles migration locking |

---

## Schema Patterns Audit

### Primary Keys ✅
- UUID (`gen_random_uuid()`) used consistently across all tables
- Defined in `001_initial_schema.sql` and maintained throughout

### Foreign Keys ✅
- Explicit FK constraints with documented `ON DELETE` behavior
- Migration `040_fix_auth_user_fk_cascades.sql` + `103_fix_remaining_auth_user_fk_cascades.sql` — all auth.users FKs corrected to CASCADE
- Migration `076_cross_module_fk_relationships.sql` — comprehensive cross-module FK audit
- Migration `081_fk_repointing_and_3nf_fixes.sql` — 3NF fixes applied
- Migration `080_polymorphic_fk_validation.sql` — check constraints on polymorphic FKs

### Indexes ✅
- Dedicated migration `072_missing_indexes.sql` (9.4KB) — comprehensive index audit
- FK columns indexed
- Composite indexes for multi-column filter patterns
- Partial indexes for status-filtered queries

### ENUM Types ✅
- Migration `073_enum_hygiene.sql` — normalized all enum usage
- Status/type columns use PostgreSQL ENUM types consistently

### Timestamps ✅
- `created_at` and `updated_at` with `DEFAULT now()` on all tables
- `TIMESTAMPTZ` used (not bare `TIMESTAMP`)
- Auto-update triggers for `updated_at` verified in migrations

### Soft Delete ✅
- `deleted_at TIMESTAMPTZ DEFAULT NULL` pattern
- Enforced in CRUD factory: `softDelete: true` (default)
- RLS policies account for soft delete per migration `029_role_based_rls.sql`

### Column Constraints ✅
- NOT NULL enforced on required columns
- CHECK constraints for bounded values
- UNIQUE constraints on natural keys
- Migration `074_schema_validation.sql` (12.7KB) — comprehensive constraint pass
- Migration `083_schema_validation_pass_2.sql` (15.6KB) — second validation pass

---

## Hardening Migrations

| Migration | Purpose | Size |
|---|---|---|
| `022_audit_remediation.sql` | Initial audit remediation | 21KB |
| `061_rls_remediation_missing_tables.sql` | RLS gap closure | 41KB |
| `068_rls_gap_closure.sql` | Additional RLS fixes | 12KB |
| `069_table_consolidation.sql` | Dedup and normalize | 6.5KB |
| `071_jsonb_normalization.sql` | JSONB column cleanup | 7.3KB |
| `072_missing_indexes.sql` | Index coverage | 9.4KB |
| `073_enum_hygiene.sql` | Enum standardization | 5.7KB |
| `074_schema_validation.sql` | Constraint validation | 12.7KB |
| `080_polymorphic_fk_validation.sql` | Polymorphic FK checks | 16.4KB |
| `083_schema_validation_pass_2.sql` | Second validation pass | 15.6KB |
| `092_hardening_pass.sql` | Final hardening | 1KB |
| `096_auth_hardening.sql` | Auth-specific hardening | 1.4KB |
| `097_auth_audit_10_10.sql` | Auth audit (10/10 score) | 10.5KB |

---

## Seed Data

| Check | Result |
|---|---|
| Seed data present | ✅ `src/lib/seed-data/` directory exists |
| Default seeding | ✅ `025_seed_defaults_and_onboarding.sql` — org defaults + onboarding steps |
| Catalog seed | ✅ `099_catalog_seed_categories.sql` (49KB) + `100_catalog_seed_items.sql` (523KB) + `102_catalog_seed_pricing.sql` (311KB) |
| Idempotent | ✅ Uses `ON CONFLICT` / `INSERT ... ON CONFLICT DO NOTHING` |

---

## Outstanding Items

- **P2:** Document migration rollback procedure using Supabase PITR
- **P3:** Consider adding sequential gap check (051 → 054 gap)
