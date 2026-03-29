# 🗂️ DENORMALIZATION_REGISTER.md — Justified Denormalization Index

> **Protocol**: FP-DATA-BEDROCK-001 · Phase 3 (Companion)
> **Generated**: 2026-03-29

## Purpose

This register formally documents every **intentional** denormalization in the schema, along with:

- Justification for the denormalization
- Maintenance mechanism (trigger, generated column, manual)
- Reconciliation query for validation

---

## D1: `organization_id` on Child Tables

| Scope             | 289 child tables                                                                                                                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pattern**       | Every org-scoped child table has its own `organization_id` column, even when it's derivable from the parent                                                                                                         |
| **Justification** | **RLS Performance** — Supabase RLS policies evaluate `organization_id = ANY(get_user_org_ids())` on every query. Without the column directly on the table, every RLS check would require a JOIN to the parent table |
| **Maintenance**   | INSERT trigger / application layer sets `organization_id` from parent                                                                                                                                               |
| **Risk**          | LOW — `organization_id` is immutable on the parent                                                                                                                                                                  |

### Reconciliation Query

```sql
-- Verify no orphaned org_ids on tasks vs projects
SELECT t.id, t.organization_id AS task_org, p.organization_id AS project_org
FROM tasks t
JOIN projects p ON t.project_id = p.id
WHERE t.organization_id != p.organization_id;
```

---

## D2: `contacts.full_name` Generated Column

| Scope             | 1 column                                                       |
| ----------------- | -------------------------------------------------------------- | --- | --- | --- | ------------------ |
| **Pattern**       | `full_name TEXT GENERATED ALWAYS AS (first_name                |     | ' ' |     | last_name) STORED` |
| **Justification** | **Query convenience** — avoids concatenation in every query    |
| **Maintenance**   | PostgreSQL GENERATED ALWAYS — automatic, guaranteed consistent |
| **Risk**          | NONE — maintained by database engine                           |

---

## D3: `resource_bookings.total_hours` Generated Column

| Scope             | 1 column                                               |
| ----------------- | ------------------------------------------------------ |
| **Pattern**       | `total_hours NUMERIC GENERATED ALWAYS AS (...) STORED` |
| **Justification** | **Performance** — avoids computation on every query    |
| **Maintenance**   | PostgreSQL GENERATED ALWAYS — automatic                |
| **Risk**          | NONE                                                   |

---

## D4: `proposal_items.total` Generated Column

| Scope             | 1 column                                                           |
| ----------------- | ------------------------------------------------------------------ |
| **Pattern**       | `total NUMERIC GENERATED ALWAYS AS (quantity * unit_price) STORED` |
| **Justification** | **Performance**                                                    |
| **Maintenance**   | PostgreSQL GENERATED ALWAYS — automatic                            |
| **Risk**          | NONE                                                               |

---

## D5: `schedule_entries.reference_name` Cached Name

| Scope             | 1 column                                                                     |
| ----------------- | ---------------------------------------------------------------------------- |
| **Pattern**       | `reference_name TEXT` cached from polymorphic entity's name                  |
| **Justification** | **Display performance** — calendar views need entity names without N+1 JOINs |
| **Maintenance**   | ⚠️ **MANUAL** — no trigger exists to sync when entity name changes           |
| **Risk**          | 🔴 HIGH — stale data if referenced entity is renamed                         |

### Reconciliation Query

```sql
-- Detect stale reference_name for project references
SELECT se.id, se.reference_name, p.name AS current_name
FROM schedule_entries se
JOIN projects p ON se.reference_id = p.id::text
WHERE se.reference_type = 'project'
  AND se.reference_name != p.name;
```

---

## D6: `schedule_entries.location_name` Cached Name

| Scope             | 1 column                                          |
| ----------------- | ------------------------------------------------- |
| **Pattern**       | `location_name TEXT` cached from `locations.name` |
| **Justification** | **Display performance**                           |
| **Maintenance**   | ⚠️ **MANUAL** — no trigger                        |
| **Risk**          | 🔴 HIGH — stale data                              |

### Reconciliation Query

```sql
SELECT se.id, se.location_name, l.name AS current_name
FROM schedule_entries se
JOIN locations l ON se.location_id = l.id
WHERE se.location_name != l.name;
```

---

## D7: `shipments.carrier_name` Cached Name

| Scope             | 1 column                                                        |
| ----------------- | --------------------------------------------------------------- |
| **Pattern**       | `carrier_name TEXT` cached from `vendors.name` via `carrier_id` |
| **Justification** | **Display convenience**                                         |
| **Maintenance**   | ⚠️ **MANUAL**                                                   |
| **Risk**          | 🟡 MEDIUM — carrier names change less frequently                |

### Reconciliation Query

```sql
SELECT s.id, s.carrier_name, v.name AS current_name
FROM shipments s
JOIN vendors v ON s.carrier_id = v.id
WHERE s.carrier_name IS NOT NULL
  AND s.carrier_name != v.name;
```
