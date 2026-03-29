# 🔧 CUSTOM_FIELDS_CERTIFICATION.md — Custom Fields Architecture Audit

> **Protocol**: FP-DATA-BEDROCK-001 · Phase 6
> **Generated**: 2026-03-29

## Architecture Overview

The custom fields system uses a standard **Entity-Attribute-Value (EAV)** pattern:

```
custom_field_definitions (org-scoped)
  ├── id UUID PK
  ├── name TEXT NOT NULL
  ├── field_key TEXT NOT NULL
  ├── field_type TEXT CHECK ('text','number','date','select','multi_select','boolean','currency','person','url','email','phone')
  ├── entity_types TEXT[] NOT NULL (which entities this field applies to)
  ├── options JSONB (for select/multi_select types)
  ├── default_value TEXT
  ├── is_required BOOLEAN
  ├── is_filterable BOOLEAN
  ├── display_order INTEGER
  ├── section TEXT DEFAULT 'custom'
  ├── organization_id UUID FK → organizations
  └── UNIQUE(organization_id, field_key)

custom_field_values (org-scoped)
  ├── id UUID PK
  ├── field_definition_id UUID FK → custom_field_definitions ON DELETE CASCADE
  ├── entity_id UUID (polymorphic — references any entity)
  ├── entity_type TEXT
  ├── value_text TEXT
  ├── value_number NUMERIC(14,4)
  ├── value_date DATE
  ├── value_boolean BOOLEAN
  ├── value_json JSONB
  └── organization_id UUID FK → organizations
```

---

## Schema Validation

### ✅ Definitions Table

| Check                                                   | Status                           |
| ------------------------------------------------------- | -------------------------------- |
| PK `id UUID`                                            | ✅                               |
| `organization_id` FK with CASCADE                       | ✅                               |
| UNIQUE constraint `(organization_id, field_key)`        | ✅                               |
| RLS enabled                                             | ✅ (migration 061)               |
| RLS policies (CRUD)                                     | ✅ (select/insert/update/delete) |
| Org isolation via `get_user_org_ids()`                  | ✅                               |
| Delete restricted to exec via `get_user_exec_org_ids()` | ✅                               |
| Index on `organization_id`                              | ✅ `idx_cfd_org`                 |
| GIN index on `entity_types` array                       | ✅ `idx_cfd_entity_types`        |
| `created_by` FK repointed to `user_profiles`            | ✅ (migration 081)               |

### ✅ Values Table

| Check                                 | Status                                 |
| ------------------------------------- | -------------------------------------- |
| PK `id UUID`                          | ✅                                     |
| `field_definition_id` FK with CASCADE | ✅                                     |
| `entity_id` index                     | ✅ `idx_cfv_entity`                    |
| `field_definition_id` partial index   | ✅ `idx_cfv_definition`                |
| Multi-type value columns              | ✅ (text, number, date, boolean, json) |
| `organization_id` for RLS             | ✅ (added in migration 061)            |

---

## Consolidation History

| Migration | Action                                                                                 |
| --------- | -------------------------------------------------------------------------------------- |
| 005       | Original `custom_fields` table created (single `entity_type` column)                   |
| 034       | `custom_field_definitions` created (multi-entity via `entity_types TEXT[]`)            |
| 061       | `custom_field_definitions` recreated with IF NOT EXISTS (partial 034 failure recovery) |
| 069       | `custom_fields` data migrated to `custom_field_definitions`, old table DROP'd          |
| 070       | Comments added documenting consolidation                                               |
| 081       | `created_by` FK repointed from `profiles` to `user_profiles`                           |

**Status**: ✅ Consolidation complete. Only `custom_field_definitions` + `custom_field_values` exist.

---

## Application Layer Integration

### Frontend Code References

```
grep -r "custom_field" src/ → NO RESULTS
```

> [!WARNING]
> **No frontend code references custom fields.** The custom fields system exists only in the database schema with no application-layer integration. This means:
>
> - No UI for defining custom fields
> - No UI for viewing/editing custom field values
> - No API routes for custom field CRUD
> - The `custom_field_type` ENUM and `entity_type` ENUM are defined but unused by app code

### Entity Config Reference

The `entity.ts` config does NOT include `custom_field_definitions` or `custom_field_values` as managed entities.

---

## Findings

| #   | Finding                                                                                           | Severity | Status                                        |
| --- | ------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------- |
| 1   | Schema is well-structured for EAV pattern                                                         | ✅       | No action                                     |
| 2   | Consolidation from legacy `custom_fields` complete                                                | ✅       | No action                                     |
| 3   | RLS and org isolation properly configured                                                         | ✅       | No action                                     |
| 4   | Indexes appropriately placed                                                                      | ✅       | No action                                     |
| 5   | **No frontend integration exists**                                                                | ⚠️ INFO  | Feature gap — not a schema issue              |
| 6   | `entity_types TEXT[]` stores entity type names but no validation against actual entity types      | 🟡       | Consider CHECK or trigger validation          |
| 7   | `custom_field_values` has both `field_definition_id` and legacy columns from original design      | 🟡       | Audit for unused legacy columns               |
| 8   | Missing: composite unique index on `(field_definition_id, entity_id)` to prevent duplicate values | 🔴       | ADD: `UNIQUE(field_definition_id, entity_id)` |

> [!CAUTION]
> **Finding #8 is critical**: Without a `UNIQUE(field_definition_id, entity_id)` constraint on `custom_field_values`, an entity could have MULTIPLE values for the same custom field definition, violating SSOT.

---

## Recommendation

1. **Add unique constraint**: `ALTER TABLE custom_field_values ADD CONSTRAINT uq_cfv_definition_entity UNIQUE(field_definition_id, entity_id);`
2. **Audit legacy columns**: Check if `value_text`, `value_number`, etc. from the original 005 design have been orphaned by the migration to `field_definition_id`
3. **Document**: Custom fields are schema-ready but frontend-pending — this is a feature implementation gap, not a schema deficiency
