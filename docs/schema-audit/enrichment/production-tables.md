# Schema Enrichment Report — Production Tables

> **Migration Sources:** 001, 003, 005, 012, 021
> **Tables:** projects, tasks, task_dependencies, project_members, milestones, subtasks, project_assignments, schedule_entries, production_time_entries, work_packages, boms, production_runs, qc_gates, technical_specs

---

## projects

| Attribute | Value |
|---|---|
| **Migration** | 001 (created), 003/012/021 (extended) |
| **Route(s)** | projects/, dashboard/, calendar/, finance/ |
| **Current Columns** | ~30 (base + extensions across migrations) |
| **Recommended Columns** | +6 |
| **Compliance Score** | Before: 72% → After: 90% |

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `weather_contingency_plan` | FT-TEXT-002 | TEXT | Outdoor event risk mitigation; insurance requirement | pro |
| `insurance_policy_id` | FT-ID-002 | UUID FK | Link to insurance_policies table; COI tracking | pro |
| `sustainability_score` | FT-NUM-002 | NUMERIC(5,2) | Leave No Trace compliance; ESG reporting | enterprise |
| `post_mortem_score` | FT-NUM-002 | NUMERIC(5,2) | Project retrospective KPI; agency margin analysis | enterprise |
| `load_out_completed_at` | FT-TEMP-002 | TIMESTAMPTZ | Kill switch trigger timestamp (48hr auto-revoke) | core |
| `timezone` | FT-TEXT-003 | TEXT | IANA timezone for local schedule rendering | core |

### Columns to Rename

None — existing naming follows `snake_case` convention.

### Index Recommendations

- Add: `CREATE INDEX idx_projects_status_org ON projects(organization_id, status)` — dashboard filters
- Add: `CREATE INDEX idx_projects_phase ON projects(current_phase)` — phase-based views
- Existing: `organization_id`, `manager_id`, `parent_project_id` already indexed via FK

### RLS Assessment

- Current: Org-scoped via `get_user_org_id()` — adequate for row-level
- Gap: No project-role-scoped policies (vendor/client should only see assigned projects)
- **Recommendation:** Add policy: `project_id IN (SELECT project_id FROM project_members WHERE profile_id = auth.uid())` for non-exec/pm roles

### Supabase Realtime Candidates

- `status`, `current_phase`, `progress` — high-frequency dashboard updates
- `budget_actual` — financial dashboard real-time tracking

---

## tasks

| Attribute | Value |
|---|---|
| **Migration** | 001 (created), 003/012 (extended) |
| **Route(s)** | tasks/, projects/, scheduling/ |
| **Current Columns** | ~18 |
| **Recommended Columns** | +3 |
| **Compliance Score** | Before: 75% → After: 88% |

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `estimated_hours` | FT-NUM-002 | NUMERIC(8,2) | Resource planning; labor cost projection | pro |
| `actual_hours` | FT-NUM-002 | NUMERIC(8,2) | Time tracking reconciliation | pro |
| `safety_critical` | FT-BOOL-001 | BOOLEAN | OSHA flagging for rigging/electrical/pyro tasks | core |

### RLS Assessment

- Current: Org-scoped via project junction — adequate
- Gap: Vendor users see all tasks in a project; should be filtered to assigned tasks only

### Supabase Realtime Candidates

- `status`, `assignee_id`, `fabrication_status` — board/kanban real-time updates

---

## task_dependencies

| Attribute | Value |
|---|---|
| **Migration** | 001 |
| **Compliance Score** | 95% |

### Assessment

Clean junction table with self-referential check constraint (`task_id != depends_on_id`). No enrichment needed.

---

## project_members

| Attribute | Value |
|---|---|
| **Migration** | 001, extended in 018 |
| **Current Columns** | 5 + extensions |
| **Compliance Score** | 85% |

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `access_expires_at` | FT-TEMP-002 | TIMESTAMPTZ | Auto-revoke access post-project; SOC2 CC6.2 | core |
| `department_role` | FT-TEXT-001 | TEXT | Department-specific role within project context | pro |

---

## work_packages (Migration 021)

| Attribute | Value |
|---|---|
| **Migration** | 021 |
| **Route(s)** | projects/ (production lifecycle) |
| **Current Columns** | ~15 |
| **Compliance Score** | 90% |

### Assessment

Well-designed with `work_package_type` enum, dependency tracking via `work_package_dependencies`, and integration with `boms` (bill of materials). Follows 3NF. Minor gap: missing `safety_plan_required` boolean for OSHA compliance flagging.

---

## production_runs (Migration 021)

| Attribute | Value |
|---|---|
| **Migration** | 021 |
| **Route(s)** | projects/ (fabrication tracking) |
| **Current Columns** | ~12 |
| **Compliance Score** | 88% |

### Assessment

Tracks fabrication batches with yield/waste metrics. Well-structured. Gap: missing `environmental_waste_kg` for sustainability reporting (ESG).

---

## qc_gates (Migration 021)

| Attribute | Value |
|---|---|
| **Migration** | 021 |
| **Route(s)** | projects/, approvals/ |
| **Current Columns** | ~12 |
| **Compliance Score** | 92% |

### Assessment

Quality control inspection gates with pass/fail/conditional status, evidence URLs, and inspector assignment. Excellent design. No enrichment needed.

---

## technical_specs (Migration 021)

| Attribute | Value |
|---|---|
| **Migration** | 021 |
| **Route(s)** | projects/ |
| **Current Columns** | ~10 |
| **Compliance Score** | 85% |

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `structural_engineer_signoff` | FT-BOOL-001 | BOOLEAN | ESTA E1.2 structural requirements for scenic elements | pro |
| `pe_stamp_document_url` | FT-URL-001 | TEXT | Professional Engineer stamp for load-bearing structures | pro |
